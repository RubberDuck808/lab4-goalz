using Microsoft.EntityFrameworkCore;
using Goalz.Core.Entities;

namespace Goalz.Api.Storage
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
    }
}