using Goalz.Core.Interfaces;
using Goalz.Data.Storage;
using Goalz.Domain.Entities;

namespace Goalz.Data.Repositories
{
    public class NatureElementRepository : INatureElementRepository
    {
        private readonly AppDbContext _context;

        public NatureElementRepository(AppDbContext context)
        {
            _context = context;
        }

        public List<ElementType> GetAllElementTypes()
        {
            return _context.ElementTypes.ToList();
        }

        public void StoreElements(List<Element> elements)
        {
            _context.Elements.AddRange(elements);

            _context.SaveChanges();
        }

        public ElementType GetNatureElementTypeByName(string typeName)
        {
            return _context.ElementTypes.FirstOrDefault(e => e.Name == typeName);
        }
    }
}
