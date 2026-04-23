using Goalz.Domain.Entities;

namespace Goalz.Application.Interfaces
{
    public interface IPartyRepository 
    {
        Task<Party> CreateAsync(Party party);
        Task<Party> GetPartyById(long id);
        Task SaveChangesAsync();
        Task<PartyMember> AddMemberAsync(PartyMember member);
        Task<Party> GetPartyByCode(long Code);
        Task<PartyGroup?> GetPartyGroupByPartyIdAsync(long partyId);
        Task AddGroupAsync(PartyGroup group);
    }
}