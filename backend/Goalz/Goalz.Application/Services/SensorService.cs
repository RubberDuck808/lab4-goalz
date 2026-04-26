using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;
using NetTopologySuite.Geometries;

namespace Goalz.Core.Services;

public class SensorService : ISensorService
{
    private readonly ISensorRepository _repository;
    private readonly ICheckpointService _checkpointService;

    public SensorService(ISensorRepository repository, ICheckpointService checkpointService)
    {
        _repository = repository;
        _checkpointService = checkpointService;
    }

    public async Task<Sensor> CreateAsync(CreateSensorRequest request)
    {
        var sensor = new Sensor
        {
            SensorName = request.SensorName,
            Geo = new Point(request.Longitude, request.Latitude) { SRID = 4326 }
        };
        await _repository.CreateAsync(sensor);
        await _checkpointService.CreateForSensorAsync(sensor.Id, sensor.Geo);
        return sensor;
    }

    public async Task<(bool Success, string? Error)> UpdateAsync(long id, UpdateSensorRequest request)
    {
        var sensor = await _repository.GetByIdAsync(id);
        if (sensor is null)
            return (false, "not_found");

        sensor.SensorName = request.SensorName;
        sensor.Geo = new Point(request.Longitude, request.Latitude) { SRID = 4326 };

        await _repository.UpdateAsync(sensor);
        return (true, null);
    }

    public async Task<(bool Success, string? Error)> DeleteAsync(long id)
    {
        var deleted = await _repository.DeleteAsync(id);
        if (!deleted)
            return (false, "not_found");
        return (true, null);
    }
}
