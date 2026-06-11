using Goalz.Core.DTOs;

namespace Goalz.Core.Interfaces;

public interface ISensorDataService
{
    Task<IEnumerable<SensorDataResponse>> GetBySensorIdAsync(long sensorId, DateTime? from = null, DateTime? to = null, int? limit = null);
}
