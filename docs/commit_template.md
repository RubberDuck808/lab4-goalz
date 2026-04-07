# Commit Message Template

```
<type>(<scope>): <short summary>

Context:
- Why is this change needed?
- What problem does it solve?

Changes:
- What was added/changed/removed?
- Key points (keep it concise)

Notes:
- Anything important for reviewers
- Trade-offs, limitations, side effects

Refs:
- Issues, tickets, PRs (optional)
```

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

## Scopes

Use the area of the project affected, e.g. `backend`, `frontend`, `iot`, `db`, `auth`, `ci`, `docs`.

## Examples

```
feat(frontend): add route map component to dashboard

Context:
- Dashboard lacked a visual representation of student routes
- Students needed to see collected GPS data on a map

Changes:
- Added MapView component using Leaflet.js
- Integrated Supabase route query into map data hook

Notes:
- Map tiles require an internet connection
- Mobile responsiveness not yet tested

Refs:
- Closes #42
```

```
fix(iot): correct temperature sensor offset calculation

Context:
- Sensor readings were consistently 2°C above actual values
- Caused inaccurate data in the sustainability dashboard

Changes:
- Applied calibration offset constant in firmware read loop

Notes:
- Offset value (2.0) should be moved to config in a follow-up

Refs:
- Issue #17
```
