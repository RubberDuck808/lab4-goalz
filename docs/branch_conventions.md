# Branch Naming Conventions

Branches follow a consistent `<type>/<short-description>` pattern to keep the repository readable and organised.

---

## Structure

```
<type>/<short-description>
```

| Part | Required | Description |
|------|----------|-------------|
| `type` | ✅ | Category of work (see types below) |
| `short-description` | ✅ | Kebab-case summary of the work, e.g. `add-login-page` |

For work tied to a specific issue, prefix the description with the issue number:

```
<type>/<issue-number>-<short-description>
```

---

## Types

| Type | When to use |
|------|-------------|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code restructuring, no behaviour change |
| `test` | Adding or updating tests |
| `chore` | Tooling, dependencies, build config |
| `ci` | CI/CD pipeline changes |
| `hotfix` | Urgent production fix branched from main |

---

## Rules

- Use **lowercase** and **kebab-case** only — no spaces, no underscores, no slashes after the first
- Keep it **short and descriptive** — aim for 3–5 words max
- Branch off from `dev` unless it is a `hotfix` (branch from `main`)
- Delete the branch after the merge request is merged

---

## Examples

```
feat/add-route-map-component
feat/42-student-checkpoint-ui
fix/sensor-temperature-offset
fix/17-login-redirect-loop
docs/update-adr-diagram
refactor/extract-auth-middleware
chore/bump-react-18-3
ci/add-lint-pipeline-step
hotfix/fix-null-pointer-on-login
```

---

## Branch Lifecycle

```
main        ← stable, production-ready
  └── dev   ← integration branch, all features merge here
        └── feat/your-feature
        └── fix/your-bug-fix
        └── docs/your-doc-update
```

`hotfix` branches are the only exception — they branch directly from `main` and merge back into both `main` and `dev`.

---

## Source

Inspired by common Git branching models:
- **Conventional Commits** — https://www.conventionalcommits.org/en/v1.0.0/
- **Gitflow** — https://nvie.com/posts/a-successful-git-branching-model/
