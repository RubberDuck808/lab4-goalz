using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces;

public interface ISensorDataRepository
{
    Task<IEnumerable<SensorData>> GetBySensorIdAsync(long sensorId, DateTime? from = null, DateTime? to = null, int? limit = null);
    IAsyncEnumerable<SensorData> GetSensorsByTimeRangeAsync(DateTime dateTimeFrom, DateTime dateTimeTo);
}
