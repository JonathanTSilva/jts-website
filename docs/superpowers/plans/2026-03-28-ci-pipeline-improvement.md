# CI/CD Pipeline Improvement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure that the website is only deployed to GitHub Pages if all validation steps (lint, type-check, unit tests, and E2E tests) pass successfully.

**Architecture:** Consolidate the independent `ci.yml` and `deploy.yml` workflows into a single `pipeline.yml` workflow. Use GitHub Actions `needs` keyword to enforce that the deployment jobs only run after the validation job succeeds.

**Tech Stack:** GitHub Actions, pnpm, Astro, Playwright.

---

### Task 1: Research and Preparation

**Files:**
- Read: `.github/workflows/ci.yml`
- Read: `.github/workflows/deploy.yml`
- Read: `package.json`

- [ ] **Step 1: Read the existing CI workflow**
- [ ] **Step 2: Read the existing Deploy workflow**
- [ ] **Step 3: Verify the build and test scripts in package.json**

### Task 2: Consolidate Workflows

**Files:**
- Create: `.github/workflows/pipeline.yml`
- Delete: `.github/workflows/ci.yml`
- Delete: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create the new consolidated pipeline workflow**
- [ ] **Step 2: Define the `validate` job (based on `ci.yml`)**
- [ ] **Step 3: Define the `deploy` job (based on `deploy.yml`) with `needs: validate`**
- [ ] **Step 4: Ensure the `deploy` job only runs on the `main` branch**
- [ ] **Step 5: Optimize by sharing build artifacts if possible (or keep it simple and rebuild for now to ensure a clean deploy artifact)**

### Task 3: Verification and Cleanup

**Files:**
- Modify: `.github/workflows/pipeline.yml`

- [ ] **Step 1: Verify the workflow syntax using a linter or manual check**
- [ ] **Step 2: Delete the old workflow files**
- [ ] **Step 3: Commit the changes**

```bash
git add .github/workflows/pipeline.yml
git rm .github/workflows/ci.yml .github/workflows/deploy.yml
git commit -m "ci: consolidate validation and deployment into a single pipeline"
```
