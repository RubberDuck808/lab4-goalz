using Goalz.Core.DTOs;
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
