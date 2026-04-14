# Goalz.API

## What is this?

This is the **entry point** of the backend — the part that receives HTTP requests from the frontend and sends back responses. It's what the outside world actually talks to.

When the frontend says "log this user in" or "fetch this party's data", it sends an HTTP request to this project. The API receives it, hands it to the right service, and sends back the result.

---

## Why does this exist separately?

The API layer is intentionally kept thin — it should do as little work as possible. Its only job is:
1. Receive an HTTP request
2. Hand it to the correct Application service
3. Return the result as an HTTP response

All the real logic lives in `Goalz.Application`. All the database work lives in `Goalz.Infrastructure`. This separation means controllers are easy to read and rarely need to change.

---

## What's inside?

### `Controllers/`
Each controller handles a group of related API endpoints.

| File | Endpoints it handles |
|---|---|
| `dashboard/authentication.cs` | `POST /api/dashboard/login` — handles staff/admin login |

Controllers receive requests, call the appropriate service, and return a response (e.g. `200 OK`, `401 Unauthorized`).

### `Program.cs`
This is the **startup file** — it wires everything together. It:
- Registers all services (AuthService, DbContext, Repository) so they can be injected where needed
- Sets up middleware (Swagger, routing, authorization)
- Starts the web server

### `appsettings.json`
Configuration file for non-secret settings (logging levels, allowed hosts). The database connection string placeholder lives here but is overridden by environment variables or user-secrets in practice.

---

## How requests flow through the system

```
Frontend (React)
    │
    │  HTTP Request (e.g. POST /api/dashboard/login)
    ▼
Goalz.API (Controller)
    │
    │  Calls service
    ▼
Goalz.Application (AuthService)
    │
    │  Queries database
    ▼
Goalz.Infrastructure (Repository / DbContext)
    │
    │  SQL query
    ▼
PostgreSQL (Supabase)
```

---

## Dependencies

- **Goalz.Application** — to call services
- **Goalz.Infrastructure** — to register DbContext and repositories in `Program.cs`
- Swashbuckle (Swagger) — auto-generates interactive API documentation at `/swagger`

---

## Running locally

```bash
# From the repo root
docker compose up -d postgres   # start local database
cd backend/Goalz/Goalz.API
dotnet run                      # start the API
```

Then open `http://localhost:8080/swagger` to see and test all available endpoints.

---

## Analogy

If this were a restaurant:
- **API** = the front door and the host — greets customers (requests), takes their name (parses input), and hands them off to the right waiter (Application service)
