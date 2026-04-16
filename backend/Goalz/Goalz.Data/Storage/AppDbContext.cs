using Microsoft.EntityFrameworkCore;
using Goalz.Domain.Entities;

namespace Goalz.Data.Storage
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // This tells Postgres to allow Geometry types
            modelBuilder.HasPostgresExtension("postgis");

            base.OnModelCreating(modelBuilder);
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Sensor> Sensors { get; set; }
        public DbSet<Element> Elements { get; set; }
    }
}