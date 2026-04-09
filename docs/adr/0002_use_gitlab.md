# ADR 002: Use GitLab for Version Control, Issues, and CI/CD

## Status
Accepted

## Context
The team needs to collaborate on code, track bugs, and host documentation in a central place that all contributors can access independently.

## Decision
Use GitLab for version control, issue tracking, and CI/CD via GitLab CI/CD.

## Consequences

### Positive
- Centralizes all project assets (code, issues, docs) in one place
- Built-in CI/CD pipelines automate testing and deployment
- Merge request workflow supports code review across the team

### Negative
- Team members unfamiliar with GitLab workflows require onboarding
- CI/CD pipeline configuration adds initial setup overhead
