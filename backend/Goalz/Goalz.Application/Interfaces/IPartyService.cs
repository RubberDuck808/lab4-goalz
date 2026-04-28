using Goalz.Core.DTOs;
namespace Goalz.Core.Interfaces
{
    public interface IPartyService
    {
        Task<PartyResponse> CreateParty(PartyRequest request, string creatorUsername);
        Task<PartyResponse?> JoinParty(long Code, string username);
        Task<PartyResponse> GetParty(int partyId);
        Task<List<string>> GetLobbyMembers(long partyId);
        Task<bool> StartGame(long partyId);
        Task<GameStateResponse?> GetGameState(long partyId);
        Task VisitCheckpoint(long partyId, long checkpointId);
    }
}