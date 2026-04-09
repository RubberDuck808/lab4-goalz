# Commit Message Template

Follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

---

## Structure

| Part | Required | Description |
|------|----------|-------------|
| `type` | ✅ | Category of the change (see types below) |
| `scope` | ❌ | Area of the codebase affected, e.g. `(auth)`, `(iot)`, `(db)` |
| `description` | ✅ | Short imperative summary — no capital, no full stop |
| `body` | ❌ | Longer explanation of *why*, not *what* |
| `footer` | ❌ | Breaking changes, issue references |

---

## Types

| Type | When to use |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Formatting, missing semicolons, etc. (no logic change) |
| `refactor` | Code restructuring without feature or bug change |
| `test` | Adding or updating tests |
| `chore` | Build process, dependency updates, tooling |
| `ci` | CI/CD configuration changes |

---

## Scopes

Use the area of the project affected:
`backend` · `frontend` · `iot` · `db` · `auth` · `ci` · `docs` · `storage`

---

## Breaking Changes

Add `!` after the type/scope **or** use a `BREAKING CHANGE` footer:

```
feat!: drop support for Node 18

BREAKING CHANGE: minimum required Node version is now 20
```

---

## Examples

**Simple feature:**
```
feat(frontend): add route map component to student dashboard
```

**Bug fix with body:**
```
fix(iot): correct temperature sensor offset calculation

Sensor readings were consistently 2°C above actual values,
causing inaccurate data in the sustainability dashboard.
Applied a calibration offset constant in the firmware read loop.
```

**Breaking change with footer:**
```
feat(auth): replace session tokens with JWT

Closes #38

BREAKING CHANGE: existing session tokens are invalidated on deploy,
all users will be required to log in again
```

**Docs only:**
```
docs(diagrams): update C4 Level 2 container diagram
```

**Chore:**
```
chore(deps): bump react from 18.2 to 18.3
```

---

## Source

**Conventional Commits specification** — https://www.conventionalcommits.org/en/v1.0.0/
