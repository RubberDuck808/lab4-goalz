using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Goalz.Api.Controllers.Game
{
    [ApiController]
    [Route("api/game/party")]
    [EnableRateLimiting("party")]

    public class PartyController : ControllerBase
    {
        private readonly IPartyService _partyService;

        public PartyController(IPartyService partyService)
        {
            _partyService = partyService;
        }

        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> CreateParty([FromBody] PartyRequest request)
        {
            var username = User.Identity!.Name!;
            return Ok(await _partyService.CreateParty(request, username));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetParty(int id)
        {
            var result = await _partyService.GetParty(id);
            return Ok(result);
        }
        
        [Authorize] //adds the condition that the Authorize Token is needed. The Authorization Middleware is registered in Program.cs
        [HttpPost("join")]
        public async Task<IActionResult> JoinParty([FromBody] JoinPartyRequest request)
        {
            var username = User.Identity!.Name!;  //from JWT Token
            var result = await _partyService.JoinParty(request.Code, username);
            if (result == null) return NotFound("Party not found");
            return Ok(result);
            
        }

        [Authorize]
        [HttpPost("{id}/start")]
        public async Task<IActionResult> StartGame(long id)
        {
            var result = await _partyService.StartGame(id);
            if (!result.Success)
                return result.Error == "Party not found" ? NotFound(result.Error) : BadRequest(result.Error);
            return Ok();
        }

        [Authorize]
        [HttpGet("{id}/state")]
        public async Task<IActionResult> GetGameState(long id)
        {
            var result = await _partyService.GetGameState(id);
            if (result == null) return NotFound("Party not found");
            return Ok(result);
        }

        [Authorize]
        [HttpPost("{id}/visit")]
        public async Task<IActionResult> VisitCheckpoint(long id, [FromBody] VisitCheckpointRequest request)
        {
            await _partyService.VisitCheckpoint(id, request.CheckpointId);
            return Ok();
        }

        [Authorize]
        [HttpPost("{id}/complete")]
        public async Task<IActionResult> CompleteGame(long id, [FromBody] CompleteGameRequest request)
        {
            var username = User.Identity!.Name!;
            await _partyService.CompleteGame(id, username, request.CheckpointIds, request.QuizScore);
            return Ok();
        }
    }
}