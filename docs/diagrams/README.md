# Diagrams

Architecture diagrams for the Goalz platform. These render directly in GitLab when PlantUML integration is enabled.

> **Note for maintainers:** If diagrams are not rendering, a GitLab admin needs to enable PlantUML under
> **Admin → Settings → Integrations → PlantUML**.

---

## System Overview

High-level view of all components and how they connect.

```plantuml
@startuml system_overview
!theme plain
title Goalz — System Overview

skinparam componentStyle rectangle
skinparam backgroundColor #FAFAFA
skinparam component {
  BackgroundColor #D6EAF8
  BorderColor #2980B9
}

actor "High School Student" as student
actor "University / Sustainability Team" as admin

package "Field" {
  [ESP32 / Arduino\n(C++ Firmware)] as iot
}

package "Frontend (React.js SPA)" {
  [Student Game UI] as game
  [Sustainability Dashboard] as dashboard
}

package "Backend (ASP.NET Core)" {
  [REST API] as api
}

package "Storage" {
  database "PostgreSQL\n(Supabase)" as db
  storage "MinIO\n(Object Storage)" as minio
}

cloud "Microsoft Azure" {
  [App Service\n(API Host)] as azure_api
  [Static Web App\n(Frontend Host)] as azure_fe
}

student --> game : Play & submit data
admin  --> dashboard : View reports

game      --> azure_fe
dashboard --> azure_fe
azure_fe  --> api

iot --> api : Send sensor data (HTTP/MQTT)
api --> azure_api
api --> db     : Read / Write
api --> minio  : Store / Retrieve images

@enduml
```

---

## Database Schema

PostgreSQL entity relationships managed via Supabase.

```plantuml
@startuml database_schema
!theme plain
title Goalz — Database Schema (PostgreSQL / Supabase)

skinparam backgroundColor #FAFAFA
skinparam class {
  BackgroundColor #D5F5E3
  BorderColor #1E8449
}

entity "students" {
  * id : UUID <<PK>>
  --
  name : VARCHAR
  school : VARCHAR
  created_at : TIMESTAMP
}

entity "routes" {
  * id : UUID <<PK>>
  --
  student_id : UUID <<FK>>
  name : VARCHAR
  coordinates : JSONB
  created_at : TIMESTAMP
}

entity "sensor_logs" {
  * id : UUID <<PK>>
  --
  route_id : UUID <<FK>>
  temperature : FLOAT
  humidity : FLOAT
  co2_ppm : FLOAT
  recorded_at : TIMESTAMP
}

entity "scores" {
  * id : UUID <<PK>>
  --
  student_id : UUID <<FK>>
  route_id : UUID <<FK>>
  points : INT
  awarded_at : TIMESTAMP
}

entity "photos" {
  * id : UUID <<PK>>
  --
  route_id : UUID <<FK>>
  storage_key : VARCHAR
  uploaded_at : TIMESTAMP
}

students  ||--o{ routes      : "walks"
routes    ||--o{ sensor_logs : "generates"
routes    ||--o{ scores      : "earns"
routes    ||--o{ photos      : "has"

@enduml
```

---

## IoT Data Flow

Sequence of events from the ESP32 sensor to the dashboard.

```plantuml
@startuml iot_data_flow
!theme plain
title Goalz — IoT Data Flow (ESP32 → API → DB)

skinparam backgroundColor #FAFAFA
skinparam sequence {
  ArrowColor #2C3E50
  ActorBorderColor #2C3E50
  LifeLineBorderColor #2C3E50
  ParticipantBackgroundColor #FDEBD0
  ParticipantBorderColor #E67E22
}

participant "ESP32\n(C++ Firmware)" as esp
participant "ASP.NET Core\nREST API" as api
participant "PostgreSQL\n(Supabase)" as db
participant "React\nDashboard" as fe

esp -> api   : POST /api/sensor-logs\n{ temp, humidity, co2, route_id }
api -> db    : INSERT INTO sensor_logs
db  --> api  : 201 Created
api --> esp  : 200 OK

fe  -> api   : GET /api/sensor-logs?route_id=X
api -> db    : SELECT * FROM sensor_logs
db  --> api  : Rows
api --> fe   : JSON payload

@enduml
```

---

## Editing a Diagram

1. Open the relevant `.puml` source file in this folder
2. Make your changes using [PlantUML syntax](https://plantuml.com/guide)
3. Copy the updated content into the matching code block above
4. Commit and push — GitLab will render the changes immediately

**Local preview:** Use the [PlantUML VS Code extension](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml) or the [online editor](https://www.plantuml.com/plantuml/uml/).

---

## Future: Auto-Generation via GitLab CI/CD

> Not yet implemented — see [ADR-008](../adr/0008_use_plantuml_auto_diagrams.md) for the planned approach.

The goal is a CI job that detects code changes, re-renders all `.puml` files to `.svg`, and commits them back automatically — so the README stays in sync without any manual copy-paste step.
