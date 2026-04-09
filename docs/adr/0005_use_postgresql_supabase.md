# ADR 005: Use PostgreSQL via Supabase as Primary Database

## Status
Accepted

## Context
Relational data such as user scores, route coordinates, and sensor logs must be stored reliably and support complex queries.

## Decision
Use PostgreSQL (via Supabase) as the primary relational database.

## Consequences

### Positive
- Supports complex queries and spatial data (GPS routes) out of the box
- Managed hosting via Supabase reduces infrastructure maintenance
- Built-in authentication and real-time subscriptions accelerate development

### Negative
- Vendor dependency on Supabase's managed platform
- Migrating away from Supabase in the future would require significant effort
