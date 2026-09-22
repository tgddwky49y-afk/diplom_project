using Microsoft.EntityFrameworkCore;
using StudyPlanner.Api.Models;

namespace StudyPlanner.Api.Data;

public class PlannerDbContext(DbContextOptions<PlannerDbContext> options) : DbContext(options)
{
    public DbSet<StudyTask> Tasks => Set<StudyTask>();
    public DbSet<StudyProject> Projects => Set<StudyProject>();
    public DbSet<PlannerUser> Users => Set<PlannerUser>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        model.Entity<PlannerUser>().Property(x => x.Name).HasMaxLength(100);
        model.Entity<PlannerUser>().Property(x => x.Email).HasMaxLength(150);
        model.Entity<PlannerUser>().HasIndex(x => x.Email).IsUnique();
        model.Entity<StudyProject>().Property(x => x.Title).HasMaxLength(150);
        model.Entity<StudyProject>().HasOne(x => x.Owner).WithMany()
            .HasForeignKey(x => x.OwnerId).OnDelete(DeleteBehavior.Restrict);
        var task = model.Entity<StudyTask>();
        task.Property(x => x.Title).HasMaxLength(150);
        task.Property(x => x.Description).HasMaxLength(2000);
        task.Property(x => x.Priority).HasMaxLength(10);
        task.Property(x => x.Status).HasMaxLength(20);
        task.HasOne(x => x.Project).WithMany().HasForeignKey(x => x.ProjectId)
            .OnDelete(DeleteBehavior.Restrict);
        task.ToTable("Tasks", t =>
        {
            t.HasCheckConstraint("CK_Tasks_Priority", "[Priority] IN ('low','medium','high')");
            t.HasCheckConstraint("CK_Tasks_Status", "[Status] IN ('todo','in_progress','completed')");
            t.HasCheckConstraint("CK_Tasks_Progress", "[Progress] BETWEEN 0 AND 100");
        });
    }
}

