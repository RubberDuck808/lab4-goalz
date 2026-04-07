# Diagrams

Architecture diagrams for the Goalz platform written in **Mermaid** — renders natively in GitLab with no configuration needed.

---

## System Overview

High-level view of all components and how they connect.

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
