using Microsoft.EntityFrameworkCore;
using Goalz.Domain.Entities;

<<<<<<<< HEAD:backend/Goalz/Goalz.Data/Storage/AppDbContext.cs
namespace Goalz.Data.Storage
========
namespace Goalz.Infrastructure.Data
>>>>>>>> dev:backend/Goalz/Goalz.Infrastructure/Data/AppDbContext.cs
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
    }
}