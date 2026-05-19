using Goalz.Core.DTOs;
using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces;

public interface IElementService
{
    Task<List<ElementType>> GetAllTypesAsync();
    Task<(Element? Element, string? Error)> CreateAsync(CreateElementRequest request);
    Task<(bool Success, string? Error)> UpdateAsync(long id, UpdateElementRequest request);
    Task<(bool Success, string? Error)> DeleteAsync(long id);
    Task<IEnumerable<PendingElementDto>> GetPendingAsync();
    Task<(bool Success, string? Error)> ApproveAsync(long id);
    Task<(bool Success, string? Error)> RejectAsync(long id);
}