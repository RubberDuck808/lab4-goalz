using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.Api.Controllers.Game
{
    [ApiController]
    [Route("api/game/leaderboard")]
    public class LeaderboardController : ControllerBase
    {
        private readonly IUserService _userService;

        public LeaderboardController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetLeaderboard([FromQuery] string? period = null)
        {
            var entries = await _userService.GetLeaderboardAsync(period);
            return Ok(entries);
        }
    }
}
