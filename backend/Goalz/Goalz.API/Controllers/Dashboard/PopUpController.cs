using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Goalz.API.Controllers.Dashboard;

[Authorize]
[Route("api/dashboard/sensors/{sensorId}/popup")]
[ApiController]
public class PopUpController : ControllerBase
{
    private readonly IPopUpService _service;

    public PopUpController(IPopUpService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create(long sensorId, [FromBody] CreatePopUpRequest request)
    {
        var (success, error) = await _service.CreateAsync(sensorId, request);
        if (!success)
        {
            return error switch
            {
                "sensor_not_found" => NotFound($"Sensor {sensorId} not found."),
                "already_exists"   => Conflict("This sensor already has a pop-up message."),
                _                  => BadRequest("Something went wrong.")
            };
        }
        return NoContent();
    }

    [HttpPut]
    public async Task<IActionResult> Update(long sensorId, [FromBody] UpdatePopUpRequest request)
    {
        var (success, error) = await _service.UpdateAsync(sensorId, request);
        if (!success)
        {
            return error switch
            {
                "not_found" => NotFound($"No pop-up found for sensor {sensorId}."),
                _           => BadRequest("Something went wrong.")
            };
        }
        return NoContent();
    }

    [HttpDelete]
    public async Task<IActionResult> Delete(long sensorId)
    {
        var (success, error) = await _service.DeleteAsync(sensorId);
        if (!success)
        {
            return error switch
            {
                "sensor_not_found" => NotFound($"Sensor {sensorId} not found."),
                "not_found"        => NotFound($"No pop-up found for sensor {sensorId}."),
                _                  => BadRequest("Something went wrong.")
            };
        }
        return NoContent();
    }
}
