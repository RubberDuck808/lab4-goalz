using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.Api.Controllers.Game;

[ApiController]
[Route("api/game/zones")]
public class ZoneController : ControllerBase
{
    private readonly IZoneRepository _zoneRepository;

    public ZoneController(IZoneRepository zoneRepository)
    {
        _zoneRepository = zoneRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] long? boundaryId = null)
    {
        var zones = await _zoneRepository.GetAllAsync();
        if (boundaryId.HasValue)
            zones = zones.Where(z => z.BoundaryId == boundaryId.Value);
        var result = zones.Select(z => new { z.Id, z.Name, z.BoundaryId });
        return Ok(result);
    }
}
