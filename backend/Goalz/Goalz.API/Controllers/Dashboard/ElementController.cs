using Goalz.Core.DTOs;
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
