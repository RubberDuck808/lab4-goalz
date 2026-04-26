using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces;

public interface IElementRepository
{
    Task<Element> CreateAsync(Element element);
    Task<Element?> GetByIdAsync(long id);
    Task<bool> UpdateAsync(Element element);
    Task<bool> DeleteAsync(long id);
    Task<ElementType?> GetElementTypeByNameAsync(string name);
    Task<ElementType> CreateElementTypeAsync(string name);
    Task<List<ElementType>> GetAllElementTypesAsync();
}
