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
        public DbSet<SensorData> SensorData { get; set; }
        public DbSet<Element> Elements { get; set; }
        public DbSet<Zone> Zones { get; set; }
        public DbSet<Section> Sections { get; set; }
        public DbSet<Checkpoint> Checkpoints { get; set; }
        public DbSet<ElementType> ElementTypes { get; set; }
        public DbSet<Party> Parties { get; set; }
        public DbSet<PartyMember> PartyMembers { get; set; }
        public DbSet<PartyGroup> PartyGroups { get; set; }


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

            modelBuilder.Entity<Section>(entity =>
            {
                entity.HasOne(s => s.Zone)
                    .WithOne()
                    .HasForeignKey<Section>(s => s.ZoneId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(s => s.ZoneId).IsUnique();
                entity.HasIndex(s => s.OrderIndex).IsUnique();
            });

            modelBuilder.Entity<Checkpoint>(entity =>
            {
                entity.HasOne(c => c.Zone)
                    .WithMany()
                    .HasForeignKey(c => c.ZoneId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(c => new { c.Type, c.ReferenceId }).IsUnique();
                entity.HasIndex(c => c.ZoneId);
            });

            modelBuilder.Entity<SensorData>(entity =>
            {
                entity.Property(sd => sd.Id).HasColumnName("id");
                entity.HasOne(sd => sd.Sensor)
                    .WithMany()
                    .HasForeignKey(sd => sd.SensorsId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ElementType>().ToTable("ElementType");

            modelBuilder.Entity<Element>(entity =>
            {
                entity.HasOne(e => e.ElementType)
                    .WithMany(et => et.Elements)
                    .HasForeignKey(e => e.ElementTypeId);
            });

            base.OnModelCreating(modelBuilder);
        }
    }
}
