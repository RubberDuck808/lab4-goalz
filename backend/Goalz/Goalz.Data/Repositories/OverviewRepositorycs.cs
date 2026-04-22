using Goalz.Domain.Entities;
using Goalz.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using Goalz.Data.Storage;

namespace Goalz.Data.Repositories;

public class OverviewRepository : IOverviewRepository
{
    private readonly AppDbContext _context;

    public OverviewRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Sensor>> GetAllSensorsAsync()
    {
        return await _context.Sensors.ToListAsync();
    }

    public async Task<List<Element>> GetAllElementsAsync()
    {
        return await _context.Elements.Include(e => e.ElementType).ToListAsync();
    }
}