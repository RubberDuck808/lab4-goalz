using Goalz.Core.Interfaces;
using Goalz.Data.Storage;
using Goalz.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Goalz.Data.Repositories;

public class SensorDataRepository : ISensorDataRepository
{
    private readonly AppDbContext _context;

    public SensorDataRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<SensorData>> GetBySensorIdAsync(long sensorId, DateTime? from = null, DateTime? to = null)
    {
        var query = _context.SensorData
            .Where(sd => sd.SensorsId == sensorId);

        if (from.HasValue)
        {
            var utcFrom = DateTime.SpecifyKind(from.Value, DateTimeKind.Utc);
            query = query.Where(sd => sd.Timestamp >= utcFrom);
        }

        if (to.HasValue)
        {
            var utcTo = DateTime.SpecifyKind(to.Value, DateTimeKind.Utc);
            query = query.Where(sd => sd.Timestamp <= utcTo);
        }

        return await query
            .OrderByDescending(sd => sd.Timestamp)
            .ToListAsync();
    }

    public IAsyncEnumerable<SensorData> GetSensorsByTimeRangeAsync(DateTime dateTimeFrom, DateTime dateTimeTo)
    {
        return _context.SensorData
            .Where(s => s.Timestamp >= dateTimeFrom && s.Timestamp <= dateTimeTo)
            .AsAsyncEnumerable();
    }
}
