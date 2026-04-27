using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;

namespace Goalz.Core.Services;

public class SensorDataService : ISensorDataService
{
    private readonly ISensorDataRepository _repo;

    public SensorDataService(ISensorDataRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<SensorDataResponse>> GetBySensorIdAsync(long sensorId)
    {
        var data = await _repo.GetBySensorIdAsync(sensorId);
        return data.Select(sd => new SensorDataResponse(sd.Id, sd.Light, sd.Humidity, sd.Temp, sd.Timestamp));
    }
}
