# ADR 002: Use GitLab for Version Control, Issues, and CI/CD

## Status
Accepted

## Context
The team needs to collaborate on code, track bugs, and host documentation in a way that high school students can access and fix issues independently.

## Decision
Use GitLab for version control, issue tracking, and CI/CD via GitLab Actions.

## Consequences

### Positive
- Centralizes all project assets (code, issues, docs) in one place
- Allows "Senior Students" to maintain and review code easily
- Built-in CI/CD pipelines automate testing and deployment

### Negative
- Team members unfamiliar with GitLab workflows require onboarding
- CI/CD pipeline configuration adds initial setup overhead
