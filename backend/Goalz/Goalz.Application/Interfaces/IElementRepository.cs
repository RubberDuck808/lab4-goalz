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
    Task<IEnumerable<Element>> GetByIdsAsync(IEnumerable<long> ids);
    Task<IEnumerable<Element>> GetAllAsync();
    Task<IEnumerable<Element>> GetAllApprovedAsync();
    Task<IEnumerable<Element>> GetPendingAsync();
    Task<Element?> FindNearbyPendingAsync(double latitude, double longitude, string elementType, string elementName, double radiusMeters);
    Task<bool> ApproveAsync(long id);
    Task<bool> RejectAsync(long id);
    Task<List<Element>> GetPendingWithoutAiAsync(int limit);
}
