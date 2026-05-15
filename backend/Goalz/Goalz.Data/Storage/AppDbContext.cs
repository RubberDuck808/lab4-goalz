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
        public DbSet<Boundary> Boundaries { get; set; }
        public DbSet<Checkpoint> Checkpoints { get; set; }
        public DbSet<ElementType> ElementTypes { get; set; }
        public DbSet<Party> Parties { get; set; }
        public DbSet<PartyMember> PartyMembers { get; set; }
        public DbSet<PartyGroup> PartyGroups { get; set; }
        public DbSet<PartyGroupAnswer> PartyGroupAnswers { get; set; }
        public DbSet<PartyVisitedCheckpoint> PartyVisitedCheckpoints { get; set; }
        public DbSet<Quiz> Quizzes { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Answer> Answers { get; set; }
        public DbSet<UserStatistics> UserStatistics { get; set; }

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

            modelBuilder.Entity<Boundary>(entity =>
            {
                entity.HasIndex(b => b.Geometry).HasMethod("gist");
            });

            modelBuilder.Entity<Zone>(entity =>
            {
                entity.HasOne<Boundary>()
                    .WithMany()
                    .HasForeignKey(z => z.BoundaryId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(z => z.BoundaryId);
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

            modelBuilder.Entity<Sensor>()
                .Property(s => s.Geo).HasColumnName("Geom");

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

            modelBuilder.Entity<PartyVisitedCheckpoint>(entity =>
            {
                entity.ToTable("PartyVisitedCheckpoints");
                entity.HasOne(pvc => pvc.Party)
                    .WithMany()
                    .HasForeignKey(pvc => pvc.PartyId);
                entity.HasOne(pvc => pvc.Checkpoint)
                    .WithMany()
                    .HasForeignKey(pvc => pvc.CheckpointId);
            });

            modelBuilder.Entity<Question>(entity =>
            {
                entity.HasOne(q => q.Quiz)
                    .WithMany(qz => qz.Questions)
                    .HasForeignKey(q => q.QuizId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Answer>(entity =>
            {
                entity.HasOne(a => a.Question)
                    .WithMany(q => q.Answers)
                    .HasForeignKey(a => a.QuestionId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Party>(entity =>
            {
                entity.HasOne(p => p.Quiz)
                    .WithMany(qz => qz.Parties)
                    .HasForeignKey(p => p.QuizId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<UserStatistics>(entity =>
            {
                entity.HasOne(s => s.User)
                    .WithOne(u => u.Statistics)
                    .HasForeignKey<UserStatistics>(s => s.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasIndex(s => s.UserId).IsUnique();
            });

            base.OnModelCreating(modelBuilder);
        }
    }
}
