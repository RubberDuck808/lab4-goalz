# ADR 004: Use React.js for Frontend SPA

## Status
Accepted

## Context
The Loggin game app and sustainability dashboard need to be interactive, fast, and visual to engage users effectively.

## Decision
Use React.js with JavaScript for the frontend to build a dynamic Single Page Application (SPA).

## Consequences

### Positive
- Component reusability between the "Game" UI and "Dashboard" UI reduces duplication
- Vast ecosystem of libraries for charts, maps, and animations
- Fast rendering via virtual DOM improves user experience

### Negative
- JavaScript ecosystem churn can increase maintenance burden over time
- Contributors new to React require time to learn component-based architecture
