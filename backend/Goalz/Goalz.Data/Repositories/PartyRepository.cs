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
            // INSERT … ON CONFLICT DO NOTHING is atomic — no TOCTOU race between check and insert
            await _context.Database.ExecuteSqlRawAsync(
                """
                INSERT INTO "PartyVisitedCheckpoints" ("PartyId", "CheckpointId")
                VALUES ({0}, {1})
                ON CONFLICT DO NOTHING
                """,
                partyId, checkpointId);
        }

        public async Task<bool> IsMemberAsync(long partyId, long userId)
        {
            return await _context.PartyMembers.AnyAsync(pm => pm.PartyId == partyId && pm.UserId == userId);
        }

        public async Task CompleteGameAsync(long partyId, string username, List<long> checkpointIds, int quizScore)
        {
            await using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                // Batch-insert unvisited checkpoints (atomic per-row)
                foreach (var id in checkpointIds)
                {
                    await _context.Database.ExecuteSqlRawAsync(
                        """
                        INSERT INTO "PartyVisitedCheckpoints" ("PartyId", "CheckpointId")
                        VALUES ({0}, {1})
                        ON CONFLICT DO NOTHING
                        """,
                        partyId, id);
                }

                var party = await _context.Parties.FindAsync(partyId);
                if (party != null)
                    party.Status = "Completed";

                // Update UserStatistics and PartyMember.Score for the completing player
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
                if (user != null)
                {
                    var stats = await _context.UserStatistics.FirstOrDefaultAsync(s => s.UserId == user.Id);
                    if (stats == null)
                    {
                        stats = new UserStatistics { UserId = user.Id };
                        _context.UserStatistics.Add(stats);
                    }
                    var memberScore = (long)(checkpointIds.Count * 10) + quizScore;
                    stats.CheckpointsVisited += checkpointIds.Count;
                    stats.GamesPlayed        += 1;
                    stats.TotalPoints        += memberScore;

                    var member = await _context.PartyMembers
                        .FirstOrDefaultAsync(pm => pm.PartyId == partyId && pm.UserId == user.Id);
                    if (member != null)
                        member.Score = memberScore;
                }

                await _context.SaveChangesAsync();
                await tx.CommitAsync();
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> TryStartGameAsync(long partyId)
        {
            var rows = await _context.Parties
                .Where(p => p.Id == partyId && p.Status == "Lobby")
                .ExecuteUpdateAsync(s => s.SetProperty(p => p.Status, "InGame"));
            return rows > 0;
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