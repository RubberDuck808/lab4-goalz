using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Goalz.Core.Interfaces;
using Goalz.Application.Interfaces;

namespace Goalz.Api.Hubs
{
    [Authorize]
    public class PartyHub : Hub
    {
        private readonly IUserRepository _userRepository;
        private readonly IPartyRepository _partyRepository;

        public PartyHub(IUserRepository userRepository, IPartyRepository partyRepository)
        {
            _userRepository = userRepository;
            _partyRepository = partyRepository;
        }

        public async Task JoinPartyRoom(long partyId)
        {
            var username = Context.User?.Identity?.Name;
            if (string.IsNullOrEmpty(username))
            {
                throw new HubException("Unauthorized connection: User identity not found.");
            }

            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null)
            {
                throw new HubException("Unauthorized connection: User account not found.");
            }

            var isMember = await _partyRepository.IsMemberAsync(partyId, user.Id);
            if (!isMember)
            {
                throw new HubException("Forbidden: You are not a member of this party.");
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, partyId.ToString());
        }

        public async Task LeavePartyRoom(long partyId)
            => await Groups.RemoveFromGroupAsync(Context.ConnectionId, partyId.ToString());
    }
}
