using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Goalz.Api.Hubs
{
    [Authorize]
    public class PartyHub : Hub
    {
        public async Task JoinPartyRoom(long partyId)
            => await Groups.AddToGroupAsync(Context.ConnectionId, partyId.ToString());

        public async Task LeavePartyRoom(long partyId)
            => await Groups.RemoveFromGroupAsync(Context.ConnectionId, partyId.ToString());
    }
}
