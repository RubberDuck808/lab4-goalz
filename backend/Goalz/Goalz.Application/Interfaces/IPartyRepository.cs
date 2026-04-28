using Goalz.Domain.Entities;

namespace Goalz.Application.Interfaces
{
    public interface IPartyRepository 
    {
        Task<Party> CreateAsync(Party party);
        Task<Party?> GetPartyById(long id);
        Task SaveChangesAsync();
        Task<PartyMember> AddMemberAsync(PartyMember member);
        Task<Party?> GetPartyByCode(long Code);
        Task<PartyGroup?> GetPartyGroupByPartyIdAsync(long partyId);
        Task AddGroupAsync(PartyGroup group);
        Task<List<string>> GetLobbyMembers(long partyId);
        Task<List<PartyMember>> GetPartyMembersWithUsersAsync(long partyId);
        Task<List<long>> GetVisitedCheckpointsAsync(long partyId);
        Task VisitCheckpointAsync(long partyId, long checkpointId);
        Task<bool> IsMemberAsync(long partyId, long userId);
        Task<List<Party>> GetStaleLobbyPartiesAsync(DateTime cutoff);
        Task DeleteAsync(Party party);
    }
}