using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces;

public interface ISensorDataRepository
{
    Task<IEnumerable<SensorData>> GetBySensorIdAsync(long sensorId);
}
