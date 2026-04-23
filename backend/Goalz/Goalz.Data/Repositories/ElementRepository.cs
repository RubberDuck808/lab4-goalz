using Goalz.Core.Interfaces;
using Goalz.Data.Storage;
using Goalz.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Goalz.Data.Repositories;

public class ElementRepository : IElementRepository
{
    private readonly AppDbContext _context;

    public ElementRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Element> CreateAsync(Element element)
    {
        _context.Elements.Add(element);
        await _context.SaveChangesAsync();
        return element;
    }

    public async Task<Element?> GetByIdAsync(long id)
    {
        return await _context.Elements.Include(e => e.ElementType).FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<bool> UpdateAsync(Element element)
    {
        _context.Elements.Update(element);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteAsync(long id)
    {
        var element = await _context.Elements.FindAsync(id);
        if (element is null) return false;
        _context.Elements.Remove(element);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<ElementType?> GetElementTypeByNameAsync(string name)
    {
        return await _context.ElementTypes
            .FirstOrDefaultAsync(et => et.Name.ToLower() == name.ToLower());
    }

    public async Task<ElementType> CreateElementTypeAsync(string name)
    {
        var elementType = new ElementType { Name = name };
        _context.ElementTypes.Add(elementType);
        await _context.SaveChangesAsync();
        return elementType;
    }

    public async Task<List<ElementType>> GetAllElementTypesAsync()
    {
        return await _context.ElementTypes.OrderBy(et => et.Name).ToListAsync();
    }
}
