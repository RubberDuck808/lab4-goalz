using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.Api.Controllers.Game
{
    [ApiController]
    [Route("api/game/party")]
    [Authorize]
    public class LobbyController(ILobbyService lobbyService) : ControllerBase
    {
        private readonly ILobbyService _lobbyService = lobbyService;

        [HttpGet("{partyId}/lobby")]
        public async Task<IActionResult> GetLobby(long partyId)
        {
            var username = User.Identity!.Name!;
            var result = await _lobbyService.JoinLobby(partyId, username);
            return Ok(result);
        }
    }
}
