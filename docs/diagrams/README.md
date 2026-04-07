# Diagrams

Architecture diagrams for the Goalz / Loggin platform written in **Mermaid** — renders natively in GitLab with no configuration needed.

---

## C4 Level 1 — System Context

Who uses the system and what external services does it depend on.

```mermaid
C4Context
    title Level 1 — System Context: Loggin Platform

    Person(admin, "Admin / Staff", "Personnel of the arboretum responsible for monitoring operations and reviewing system outputs.")
    Person(student, "Student", "End user interacting with the system to explore routes, capture images, and participate in activities.")

    System(loggin, "Loggin Platform", "Core application that manages student engagement, collects sensor and image data, processes analysis, and provides reporting tools for staff.")

    System_Ext(sensor, "Sensor / IoT", "Devices deployed in the arboretum that provide environmental and location-based data.")
    System_Ext(ai, "AI Analysis Service", "Processes uploaded images and returns analytical insights such as plant identification and health status.")
    System_Ext(mapapi, "Map API", "Provides map, geolocation, and route visualization services.")
    SystemDb_Ext(databases, "Databases", "Stores sensor data, user data, images, and analytical results.")

    Rel(admin, loggin, "Monitors activity, reviews data, generates reports")
    Rel(student, loggin, "Explores routes, interacts with checkpoints, uploads images, earns points")
    Rel(sensor, loggin, "Sends environmental and location data")
    BiRel(loggin, ai, "Sends captured images for analysis and receives analytical insights")
    BiRel(loggin, mapapi, "Requests and receives map data, route information, map tiles, and geolocation data")
    Rel(loggin, databases, "Stores operational data and retrieves it for analytics, dashboards, and reporting")
```

---

## C4 Level 2 — Container

The internal building blocks of the Loggin Platform and how they communicate.

```mermaid
C4Container
    title Level 2 — Container: Loggin Platform

    Person(admin, "Admin / Staff", "Personnel of the arboretum responsible for monitoring operations and reviewing system outputs.")
    Person(student, "Student", "End user interacting with the system to explore routes, capture images, and participate in activities.")

    System_Ext(sensor, "Sensor / IoT", "Devices deployed in the arboretum that provide environmental and location-based data.")
    System_Ext(ai, "AI Analysis Service", "Processes uploaded images and returns structured insights.")
    System_Ext(mapapi, "Map API", "Provides map tiles, route paths, and geolocation data.")

    System_Boundary(loggin, "Loggin Platform") {
        Container(adminDash, "Admin Dashboard", "React JS", "Single-page web application for arboretum staff to monitor activity, review collected data, and generate reports.")
        Container(studentApp, "Student Application", "React JS", "Web/mobile-facing client for students to explore routes, interact with checkpoints, upload images, and earn points.")
        Container(bgService, "Background Processing Service", "C# / .NET Worker Service", "Executes asynchronous tasks: sensor data ingestion, AI analysis orchestration, and report generation.")
        Container(api, "Backend API", "C# / ASP.NET Core REST API", "Handles authentication, business logic, route management, checkpoint interactions, image submission, and reporting.")
        ContainerDb(objectStorage, "Object Storage", "MinIO", "Stores uploaded images, generated reports, and other binary files.")
        ContainerDb(db, "Relational Database", "PostgreSQL / Supabase", "Stores users, routes, checkpoints, sessions, points, sensor metadata, and application data.")
    }

    Rel(admin, adminDash, "Sends administration, monitoring, and reporting requests", "HTTPS, JSON")
    Rel(student, studentApp, "Sends route progress, checkpoint events, image uploads, and point-related actions", "HTTPS, JSON/multipart")
    Rel(adminDash, api, "API requests", "HTTPS, JSON")
    Rel(studentApp, api, "API requests", "HTTPS, JSON/multipart")
    Rel(sensor, bgService, "Submits environmental and location data", "HTTP or MQTT, JSON")
    Rel(bgService, api, "Triggers asynchronous processing jobs", "Queue/HTTP")
    BiRel(bgService, objectStorage, "Stores and retrieves images and generated reports", "HTTP, Object Storage API")
    BiRel(bgService, ai, "Uploads images for analysis and receives structured insights", "HTTPS, multipart/form-data")
    BiRel(api, mapapi, "Requests and receives map tiles, route paths, and geolocation data", "HTTPS, JSON")
    BiRel(api, objectStorage, "Reads and writes images and reports", "HTTP, Object Storage API")
    Rel(api, db, "Reads and writes application data", "HTTPS, JSON via Supabase API")
    Rel(bgService, db, "Persists processed sensor data and AI analysis results", "HTTPS, JSON via Supabase API")
```

---

## System Overview

High-level component view across all layers.

```mermaid
flowchart TD
    student["👤 High School Student"]
    admin["👤 University / Sustainability Team"]

    subgraph Field
        iot["ESP32 / Arduino\n(C++ Firmware)"]
    end

    subgraph Frontend["Frontend (React.js SPA)"]
        game["Student Game UI"]
        dashboard["Sustainability Dashboard"]
    end

    subgraph Backend["Backend (ASP.NET Core)"]
        api["REST API"]
    end

    subgraph Storage
        db[("PostgreSQL\n(Supabase)")]
        minio[("MinIO\n(Object Storage)")]
    end

    subgraph Azure["Microsoft Azure"]
        azure_api["App Service\n(API Host)"]
        azure_fe["Static Web App\n(Frontend Host)"]
    end

    student -->|"Play & submit data"| game
    admin -->|"View reports"| dashboard
    game --> azure_fe
    dashboard --> azure_fe
    azure_fe --> api
    iot -->|"Send sensor data\n(HTTP/MQTT)"| api
    api --> azure_api
    api -->|"Read / Write"| db
    api -->|"Store / Retrieve images"| minio
```

---

## Database Schema

PostgreSQL entity relationships managed via Supabase.

```mermaid
erDiagram
    students {
        UUID id PK
        VARCHAR name
        VARCHAR school
        TIMESTAMP created_at
    }
    routes {
        UUID id PK
        UUID student_id FK
        VARCHAR name
        JSONB coordinates
        TIMESTAMP created_at
    }
    sensor_logs {
        UUID id PK
        UUID route_id FK
        FLOAT temperature
        FLOAT humidity
        FLOAT co2_ppm
        TIMESTAMP recorded_at
    }
    scores {
        UUID id PK
        UUID student_id FK
        UUID route_id FK
        INT points
        TIMESTAMP awarded_at
    }
    photos {
        UUID id PK
        UUID route_id FK
        VARCHAR storage_key
        TIMESTAMP uploaded_at
    }

    students ||--o{ routes : "walks"
    routes ||--o{ sensor_logs : "generates"
    routes ||--o{ scores : "earns"
    routes ||--o{ photos : "has"
```

---

## IoT Data Flow

Sequence of events from the ESP32 sensor to the dashboard.

```mermaid
sequenceDiagram
    participant esp as ESP32 (C++ Firmware)
    participant api as ASP.NET Core REST API
    participant db as PostgreSQL (Supabase)
    participant fe as React Dashboard

    esp->>api: POST /api/sensor-logs { temp, humidity, co2, route_id }
    api->>db: INSERT INTO sensor_logs
    db-->>api: 201 Created
    api-->>esp: 200 OK

    fe->>api: GET /api/sensor-logs?route_id=X
    api->>db: SELECT * FROM sensor_logs
    db-->>api: Rows
    api-->>fe: JSON payload
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
