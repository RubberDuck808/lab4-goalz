using Goalz.Core.DTOs;
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
