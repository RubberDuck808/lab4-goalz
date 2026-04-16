using Goalz.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Goalz.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Answer> Answers => Set<Answer>();
    public DbSet<Party> Parties => Set<Party>();
    public DbSet<PartyGroup> PartyGroups => Set<PartyGroup>();
    public DbSet<PartyMember> PartyMembers => Set<PartyMember>();
    public DbSet<User> Users => Set<User>();
    public DbSet<PartyGroupAnswer> PartyGroupAnswers => Set<PartyGroupAnswer>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Quiz>(e => e.ToTable("Quizzes"));

        modelBuilder.Entity<Question>(e =>
        {
            e.ToTable("Questions");
            e.HasOne(q => q.Quiz)
                .WithMany(qz => qz.Questions)
                .HasForeignKey(q => q.QuizId);
        });

        modelBuilder.Entity<Answer>(e =>
        {
            e.ToTable("Answers");
            e.HasOne(a => a.Question)
                .WithMany(q => q.Answers)
                .HasForeignKey(a => a.QuestionId);
        });

        modelBuilder.Entity<Party>(e =>
        {
            e.ToTable("Parties");
            e.HasOne(p => p.Quiz)
                .WithMany(qz => qz.Parties)
                .HasForeignKey(p => p.QuizId);
        });

        modelBuilder.Entity<PartyGroup>(e =>
        {
            e.ToTable("PartyGroups");
            e.HasOne(pg => pg.Party)
                .WithMany(p => p.PartyGroups)
                .HasForeignKey(pg => pg.PartyId);
        });

        modelBuilder.Entity<PartyMember>(e =>
        {
            e.ToTable("PartyMembers");
            e.HasOne(pm => pm.PartyGroup)
                .WithMany(pg => pg.PartyMembers)
                .HasForeignKey(pm => pm.PartyGroupId);
            e.HasOne(pm => pm.User)
                .WithMany(u => u.PartyMembers)
                .HasForeignKey(pm => pm.UserId);
        });

        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("Users");
            e.Property(u => u.Role).HasConversion<string>();
        });

        modelBuilder.Entity<PartyGroupAnswer>(e =>
        {
            e.ToTable("PartyGroupAnswers");
            e.HasOne(pga => pga.PartyGroup)
                .WithMany(pg => pg.PartyGroupAnswers)
                .HasForeignKey(pga => pga.PartyGroupId);
            e.HasOne(pga => pga.Answer)
                .WithMany(a => a.PartyGroupAnswers)
                .HasForeignKey(pga => pga.AnswerId);
        });
    }
}
