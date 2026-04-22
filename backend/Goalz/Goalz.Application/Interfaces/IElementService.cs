using Goalz.Core.DTOs;
using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces;

public interface IElementService
{
    Task<Element> CreateAsync(CreateElementRequest request);
    Task<(bool Success, string? Error)> UpdateAsync(long id, UpdateElementRequest request);
    Task<(bool Success, string? Error)> DeleteAsync(long id);
}