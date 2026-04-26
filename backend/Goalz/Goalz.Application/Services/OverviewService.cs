using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;

namespace Goalz.Core.Services;

public class OverviewService : IOverviewService
{
    private readonly IOverviewRepository _repository;

    public OverviewService(IOverviewRepository repository)
    {
        _repository = repository;
    }

    public async Task<ElementsDTO> GetDashboardData()
    {
        return new ElementsDTO
        {
            sensors = await _repository.GetAllSensorsAsync(),
            element = await _repository.GetAllElementsAsync()
        };
    }
}