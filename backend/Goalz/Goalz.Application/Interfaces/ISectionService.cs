using Goalz.Core.DTOs;

namespace Goalz.Core.Interfaces
{
    public interface ISectionService
    {
        Task<IEnumerable<SectionSummaryDto>> GetAllAsync();
        Task<SectionDetailDto?> GetByIdAsync(long id);
    }
}
