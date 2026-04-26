# Arboretum Dashboard — Staff Admin Panel

The staff-facing admin dashboard for the Loggin platform. Staff and admins use this to monitor game sessions, view activity, and manage the platform.

Built with **React 19** + **Vite** + **Tailwind CSS**.

---

## What this is

A separate web app from the player-facing Loggin app — this is only for **Staff** and **Admin** users. Access is controlled by role; players cannot log in here.

---

## Current State

Login page is implemented and connects to the backend authentication endpoint (`POST /api/dashboard/auth/login`). The overview page is a placeholder.

**Implemented routes:**
| Route | Description |
|---|---|
| `/` | Login page — email + password authentication |
| `/overview` | Overview page (placeholder) |

---

## Running Locally

```bash
cd frontend/dashboard
npm install
npm run dev
```

Dashboard runs at `http://localhost:5174` by default.

Or via Docker (full stack):
```bash
# From repo root
docker compose up dashboard
```
Dashboard runs at `http://localhost:3001`.

---

## Structure

```
src/
  pages/         # Page components (Login, Overview)
  components/    # Shared UI components
  hooks/
    useAPI.jsx   # Generic fetch hook for backend requests
  services/
    authService.jsx  # Handles login API call and token storage
  assets/
```

---

## Authentication

Login calls `POST /api/dashboard/auth/login` with `{ email, password }`. On success, a JWT token is returned and stored in `localStorage`. The `useAPI` hook automatically attaches it as a `Bearer` token on all subsequent requests.

Only users with `Staff` or `Admin` roles can authenticate through this dashboard.

---

## API

All requests go to the backend API at `http://localhost:8080/api/dashboard`. In production this is proxied via the Nginx config (`nginx.conf`).
