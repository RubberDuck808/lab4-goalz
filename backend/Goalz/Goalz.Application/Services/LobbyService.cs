using Goalz.Application.Interfaces;
using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;

namespace Goalz.Core.Services
{
    public class LobbyService(IPartyRepository partyRepository, IUserRepository userRepository) : ILobbyService
    {
        private readonly IPartyRepository _partyRepository = partyRepository;
        private readonly IUserRepository _userRepository = userRepository;

        public async Task<LobbyResponse> JoinLobby(long partyId, string username)
        {
            var party = await _partyRepository.GetPartyById(partyId)
                ?? throw new Exception("Party not found");

            var user = await _userRepository.GetByUsernameAsync(username)
                ?? throw new Exception("User not found");

            var members = await _partyRepository.GetLobbyMembers(partyId);

            return new LobbyResponse
            {
                PartyId = party.Id,
                PartyName = party.Name,
                Members = members,
                Code = party.Code,
                IsReady = false
            };
        }
    }
}
