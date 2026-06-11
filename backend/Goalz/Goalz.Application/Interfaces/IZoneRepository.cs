using Goalz.Domain.Entities;
using NetTopologySuite.Geometries;

namespace Goalz.Core.Interfaces
{
    public interface IZoneRepository
    {
        Task<IEnumerable<Zone>> GetAllAsync();
        Task<Zone?> GetByIdAsync(long id);
        Task AddAsync(Zone zone);
        Task DeleteAsync(Zone zone);
        Task SaveChangesAsync();
        Task<Zone?> FindContainingZoneAsync(Point point);
    }
}
