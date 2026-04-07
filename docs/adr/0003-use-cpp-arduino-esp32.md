# ADR 003: Use C++ (Arduino/ESP32) for IoT Sensor Firmware

## Status
Accepted

## Context
Sensors and hardware (IoT) need to collect data in the field and send it to the dashboard reliably and efficiently.

## Decision
Use C++ (Arduino/ESP32) for the IoT sensor firmware development.

## Consequences

### Positive
- Direct hardware access and low-level control over sensors
- Large Arduino/ESP32 community and library ecosystem
- Low power consumption and real-time performance suitable for field devices

### Negative
- Knowledge of C++ needs to be developed within the team
- Debugging embedded firmware is more complex than higher-level languages
