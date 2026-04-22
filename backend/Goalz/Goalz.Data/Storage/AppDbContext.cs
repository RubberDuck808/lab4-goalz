using Microsoft.EntityFrameworkCore;
using Goalz.Domain.Entities;

namespace Goalz.Data.Storage
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Friendship> Friendships { get; set; }
        public DbSet<Sensor> Sensors { get; set; }
        public DbSet<Element> Elements { get; set; }
        public DbSet<Zone> Zones { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasPostgresExtension("postgis");

            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>();

            modelBuilder.Entity<Friendship>(entity =>
            {
                entity.Property(f => f.Status)
                    .HasConversion<string>();

                entity.HasOne(f => f.Requester)
                    .WithMany(u => u.SentFriendships)
                    .HasForeignKey(f => f.RequesterId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(f => f.Addressee)
                    .WithMany(u => u.ReceivedFriendships)
                    .HasForeignKey(f => f.AddresseeId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(f => new { f.RequesterId, f.AddresseeId })
                    .IsUnique();
            });

            base.OnModelCreating(modelBuilder);
        }
    }
}
