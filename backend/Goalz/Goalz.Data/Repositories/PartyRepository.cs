using Goalz.Application.Interfaces;
using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Data.Storage;
using Goalz.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
//Service kümmert sich um Logik, Repository um Datenbankzugriff.
//mehrere Services können das gleiche Repository nutzen.
//wenn du die Datenbank wechselst, änderst du nur das Repository.

namespace Goalz.Data.Repositories
{
    public class PartyRepository(AppDbContext context) : IPartyRepository
    {
        private readonly AppDbContext _context = context; //muss innerhalb einer class sein, namespace akzeptiert keine deklarationen

        public async Task<PartyMember> AddMemberAsync(PartyMember member)
        {
            await _context.PartyMembers.AddAsync(member);
            await _context.SaveChangesAsync();
            return member;
        }

        public async Task<Party> CreateAsync(Party party)
        {
            await _context.Parties.AddAsync(party);
            await _context.SaveChangesAsync();
            return party;
        }

        public async Task<Party?> GetPartyById(long id)
        {
            return await _context.Parties
                .FirstOrDefaultAsync(p => p.Id == id); //<Party?> mit Fragezeichen, da somit auch ein nullable Wert zurückgegeben werden kann. Error CS8603
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<Party?> GetPartyByCode(long Code)
        {
            return await _context.Parties
                .FirstOrDefaultAsync(p => p.Code == Code);
        }
        public async Task<PartyGroup?> GetPartyGroupByPartyIdAsync(long partyId)
        {
            return await _context.PartyGroups
                .FirstOrDefaultAsync(pg => pg.PartyId == partyId);
        }
        public async Task AddGroupAsync(PartyGroup group)
        {
            await _context.PartyGroups.AddAsync(group);
        }
    }
}