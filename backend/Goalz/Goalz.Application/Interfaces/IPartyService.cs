using Goalz.Core.DTOs;
namespace Goalz.Core.Interfaces
{
    public interface IPartyService
    {
        Task<PartyResponse> CreateParty(PartyRequest request);
        Task<PartyResponse> JoinParty(long Code, string username);
        Task<PartyResponse> GetParty(int partyId);
        Task<List<string>> GetLobbyMembers(long partyId);
    }
}