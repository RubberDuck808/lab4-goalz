using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces
{
    public interface ISectionRepository
    {
        Task<IEnumerable<Section>> GetAllOrderedAsync();
        Task<Section?> GetByIdWithCheckpointsAsync(long id);
    }
}
