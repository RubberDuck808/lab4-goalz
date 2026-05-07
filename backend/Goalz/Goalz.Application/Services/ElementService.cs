using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;
using NetTopologySuite.Geometries;

namespace Goalz.Core.Services;

public class ElementService : IElementService
{
    private readonly IElementRepository _repository;

    public ElementService(IElementRepository repository)
    {
        _repository = repository;
    }

    public async Task<Element> CreateAsync(CreateElementRequest request)
    {
        var elementType = await _repository.GetElementTypeByNameAsync(request.ElementType)
                          ?? await _repository.CreateElementTypeAsync(request.ElementType);

        if (!request.IsApproved && request.ImageUrl is not null)
        {
            var existing = await _repository.FindNearbyPendingAsync(
                request.Latitude, request.Longitude,
                request.ElementType, request.ElementName, radiusMeters: 5.0);
            if (existing is not null)
            {
                existing.ImageUrl = request.ImageUrl;
                await _repository.UpdateAsync(existing);
                return existing;
            }
        }

        var element = new Element
        {
            ElementName   = request.ElementName,
            ElementTypeId = elementType.Id,
            Geom          = new Point(request.Longitude, request.Latitude) { SRID = 4326 },
            ImageUrl      = request.ImageUrl ?? string.Empty,
            IsGreen       = request.IsGreen,
            IsApproved    = request.IsApproved,
            SubmittedBy   = request.SubmittedBy,
            CreatedAt     = DateTime.UtcNow,
        };
        await _repository.CreateAsync(element);
        return element;
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
        });
    }

    public async Task<(bool Success, string? Error)> ApproveAsync(long id)
        => await _repository.ApproveAsync(id) ? (true, null) : (false, "not_found");

    public async Task<(bool Success, string? Error)> RejectAsync(long id)
        => await _repository.RejectAsync(id) ? (true, null) : (false, "not_found");
}
