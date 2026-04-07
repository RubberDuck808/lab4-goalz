# ADR 007: Host Application on Microsoft Azure

## Status
Accepted

## Context
The entire system must be accessible online for both university staff and high school participants involved in the Office of Sustainability program.

## Decision
Host the application on Microsoft Azure using App Services for the backend and Static Web Apps for the frontend.

## Consequences

### Positive
- Native support for ASP.NET Core simplifies backend deployment
- High uptime and scalability suitable for the Office of Sustainability's needs
- Integrated monitoring, logging, and security tooling available out of the box

### Negative
- Ongoing cloud hosting costs must be budgeted for
- Team requires familiarity with Azure portal and deployment pipelines
