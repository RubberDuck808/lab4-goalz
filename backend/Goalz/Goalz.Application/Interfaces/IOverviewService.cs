using Goalz.Core.DTOs;
using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces;

public interface IOverviewService
{
    Task<ElementsDTO> GetDashboardData();
    
}
