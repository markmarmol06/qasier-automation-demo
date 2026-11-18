# Qasier automation demo

A tiny Playwright project for trying **Run automation** in Qasier.

## One-time setup
1. Create an empty GitHub repository (e.g. `qasier-automation-demo`) and push this folder to it:
   ```
   git remote add origin git@github.com:<you>/qasier-automation-demo.git
   git push -u origin main
   ```
2. In the repo: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `QASIER_API_KEY`
   - Value: your Automation API key (Qasier → Account Settings → Automation & API)
3. Create a fine-grained token (GitHub → Settings → Developer settings → Fine-grained tokens)
   for **only this repository** with **Actions: Read and write** and **Contents: Read**.
4. In Qasier, create a test run containing test cases with the IDs used in `tests/example.spec.ts`
   (`TC-001` … `TC-004`) — or edit the IDs in that file to match your real ones.
5. Qasier → Account Settings → Automation & API → *Run automation from Qasier*:
   owner = your GitHub user/org, repository = `qasier-automation-demo`,
   workflow = `qasier.yml`, branch = `main`, token = the token from step 3.

## Try it
Open the test run in Qasier → **Run automation**. Expect: Queued → Running → CI failed
(`TC-004` fails on purpose). `TC-001`–`TC-003` become Passed and `TC-004` Failed in the run.

## Run locally (optional)
```
npm install
npx playwright install chromium
QASIER_RUN_ID=RUN-xxxx QASIER_API_KEY=... npx playwright test
```
Without the two variables the tests still run; the reporter just skips posting.
