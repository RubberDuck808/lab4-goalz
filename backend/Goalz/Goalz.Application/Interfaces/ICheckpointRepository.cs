using Goalz.Domain.Entities;
using NetTopologySuite.Geometries;

namespace Goalz.Core.Interfaces;

public interface ICheckpointRepository
{
    Task<IEnumerable<Checkpoint>> GetAllAsync();
    Task<IEnumerable<Checkpoint>> FindInsideBoundaryAsync(Geometry boundary);
    Task<Checkpoint?> GetByReferenceAsync(string type, long referenceId);
    Task AddAsync(Checkpoint checkpoint);
    Task SaveChangesAsync();
}
