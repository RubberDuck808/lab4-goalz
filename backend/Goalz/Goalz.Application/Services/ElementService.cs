using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;
using NetTopologySuite.Geometries;

namespace Goalz.Core.Services;

public class ElementService : IElementService
{
    private readonly IElementRepository _repository;
    private readonly ICheckpointService _checkpointService;

    public ElementService(IElementRepository repository, ICheckpointService checkpointService)
    {
        _repository = repository;
        _checkpointService = checkpointService;
    }

    public async Task<Element> CreateAsync(CreateElementRequest request)
    {
        var elementType = await _repository.GetElementTypeByNameAsync(request.ElementType)
                          ?? await _repository.CreateElementTypeAsync(request.ElementType);

        var element = new Element
        {
            ElementName = request.ElementName,
            ElementTypeId = elementType.Id,
            Geom = new Point(request.Longitude, request.Latitude) { SRID = 4326 },
            ImageUrl = request.ImageUrl ?? string.Empty,
            IsGreen = request.IsGreen
        };
        await _repository.CreateAsync(element);
        await _checkpointService.CreateForElementAsync(element.Id, element.Geom);
        return element;
    }

    public async Task<(bool Success, string? Error)> UpdateAsync(long id, UpdateElementRequest request)
    {
        var element = await _repository.GetByIdAsync(id);
        if (element is null)
            return (false, "not_found");

        var elementType = await _repository.GetElementTypeByNameAsync(request.ElementType)
                          ?? await _repository.CreateElementTypeAsync(request.ElementType);

        element.ElementName = request.ElementName;
        element.ElementTypeId = elementType.Id;
        element.Geom = new Point(request.Longitude, request.Latitude) { SRID = 4326 };
        element.ImageUrl = request.ImageUrl ?? string.Empty;
        element.IsGreen = request.IsGreen;

        await _repository.UpdateAsync(element);
        return (true, null);
    }

    public async Task<(bool Success, string? Error)> DeleteAsync(long id)
    {
        var deleted = await _repository.DeleteAsync(id);
        if (!deleted)
            return (false, "not_found");
        await _checkpointService.DeleteByReferenceAsync("element", id);
        return (true, null);
    }
}
