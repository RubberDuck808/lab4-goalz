using Goalz.Core.Interfaces;
using Goalz.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.Api.Controllers.Game
{
    [ApiController]
    [Route("api/game/party")]
    [Authorize]
    public class LobbyController : ControllerBase
    {
        private readonly ILobbyService _lobbyService;
        private readonly IUserRepository _userRepository;
        private readonly IPartyRepository _partyRepository;

        public LobbyController(
            ILobbyService lobbyService,
            IUserRepository userRepository,
            IPartyRepository partyRepository)
        {
            _lobbyService = lobbyService;
            _userRepository = userRepository;
            _partyRepository = partyRepository;
        }

        [HttpGet("{partyId}/lobby")]
        public async Task<IActionResult> GetLobby(long partyId)
        {
            var username = User.Identity!.Name!;
            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null || !await _partyRepository.IsMemberAsync(partyId, user.Id))
            {
                return Forbid();
            }

            var result = await _lobbyService.JoinLobby(partyId, username);
            return Ok(result);
        }
    }
}
