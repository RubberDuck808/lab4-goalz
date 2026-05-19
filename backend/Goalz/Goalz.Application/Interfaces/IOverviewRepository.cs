using Goalz.Core.DTOs;
using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces;

public interface IOverviewRepository
{
    Task<List<SensorOverviewDto>> GetAllSensorsAsync();
    Task<List<Element>> GetAllElementsAsync();
}