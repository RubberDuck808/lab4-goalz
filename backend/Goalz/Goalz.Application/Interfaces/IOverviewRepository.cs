using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces;

public interface IOverviewRepository
{
    Task<List<Sensor>> GetAllSensorsAsync();
    Task<List<Element>> GetAllElementsAsync();
}