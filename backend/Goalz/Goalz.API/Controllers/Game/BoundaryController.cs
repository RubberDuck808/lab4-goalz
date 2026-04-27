using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.Api.Controllers.Game;

[ApiController]
[Route("api/game/boundaries")]
public class BoundaryController : ControllerBase
{
    private readonly IBoundaryRepository _boundaryRepository;

    public BoundaryController(IBoundaryRepository boundaryRepository)
    {
        _boundaryRepository = boundaryRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var boundaries = await _boundaryRepository.GetAllAsync();
        var result = boundaries.Select(b => new { b.Id, b.Name, b.Color });
        return Ok(result);
    }
}
