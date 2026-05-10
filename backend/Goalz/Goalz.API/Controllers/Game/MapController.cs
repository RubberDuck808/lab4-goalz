using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.Api.Controllers.Game;

[ApiController]
[Route("api/game/map")]
public class MapController : ControllerBase
{
    private readonly IZoneService _zoneService;
    private readonly IBoundaryService _boundaryService;
    private readonly ICheckpointService _checkpointService;

    public MapController(IZoneService zoneService, IBoundaryService boundaryService, ICheckpointService checkpointService)
    {
        _zoneService = zoneService;
        _boundaryService = boundaryService;
        _checkpointService = checkpointService;
    }

    [HttpGet("zones")]
    public async Task<IActionResult> GetZones()
    {
        var zones = await _zoneService.GetAllAsync();
        return Ok(zones);
    }

    [HttpGet("boundaries")]
    public async Task<IActionResult> GetBoundaries()
    {
        var boundaries = await _boundaryService.GetAllAsync();
        return Ok(boundaries);
    }

    [HttpGet("checkpoints")]
    public async Task<IActionResult> GetCheckpoints()
    {
        var checkpoints = await _checkpointService.GetAllAsync();
        return Ok(checkpoints);
    }
}
