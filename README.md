# cicdpractice

A hands-on project for learning industry-standard CI/CD using **GitHub Actions**. The "product" is a small Node.js calculator API — the goal is to practice the workflow of safely shipping new features.

---

## What was set up

### Project structure

```
cicdpractice/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                  # Runs on every PR → validates before merge
│   │   └── cd.yml                  # Runs on merge to main → deploys
│   └── pull_request_template.md    # Pre-fills PR description checklist
├── src/
│   ├── app.js                      # Express API (your "product")
│   ├── app.test.js                 # Jest + Supertest tests
│   └── server.js                   # Entry point (starts the HTTP server)
├── .eslintrc.json                  # ESLint rules
├── .gitignore
└── package.json
```

### CI pipeline (`ci.yml`)

Triggered on every **pull request targeting `main`**. Runs three jobs:

| Job | What it does |
|-----|-------------|
| **Lint** | Runs ESLint to catch style/syntax issues |
| **Test** | Runs Jest with coverage on Node 18 and Node 20 (matrix build) |
| **Build** | Validates the app syntax after lint + tests pass (`needs: [lint, test]`) |

All three jobs must be green before GitHub will allow a merge.

### CD pipeline (`cd.yml`)

Triggered on every **push (merge) to `main`**. Runs three sequential jobs:

| Job | What it does |
|-----|-------------|
| **Build** | Re-runs tests and build check |
| **Deploy → Staging** | Deploys to the `staging` environment (auto, no approval needed) |
| **Deploy → Production** | Deploys to the `production` environment — **pauses for a human reviewer** |

The staging and production steps currently `echo` placeholder commands. Replace them with your real deployment tool (Fly.io, AWS ECS, Heroku, etc.).

### PR template (`.github/pull_request_template.md`)

Every new pull request is pre-filled with a checklist: description, change type, testing notes, and a done list. This mirrors what most engineering teams require before merging.

---

## One-time GitHub setup (required)

These settings live in GitHub, not in files, so you do them once in the UI.

### 1. Push this repo to GitHub

```bash
git remote add origin https://github.com/<your-username>/cicdpractice.git
git push -u origin main
```

### 2. Create Environments (for CD approvals)

Go to **Settings → Environments** and create two environments:

**`staging`**
- No required reviewers (deploys automatically after merge)

**`production`**
- Add yourself as a **Required reviewer**
- This causes the production deploy job to pause and wait for your approval

### 3. Enable Branch Protection on `main`

Go to **Settings → Branches → Add branch ruleset** (or "Add rule" on older UI) and configure:

| Setting | Value |
|---------|-------|
| Branch name pattern | `main` |
| Require a pull request before merging | Enabled |
| Required approvals | 1 (or 0 if working solo) |
| Require status checks to pass | Enabled |
| Required status checks | `Lint`, `Test (Node 18)`, `Test (Node 20)`, `Build` |
| Require branches to be up to date | Enabled |
| Do not allow bypassing the above settings | Enabled |

> After the first CI run, the status check names will appear in the search box so you can add them.

---

## Day-to-day workflow

This is the loop you follow every time you add a feature:

```
main
 │
 ├── git checkout -b feature/my-new-feature
 │
 │   (write code + tests)
 │
 ├── git push origin feature/my-new-feature
 │
 ├── Open PR on GitHub
 │     └── CI runs automatically (lint → test → build)
 │           All checks green? → Get review/approval → Merge
 │
 └── CD runs automatically on merge
       └── Build → Staging deploy → (approval) → Production deploy
```

### Step-by-step

```bash
# 1. Create a feature branch
git checkout -b feature/square-root

# 2. Make your changes in src/app.js and add tests in src/app.test.js

# 3. Verify locally before pushing
npm install        # first time only
npm run lint
npm test

# 4. Commit and push
git add .
git commit -m "feat: add square root endpoint"
git push origin feature/square-root

# 5. Open a pull request on GitHub
#    → CI kicks off automatically
#    → Fix any failures, push again — CI re-runs
#    → Once green, merge the PR

# 6. CD kicks off automatically on merge
#    → Watch it in Actions → your merge commit → "CD" workflow
#    → Approve the production deploy when prompted
```

---

## Running locally

```bash
npm install
npm test          # run tests with coverage
npm run lint      # lint check
npm start         # start the server on port 3000
```

Test an endpoint manually:

```bash
curl -X POST http://localhost:3000/add \
  -H "Content-Type: application/json" \
  -d '{"a": 5, "b": 3}'
# → {"result":8}
```

---

## Adding a new feature (example)

1. Add a new route in `src/app.js`
2. Add tests for it in `src/app.test.js`
3. Follow the workflow above — the pipeline validates everything before it reaches `main`

The coverage threshold is set to **80%** in `package.json`. If your new code drops coverage below that, the test job will fail and the PR cannot be merged.

---

## Key concepts practiced here

| Concept | Where |
|---------|-------|
| Trunk-based development | Feature branches → PR → merge to `main` |
| CI (Continuous Integration) | `ci.yml` runs on every PR |
| CD (Continuous Deployment) | `cd.yml` runs on every merge |
| Matrix builds | Tests run on Node 18 and 20 in parallel |
| Environment-gated deploys | Staging auto-deploys; production requires approval |
| Branch protection | `main` can only be updated through a passing PR |
| Code coverage enforcement | 80% line coverage threshold in Jest config |
| PR templates | Standardized checklist on every PR |
