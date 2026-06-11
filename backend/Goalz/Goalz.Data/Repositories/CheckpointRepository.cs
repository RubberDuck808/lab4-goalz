using Goalz.Core.Interfaces;
using Goalz.Data.Storage;
using Goalz.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Goalz.Data.Repositories;

public class CheckpointRepository : ICheckpointRepository
{
    private readonly AppDbContext _context;

    public CheckpointRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Checkpoint>> GetAllAsync()
        => await _context.Checkpoints.ToListAsync();

    public async Task<IEnumerable<Checkpoint>> FindInsideBoundaryAsync(Geometry boundary)
        => await _context.Checkpoints
            .Include(c => c.Zone)
            .Where(c => boundary.Contains(c.Location))
            .ToListAsync();

    public async Task<Checkpoint?> GetByReferenceAsync(string type, long referenceId)
        => await _context.Checkpoints
            .FirstOrDefaultAsync(c => c.Type == type && c.ReferenceId == referenceId);

    public async Task AddAsync(Checkpoint checkpoint)
        => await _context.Checkpoints.AddAsync(checkpoint);

    public Task DeleteAsync(Checkpoint checkpoint)
    {
        _context.Checkpoints.Remove(checkpoint);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();
}
