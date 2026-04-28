using Goalz.Core.Interfaces;
using Goalz.Data.Storage;
using Goalz.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Goalz.Data.Repositories
{
    public class ZoneRepository : IZoneRepository
    {
        private readonly AppDbContext _context;

        public ZoneRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Zone>> GetAllAsync()
        {
            return await _context.Zones.ToListAsync();
        }

        public async Task<Zone?> GetByIdAsync(long id)
        {
            return await _context.Zones.FindAsync(id);
        }

        public async Task AddAsync(Zone zone)
        {
            await _context.Zones.AddAsync(zone);
        }

        public Task DeleteAsync(Zone zone)
        {
            _context.Zones.Remove(zone);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<Zone?> FindContainingZoneAsync(Point point)
            => await _context.Zones
                .Where(z => z.Boundary.Contains(point))
                .FirstOrDefaultAsync();
    }
}
