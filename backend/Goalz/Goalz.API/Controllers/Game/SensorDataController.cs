using Goalz.Core.Interfaces;
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
