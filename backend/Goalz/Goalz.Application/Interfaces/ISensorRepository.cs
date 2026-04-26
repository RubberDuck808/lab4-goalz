using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces;

public interface ISensorRepository
{
    Task<Sensor> CreateAsync(Sensor sensor);
    Task<Sensor?> GetByIdAsync(long id);
    Task<bool> UpdateAsync(Sensor sensor);
    Task<bool> DeleteAsync(long id);
    Task<IEnumerable<Sensor>> GetByIdsAsync(IEnumerable<long> ids);
}