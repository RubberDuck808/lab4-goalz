# Adding a New Backend Feature

Follow this order when adding a backend feature end-to-end:

1. **Entity** — add to `Goalz.Domain/Entities/`. Use `long Id` PK. Navigation collections default to `[]`.

2. **DbSet** — add to `Goalz.Data/Storage/AppDbContext.cs`. Add any `OnModelCreating` config in the same file:
   - Enum properties **must** have `.HasConversion<string>()` or they'll be stored as integers
   - Add indexes and FK delete behavior here

3. **Migration** — see `CLAUDE.md` for the required command (must use `--configuration Release`).

4. **Repository interface** — add `IXxxRepository` to `Goalz.Application/Interfaces/`, namespace `Goalz.Core.Interfaces`.

5. **Repository** — implement in `Goalz.Data/Repositories/`. Inject `AppDbContext` via constructor.

6. **Service interface** — add `IXxxService` to `Goalz.Application/Interfaces/`.

7. **Service** — implement in `Goalz.Application/Services/`, namespace `Goalz.Core.Services`. Inject the repository interface.

8. **DI registration** — in `Goalz.API/Program.cs`, register both as `Scoped`:
   ```csharp
   builder.Services.AddScoped<IXxxRepository, XxxRepository>();
   builder.Services.AddScoped<IXxxService, XxxService>();
   ```

9. **Controller** — add under `Goalz.API/Controllers/Game/` or `Dashboard/`. Inject the service interface. See `api_and_auth.md` for route conventions.

10. **DTOs** — add to `Goalz.Application/DTOs/`, namespace `Goalz.Core.DTOs`.

## Error Handling Pattern

Service methods return `(bool Success, string? Error)` tuples. Controllers switch on the error string to select the HTTP status code.

Reference implementation: `backend/Goalz/Goalz.API/Controllers/Game/FriendshipController.cs`

```csharp
var (success, error) = await _service.DoSomethingAsync(...);
if (!success)
{
    return error switch
    {
        "not_found" => NotFound("..."),
        "conflict_reason" => Conflict("..."),
        _ => BadRequest("Something went wrong.")
    };
}
return NoContent();
```
