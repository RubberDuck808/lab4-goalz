using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Goalz.API.Controllers.Dashboard;

[Route("api/dashboard/elements")]
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
    public async Task<IActionResult> GetTypes()
    {
        var types = await _elementService.GetAllTypesAsync();
        return Ok(types);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateElementRequest request)
    {
        request.IsApproved  = true;
        request.SubmittedBy = null;
        var (element, error) = await _elementService.CreateAsync(request);
        if (element is null)
            return BadRequest(error);
        return CreatedAtAction(nameof(Create), new { id = element.Id }, element);
    }

    [HttpGet("pending")]
    public async Task<IActionResult> GetPending()
        => Ok(await _elementService.GetPendingAsync());

    [HttpPost("{id}/analyse")]
    public async Task<IActionResult> TriggerAnalysis(long id)
    {
        var (success, error) = await _elementService.TriggerAnalysisAsync(id);
        return success ? Accepted() : error == "not_found" ? NotFound() : BadRequest(error);
    }

    [HttpPut("{id}/approve")]
    public async Task<IActionResult> Approve(long id)
    {
        var (success, error) = await _elementService.ApproveAsync(id);
        return success ? NoContent() : error == "not_found" ? NotFound() : BadRequest();
    }

    [HttpPut("{id}/reject")]
    public async Task<IActionResult> Reject(long id)
    {
        var (success, error) = await _elementService.RejectAsync(id);
        return success ? NoContent() : error == "not_found" ? NotFound() : BadRequest();
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
