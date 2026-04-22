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

        [HttpPost ("create")]
        public async Task<IActionResult> CreateParty([FromBody] PartyRequest request)
        {
            return Ok(await _partyService.CreateParty(request));
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
    }
}