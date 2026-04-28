using Goalz.Application.Interfaces;
using Goalz.Core.DTOs;
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
                ?? throw new Exception("Creator user not found");
            var firstGroup = await _partyRepository.GetPartyGroupByPartyIdAsync(createdParty.Id)
                ?? throw new Exception("Party group not found");

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
                throw new Exception("Party not found");

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
                ?? throw new Exception("User not found");

            var alreadyMember = await _partyRepository.IsMemberAsync(party.Id, user.Id);
            if (!alreadyMember)
            {
                var partyGroup = await _partyRepository.GetPartyGroupByPartyIdAsync(party.Id)
                    ?? throw new Exception("Party group not found");

                await _partyRepository.AddMemberAsync(new PartyMember
                {
                    UserId = user.Id,
                    PartyGroupId = partyGroup.Id,
                    PartyId = party.Id
                });
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

        public async Task<bool> StartGame(long partyId)
        {
            var party = await _partyRepository.GetPartyById(partyId);
            if (party == null) return false;

            party.Status = "InGame";

            var members = await _partyRepository.GetPartyMembersWithUsersAsync(partyId);
            var shuffled = members.OrderBy(_ => Guid.NewGuid()).ToList();

            if (party.GroupSize == null)
            {
                // No groups — everyone plays solo with both tasks
                foreach (var m in shuffled)
                    m.Role = "Explorer";
            }
            else
            {
                // Alternate Scout/Trailblazer within each group of GroupSize
                for (int i = 0; i < shuffled.Count; i++)
                    shuffled[i].Role = i % 2 == 0 ? "Scout" : "Trailblazer";
            }

            await _partyRepository.SaveChangesAsync();
            return true;
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
            };
        }

        public async Task VisitCheckpoint(long partyId, long checkpointId)
        {
            var party = await _partyRepository.GetPartyById(partyId) ?? throw new Exception("Party not found");
            if (party.Status != "InGame") return;
            await _partyRepository.VisitCheckpointAsync(partyId, checkpointId);
        }
    }
}