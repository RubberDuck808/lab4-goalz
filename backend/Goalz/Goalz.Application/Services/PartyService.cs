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

        public async Task<PartyResponse> CreateParty(PartyRequest request)
        {
            var party = new Party
            {
                Name = request.Name,
                Code = CodeGenerator.GeneratePartyCode()
            };

            var createdParty = await _partyRepository.CreateAsync(party);
            await _partyRepository.SaveChangesAsync();

            // ← PartyGroups erstellen (z.B. 4 Teams)
            var groups = new List<PartyGroup>
            {
                new() { PartyId = createdParty.Id, Name = "Team A" },
                new() { PartyId = createdParty.Id, Name = "Team B" },
                new() { PartyId = createdParty.Id, Name = "Team C" },
                new() { PartyId = createdParty.Id, Name = "Team D" },
            };

            foreach (var group in groups)
            {
                await _partyRepository.AddGroupAsync(group);  // ← neue Methode!
            }
            await _partyRepository.SaveChangesAsync();

            return new PartyResponse
            {
                Id = createdParty.Id,
                Name = createdParty.Name,
                Code = createdParty.Code,
                Members = []
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

        public async Task<PartyResponse> JoinParty(long code, string username)
        {
            var party = await _partyRepository.GetPartyByCode(code) 
                ?? throw new Exception("Party not found");
            var user = await _userRepository.GetByUsernameAsync(username) 
                ?? throw new Exception("User not found");

            // PartyGroup finden
            var partyGroup = await _partyRepository.GetPartyGroupByPartyIdAsync(party.Id)
                ?? throw new Exception("Party group not found");

            // PartyMember erstellen
            var partyMember = new PartyMember
            {
                UserId = user.Id,
                PartyGroupId = partyGroup.Id
            };
            
            await _partyRepository.AddMemberAsync(partyMember);
            await _partyRepository.SaveChangesAsync();

            return new PartyResponse
            {
                Id = party.Id,
                Name = party.Name,
                Code = party.Code,
                Members = []
            };
        }
    }
}