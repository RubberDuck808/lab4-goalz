# Goalz — Office of Sustainability Platform

> [!NOTE]
> This project is developed as part of a university–high school collaboration under the Office of Sustainability program.

## Overview

<!-- TODO: Add a 2–3 sentence description of what the platform does and who it is for -->

Goalz is a sustainability platform that connects university students and high school participants to collect environmental data, visualize routes, and engage through an interactive game dashboard.

## Table of Contents

- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [Documentation](#documentation)

---

## Project Structure

```
lab4-goalz/
├── backend/        # ASP.NET Core Web API (C#)
├── frontend/       # React.js Single Page Application
├── hardware/       # IoT firmware (C++/Arduino/ESP32)
└── docs/
    ├── adr/        # Architecture Decision Records
    └── commit-template.md
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | ASP.NET Core (C#) |
| Frontend | React.js (JavaScript) |
| IoT Firmware | C++ (Arduino / ESP32) |
| Database | PostgreSQL via Supabase |
| Object Storage | MinIO |
| Hosting | Microsoft Azure |
| Version Control & CI/CD | GitLab |

> For the rationale behind each technology choice, see [`docs/adr/`](docs/adr/).

---

## Getting Started

### Prerequisites

<!-- TODO: List required tools and versions (e.g. Node.js, .NET SDK, Arduino IDE, etc.) -->

- Node.js `>= X.X`
- .NET SDK `>= X.X`
- Arduino IDE / PlatformIO
- Docker (for MinIO local development)

### Installation

<!-- TODO: Fill in setup steps once project scaffolding is complete -->

```bash
# Clone the repository
git clone <repository-url>
cd lab4-goalz

# Backend
cd backend
# TODO: add setup commands

# Frontend
cd ../frontend
# TODO: add setup commands
```

### Environment Variables

<!-- TODO: Document required environment variables (use a .env.example file) -->

Copy `.env.example` to `.env` and fill in the required values:

```
# TODO: Add environment variable list
```

---

## Contributing

We follow a structured commit message format to keep the project history clear and readable for all team members, including high school students.

See [`docs/commit-template.md`](docs/commit-template.md) for the full template and examples.

### Branch Naming

<!-- TODO: Define branch naming conventions (e.g. feature/, fix/, docs/) -->

```
feature/<short-description>
fix/<short-description>
docs/<short-description>
```

### Pull / Merge Requests

<!-- TODO: Add MR/PR process (review requirements, approval rules, etc.) -->

---

## Documentation

| Document | Description |
|----------|-------------|
| [`docs/adr/`](docs/adr/) | Architecture Decision Records — all major technology and design decisions |
| [`docs/commit-template.md`](docs/commit-template.md) | Commit message format and examples |

---

## Team

<!-- TODO: Add team members, roles (e.g. Senior Students, Maintainers) and contact info -->

| Name | Role |
|------|------|
| <!-- Name --> | <!-- Role --> |

---

## License

<!-- TODO: Add license information -->
