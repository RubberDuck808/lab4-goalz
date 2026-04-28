using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces
{
    public interface IBoundaryRepository
    {
        Task<IEnumerable<Boundary>> GetAllAsync();
        Task<Boundary?> GetByIdAsync(long id);
        Task AddAsync(Boundary boundary);
        Task DeleteAsync(Boundary boundary);
        Task SaveChangesAsync();
    }
}
