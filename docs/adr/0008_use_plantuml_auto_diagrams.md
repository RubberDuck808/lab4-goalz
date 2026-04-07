# ADR 008: Use PlantUML for Auto-Generated Architecture Diagrams via GitLab CI/CD

## Status
Proposed

## Context
As the codebase grows across multiple layers (backend, frontend, IoT firmware, database), architecture diagrams become outdated quickly. High school students and new contributors need up-to-date visual references to understand the system without manually redrawing diagrams after every change.

## Decision
Use PlantUML (`.puml` source files) stored in `docs/diagrams/` to define diagrams as code. A GitLab CI/CD pipeline job will automatically render and commit updated diagram images (`.svg`) whenever relevant source files change.

## Consequences

### Positive
- Diagrams are always in sync with the actual codebase
- `.puml` files are plain text and diff-friendly in merge requests
- No external diagramming tools needed; diagrams live alongside the code
- Works natively with GitLab's built-in PlantUML rendering in Markdown

### Negative
- Requires a GitLab CI runner with Java or Docker available to render PlantUML
- The CI pipeline needs write access to the repository to commit generated images
- Team members need to learn basic PlantUML syntax to update diagrams
