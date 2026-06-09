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

    public async Task<IEnumerable<SensorData>> GetBySensorIdAsync(long sensorId, DateTime? from = null, DateTime? to = null, int? limit = null)
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

        query = query.OrderByDescending(sd => sd.Timestamp);

        if (limit.HasValue)
        {
            query = query.Take(Math.Min(limit.Value, 500));
        }

        return await query.ToListAsync();
    }

    public async Task<IEnumerable<SensorData>> GetBySensorIdAsync(long sensorId)
    {
        return await _context.SensorData
            .Where(sd => sd.SensorsId == sensorId)
            .OrderByDescending(sd => sd.Timestamp)
            .Take(500)
            .ToListAsync();
    }

    public IAsyncEnumerable<SensorData> GetSensorsByTimeRangeAsync(DateTime dateTimeFrom, DateTime dateTimeTo)
    {
        return _context.SensorData
            .Where(s => s.Timestamp >= dateTimeFrom && s.Timestamp <= dateTimeTo)
            .AsAsyncEnumerable();
    }

    public async Task<IEnumerable<SensorData>> GetDataSummary()
    {
        var data = await _context.SensorData
            .OrderByDescending(x => x.Timestamp)
            .GroupBy(x => x.SensorsId)
            .Select(g => g.First())
            .Take(20)
            .ToListAsync();

        return data;
    }
}
