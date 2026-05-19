using Goalz.Core.DTOs;
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

    public async Task<List<SensorOverviewDto>> GetAllSensorsAsync()
    {
        return await _context.Sensors
            .Select(s => new SensorOverviewDto
            {
                Id          = s.Id,
                SensorName  = s.SensorName,
                Geo         = s.Geo,
                PopUpId     = s.PopUpId,
                Temp        = s.SensorData.OrderByDescending(d => d.Timestamp).Select(d => (double?)d.Temp).FirstOrDefault(),
                Humidity    = s.SensorData.OrderByDescending(d => d.Timestamp).Select(d => (double?)d.Humidity).FirstOrDefault(),
                Light       = s.SensorData.OrderByDescending(d => d.Timestamp).Select(d => (double?)d.Light).FirstOrDefault(),
                SoilMoisture = s.SensorData.OrderByDescending(d => d.Timestamp).Select(d => (long?)d.SoilMoisture).FirstOrDefault(),
                LastReading = s.SensorData.OrderByDescending(d => d.Timestamp).Select(d => (DateTime?)d.Timestamp).FirstOrDefault(),
            })
            .ToListAsync();
    }

    public async Task<List<Element>> GetAllElementsAsync()
    {
        return await _context.Elements.Include(e => e.ElementType).ToListAsync();
    }
}