using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;
using Microsoft.Extensions.Logging;
using NetTopologySuite.Geometries;

namespace Goalz.Core.Services;

public class ElementService : IElementService
{
    private static readonly SemaphoreSlim _analysisSemaphore = new(10, 10);

    private readonly IElementRepository _repository;
    private readonly IUserService _userService;
    private readonly IImageAnalysisService? _imageAnalysis;
    private readonly ILogger<ElementService> _logger;

    public ElementService(
        IElementRepository repository,
        IUserService userService,
        IImageAnalysisService? imageAnalysis,
        ILogger<ElementService> logger)
    {
        _repository    = repository;
        _userService   = userService;
        _imageAnalysis = imageAnalysis;
        _logger        = logger;
    }

    public Task<List<ElementType>> GetAllTypesAsync()
        => _repository.GetAllElementTypesAsync();

    public async Task<(Element? Element, string? Error)> CreateAsync(CreateElementRequest request)
    {
        ElementType? elementType;
        if (!request.IsApproved)
        {
            elementType = await _repository.GetElementTypeByNameAsync(request.ElementType);
            if (elementType is null)
                return (null, "unknown_type");
        }
        else
        {
            elementType = await _repository.GetElementTypeByNameAsync(request.ElementType)
                          ?? await _repository.CreateElementTypeAsync(request.ElementType);
        }

        if (!request.IsApproved)
        {
            var existing = await _repository.FindNearbyPendingAsync(
                request.Latitude, request.Longitude,
                request.ElementType, request.ElementName, radiusMeters: 5.0);
            if (existing is not null)
            {
                if (request.ImageUrl is not null)
                {
                    existing.ImageUrl = request.ImageUrl;
                    await _repository.UpdateAsync(existing);
                    FireAnalysis(existing.Id, existing.ImageUrl, existing.ElementName, elementType.Name);
                }
                return (existing, null);
            }
        }

        var element = new Element
        {
            ElementName   = request.ElementName,
            ElementTypeId = elementType.Id,
            Geom          = new Point(request.Longitude, request.Latitude) { SRID = 4326 },
            ImageUrl      = request.ImageUrl,
            IsGreen       = request.IsGreen,
            IsApproved    = request.IsApproved,
            SubmittedBy   = request.SubmittedBy,
            CreatedAt     = DateTime.UtcNow,
        };
        await _repository.CreateAsync(element);
        if (request.SubmittedBy is not null)
            await _userService.IncrementPicturesTakenAsync(request.SubmittedBy);

        if (!request.IsApproved && element.ImageUrl is not null)
            FireAnalysis(element.Id, element.ImageUrl, element.ElementName, elementType.Name);

        return (element, null);
    }

    public async Task<(bool Success, string? Error)> UpdateAsync(long id, UpdateElementRequest request)
    {
        var element = await _repository.GetByIdAsync(id);
        if (element is null)
            return (false, "not_found");

        var elementType = await _repository.GetElementTypeByNameAsync(request.ElementType)
                          ?? await _repository.CreateElementTypeAsync(request.ElementType);

        element.ElementName   = request.ElementName;
        element.ElementTypeId = elementType.Id;
        element.Geom          = new Point(request.Longitude, request.Latitude) { SRID = 4326 };
        element.ImageUrl      = request.ImageUrl ?? string.Empty;
        element.IsGreen       = request.IsGreen;

        await _repository.UpdateAsync(element);
        return (true, null);
    }

    public async Task<(bool Success, string? Error)> DeleteAsync(long id)
    {
        var deleted = await _repository.DeleteAsync(id);
        return deleted ? (true, null) : (false, "not_found");
    }

    public async Task<IEnumerable<PendingElementDto>> GetPendingAsync()
    {
        var elements = await _repository.GetPendingAsync();
        return elements.Select(e => new PendingElementDto
        {
            Id          = e.Id,
            ElementName = e.ElementName,
            ElementType = e.ElementType?.Name ?? string.Empty,
            Latitude    = e.Geom.Y,
            Longitude   = e.Geom.X,
            ImageUrl    = e.ImageUrl,
            IsGreen     = e.IsGreen,
            SubmittedBy = e.SubmittedBy,
            CreatedAt   = e.CreatedAt,
            AiConfidence = e.AiConfidence,
            AiSummary    = e.AiSummary,
            AiResult     = e.AiResult?.ToString(),
        });
    }

    public async Task<(bool Success, string? Error)> ApproveAsync(long id)
        => await _repository.ApproveAsync(id) ? (true, null) : (false, "not_found");

    public async Task<(bool Success, string? Error)> RejectAsync(long id)
        => await _repository.RejectAsync(id) ? (true, null) : (false, "not_found");

    public async Task RetryMissedAnalysisAsync()
    {
        var missed = await _repository.GetPendingWithoutAiAsync(limit: 50);
        foreach (var element in missed)
        {
            if (element.ImageUrl is null) continue;
            FireAnalysis(element.Id, element.ImageUrl, element.ElementName, element.ElementType?.Name ?? "");
        }
    }

    private void FireAnalysis(long id, string imageUrl, string name, string type)
    {
        if (_imageAnalysis is null) return;
        _ = Task.Run(() => AnalyseAndActAsync(id, imageUrl, name, type));
    }

    private async Task AnalyseAndActAsync(long id, string imageUrl, string name, string type)
    {
        await _analysisSemaphore.WaitAsync();
        try
        {
            var result = await _imageAnalysis!.AnalyseElementAsync(imageUrl, name, type);
            if (result is null) return;

            var element = await _repository.GetByIdAsync(id);
            if (element is null || element.IsRejected) return;

            element.AiConfidence = result.Confidence;
            element.AiSummary    = result.Summary;
            element.AiResult     = result.Recommendation;
            await _repository.UpdateAsync(element);

            if (result.Recommendation == AiRecommendation.AutoApprove)
                await _repository.ApproveAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AI analysis failed for element {Id}", id);
        }
        finally
        {
            _analysisSemaphore.Release();
        }
    }
}
