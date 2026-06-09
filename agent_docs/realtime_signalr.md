# Real-Time Party Updates — SignalR

## Why SignalR

Party game state (members joining, game starting, checkpoints visited, game completing) used to be kept in sync by every player polling `GET /api/game/party/{id}/state` every 3 seconds. At scale that produces thousands of redundant DB round-trips per second. SignalR replaces this with server-push: the backend broadcasts state to the party group the moment it changes, and the mobile client only falls back to REST if the WebSocket is down.

---

## Architecture Overview

```
Mobile client                    ASP.NET Core API
─────────────────────────────    ────────────────────────────────────────
GameContext.jsx
  buildPartyConnection()  ──────→  /hubs/party  (PartyHub)
  connection.invoke(                  Groups.AddToGroupAsync(partyId)
    "JoinPartyRoom", partyId)
                                      ↓ event fires (e.g. another player joins)
  on("MemberJoined", state)  ←──  IHubContext<PartyHub>
  applyServerState(state)             .Clients.Group(partyId)
                                      .SendAsync("MemberJoined", gameState)
  [30s fallback poll]  ────────→  GET /api/game/party/{id}/state
```

---

## Backend

### `Program.cs` — JWT for WebSockets

WebSocket connections cannot send HTTP headers, so the JWT arrives as a query parameter on the hub handshake. An `OnMessageReceived` event inside the `AddJwtBearer` block reads it:

```csharp
options.Events = new JwtBearerEvents
{
    OnMessageReceived = context =>
    {
        var token = context.Request.Query["access_token"];
        if (!string.IsNullOrEmpty(token) &&
            context.HttpContext.Request.Path.StartsWithSegments("/hubs"))
            context.Token = token;
        return Task.CompletedTask;
    }
};
```

**File:** `Goalz.API/Program.cs`

---

### `PartyHub.cs` — group membership only

The hub's only job is managing SignalR group membership. All broadcasting is done server-side via `IHubContext<PartyHub>` injected into controllers — the hub itself has no broadcast methods.

```csharp
[Authorize]
public class PartyHub : Hub
{
    public async Task JoinPartyRoom(long partyId)
        => await Groups.AddToGroupAsync(Context.ConnectionId, partyId.ToString());

    public async Task LeavePartyRoom(long partyId)
        => await Groups.RemoveFromGroupAsync(Context.ConnectionId, partyId.ToString());
}
```

**File:** `Goalz.API/Hubs/PartyHub.cs`  
**Mapped at:** `/hubs/party`

---

### `PartyController.cs` — push after each mutation

`IHubContext<PartyHub>` is injected into `PartyController`. After every state-changing action the controller fetches the fresh `GameStateResponse` and broadcasts it to the party group:

| Action | Event pushed | Payload |
|---|---|---|
| `POST /party/join` | `MemberJoined` | full `GameStateResponse` |
| `POST /party/{id}/start` | `GameStarted` | full `GameStateResponse` |
| `POST /party/{id}/visit` | `CheckpointVisited` | full `GameStateResponse` |
| `POST /party/{id}/complete` | `GameCompleted` | `{ username }` |

Pushing the full `GameStateResponse` on each event means the client update path is identical to what it did with REST polling — no special per-event deserialization needed.

**File:** `Goalz.API/Controllers/Game/PartyController.cs`

---

## Frontend

### `services/signalr.js`

Builds a `HubConnection` with the JWT token factory and automatic reconnect:

```js
import * as signalR from '@microsoft/signalr';
import { getToken } from './session';

export function buildPartyConnection() {
  return new signalR.HubConnectionBuilder()
    .withUrl(`${BASE}/hubs/party`, {
      accessTokenFactory: () => getToken(),  // → ?access_token=<JWT>
    })
    .withAutomaticReconnect()
    .build();
}
```

**File:** `frontend/mobile/services/signalr.js`

---

### `context/GameContext.jsx` — connection lifecycle

When `partyId` becomes non-null the context:

1. Fires an **initial REST poll** so the UI is populated immediately (before the WebSocket handshake completes)
2. Builds the hub connection and registers event listeners
3. Calls `connection.invoke("JoinPartyRoom", partyId)` after the connection starts
4. Starts a **30-second fallback poll** (`setInterval`) to re-sync if the WebSocket drops
5. On reconnect, re-joins the room and fires one immediate poll to catch up
6. When `partyId` becomes null (game over / user leaves), calls `LeavePartyRoom`, stops the connection, and clears the fallback interval

```
partyId set
    │
    ├── initial REST poll (immediate)
    ├── buildPartyConnection()
    │     ├── on("MemberJoined",      applyServerState)
    │     ├── on("GameStarted",       applyServerState)
    │     └── on("CheckpointVisited", applyServerState)
    ├── connection.start()
    ├── invoke("JoinPartyRoom", partyId)
    └── start 30s fallback interval

partyId cleared
    ├── invoke("LeavePartyRoom", partyId)
    ├── connection.stop()
    └── clearInterval(fallback)
```

The shared `applyServerState(data)` function handles state updates from both the hub events and the fallback poll — the `GameStateResponse` shape is identical in both cases.

**File:** `frontend/mobile/context/GameContext.jsx`

---

## Event reference

| Event name | Direction | Payload | When fired |
|---|---|---|---|
| `MemberJoined` | server → client | `GameStateResponse` | A player calls `POST /party/join` |
| `GameStarted` | server → client | `GameStateResponse` | Host calls `POST /party/{id}/start` |
| `CheckpointVisited` | server → client | `GameStateResponse` | Any player calls `POST /party/{id}/visit` |
| `GameCompleted` | server → client | `{ username: string }` | Any player calls `POST /party/{id}/complete` |
| `JoinPartyRoom` | client → server | `partyId: long` | Client invokes on connect / reconnect |
| `LeavePartyRoom` | client → server | `partyId: long` | Client invokes before disconnect |

---

## Fallback poll

The 30-second fallback exists for two reasons:

1. **Network resilience** — mobile networks drop WebSocket connections. `withAutomaticReconnect()` will attempt to re-establish, but during the reconnect window the fallback keeps state from going stale.
2. **App resume** — when the app returns from background, an immediate poll fires regardless of the hub state.

If you want to remove the fallback entirely (e.g. in a controlled network environment), delete the `scheduleFallback()` call and the `AppState` listener in `GameContext.jsx`. The hub events alone are sufficient when connectivity is reliable.

---

## Adding a new real-time event

1. **Backend**: After the relevant state change in the controller, call:
   ```csharp
   await _hub.Clients.Group(partyId.ToString()).SendAsync("YourEventName", payload);
   ```
2. **Frontend**: In `GameContext.jsx` (inside the `start()` async function), add:
   ```js
   connection.on('YourEventName', (data) => { /* update state */ });
   ```
3. **Document**: Add a row to the Event reference table above.

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Hub connection rejected (401) | Token not reaching the hub — check `accessTokenFactory` returns a non-null string; check `OnMessageReceived` is in `Program.cs` |
| State not updating in real time | Client not calling `JoinPartyRoom` — check the `invoke` call runs after `connection.start()` resolves |
| Duplicate state updates | Multiple `GameContext` instances mounted — ensure `GameProvider` wraps the tree only once in `App.js` |
| Connection drops immediately | CORS — check `AllowFrontend` policy in `Program.cs` includes the app's origin; SignalR negotiation uses HTTP before upgrading |
