using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.Api.Controllers.Game;

[ApiController]
[Route("api/game/boundaries")]
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
        var result = boundaries.Select(b => new { b.Id, b.Name, b.Color });
        return Ok(result);
    }
}
