    using Microsoft.AspNetCore.Mvc;
using Goalz.Core.Services;
using Goalz.API.Models;
using Goalz.Core.Interfaces;

namespace Goalz.API.Controllers.Dashboard;

[Route("api/dashboard/overview")]
[ApiController]
public class OverviewController : ControllerBase
{
    private readonly IOverviewService _overviewService;

    public OverviewController(IOverviewService overviewService)
    {
        _overviewService = overviewService;
    }

    [HttpGet]
    public async Task<ActionResult<MapElements>> GetElements()
    {
        var data = await _overviewService.GetDashboardData();
        return Ok(data);
    }
}