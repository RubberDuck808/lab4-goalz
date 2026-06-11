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
            .Select(s => new
            {
                Sensor = s,
                LatestData = s.SensorData.OrderByDescending(d => d.Timestamp).FirstOrDefault()
            })
            .Select(x => new SensorOverviewDto
            {
                Id          = x.Sensor.Id,
                SensorName  = x.Sensor.SensorName,
                Geo         = x.Sensor.Geo,
                PopUpId     = x.Sensor.PopUpId,
                Temp        = x.LatestData != null ? (double?)x.LatestData.Temp : null,
                Humidity    = x.LatestData != null ? (double?)x.LatestData.Humidity : null,
                Light       = x.LatestData != null ? (double?)x.LatestData.Light : null,
                SoilMoisture = x.LatestData != null ? (long?)x.LatestData.SoilMoisture : null,
                LastReading = x.LatestData != null ? (DateTime?)x.LatestData.Timestamp : null,
            })
            .ToListAsync();
    }

    public async Task<List<Element>> GetAllElementsAsync()
    {
        return await _context.Elements.Include(e => e.ElementType).ToListAsync();
    }
}