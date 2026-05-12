using Goalz.Core.DTOs;

namespace Goalz.Core.Interfaces;

public interface IPopUpService
{
    Task<PopUpDto?> GetBySensorIdAsync(long sensorId);
    Task<(bool Success, string? Error)> CreateAsync(long sensorId, CreatePopUpRequest request);
    Task<(bool Success, string? Error)> UpdateAsync(long sensorId, UpdatePopUpRequest request);
    Task<(bool Success, string? Error)> DeleteAsync(long sensorId);
}
