/**
 * Qasier Reporter for Playwright
 *
 * Usage:
 *   QASIER_RUN_ID=RUN-12345 npx playwright test
 *
 * In playwright.config.ts:
 *   reporter: [['./qasier-reporter.ts']]
 *
 * Override for local testing (Firebase emulator, mock server) or if Qasier's
 * API endpoint ever changes — production runs don't need to set this.
 *   QASIER_API_URL=https://app.qasier.com/automationResults
 */

import type {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';

const QASIER_API = process.env.QASIER_API_URL
  || 'https://app.qasier.com/automationResults';

interface QasierResult {
  testCaseId: string;
  status: 'Passed' | 'Failed' | 'Blocked' | 'Skipped' | 'In Progress';
  actualResult?: string;
  duration?: string;
}

// Extract TC ID from test title — supports @TC-001 or [TC-001] annotation
function extractTcId(title: string): string | null {
  const match = title.match(/[@\[]?(TC-[\w\d]+)[\]]?/i);
  return match ? match[1].toUpperCase() : null;
}

function mapStatus(status: TestResult['status']): QasierResult['status'] {
  switch (status) {
    case 'passed':    return 'Passed';
    case 'failed':    return 'Failed';
    case 'timedOut':  return 'Failed';
    case 'skipped':   return 'Skipped';
    case 'interrupted': return 'Blocked';
    default:          return 'Failed';
  }
}

class QasierReporter implements Reporter {
  private runId: string | null = null;
  private apiKey: string | null = null;
  private results: QasierResult[] = [];

  onBegin(config: FullConfig, suite: Suite) {
    this.runId  = process.env.QASIER_RUN_ID  || null;
    this.apiKey = process.env.QASIER_API_KEY || null;
    if (!this.runId) {
      console.warn('[Qasier] QASIER_RUN_ID not set — results will not be reported.');
    } else if (!this.apiKey) {
      console.warn('[Qasier] QASIER_API_KEY not set — results will not be reported. Generate a key in Qasier → Settings.');
    } else {
      console.log(`[Qasier] Reporting to Run ID: ${this.runId}`);
    }
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (!this.runId) return;

    const tcId = extractTcId(test.title);
    if (!tcId) return;

    const durationSec = (result.duration / 1000).toFixed(2) + 's';
    const errorMsg = result.errors.map(e => e.message?.split('\n')[0]).filter(Boolean).join(' | ');

    // Check for custom actualResult annotation set inside the test
    const customActual = test.annotations.find(a => a.type === 'actualResult')?.description;

    const actualResult = customActual
      || (result.status === 'passed' ? 'Test executed successfully.' : errorMsg || 'Test failed.');

    this.results.push({
      testCaseId: tcId,
      status: mapStatus(result.status),
      actualResult,
      duration: durationSec,
    });

    console.log(`[Qasier] ${tcId} → ${mapStatus(result.status)} (${durationSec})`);
  }

  async onEnd(result: FullResult) {
    if (!this.runId || !this.apiKey || this.results.length === 0) {
      if (this.runId && !this.apiKey) console.warn('[Qasier] QASIER_API_KEY not set — skipping report.');
      else if (this.runId) console.warn('[Qasier] No TC-annotated tests found. Annotate tests with @TC-xxx to report results.');
      return;
    }

    console.log(`[Qasier] Posting ${this.results.length} result(s) to Run ${this.runId}...`);

    try {
      const response = await fetch(QASIER_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ runId: this.runId, results: this.results }),
      });

      const data = await response.json() as any;

      if (response.ok) {
        console.log(`[Qasier] ✅ Updated: ${data.updated?.join(', ')}`);
        if (data.notFound?.length) {
          console.warn(`[Qasier] ⚠️  Not found in run: ${data.notFound?.join(', ')}`);
        }
        console.log(`[Qasier] Run status → ${data.runStatus}`);
      } else {
        console.error(`[Qasier] ❌ Failed: ${data.error}`);
      }
    } catch (err) {
      console.error('[Qasier] ❌ Network error:', err);
    }
  }
}

export default QasierReporter;
