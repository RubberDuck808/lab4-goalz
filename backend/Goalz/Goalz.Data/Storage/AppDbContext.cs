using Microsoft.EntityFrameworkCore;
using Goalz.Domain.Entities;

namespace Goalz.Data.Storage
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
    }
}