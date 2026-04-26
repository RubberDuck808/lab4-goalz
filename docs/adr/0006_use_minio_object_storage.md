# ADR 006: Use MinIO as S3-Compatible Object Storage

## Status
Accepted

## Context
Students will upload photos of routes and landscape elements which are too large to store efficiently in a standard relational database.

## Decision
Use MinIO as an S3-compatible Object Storage solution for images and other large binary files.

## Consequences

### Positive
- Keeps the database lean and fast by offloading large binary files
- S3-compatible API allows easy migration to other object stores if needed
- Handles high-resolution photos efficiently at scale

### Negative
- Requires running and maintaining a separate MinIO service
- Team must learn object storage concepts and MinIO administration
