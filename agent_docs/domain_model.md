# Domain Model

Entities live in `backend/Goalz/Goalz.Domain/Entities/`.

## Source of truth

For the full list of registered entities/DbSets, table columns, FKs, and indexes: see **[`docs/db_schema.sql`](../docs/db_schema.sql)** (generated DDL — regenerate with `dotnet ef migrations script --project Goalz.Data --startup-project Goalz.API --configuration Release -o ../../docs/db_schema.sql` from `backend/Goalz`, API stopped) and **[PROJECT_DETAILS.md §6](../PROJECT_DETAILS.md#6-backend--domain-model)** for a one-line-per-entity purpose summary.

Don't re-list entities here — that's exactly how this doc went stale before (it once claimed only 4 entities were registered; there are 21).

The only entity genuinely **not** in the active `AppDbContext`: `Information` — orphaned, no DbSet, no migration, safe to ignore.

## Enums

Enums are stored as **strings** in the database (not integers). This is configured per-entity in `OnModelCreating`. When adding any new enum property, add `.HasConversion<string>()`:

```csharp
modelBuilder.Entity<MyEntity>()
    .Property(e => e.MyEnum)
    .HasConversion<string>();
```

**Enum types:**
- `Role`: `Player`, `Staff`, `Admin`
- `FriendshipStatus`: `Pending`, `Accepted`

## Friendship Directionality

The Friendship entity is directional:
- `RequesterId` = the user who sent the request
- `AddresseeId` = the user who received it
- Unique index on `(RequesterId, AddresseeId)` — a pair can only have one record in one direction

Password hashing uses BCrypt (`BCrypt.Net-Next`): `BCrypt.HashPassword()` / `BCrypt.Verify()`.

## PostGIS

`Sensor.Geo` and `Element.Geom` are `NetTopologySuite.Geometries.Point`. Requires:
- `UseNetTopologySuite()` in EF options (already in `Program.cs`)
- `modelBuilder.HasPostgresExtension("postgis")` (already in `AppDbContext.OnModelCreating`)
- `GeoJsonConverterFactory` registered in JSON options (already in `Program.cs`)
