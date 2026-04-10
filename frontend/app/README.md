# Loggin — Player App

The player-facing mobile web app for the Loggin game. Players use this to log in, create or join parties, play through game sections, answer quizzes, and track their score and profile.

Built with **React 19** + **Vite** + **Tailwind CSS**.

---

## What this is

Loggin is an interactive outdoor game set in the Arboretum. Players are split into groups and given roles — **Scouts** collect hint fragments from sensors hidden in the environment, and **Trailblazers** photograph nature elements to reveal a hidden box on the map. When both tasks are done, the group gathers at the box to answer a quiz and earn points.

See [`docs/game_flow.md`](../../docs/game_flow.md) for the full game flow.

---

## Current State

Early scaffolding — the app renders a placeholder page. Routes and pages are yet to be built.

---

## Running Locally

```bash
cd frontend/app
npm install
npm run dev
```

App runs at `http://localhost:5173` by default.

Or via Docker (full stack):
```bash
# From repo root
docker compose up app
```
App runs at `http://localhost:3000`.

---

## Structure

```
src/
  pages/       # Page components (one per route)
  components/  # Shared UI components
  hooks/       # Custom React hooks
  services/    # API communication
  assets/      # Images, icons
```

---

## API

All requests go to the backend API at `http://localhost:8080/api`. In production this is proxied via the Nginx config (`nginx.conf`).
