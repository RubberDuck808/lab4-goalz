using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.API.Controllers.Game;

[Route("api/game/elements")]
[ApiController]
[Authorize]
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
    [AllowAnonymous]
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
}
