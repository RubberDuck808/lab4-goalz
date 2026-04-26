using Goalz.Core.DTOs;
using NetTopologySuite.Geometries;

namespace Goalz.Core.Interfaces;

public interface ICheckpointService
{
    Task<IEnumerable<CheckpointDto>> GetAllAsync();
    Task CreateForElementAsync(long elementId, Point location);
    Task CreateForSensorAsync(long sensorId, Point location);
    Task AssignZonesForNewZoneAsync(long zoneId, Geometry boundary, string zoneType);
}
