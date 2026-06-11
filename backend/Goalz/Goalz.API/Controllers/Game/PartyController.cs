using Goalz.Api.Hubs;
using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.SignalR;

namespace Goalz.Api.Controllers.Game
{
    [ApiController]
    [Route("api/game/party")]
    [EnableRateLimiting("party")]
    public class PartyController : ControllerBase
    {
        private readonly IPartyService _partyService;
        private readonly IHubContext<PartyHub> _hub;
        private readonly IUserRepository _userRepository;
        private readonly IPartyRepository _partyRepository;

        public PartyController(
            IPartyService partyService, 
            IHubContext<PartyHub> hub,
            IUserRepository userRepository,
            IPartyRepository partyRepository)
        {
            _partyService = partyService;
            _hub = hub;
            _userRepository = userRepository;
            _partyRepository = partyRepository;
        }

        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> CreateParty([FromBody] PartyRequest request)
        {
            var username = User.Identity!.Name!;
            return Ok(await _partyService.CreateParty(request, username));
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetParty(int id)
        {
            var username = User.Identity!.Name!;
            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null || !await _partyRepository.IsMemberAsync(id, user.Id))
            {
                return Forbid();
            }

            var result = await _partyService.GetParty(id);
            if (result == null) return NotFound("Party not found");
            return Ok(result);
        }

        [Authorize]
        [HttpPost("join")]
        public async Task<IActionResult> JoinParty([FromBody] JoinPartyRequest request)
        {
            var username = User.Identity!.Name!;
            var result = await _partyService.JoinParty(request.Code, username);
            if (result == null) return NotFound("Party not found");

            var state = await _partyService.GetGameState(result.Id);
            await _hub.Clients.Group(result.Id.ToString()).SendAsync("MemberJoined", state);

            return Ok(result);
        }

        [Authorize]
        [HttpPost("{id}/start")]
        public async Task<IActionResult> StartGame(long id)
        {
            var username = User.Identity!.Name!;
            var result = await _partyService.StartGame(id, username);
            if (!result.Success)
            {
                if (result.Error == "Party not found") return NotFound(result.Error);
                if (result.Error == "Forbidden") return Forbid();
                return BadRequest(result.Error);
            }

            var state = await _partyService.GetGameState(id);
            await _hub.Clients.Group(id.ToString()).SendAsync("GameStarted", state);

            return Ok();
        }

        [Authorize]
        [HttpGet("{id}/state")]
        public async Task<IActionResult> GetGameState(long id)
        {
            var username = User.Identity!.Name!;
            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null || !await _partyRepository.IsMemberAsync(id, user.Id))
            {
                return Forbid();
            }

            var result = await _partyService.GetGameState(id);
            if (result == null) return NotFound("Party not found");
            return Ok(result);
        }

        [Authorize]
        [HttpPost("{id}/visit")]
        public async Task<IActionResult> VisitCheckpoint(long id, [FromBody] VisitCheckpointRequest request)
        {
            var username = User.Identity!.Name!;
            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null || !await _partyRepository.IsMemberAsync(id, user.Id))
            {
                return Forbid();
            }

            await _partyService.VisitCheckpoint(id, request.CheckpointId, username);

            var state = await _partyService.GetGameState(id);
            await _hub.Clients.Group(id.ToString()).SendAsync("CheckpointVisited", state);

            return Ok();
        }

        [Authorize]
        [HttpPost("{id}/complete")]
        public async Task<IActionResult> CompleteGame(long id, [FromBody] CompleteGameRequest request)
        {
            var username = User.Identity!.Name!;
            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null || !await _partyRepository.IsMemberAsync(id, user.Id))
            {
                return Forbid();
            }

            await _partyService.CompleteGame(id, username, request.CheckpointIds, request.QuizScore);

            await _hub.Clients.Group(id.ToString()).SendAsync("GameCompleted", new { username });

            return Ok();
        }
    }
}
