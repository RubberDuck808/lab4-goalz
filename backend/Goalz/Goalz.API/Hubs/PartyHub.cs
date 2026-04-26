using Microsoft.AspNetCore.SignalR;

namespace Goalz.Api.Hubs
{
    public class PartyHub : Hub
    {
        public async Task JoinLobbyRoom(long partyId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, partyId.ToString());
        }

        public async Task SendMemberJoined(long partyId, string username)
        {
            await Clients.Group(partyId.ToString()).SendAsync("MemberJoined", username);
        }

        public async Task StartGame(long partyId)
        {
            await Clients.Group(partyId.ToString()).SendAsync("GameStarted", partyId);
        }
    }
}
