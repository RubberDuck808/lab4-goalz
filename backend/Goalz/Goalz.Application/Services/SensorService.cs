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
        await _checkpointService.DeleteByReferenceAsync("sensor", id);
        return (true, null);
    }

    public async Task StoreSensorData(SensorDataDTO sensorData)
    {
        await ValidateSensorData(sensorData);

        var sensorDataEntity = new SensorData
        {
            SensorsId = sensorData.SensorId,
            Temp = sensorData.Temperature,
            Humidity = (long)sensorData.Humidity,
            //SoilMoisture = sensorData.SoilMoisture,
            //RawMoisture = sensorData.RawMoisture,
            Light = (long)sensorData.Light,
            Timestamp = DateTime.UtcNow
        };

        await _repository.StoreSensorData(sensorDataEntity);
    }

    private async Task ValidateSensorData(SensorDataDTO sensorData)
    {
        var sensor = await _repository.GetByIdAsync(sensorData.SensorId);

        if (sensor == null) 
        { 
            throw new ArgumentNullException($"Sensor with ID {sensorData.SensorId} not found.");
        } 
        else if (sensorData.Temperature < -50 || sensorData.Temperature > 50)
        {
            throw new ArgumentOutOfRangeException(nameof(sensorData.Temperature), "Temperature must be between -50 and 150 degrees Celsius.");
        }
        else if (sensorData.Humidity < 0 || sensorData.Humidity > 100)
        {
            throw new ArgumentOutOfRangeException(nameof(sensorData.Humidity), "Humidity must be between 0 and 100%.");
        }
        else if (sensorData.SoilMoisture < 0 || sensorData.SoilMoisture > 100)
        {
            throw new ArgumentOutOfRangeException(nameof(sensorData.SoilMoisture), "Soil moisture must be between 0 and 100%.");
        }
        else if (sensorData.RawMoisture < 0 || sensorData.RawMoisture > 1023)
        {
            throw new ArgumentOutOfRangeException(nameof(sensorData.RawMoisture), "Raw moisture must be between 0 and 1023.");
        }
    }
}
