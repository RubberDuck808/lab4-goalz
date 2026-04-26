using Goalz.Core.DTOs;

namespace Goalz.Core.Interfaces
{
    public interface ILobbyService
    {
        Task<LobbyResponse> JoinLobby(long partyId, string username);
    }
}
