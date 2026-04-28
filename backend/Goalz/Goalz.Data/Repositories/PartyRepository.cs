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
                .Where(pg => pg.PartyId == partyId)
                .OrderBy(pg => pg.PartyMembers.Count)
                .FirstOrDefaultAsync();
        }
        public async Task AddGroupAsync(PartyGroup group)
        {
            await _context.PartyGroups.AddAsync(group);
        }

        public async Task<List<string>> GetLobbyMembers(long partyId)
        {
            return await _context.PartyGroups
                .Where(pg => pg.PartyId == partyId)
                .SelectMany(pg => pg.PartyMembers)   
                .Select(pm => pm.User.Username)
                .ToListAsync();
        }

        public async Task<List<PartyMember>> GetPartyMembersWithUsersAsync(long partyId)
        {
            return await _context.PartyGroups
                .Where(pg => pg.PartyId == partyId)
                .SelectMany(pg => pg.PartyMembers)
                .Include(pm => pm.User)
                .ToListAsync();
        }

        public async Task<List<long>> GetVisitedCheckpointsAsync(long partyId)
        {
            return await _context.PartyVisitedCheckpoints
                .Where(pvc => pvc.PartyId == partyId)
                .Select(pvc => pvc.CheckpointId)
                .ToListAsync();
        }

        public async Task VisitCheckpointAsync(long partyId, long checkpointId)
        {
            var exists = await _context.PartyVisitedCheckpoints.AnyAsync(pvc => pvc.PartyId == partyId && pvc.CheckpointId == checkpointId);
            if (!exists)
            {
                await _context.PartyVisitedCheckpoints.AddAsync(new PartyVisitedCheckpoint { PartyId = partyId, CheckpointId = checkpointId });
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> IsMemberAsync(long partyId, long userId)
        {
            return await _context.PartyMembers.AnyAsync(pm => pm.PartyId == partyId && pm.UserId == userId);
        }

        public async Task<List<Party>> GetStaleLobbyPartiesAsync(DateTime cutoff)
        {
            return await _context.Parties
                .Where(p => p.Status == "Lobby" && p.CreatedAt < cutoff)
                .ToListAsync();
        }

        public async Task DeleteAsync(Party party)
        {
            var visitedCheckpoints = await _context.PartyVisitedCheckpoints
                .Where(pvc => pvc.PartyId == party.Id)
                .ToListAsync();
            _context.PartyVisitedCheckpoints.RemoveRange(visitedCheckpoints);

            var memberIds = await _context.PartyMembers
                .Where(pm => pm.PartyId == party.Id)
                .Select(pm => pm.Id)
                .ToListAsync();
            var members = await _context.PartyMembers
                .Where(pm => memberIds.Contains(pm.Id))
                .ToListAsync();
            _context.PartyMembers.RemoveRange(members);

            var groups = await _context.PartyGroups
                .Where(pg => pg.PartyId == party.Id)
                .ToListAsync();
            _context.PartyGroups.RemoveRange(groups);

            _context.Parties.Remove(party);
            await _context.SaveChangesAsync();
        }
    }
}