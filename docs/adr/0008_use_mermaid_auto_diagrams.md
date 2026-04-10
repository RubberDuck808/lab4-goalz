# ADR 008: Use Mermaid for Architecture Diagrams

## Status
Accepted

## Context
As the codebase grows across multiple layers (backend, frontend, IoT firmware, database), architecture diagrams become outdated quickly. New contributors need up-to-date visual references to understand the system. PlantUML was initially considered but is not available as an integration on the university's GitLab instance.

## Decision
Use Mermaid stored in `docs/diagrams/` to define diagrams as code, with each diagram type in its own `.md` file (e.g. `c4_models.md`, `sequence_diagrams.md`). Diagrams are embedded as `mermaid` fenced code blocks which render natively in GitLab without any admin configuration or integration setup.

## Consequences

### Positive
- Renders natively in GitLab Markdown — no admin setup or integration required
- `.mmd` files are plain text and diff-friendly in merge requests
- Mermaid supports all needed diagram types: flowchart, ER diagram, sequence diagram
- Live preview available via VS Code extension or mermaid.live

### Negative
- Team members need to learn basic Mermaid syntax to update diagrams
- Team members need to keep diagram files up to date manually as the system evolves
- Auto-generation via CI/CD is planned but not yet implemented (see Future section in `docs/diagrams/c4_models.md`)
