using Goalz.Domain.Entities;

namespace Goalz.Core.Interfaces
{
    public interface INatureElementRepository
    {
        List<ElementType> GetAllElementTypes();
        void StoreElements(List<Element> elements);
        ElementType GetNatureElementTypeByName(string typeName);
    }
}
