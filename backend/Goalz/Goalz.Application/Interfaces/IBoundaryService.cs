using Goalz.Core.DTOs;
using NetTopologySuite.Geometries;

namespace Goalz.Core.Interfaces
{
    public interface IBoundaryService
    {
        Task<IEnumerable<BoundaryDto>> GetAllAsync();
        Task<(bool Success, string? Error)> CreateAsync(CreateBoundaryDto dto);
        Task<(bool Success, string? Error)> UpdateAsync(long id, UpdateBoundaryDto dto);
        Task<bool> DeleteAsync(long id);
        Task<IEnumerable<Geometry>> GeneratePreviewAsync(long boundaryId, int count);
    }
}
