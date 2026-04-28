using System.Collections.Generic;
using Goalz.Core.Interfaces;
using Goalz.Data.Storage;
using Goalz.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Goalz.Data.Repositories;

public class SensorRepository : ISensorRepository
{
    private readonly AppDbContext _context;

    public SensorRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Sensor> CreateAsync(Sensor sensor)
    {
        _context.Sensors.Add(sensor);
        await _context.SaveChangesAsync();
        return sensor;
    }

    public async Task<Sensor?> GetByIdAsync(long id)
    {
        return await _context.Sensors.FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<bool> UpdateAsync(Sensor sensor)
    {
        _context.Sensors.Update(sensor);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteAsync(long id)
    {
        var sensor = await _context.Sensors.FindAsync(id);
        if (sensor is null) return false;
        _context.Sensors.Remove(sensor);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<IEnumerable<Sensor>> GetByIdsAsync(IEnumerable<long> ids)
    {
        var idSet = ids.ToHashSet();
        return await _context.Sensors.Where(s => idSet.Contains(s.Id)).ToListAsync();
    }
}
