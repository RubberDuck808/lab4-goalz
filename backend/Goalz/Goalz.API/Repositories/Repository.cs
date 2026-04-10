using Goalz.API.Data;
using Goalz.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Goalz.API.Repositories;

public class Repository<T>(GoalzDbContext context) : IRepository<T> where T : class
{
    private readonly DbSet<T> _set = context.Set<T>();

    public async Task<T?> GetByIdAsync(long id) => await _set.FindAsync(id);

    public async Task<IEnumerable<T>> GetAllAsync() => await _set.ToListAsync();

    public async Task AddAsync(T entity) => await _set.AddAsync(entity);

    public void Update(T entity) => _set.Update(entity);

    public void Delete(T entity) => _set.Remove(entity);

    public async Task SaveChangesAsync() => await context.SaveChangesAsync();
}
