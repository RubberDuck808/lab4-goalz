using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.Api.Controllers.Game;

/// <summary>
/// Consolidates the game-side map data endpoints. Replaces the deleted ZoneController
/// and BoundaryController which previously exposed separate /api/game/zones and
/// /api/game/boundaries routes.
/// </summary>
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
        if (zones == null) return NotFound();
        return Ok(zones);
    }

    [HttpGet("boundaries")]
    public async Task<IActionResult> GetBoundaries()
    {
        var boundaries = await _boundaryService.GetAllAsync();
        if (boundaries == null) return NotFound();
        return Ok(boundaries);
    }

    [HttpGet("checkpoints")]
    public async Task<IActionResult> GetCheckpoints()
    {
        var checkpoints = await _checkpointService.GetAllAsync();
        if (checkpoints == null) return NotFound();
        return Ok(checkpoints);
    }
}
