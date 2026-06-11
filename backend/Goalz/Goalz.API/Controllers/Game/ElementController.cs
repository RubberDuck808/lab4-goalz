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

    public ElementController(IElementService elementService)
    {
        _elementService = elementService;
    }

    [HttpGet("types")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTypes()
    {
        var types = await _elementService.GetAllTypesAsync();
        return Ok(types);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateElementRequest request)
    {
        var username = User.Identity?.Name;
        if (username == null) return Unauthorized();
        request.IsApproved  = false;
        request.SubmittedBy = username;
        var (element, error) = await _elementService.CreateAsync(request);
        if (element is null)
            return error == "unknown_type" ? BadRequest("Unknown element type.") : BadRequest(error);
        return CreatedAtAction(nameof(Create), new { id = element.Id }, element);
    }
}
