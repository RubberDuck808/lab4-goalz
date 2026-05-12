using Goalz.Core.Interfaces;
using Goalz.Data.Storage;
using Goalz.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Goalz.Data.Repositories;

public class PopUpRepository : IPopUpRepository
{
    private readonly AppDbContext _context;

    public PopUpRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PopUp?> GetBySensorIdAsync(long sensorId)
    {
        return await _context.Sensors
            .Where(s => s.Id == sensorId)
            .Select(s => s.PopUp)
            .FirstOrDefaultAsync();
    }

    public async Task<PopUp> CreateAsync(PopUp popUp)
    {
        _context.PopUps.Add(popUp);
        await _context.SaveChangesAsync();
        return popUp;
    }

    public async Task<bool> UpdateAsync(PopUp popUp)
    {
        _context.PopUps.Update(popUp);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteAsync(long id)
    {
        var popUp = await _context.PopUps.FindAsync(id);
        if (popUp is null) return false;
        _context.PopUps.Remove(popUp);
        return await _context.SaveChangesAsync() > 0;
    }
}
