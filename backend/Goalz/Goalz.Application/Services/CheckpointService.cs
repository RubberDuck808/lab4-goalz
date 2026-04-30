using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;
using NetTopologySuite.Geometries;

namespace Goalz.Core.Services;

public class CheckpointService : ICheckpointService
{
    private readonly ICheckpointRepository _checkpointRepository;
    private readonly IZoneRepository _zoneRepository;
    private readonly IElementRepository _elementRepository;
    private readonly ISensorRepository _sensorRepository;

    public CheckpointService(
        ICheckpointRepository checkpointRepository,
        IZoneRepository zoneRepository,
        IElementRepository elementRepository,
        ISensorRepository sensorRepository)
    {
        _checkpointRepository = checkpointRepository;
        _zoneRepository = zoneRepository;
        _elementRepository = elementRepository;
        _sensorRepository = sensorRepository;
    }

    public async Task<IEnumerable<CheckpointDto>> GetAllAsync()
    {
        var checkpoints = (await _checkpointRepository.GetAllAsync()).ToList();

        var elementRefIds = checkpoints.Where(c => c.Type == "element").Select(c => c.ReferenceId).ToHashSet();
        var sensorRefIds  = checkpoints.Where(c => c.Type == "sensor").Select(c => c.ReferenceId).ToList();

        var elementsById = (await _elementRepository.GetByIdsAsync(elementRefIds)).ToDictionary(e => e.Id);
        var sensorsById  = (await _sensorRepository.GetByIdsAsync(sensorRefIds)).ToDictionary(s => s.Id);

        var checkpointDtos = checkpoints.Select(cp =>
        {
            var dto = new CheckpointDto
            {
                Id          = cp.Id,
                Type        = cp.Type,
                ReferenceId = cp.ReferenceId,
                ZoneId      = cp.ZoneId,
                Latitude    = cp.Location.Y,
                Longitude   = cp.Location.X,
            };

            if (cp.Type == "element" && elementsById.TryGetValue(cp.ReferenceId, out var el))
            {
                dto.ElementTypeId = el.ElementTypeId;
                dto.IsGreen       = el.IsGreen;
                dto.Name          = el.ElementName;
            }
            else if (cp.Type == "sensor" && sensorsById.TryGetValue(cp.ReferenceId, out var s))
            {
                dto.Name = s.SensorName ?? $"Sensor {s.Id}";
            }

            return dto;
        }).ToList();

        // Include elements that have no checkpoint row so they appear on the map
        var allElements = await _elementRepository.GetAllAsync();
        var orphanDtos = allElements
            .Where(e => !elementRefIds.Contains(e.Id))
            .Select(e => new CheckpointDto
            {
                Id            = 0,
                Type          = "element",
                ReferenceId   = e.Id,
                ZoneId        = null,
                Latitude      = e.Geom.Y,
                Longitude     = e.Geom.X,
                ElementTypeId = e.ElementTypeId,
                IsGreen       = e.IsGreen,
                Name          = e.ElementName,
            });

        return checkpointDtos.Concat(orphanDtos);
    }

    public async Task CreateForElementAsync(long elementId, Point location)
    {
        var containingZone = await _zoneRepository.FindContainingZoneAsync(location);
        var checkpoint = new Checkpoint
        {
            Type        = "element",
            ReferenceId = elementId,
            Location    = location,
            ZoneId      = containingZone?.Id,
        };
        await _checkpointRepository.AddAsync(checkpoint);
        await _checkpointRepository.SaveChangesAsync();
    }

    public async Task CreateForSensorAsync(long sensorId, Point location)
    {
        var containingZone = await _zoneRepository.FindContainingZoneAsync(location);
        var checkpoint = new Checkpoint
        {
            Type        = "sensor",
            ReferenceId = sensorId,
            Location    = location,
            ZoneId      = containingZone?.Id,
        };
        await _checkpointRepository.AddAsync(checkpoint);
        await _checkpointRepository.SaveChangesAsync();
    }

    public async Task DeleteByReferenceAsync(string type, long referenceId)
    {
        var checkpoint = await _checkpointRepository.GetByReferenceAsync(type, referenceId);
        if (checkpoint is null) return;
        await _checkpointRepository.DeleteAsync(checkpoint);
        await _checkpointRepository.SaveChangesAsync();
    }

    public async Task AssignZonesForNewZoneAsync(long zoneId, Geometry boundary)
    {
        var inside = await _checkpointRepository.FindInsideBoundaryAsync(boundary);
        foreach (var cp in inside)
        {
            if (cp.ZoneId == null)
                cp.ZoneId = zoneId;
        }
        await _checkpointRepository.SaveChangesAsync();
    }
}
