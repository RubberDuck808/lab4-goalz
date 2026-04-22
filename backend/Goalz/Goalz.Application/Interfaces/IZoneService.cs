using Goalz.Core.DTOs;

namespace Goalz.Core.Interfaces
{
    public interface IZoneService
    {
        Task<IEnumerable<ZoneDto>> GetAllAsync();
        Task<(bool Success, string? Error)> CreateAsync(CreateZoneDto dto);
        Task<(bool Success, string? Error)> UpdateAsync(long id, UpdateZoneDto dto);
        Task<bool> DeleteAsync(long id);
    }
}
