using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.Api.Controllers.Dashboard;

[ApiController]
[Route("api/dashboard/checkpoints")]
public class CheckpointController : ControllerBase
{
    private readonly ICheckpointService _checkpointService;

    public CheckpointController(ICheckpointService checkpointService)
    {
        _checkpointService = checkpointService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var checkpoints = await _checkpointService.GetAllAsync();
        return Ok(checkpoints);
    }
}
