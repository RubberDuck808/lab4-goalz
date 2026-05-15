using Goalz.Application.Interfaces;
using Goalz.Core.DTOs;
using Goalz.Core.Exceptions;
using Goalz.Core.Utils;
using Goalz.Domain.Entities;
using Goalz.Core.Interfaces;

namespace Goalz.Core.Services
{
    public class PartyService : IPartyService
    {
        private readonly IPartyRepository _partyRepository;
        private readonly IUserRepository _userRepository;

        public PartyService(IUserRepository userRepository, IPartyRepository partyRepository)
        {
            _userRepository = userRepository;
            _partyRepository = partyRepository;
        }
        //Es können nicht zwei Konstruktoren existieren, da der zweite den ersten überschreibt

        public async Task<PartyResponse> CreateParty(PartyRequest request, string creatorUsername)
        {
            var party = new Party
            {
                Name = request.Name,
                Code = CodeGenerator.GeneratePartyCode(),
                GroupSize = request.GroupSize,
                BoundaryId = request.BoundaryId,
                ZoneCount = request.ZoneCount,
                CheckpointsPerZone = request.CheckpointsPerZone,
                AllowedRoles = request.AllowedRoles.Count > 0
                    ? string.Join(',', request.AllowedRoles)
                    : "Scout,Trailblazer,Explorer",
            };

            var createdParty = await _partyRepository.CreateAsync(party);
            await _partyRepository.SaveChangesAsync();

            var groups = new List<PartyGroup>
            {
                new() { PartyId = createdParty.Id, Name = "Team A" },
                new() { PartyId = createdParty.Id, Name = "Team B" },
                new() { PartyId = createdParty.Id, Name = "Team C" },
                new() { PartyId = createdParty.Id, Name = "Team D" },
            };

            foreach (var group in groups)
            {
                await _partyRepository.AddGroupAsync(group);
            }
            await _partyRepository.SaveChangesAsync();

            var creator = await _userRepository.GetByUsernameAsync(creatorUsername)
                ?? throw new NotFoundException("Creator user not found");
            var firstGroup = await _partyRepository.GetPartyGroupByPartyIdAsync(createdParty.Id)
                ?? throw new NotFoundException("Party group not found");

            await _partyRepository.AddMemberAsync(new PartyMember
            {
                UserId = creator.Id,
                PartyGroupId = firstGroup.Id,
                PartyId = createdParty.Id
            });

            return new PartyResponse
            {
                Id = createdParty.Id,
                Name = createdParty.Name,
                Code = createdParty.Code,
                Members = [creatorUsername]
            };
        }

        public async Task<PartyResponse> GetParty(int partyId)
        {
            var party = await _partyRepository.GetPartyById(partyId);
            
            if (party == null)
                throw new NotFoundException("Party not found");

            return new PartyResponse
            {
                Id = party.Id,
                Name = party.Name,
                Code = party.Code,
                Members = []
            };
        }

        public async Task<List<string>> GetLobbyMembers(long partyId)
        {
            return await _partyRepository.GetLobbyMembers(partyId);
        }

        public async Task<PartyResponse?> JoinParty(long code, string username)
        {
            var party = await _partyRepository.GetPartyByCode(code);
            if (party == null) return null;
            if (party.Status != "Lobby") return null;

            var user = await _userRepository.GetByUsernameAsync(username)
                ?? throw new NotFoundException("User not found");

            var alreadyMember = await _partyRepository.IsMemberAsync(party.Id, user.Id);
            if (!alreadyMember)
            {
                var partyGroup = await _partyRepository.GetPartyGroupByPartyIdAsync(party.Id)
                    ?? throw new NotFoundException("Party group not found");

                await _partyRepository.AddMemberAsync(new PartyMember
                {
                    UserId = user.Id,
                    PartyGroupId = partyGroup.Id,
                    PartyId = party.Id
                });

                await _userRepository.IncrementPartiesJoinedAsync(username);
            }

            var members = await _partyRepository.GetLobbyMembers(party.Id);

            return new PartyResponse
            {
                Id = party.Id,
                Name = party.Name,
                Code = party.Code,
                Members = members
            };
        }

        public async Task<StartGameResult> StartGame(long partyId, string username)
        {
            var party = await _partyRepository.GetPartyById(partyId);
            if (party == null) return StartGameResult.Fail("Party not found");

            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null || !await _partyRepository.IsMemberAsync(partyId, user.Id))
                return StartGameResult.Fail("Forbidden");

            var allowedRoles = party.GetAllowedRolesList();
            if (allowedRoles.Count == 0) return StartGameResult.Fail("No roles configured.");

            // Atomic status transition — only advance if still in Lobby to prevent double-start
            var updated = await _partyRepository.TryStartGameAsync(partyId);
            if (!updated) return StartGameResult.Fail("Game already started.");

            var members = await _partyRepository.GetPartyMembersWithUsersAsync(partyId);
            var shuffled = members.OrderBy(_ => Guid.NewGuid()).ToList();

            // Auto-reduce GroupSize if fewer players than configured
            if (party.GroupSize.HasValue && shuffled.Count < party.GroupSize.Value)
                party.GroupSize = shuffled.Count < 2 ? null : shuffled.Count;

            if (party.GroupSize == null)
            {
                // No groups — Explorer if allowed, otherwise first allowed role
                var soloRole = allowedRoles.Contains("Explorer") ? "Explorer" : allowedRoles[0];
                foreach (var m in shuffled)
                    m.Role = soloRole;
            }
            else
            {
                // Cycle through allowed roles — Scout+Trailblazer reproduces original alternation
                for (int i = 0; i < shuffled.Count; i++)
                    shuffled[i].Role = allowedRoles[i % allowedRoles.Count];
            }

            await _partyRepository.SaveChangesAsync();
            return StartGameResult.Ok();
        }

        public async Task<GameStateResponse?> GetGameState(long partyId)
        {
            var party = await _partyRepository.GetPartyById(partyId);
            if (party == null) return null;

            var members = await _partyRepository.GetPartyMembersWithUsersAsync(partyId);
            var visited = await _partyRepository.GetVisitedCheckpointsAsync(partyId);

            return new GameStateResponse
            {
                Status = party.Status,
                Members = members.Select(m => new MemberRoleDto
                {
                    Username = m.User.Username,
                    Role = m.Role
                }).ToList(),
                VisitedCheckpointIds = visited,
                GroupSize = party.GroupSize,
                BoundaryId = party.BoundaryId,
                ZoneCount = party.ZoneCount,
                CheckpointsPerZone = party.CheckpointsPerZone,
                AllowedRoles = party.GetAllowedRolesList(),
            };
        }

        public async Task VisitCheckpoint(long partyId, long checkpointId, string username)
        {
            var party = await _partyRepository.GetPartyById(partyId) ?? throw new NotFoundException("Party not found");
            if (party.Status != "InGame") return;

            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null || !await _partyRepository.IsMemberAsync(partyId, user.Id)) return;

            await _partyRepository.VisitCheckpointAsync(partyId, checkpointId);
        }

        public async Task CompleteGame(long partyId, string username, List<long> checkpointIds, int quizScore)
        {
            var party = await _partyRepository.GetPartyById(partyId) ?? throw new NotFoundException("Party not found");
            if (party.Status != "InGame") return;

            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null || !await _partyRepository.IsMemberAsync(partyId, user.Id)) return;

            await _partyRepository.CompleteGameAsync(partyId, username, checkpointIds, quizScore);
        }
    }
}