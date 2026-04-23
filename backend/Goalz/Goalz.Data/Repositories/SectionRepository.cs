using Goalz.Core.Interfaces;
using Goalz.Data.Storage;
using Goalz.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Goalz.Data.Repositories
{
    public class SectionRepository : ISectionRepository
    {
        private readonly AppDbContext _context;

        public SectionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Section>> GetAllOrderedAsync()
        {
            return await _context.Sections
                .Include(s => s.Zone)
                .OrderBy(s => s.OrderIndex)
                .ToListAsync();
        }

        public async Task<Section?> GetByIdWithCheckpointsAsync(long id)
        {
            return await _context.Sections
                .Include(s => s.Zone)
                .Include(s => s.Checkpoints)
                .FirstOrDefaultAsync(s => s.Id == id);
        }
    }
}
