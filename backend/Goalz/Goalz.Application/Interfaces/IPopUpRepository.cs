using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces;

public interface IPopUpRepository
{
    Task<PopUp?> GetBySensorIdAsync(long sensorId);
    Task<PopUp> CreateAsync(PopUp popUp);
    Task<bool> UpdateAsync(PopUp popUp);
    Task<bool> DeleteAsync(long id);
}
