# Domain Model

Entities live in `backend/Goalz/Goalz.Domain/Entities/`.

## Registered DbSets (active in AppDbContext)

Only these four are registered in `Goalz.Data/Storage/AppDbContext.cs`:

| Entity | Key fields |
|---|---|
| **User** | `long Id`, `Username`, `Name`, `Email`, `PasswordHash`, `Role` (enum), `CreatedAt` |
| **Friendship** | `long Id`, `RequesterId` → User, `AddresseeId` → User, `Status` (enum), `CreatedAt`, `UpdatedAt` |
| **Sensor** | `long Id`, `Temp`, `Humidity`, `Point Geo` (PostGIS) |
| **Element** | `long Id`, `Point Geom` (PostGIS), `ImageUrl`, `IsGreen` |

## Unregistered Entities (domain only — no DbSet, no table)

These exist as domain entities but are **not** in `AppDbContext` and have no migration:
`Quiz`, `Question`, `Answer`, `Party`, `PartyGroup`, `PartyMember`, `PartyGroupAnswer`

To use any of these: add a `DbSet<T>` to `AppDbContext` and run a migration first.

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
