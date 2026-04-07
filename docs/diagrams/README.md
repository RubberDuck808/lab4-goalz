# Diagrams

Architecture diagrams for the Loggin platform written in **Mermaid** — renders natively in GitLab with no configuration needed.

---

## C4 Level 1 — System Context

Who uses the system and what external services it depends on.

```mermaid
flowchart TD

%% ===================== USERS =====================
admin["👤 Admin / Staff<br/>Monitors activity, reviews data, generates reports (HTTPS)"]
student["👤 Student<br/>Explores routes, uploads images, earns points (HTTPS)"]

%% ===================== PLATFORM =====================
platform["Loggin Platform<br/>(Software System)<br/>Core application managing student engagement,<br/>sensor data, image analysis, and reporting"]

%% ===================== EXTERNAL =====================
sensor["Sensor / IoT<br/>Environmental + location data<br/>(HTTP / MQTT)"]
ai["AI Analysis Service<br/>Image analysis & plant identification<br/>(HTTPS)"]
mapapi["Map API<br/>Maps, routes, geolocation<br/>(HTTPS)"]
db["Databases<br/>(PostgreSQL / Supabase + MinIO)<br/>Sensor data, user data, images, analytical results"]

%% ===================== RELATIONSHIPS =====================
admin -->|"Monitors activity, reviews data, generates reports"| platform
student -->|"Explores routes, interacts with checkpoints, uploads images, earns points"| platform
sensor -->|"Sends environmental and location data"| platform
platform <-->|"Sends images for analysis — receives analytical insights"| ai
platform <-->|"Requests map data, routes, geolocation — receives map tiles"| mapapi
platform -->|"Stores and retrieves operational data"| db
```

---

## C4 Level 2 — Container

The internal building blocks of the Loggin Platform and how they communicate.

```mermaid
flowchart TD

%% ===================== USERS =====================
admin["👤 Admin / Staff<br/>Uses monitoring & reporting (HTTPS)"]
student["👤 Student<br/>Uses routes & image capture (HTTPS)"]

%% ===================== PLATFORM =====================
subgraph platform["Loggin Platform"]

    %% --- Frontend ---
    subgraph frontend["Frontend"]
        admin_ui["Admin Dashboard<br/>(React SPA)<br/>Monitoring & reporting"]
        student_ui["Student Application<br/>(React SPA)<br/>Routes, checkpoints, uploads"]
    end

    %% --- Backend ---
    subgraph backend["Backend"]
        api["Backend API<br/>(ASP.NET Core REST API)<br/>Auth, routes, checkpoints, uploads"]
        bg["Background Processing Service<br/>(.NET Worker)<br/>Async jobs, AI orchestration, reports"]
    end

    %% --- Storage ---
    subgraph storage["Storage"]
        object["Object Storage<br/>(MinIO)<br/>Images, reports, binary files"]
    end

end

%% ===================== EXTERNAL =====================
sensor["Sensor / IoT<br/>Environmental + location data<br/>(HTTP / MQTT)"]
ai["AI Analysis Service<br/>Image analysis<br/>(HTTPS multipart/form-data + JSON)"]
mapapi["Map API<br/>Maps, routes, geolocation<br/>(HTTPS JSON)"]
db["Relational Database<br/>(PostgreSQL / Supabase)<br/>Users, routes, checkpoints, sensor data"]

%% ===================== USER FLOW =====================
admin --> admin_ui
student --> student_ui

%% ===================== FRONTEND → API =====================
admin_ui -->|"HTTPS JSON<br/>Admin & reporting requests"| api
student_ui -->|"HTTPS JSON / multipart<br/>Progress, checkpoints, uploads"| api

%% ===================== SENSOR =====================
sensor -->|"HTTP / MQTT JSON<br/>Sensor data"| bg

%% ===================== AI =====================
bg -->|"Upload images<br/>(HTTPS multipart)"| ai
ai -->|"Return insights JSON"| bg

%% ===================== INTERNAL =====================
bg -->|"Trigger jobs (queue / HTTP)"| api

%% ===================== STORAGE =====================
api -->|"Store / retrieve images<br/>(Object Storage API)"| object
bg -->|"Read / write images + reports"| object

%% ===================== DATABASE =====================
api -->|"Read / write app data<br/>(HTTPS SQL via Supabase API)"| db
bg -->|"Persist processed sensor + AI data"| db

%% ===================== MAP =====================
api -->|"Request maps, routes"| mapapi
mapapi -->|"Return map data"| api
```

---

## Editing a Diagram

1. Open the relevant `.mmd` source file in this folder
2. Make your changes using [Mermaid syntax](https://mermaid.js.org/intro/)
3. Copy the updated content into the matching code block above
4. Commit and push — GitLab renders the changes immediately

**Local preview:** Use the [Mermaid VS Code extension](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid) or the [Mermaid live editor](https://mermaid.live/).

---

## Future: Auto-Generation via GitLab CI/CD

> Not yet implemented — see [ADR-008](../adr/0008_use_plantuml_auto_diagrams.md) for the planned approach.

The goal is a CI job that detects source code changes and automatically keeps the diagrams in sync — removing the manual copy-paste step between the `.mmd` source files and this README.
