# ADR 008: Use Mermaid for Architecture Diagrams

## Status
Accepted

## Context
As the codebase grows across multiple layers (backend, frontend, IoT firmware, database), architecture diagrams become outdated quickly. High school students and new contributors need up-to-date visual references to understand the system. PlantUML was initially considered but is not available as an integration on the university's GitLab instance.

## Decision
Use Mermaid (`.mmd` source files) stored in `docs/diagrams/` to define diagrams as code. Diagrams are embedded as `mermaid` fenced code blocks in `docs/diagrams/README.md`, which renders natively in GitLab without any admin configuration or integration setup.

## Consequences

### Positive
- Renders natively in GitLab Markdown — no admin setup or integration required
- `.mmd` files are plain text and diff-friendly in merge requests
- Mermaid supports all needed diagram types: flowchart, ER diagram, sequence diagram
- Live preview available via VS Code extension or mermaid.live

### Negative
- Team members need to learn basic Mermaid syntax to update diagrams
- Diagram source (`.mmd`) and the README block must currently be kept in sync manually
- Auto-generation via CI/CD is planned but not yet implemented (see Future section in `docs/diagrams/README.md`)
