using Goalz.API.Models;
using Goalz.Core.DTOs;
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

    [HttpPost("data")]
    public async Task<IActionResult> SensorData([FromBody] SensorData data)
    {
        try
        {
            var sensorDataDto = new SensorDataDTO
            {
                SensorId = data.SensorId,
                Temperature = data.Temperature,
                Humidity = data.Humidity,
                SoilMoisture = data.SoilMoisture,
                RawMoisture = data.RawMoisture
            };

            await _sensorService.StoreSensorData(sensorDataDto);

            return Ok("Data successfully stored!");
        }
        catch (ArgumentOutOfRangeException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (ArgumentNullException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An unexpected error occurred: {ex.Message}");
        }

    }
}
