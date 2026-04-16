using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.Api.Controllers.Game
{
    [ApiController]
    [Route("api/game/friends")]
    [Authorize]
    public class FriendshipController : ControllerBase
    {
        private readonly IFriendshipService _friendshipService;
        private readonly IUserRepository _userRepository;

        public FriendshipController(IFriendshipService friendshipService, IUserRepository userRepository)
        {
            _friendshipService = friendshipService;
            _userRepository = userRepository;
        }

        private string CurrentUsername => User.Identity!.Name!;

        [HttpGet("search")]
        public async Task<IActionResult> SearchUsers([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
                return Ok(Array.Empty<UserSearchDto>());

            var users = await _userRepository.SearchByUsernameAsync(q.Trim(), CurrentUsername);
            return Ok(users.Select(u => new UserSearchDto { Username = u.Username }));
        }

        [AllowAnonymous]
        [HttpGet("connections/{username}")]
        public async Task<IActionResult> GetConnections(string username)
        {
            var connections = await _friendshipService.GetConnectionsAsync(username);
            return Ok(connections);
        }

        [HttpGet("requests")]
        public async Task<IActionResult> GetRequests()
        {
            var requests = await _friendshipService.GetRequestsAsync(CurrentUsername);
            return Ok(requests);
        }

        [HttpPost("request")]
        public async Task<IActionResult> SendRequest([FromBody] PartnerUsernameDto dto)
        {
            var (success, error) = await _friendshipService.SendRequestAsync(CurrentUsername, dto.Username);

            if (!success)
            {
                return error switch
                {
                    "user_not_found" => NotFound("User not found."),
                    "already_friends" => Conflict("You are already friends."),
                    "request_exists" => Conflict("A friend request already exists."),
                    "cannot_self_add" => BadRequest("You cannot add yourself."),
                    _ => BadRequest("Something went wrong.")
                };
            }

            return NoContent();
        }

        [HttpPut("accept")]
        public async Task<IActionResult> AcceptRequest([FromBody] PartnerUsernameDto dto)
        {
            var (success, error) = await _friendshipService.AcceptRequestAsync(dto.Username, CurrentUsername);

            if (!success)
            {
                return error switch
                {
                    "request_not_found" => NotFound("Friend request not found."),
                    "not_pending" => Conflict("Request is not pending."),
                    _ => BadRequest("Something went wrong.")
                };
            }

            return NoContent();
        }

        [HttpDelete("decline")]
        public async Task<IActionResult> DeclineRequest([FromBody] PartnerUsernameDto dto)
        {
            var (success, error) = await _friendshipService.DeclineRequestAsync(dto.Username, CurrentUsername);

            if (!success)
            {
                return error switch
                {
                    "request_not_found" => NotFound("Friend request not found."),
                    _ => BadRequest("Something went wrong.")
                };
            }

            return NoContent();
        }

        [HttpDelete("connection")]
        public async Task<IActionResult> RemoveConnection([FromBody] PartnerUsernameDto dto)
        {
            var (success, error) = await _friendshipService.RemoveConnectionAsync(CurrentUsername, dto.Username);

            if (!success)
            {
                return error switch
                {
                    "user_not_found" => NotFound("User not found."),
                    "not_friends" => NotFound("No connection found."),
                    _ => BadRequest("Something went wrong.")
                };
            }

            return NoContent();
        }
    }
}
