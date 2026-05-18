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

    public async Task StoreSensorData(SensorDataDto sensorData)
    {
        await ValidateSensorData(sensorData);

        var sensorDataEntity = new SensorData
        {
            SensorsId = sensorData.SensorId,
            Temp = sensorData.Temperature,
            Humidity = (long)sensorData.Humidity,
            SoilMoisture = CalculateSoilMoisture(sensorData.RawMoisture),
            Light = CalculateLight(sensorData.RawRed, sensorData.RawGreen, sensorData.RawBlue),
            Wind = CalculateWindSpeed(sensorData.RawWindRv, sensorData.RawWindTmp),
            Timestamp = DateTime.UtcNow
        };

        await _repository.StoreSensorData(sensorDataEntity);
    }

    private int CalculateSoilMoisture(int rawMoisture)
    {
        const int dryValue = 3500;
        const int wetValue = 1200;

        var percentage =
            (rawMoisture - dryValue) * 100 / (wetValue - dryValue);

        percentage = Math.Clamp(percentage, 0, 100);

        return percentage;
    }

    private long CalculateLight(uint rawRed, uint rawGreen, uint rawBlue)
    {
        var brightness =
            (0.2126 * rawRed) +
            (0.7152 * rawGreen) +
            (0.0722 * rawBlue);

        return (long)brightness;
    }

    private double CalculateWindSpeed(int rawWindRv, int rawWindTmp)
    {
        double rvVolts = (rawWindRv / 4095.0) * 3.3;
        double tmpVolts = (rawWindTmp / 4095.0) * 3.3;

        int tmpRawEquivalent5V =
            (int)((tmpVolts / 5.0) * 1023.0);

        double zeroWindAdUnits =
            -0.0006 * tmpRawEquivalent5V * tmpRawEquivalent5V +
             1.0727 * tmpRawEquivalent5V +
            47.172;

        double zeroWindVolts =
            (zeroWindAdUnits * 0.0048828125) - 0.2;

        double windSpeedMph =
            Math.Pow(
                (rvVolts - zeroWindVolts) / 0.2300,
                2.7265);

        if (double.IsNaN(windSpeedMph) || windSpeedMph < 0)
        {
            return 0;
        }

        return Math.Round(windSpeedMph, 2);
    }

    private async Task ValidateSensorData(SensorDataDto sensorData)
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
        else if (sensorData.RawMoisture < 0 || sensorData.RawMoisture > 1023)
        {
            throw new ArgumentOutOfRangeException(nameof(sensorData.RawMoisture), "Raw moisture must be between 0 and 1023.");
        }
    }
}
