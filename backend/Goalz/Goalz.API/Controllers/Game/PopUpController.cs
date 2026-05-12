using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.API.Controllers.Game;

[Route("api/game/sensors/{sensorId}/popup")]
[ApiController]
public class PopUpController : ControllerBase
{
    private readonly IPopUpService _service;

    public PopUpController(IPopUpService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Get(long sensorId)
    {
        var popUp = await _service.GetBySensorIdAsync(sensorId);
        if (popUp is null) return NotFound();
        return Ok(popUp);
    }
}
