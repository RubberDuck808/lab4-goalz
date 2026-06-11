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

    public async Task<IEnumerable<Element>> GetByIdsAsync(IEnumerable<long> ids)
    {
        var idSet = ids.ToHashSet();
        return await _context.Elements.Where(e => idSet.Contains(e.Id)).ToListAsync();
    }

    public async Task<IEnumerable<Element>> GetAllAsync()
        => await _context.Elements.ToListAsync();

    public async Task<IEnumerable<Element>> GetAllApprovedAsync()
        => await _context.Elements.Where(e => e.IsApproved).ToListAsync();

    public async Task<IEnumerable<Element>> GetPendingAsync()
        => await _context.Elements
             .Include(e => e.ElementType)
             .Where(e => !e.IsApproved && !e.IsRejected)
             .OrderByDescending(e => e.CreatedAt)
             .ToListAsync();

    public async Task<Element?> FindNearbyPendingAsync(
        double latitude, double longitude,
        string elementType, string elementName,
        double radiusMeters)
    {
        return await _context.Elements
            .FromSqlRaw("""
                SELECT e.* FROM "Elements" e
                JOIN "ElementType" et ON et."Id" = e."ElementTypeId"
                WHERE e."IsApproved" = false
                  AND e."IsRejected" = false
                  AND lower(et."Name") = lower({0})
                  AND lower(e."ElementName") = lower({1})
                  AND ST_DWithin(
                        e."Geom"::geography,
                        ST_SetSRID(ST_MakePoint({2},{3}),4326)::geography,
                        {4})
                LIMIT 1
                """, elementType, elementName, longitude, latitude, radiusMeters)
            .Include(e => e.ElementType)
            .FirstOrDefaultAsync();
    }

    public async Task<bool> ApproveAsync(long id)
    {
        var element = await _context.Elements.FindAsync(id);
        if (element is null) return false;
        element.IsApproved = true;
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> RejectAsync(long id)
    {
        var element = await _context.Elements.FindAsync(id);
        if (element is null) return false;
        element.IsRejected = true;
        element.IsApproved = false;
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<List<Element>> GetPendingWithoutAiAsync(int limit)
        => await _context.Elements
             .Include(e => e.ElementType)
             .Where(e => !e.IsApproved && !e.IsRejected && e.AiConfidence == null)
             .OrderBy(e => e.CreatedAt)
             .Take(limit)
             .ToListAsync();
}
