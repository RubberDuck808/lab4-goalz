using Goalz.Core.DTOs;
using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces;

public interface ISensorService
{
    Task<Sensor> CreateAsync(CreateSensorRequest request);
    Task<(bool Success, string? Error)> UpdateAsync(long id, UpdateSensorRequest request);
    Task<(bool Success, string? Error)> DeleteAsync(long id);
}