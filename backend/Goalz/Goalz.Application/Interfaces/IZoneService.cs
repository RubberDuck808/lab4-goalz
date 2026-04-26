using Goalz.Core.DTOs;
using NetTopologySuite.Geometries;

namespace Goalz.Core.Interfaces
{
    public interface IZoneService
    {
        Task<IEnumerable<ZoneDto>> GetAllAsync();
        Task<(bool Success, string? Error)> CreateAsync(CreateZoneDto dto);
        Task<(bool Success, string? Error)> UpdateAsync(long id, UpdateZoneDto dto);
        Task<bool> DeleteAsync(long id);
        Task<IEnumerable<Geometry>> GenerateZonePreviewAsync(long boundaryId, int count);
    }
}
