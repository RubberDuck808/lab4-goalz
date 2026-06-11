using Goalz.Core.Interfaces;
using Goalz.Data.Storage;
using Goalz.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Goalz.Data.Repositories
{
    public class BoundaryRepository : IBoundaryRepository
    {
        private readonly AppDbContext _context;

        public BoundaryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Boundary>> GetAllAsync()
            => await _context.Boundaries.ToListAsync();

        public async Task<Boundary?> GetByIdAsync(long id)
            => await _context.Boundaries.FindAsync(id);

        public async Task AddAsync(Boundary boundary)
            => await _context.Boundaries.AddAsync(boundary);

        public Task DeleteAsync(Boundary boundary)
        {
            _context.Boundaries.Remove(boundary);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
            => await _context.SaveChangesAsync();
    }
}
