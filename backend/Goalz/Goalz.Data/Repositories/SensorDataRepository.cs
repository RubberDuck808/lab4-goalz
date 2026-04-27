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

    public async Task<IEnumerable<SensorData>> GetBySensorIdAsync(long sensorId)
    {
        return await _context.SensorData
            .Where(sd => sd.SensorsId == sensorId)
            .OrderByDescending(sd => sd.Timestamp)
            .ToListAsync();
    }
}
