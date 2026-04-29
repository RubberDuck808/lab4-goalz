≈
h/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/Controllers/Dashboard/AuthController.cs√using Microsoft.AspNetCore.Mvc;
using Goalz.Core.Interfaces;
using Goalz.Core.DTOs;

namespace Goalz.Api.Controllers
{
    [ApiController]
    [Route("api/dashboard/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        // The system will automatically provide the AuthService here
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest model)
        {
            var result = await _authService.CheckAuth(model.Email, model.Password);

            if (result == null)
                return NotFound("User not found or invalid password.");

            return Ok(result);
        }

        [HttpPost("create-user")]
        public async Task<IActionResult> CreateUser([FromBody] CreateStaffUserRequest request)
        {
            var (result, error) = await _authService.CreateStaffUserAsync(request);

            return error switch
            {
                "unauthorized" => Unauthorized("Only admins can create new users."),
                "email_taken" => Conflict("An account with this email already exists."),
                _ => CreatedAtAction(nameof(CreateUser), result)
            };
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] string adminEmail)
        {
            var (users, error) = await _authService.GetStaffUsersAsync(adminEmail);
            if (error != null)
                return Unauthorized("Only admins can view users.");
            return Ok(users);
        }

        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> ChangeRole(long id, [FromBody] ChangeRoleRequest request)
        {
            var (success, error) = await _authService.ChangeUserRoleAsync(request.AdminEmail, id, request.NewRole);
            if (!success)
            {
                return error switch
                {
                    "unauthorized" => Unauthorized("Only admins can change user roles."),
                    "not_found" => NotFound("User not found."),
                    "invalid_role" => BadRequest("Role must be 'Staff' or 'Admin'."),
                    _ => BadRequest("Something went wrong.")
                };
            }
            return NoContent();
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(long id, [FromQuery] string adminEmail)
        {
            var (success, error) = await _authService.DeleteUserAsync(adminEmail, id);
            if (!success)
            {
                return error switch
                {
                    "unauthorized" => Unauthorized("Only admins can delete users."),
                    "not_found" => NotFound("User not found."),
                    "cannot_self_delete" => BadRequest("You cannot delete your own account."),
                    _ => BadRequest("Something went wrong.")
                };
            }
            return NoContent();
        }
    }
}ParseOptions.0.json∞
l/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/Controllers/Dashboard/BoundaryController.cs™using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.Api.Controllers.Dashboard
{
    [ApiController]
    [Route("api/dashboard/boundaries")]
    public class BoundaryController : ControllerBase
    {
        private readonly IBoundaryService _boundaryService;

        public BoundaryController(IBoundaryService boundaryService)
        {
            _boundaryService = boundaryService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var boundaries = await _boundaryService.GetAllAsync();
            return Ok(boundaries);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateBoundaryDto dto)
        {
            var (success, error) = await _boundaryService.CreateAsync(dto);
            if (!success)
            {
                return error switch
                {
                    "invalid_name"     => BadRequest("Boundary name is required."),
                    "invalid_geometry" => BadRequest("A valid GeoJSON geometry is required."),
                    _                  => BadRequest("Something went wrong."),
                };
            }
            return NoContent();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateBoundaryDto dto)
        {
            var (success, error) = await _boundaryService.UpdateAsync(id, dto);
            if (!success)
            {
                return error switch
                {
                    "not_found"    => NotFound(),
                    "invalid_name" => BadRequest("Boundary name is required."),
                    _              => BadRequest("Something went wrong."),
                };
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var deleted = await _boundaryService.DeleteAsync(id);
            return deleted ? NoContent() : NotFound();
        }

        [HttpGet("{id}/generate-preview")]
        public async Task<IActionResult> GeneratePreview(long id, [FromQuery] int count = 4)
        {
            var geometries = await _boundaryService.GeneratePreviewAsync(id, count);
            return Ok(geometries);
        }
    }
}
ParseOptions.0.json»
n/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/Controllers/Dashboard/CheckpointController.cs¿using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.Api.Controllers.Dashboard;

[ApiController]
[Route("api/dashboard/checkpoints")]
public class CheckpointController : ControllerBase
{
    private readonly ICheckpointService _checkpointService;

    public CheckpointController(ICheckpointService checkpointService)
    {
        _checkpointService = checkpointService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var checkpoints = await _checkpointService.GetAllAsync();
        return Ok(checkpoints);
    }
}
ParseOptions.0.json÷
k/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/Controllers/Dashboard/ElementController.cs—using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.API.Controllers.Dashboard;

[Route("api/dashboard/elements")]
[ApiController]
public class ElementController : ControllerBase
{
    private readonly IElementService _elementService;
    private readonly IElementRepository _elementRepository;

    public ElementController(IElementService elementService, IElementRepository elementRepository)
    {
        _elementService = elementService;
        _elementRepository = elementRepository;
    }

    [HttpGet("types")]
    public async Task<IActionResult> GetTypes()
    {
        var types = await _elementRepository.GetAllElementTypesAsync();
        return Ok(types);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateElementRequest request)
    {
        var element = await _elementService.CreateAsync(request);
        return CreatedAtAction(nameof(Create), new { id = element.Id }, element);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateElementRequest request)
    {
        var (success, error) = await _elementService.UpdateAsync(id, request);
        if (!success)
        {
            return error switch
            {
                "not_found" => NotFound($"Element {id} not found."),
                _ => BadRequest("Something went wrong.")
            };
        }
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(long id)
    {
        var (success, error) = await _elementService.DeleteAsync(id);
        if (!success)
        {
            return error switch
            {
                "not_found" => NotFound($"Element {id} not found."),
                _ => BadRequest("Something went wrong.")
            };
        }
        return NoContent();
    }
}
ParseOptions.0.json–
s/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/Controllers/Dashboard/GenerateReportsController.cs√using System.Text;
using Goalz.API.Models;
using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.API.Controllers.Dashboard
{
    [Route("api/dashboard")]
    [ApiController]
    public class GenerateReportsController : ControllerBase
    {
        private IGenerateReportService _generateReportService;

        public GenerateReportsController(IGenerateReportService generateReportService) 
        { 
            _generateReportService = generateReportService;
        }

        [HttpPost("generate")]
        public IActionResult GenerateReport(GenerateReportsModel model)
        {
            try
            {
                GenerateReportDto settingsDto = new GenerateReportDto();
                settingsDto.DateTimeTo = model.DateTimeTo;
                settingsDto.DateTimeFrom = model.DateTimeFrom;
                settingsDto.ReportType = model.ReportType;
                settingsDto.reportContents = model.reportContents;

                var stringBuilder = _generateReportService.GenerateReport(settingsDto);

                var bytes = Encoding.UTF8.GetBytes(stringBuilder.ToString());

                if (model.ReportType == ReportTypeEnum.CSV)
                {
                    return File(
                        bytes,
                        "text/csv",
                        "landscape-elements.csv"
                    );
                }

                return BadRequest("File type not supported!");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }
    }
}
ParseOptions.0.json´
q/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/Controllers/Dashboard/ImportDatasetController.cs†using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.API.Controllers.Dashboard
{
    [Route("api/dashboard/[controller]")]
    [ApiController]
    public class ImportDatasetController : ControllerBase
    {
        private readonly IDatasetService _datasetService;

        public ImportDatasetController(IDatasetService datasetService)
        {
            _datasetService = datasetService;
        }

        [HttpPost]
        public async Task<IActionResult> UploadDataset([FromForm] List<IFormFile> files)
        {
            if (files == null || files.Count == 0)
            {
                return BadRequest("No file uploaded.");
            }

            try
            {
                var results = new List<List<string>>();

                foreach (var file in files)
                {
                    if (file.Length > 0)
                    {
                        var result = await _datasetService.ReadCSV(file);
                        results.Add(result);
                    }
                }

                return Ok(results);
            }
            catch (Exception)
            {

                throw;
            }
        }

        [HttpPost("store")]
        public async Task<IActionResult> StoreDataset(List<string> records)
        {
            try
            {
                await _datasetService.StoreCSVFile(records);

                return Ok("Elements successfully stored!");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest($"Invalid dataset format: {ex.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while storing the dataset: {ex.Message}");
            }
           
        }
    }
}
ParseOptions.0.jsonÔ
l/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/Controllers/Dashboard/OverviewController.csÈ    using Microsoft.AspNetCore.Mvc;
using Goalz.Core.Services;
using Goalz.API.Models;
using Goalz.Core.Interfaces;

namespace Goalz.API.Controllers.Dashboard;

[Route("api/dashboard/overview")]
[ApiController]
public class OverviewController : ControllerBase
{
    private readonly IOverviewService _overviewService;

    public OverviewController(IOverviewService overviewService)
    {
        _overviewService = overviewService;
    }

    [HttpGet]
    public async Task<ActionResult<MapElements>> GetElements()
    {
        var data = await _overviewService.GetDashboardData();
        return Ok(data);
    }
}ParseOptions.0.json˙
j/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/Controllers/Dashboard/SensorController.csˆusing Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.API.Controllers.Dashboard;

[Route("api/dashboard/sensors")]
[ApiController]
public class SensorController : ControllerBase
{
    private readonly ISensorService _sensorService;

    public SensorController(ISensorService sensorService)
    {
        _sensorService = sensorService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSensorRequest request)
    {
        var sensor = await _sensorService.CreateAsync(request);
        return CreatedAtAction(nameof(Create), new { id = sensor.Id }, sensor);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateSensorRequest request)
    {
        var (success, error) = await _sensorService.UpdateAsync(id, request);
        if (!success)
        {
            return error switch
            {
                "not_found" => NotFound($"Sensor {id} not found."),
                _ => BadRequest("Something went wrong.")
            };
        }
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(long id)
    {
        var (success, error) = await _sensorService.DeleteAsync(id);
        if (!success)
        {
            return error switch
            {
                "not_found" => NotFound($"Sensor {id} not found."),
                _ => BadRequest("Something went wrong.")
            };
        }
        return NoContent();
    }
}
ParseOptions.0.json»
h/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/Controllers/Dashboard/ZoneController.cs∆using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.Api.Controllers.Dashboard
{
    [ApiController]
    [Route("api/dashboard/zones")]
    public class ZoneController : ControllerBase
    {
        private readonly IZoneService _zoneService;

        public ZoneController(IZoneService zoneService)
        {
            _zoneService = zoneService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var zones = await _zoneService.GetAllAsync();
            return Ok(zones);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateZoneDto dto)
        {
            var (success, error) = await _zoneService.CreateAsync(dto);
            if (!success)
            {
                return error switch
                {
                    "invalid_name"     => BadRequest("Zone name is required."),
                    "invalid_geometry" => BadRequest("A valid GeoJSON geometry is required."),
                    _                  => BadRequest("Something went wrong."),
                };
            }
            return NoContent();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateZoneDto dto)
        {
            var (success, error) = await _zoneService.UpdateAsync(id, dto);
            if (!success)
            {
                return error switch
                {
                    "not_found"    => NotFound(),
                    "invalid_name" => BadRequest("Zone name is required."),
                    _              => BadRequest("Something went wrong."),
                };
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var deleted = await _zoneService.DeleteAsync(id);
            return deleted ? NoContent() : NotFound();
        }
    }
}
ParseOptions.0.jsonö
c/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/Controllers/Game/AuthController.csù
using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Goalz.Api.Controllers.Game
{
    [ApiController]
    [Route("api/game/auth")]
    [EnableRateLimiting("auth")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;

        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] GameLoginRequest request)
        {
            var result = await _userService.LoginAsync(request);

            if (result == null)
                return Unauthorized("Invalid email or password.");

            return Ok(result);
        }

        [HttpPost("signup")]
        public async Task<IActionResult> SignUp([FromBody] GameSignUpRequest request)
        {
            var (user, error) = await _userService.SignUpAsync(request);

            if (error == "email_taken")
                return Conflict("An account with this email already exists.");

            if (error == "username_taken")
                return Conflict("This username is already taken.");

            return CreatedAtAction(nameof(SignUp), user);
        }
    }
}
ParseOptions.0.jsonÍ
g/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/Controllers/Game/BoundaryController.csÈusing Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.Api.Controllers.Game;

[ApiController]
[Route("api/game/boundaries")]
public class BoundaryController : ControllerBase
{
    private readonly IBoundaryService _boundaryService;

    public BoundaryController(IBoundaryService boundaryService)
    {
        _boundaryService = boundaryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var boundaries = await _boundaryService.GetAllAsync();
        var result = boundaries.Select(b => new { b.Id, b.Name, b.Color });
        return Ok(result);
    }
}
ParseOptions.0.jsonü	
f/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/Controllers/Game/ElementController.csüusing Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.API.Controllers.Game;

[Route("api/game/elements")]
[ApiController]
[Authorize]
public class ElementController : ControllerBase
{
    private readonly IElementService _elementService;
    private readonly IElementRepository _elementRepository;

    public ElementController(IElementService elementService, IElementRepository elementRepository)
    {
        _elementService = elementService;
        _elementRepository = elementRepository;
    }

    [HttpGet("types")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTypes()
    {
        var types = await _elementRepository.GetAllElementTypesAsync();
        return Ok(types);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateElementRequest request)
    {
        var element = await _elementService.CreateAsync(request);
        return CreatedAtAction(nameof(Create), new { id = element.Id }, element);
    }
}
ParseOptions.0.jsonû"
i/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/Controllers/Game/FriendshipController.csõ!using Goalz.Core.DTOs;
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
ParseOptions.0.jsonÖ
d/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/Controllers/Game/LobbyController.csáusing Goalz.Core.Interfaces;
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
ParseOptions.0.json‡
d/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/Controllers/Game/PartyController.cs‚using Goalz.Core.DTOs;
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
            var found = await _partyService.StartGame(id);
            if (!found) return NotFound("Party not found");
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
    }
}ParseOptions.0.json≈
i/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/Controllers/Game/SensorDataController.cs¬using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.API.Controllers.Game;

[Route("api/game/sensors")]
[ApiController]
public class SensorDataController : ControllerBase
{
    private readonly ISensorDataService _sensorDataService;

    public SensorDataController(ISensorDataService sensorDataService)
    {
        _sensorDataService = sensorDataService;
    }

    [HttpGet("{id}/data")]
    public async Task<IActionResult> GetData(long id)
    {
        var data = await _sensorDataService.GetBySensorIdAsync(id);
        return Ok(data);
    }
}
ParseOptions.0.json˛
k/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/Controllers/Game/VisitCheckpointRequest.csznamespace Goalz.Api.Controllers.Game;

public class VisitCheckpointRequest
{
    public long CheckpointId { get; set; }
}
ParseOptions.0.jsonƒ
c/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/Controllers/Game/ZoneController.cs«using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.Api.Controllers.Game;

[ApiController]
[Route("api/game/zones")]
public class ZoneController : ControllerBase
{
    private readonly IZoneService _zoneService;

    public ZoneController(IZoneService zoneService)
    {
        _zoneService = zoneService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] long? boundaryId = null)
    {
        var zones = await _zoneService.GetAllAsync();
        if (boundaryId.HasValue)
            zones = zones.Where(z => z.BoundaryId == boundaryId.Value);
        var result = zones.Select(z => new { z.Id, z.Name, z.BoundaryId });
        return Ok(result);
    }
}
ParseOptions.0.jsonÕ
Q/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/Hubs/PartyHub.cs‚using Microsoft.AspNetCore.SignalR;

namespace Goalz.Api.Hubs
{
    public class PartyHub : Hub
    {
        public async Task JoinLobbyRoom(long partyId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, partyId.ToString());
        }

        public async Task SendMemberJoined(long partyId, string username)
        {
            await Clients.Group(partyId.ToString()).SendAsync("MemberJoined", username);
        }

        public async Task StartGame(long partyId)
        {
            await Clients.Group(partyId.ToString()).SendAsync("GameStarted", partyId);
        }
    }
}
ParseOptions.0.jsonú
W/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/Models/DatasetModel.cs´namespace Goalz.API.Models
{
    public class DatasetModel
    {
        public string ElementName { get; set; } = string.Empty;
        public string ElementType { get; set; } = string.Empty;
        public string Longitude { get; set; } = string.Empty;
        public string Latitude { get; set; } = string.Empty;
        public bool IsGreen { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
    }
}
ParseOptions.0.json÷
_/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/Models/GenerateReportsModel.cs›using Goalz.Core.DTOs;

namespace Goalz.API.Models
{
    public class GenerateReportsModel
    {
        public DateTime DateTimeFrom { get; set; }
        public DateTime DateTimeTo { get; set; }
        public ReportSettingsDto reportContents { get; set; } = new ReportSettingsDto();
        public ReportTypeEnum ReportType { get; set; }
    }
}
ParseOptions.0.jsonË
V/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/Models/MapElements.cs¯using Goalz.Domain.Entities;

namespace Goalz.API.Models
{
    public class MapElements
    {
        public List<Sensor> sensors { get; set; } = new List<Sensor>();
        public List<Element> element { get; set; } = new List<Element>();
    }
}
ParseOptions.0.json¿3
K/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/Program.cs€2using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Goalz.Api.Hubs;
using Goalz.Api.Services;
using Goalz.Application.Interfaces;
using Goalz.Core.Interfaces;
using Goalz.Core.Services;
using Goalz.Data.Repositories;
using Goalz.Data.Storage;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NetTopologySuite.IO.Converters;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
        o => o.UseNetTopologySuite())
    .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));

var allowedOrigins = (builder.Configuration["AllowedOrigins"]
    ?? "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:8081")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// JWT ‚Äî must clear default claim mapping so Sub stays as Sub
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("Jwt:Secret is not configured.");
//Authentication Token
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // ASP.NET Core 9 defaults to JsonWebTokenHandler, but JwtService generates tokens
        // with JwtSecurityTokenHandler. Force the legacy handler so they match.
        options.UseSecurityTokenValidators = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
            NameClaimType = JwtRegisteredClaimNames.Sub,
            RoleClaimType = "role",
        };
    });

// Dashboard auth
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();

// Dashboard overview
builder.Services.AddScoped<IOverviewRepository, OverviewRepository>();
builder.Services.AddScoped<IOverviewService, OverviewService>();

builder.Services.AddScoped<INatureElementRepository, NatureElementRepository>();
// Elements CRUD
builder.Services.AddScoped<IElementRepository, ElementRepository>();
builder.Services.AddScoped<IElementService, ElementService>();

// Sensors CRUD
builder.Services.AddScoped<ISensorRepository, SensorRepository>();
builder.Services.AddScoped<ISensorService, SensorService>();
builder.Services.AddScoped<ISensorDataRepository, SensorDataRepository>();
builder.Services.AddScoped<ISensorDataService, SensorDataService>();

// Dataset import
builder.Services.AddScoped<IDatasetService, DatasetService>();

// Game auth
builder.Services.AddSingleton<IJwtService, JwtService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

// Friendships
builder.Services.AddScoped<IFriendshipRepository, FriendshipRepository>();
builder.Services.AddScoped<IFriendshipService, FriendshipService>();

builder.Services.AddScoped<IGenerateReportService, GenerateReportService>();

// Zones
builder.Services.AddScoped<IZoneRepository, ZoneRepository>();
builder.Services.AddScoped<IZoneService, ZoneService>();

// Boundaries
builder.Services.AddScoped<IBoundaryRepository, BoundaryRepository>();
builder.Services.AddScoped<IBoundaryService, BoundaryService>();

// Checkpoints
builder.Services.AddScoped<ICheckpointRepository, CheckpointRepository>();
builder.Services.AddScoped<ICheckpointService, CheckpointService>();

// Party
builder.Services.AddScoped<IPartyService, PartyService>();
builder.Services.AddScoped<IPartyRepository, PartyRepository>();

// Lobby
builder.Services.AddScoped<ILobbyService, LobbyService>();
builder.Services.AddHostedService<PartyCleanupService>();
builder.Services.AddSignalR();

// Rate limiting ‚Äî 10 requests per minute per IP on auth endpoints
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("auth", limiter =>
    {
        limiter.Window = TimeSpan.FromMinutes(1);
        limiter.PermitLimit = 10;
        limiter.QueueLimit = 0;
        limiter.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    });

    options.AddFixedWindowLimiter("party", limiter =>
    {
        limiter.Window = TimeSpan.FromMinutes(1);
        limiter.PermitLimit = 100; // Allow enough for polling every few seconds
        limiter.QueueLimit = 0;
        limiter.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    });

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(new GeoJsonConverterFactory());
        options.JsonSerializerOptions.NumberHandling = JsonNumberHandling.AllowNamedFloatingPointLiterals;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseExceptionHandler(error => error.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new { error = "An unexpected error occurred." });
    }));
}

app.UseCors("AllowFrontend");
app.UseHttpsRedirection();
app.UseRateLimiter();
app.UseAuthentication(); //implements AddAuthentication()
app.UseAuthorization();
app.MapControllers();
app.MapHub<PartyHub>("/hubs/party");
app.Run();
ParseOptions.0.json∏
W/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/Services/JwtService.cs«using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Goalz.Core.Interfaces;
using Microsoft.IdentityModel.Tokens;

namespace Goalz.Api.Services
{
    public class JwtService : IJwtService
    {
        private readonly SymmetricSecurityKey _key;

        public JwtService(IConfiguration config)
        {
            var secret = config["Jwt:Secret"]
                ?? throw new InvalidOperationException("Jwt:Secret is not configured. Set it via user-secrets or environment variable Jwt__Secret.");

            if (secret.Length < 32)
                throw new InvalidOperationException("Jwt:Secret must be at least 32 characters.");

            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        }

        public string Generate(string username, string role)
        {
            var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                claims:
                [
                    new Claim(JwtRegisteredClaimNames.Sub, username),
                    new Claim("role", role),
                ],
                expires: DateTime.UtcNow.AddDays(30),
                signingCredentials: creds
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string Generate(string username, string role, string name)
        {
            var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                claims:
                [
                    new Claim(JwtRegisteredClaimNames.Sub, username),
                    new Claim("role", role),
                    new Claim(JwtRegisteredClaimNames.Name, name),
                ],
                expires: DateTime.UtcNow.AddDays(30),
                signingCredentials: creds
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
ParseOptions.0.json©
`/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/Services/PartyCleanupService.csØ
using Goalz.Application.Interfaces;

namespace Goalz.Api.Services;

public class PartyCleanupService(IServiceScopeFactory scopeFactory, ILogger<PartyCleanupService> logger)
    : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(1);
    private static readonly TimeSpan LobbyTimeout = TimeSpan.FromMinutes(5);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(Interval, stoppingToken);
            await CleanupAsync();
        }
    }

    private async Task CleanupAsync()
    {
        using var scope = scopeFactory.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IPartyRepository>();

        var cutoff = DateTime.UtcNow - LobbyTimeout;
        var stale = await repo.GetStaleLobbyPartiesAsync(cutoff);

        foreach (var party in stale)
        {
            try
            {
                await repo.DeleteAsync(party);
                logger.LogInformation("Deleted stale lobby party {PartyId} ({PartyName})", party.Id, party.Name);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to delete stale party {PartyId}", party.Id);
            }
        }
    }
}
ParseOptions.0.json¯
m/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/obj/Debug/net9.0/Goalz.API.GlobalUsings.g.csÒ// <auto-generated/>
global using Microsoft.AspNetCore.Builder;
global using Microsoft.AspNetCore.Hosting;
global using Microsoft.AspNetCore.Http;
global using Microsoft.AspNetCore.Routing;
global using Microsoft.Extensions.Configuration;
global using Microsoft.Extensions.DependencyInjection;
global using Microsoft.Extensions.Hosting;
global using Microsoft.Extensions.Logging;
global using System;
global using System.Collections.Generic;
global using System.IO;
global using System.Linq;
global using System.Net.Http;
global using System.Net.Http.Json;
global using System.Threading;
global using System.Threading.Tasks;
ParseOptions.0.json›
Ä/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/obj/Debug/net9.0/.NETCoreApp,Version=v9.0.AssemblyAttributes.cs¬// <autogenerated />
using System;
using System.Reflection;
[assembly: global::System.Runtime.Versioning.TargetFrameworkAttribute(".NETCoreApp,Version=v9.0", FrameworkDisplayName = ".NET 9.0")]
ParseOptions.0.json“	
k/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/obj/Debug/net9.0/Goalz.API.AssemblyInfo.csÕ//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using System;
using System.Reflection;

[assembly: Microsoft.Extensions.Configuration.UserSecrets.UserSecretsIdAttribute("038e2be9-51c9-47a9-9163-6df18e6fe07b")]
[assembly: System.Reflection.AssemblyCompanyAttribute("Goalz.API")]
[assembly: System.Reflection.AssemblyConfigurationAttribute("Debug")]
[assembly: System.Reflection.AssemblyFileVersionAttribute("1.0.0.0")]
[assembly: System.Reflection.AssemblyInformationalVersionAttribute("1.0.0+386b1377d4b3d9193b1660fe8debbcb244aea640")]
[assembly: System.Reflection.AssemblyProductAttribute("Goalz.API")]
[assembly: System.Reflection.AssemblyTitleAttribute("Goalz.API")]
[assembly: System.Reflection.AssemblyVersionAttribute("1.0.0.0")]

// Generated by the MSBuild WriteCodeFragment class.

ParseOptions.0.json—
~/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/obj/Debug/net9.0/Goalz.API.MvcApplicationPartsAssemblyInfo.csπ//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using System;
using System.Reflection;

[assembly: Microsoft.AspNetCore.Mvc.ApplicationParts.ApplicationPartAttribute("Swashbuckle.AspNetCore.SwaggerGen")]

// Generated by the MSBuild WriteCodeFragment class.

ParseOptions.0.jsonÙ
q/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.API/obj/Debug/net9.0/EFCoreNpgsqlNetTopologySuite.csÈ//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using System;
using System.Reflection;

[assembly: Microsoft.EntityFrameworkCore.Design.DesignTimeServicesReferenceAttribute(("Npgsql.EntityFrameworkCore.PostgreSQL.Design.Internal.NpgsqlNetTopologySuiteDesig" +
    "nTimeServices, Npgsql.EntityFrameworkCore.PostgreSQL.NetTopologySuite"), "Npgsql.EntityFrameworkCore.PostgreSQL")]

// Generated by the MSBuild WriteCodeFragment class.

ParseOptions.0.json