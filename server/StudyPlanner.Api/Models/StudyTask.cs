namespace StudyPlanner.Api.Models;

public class StudyTask
{
    public int Id { get; set; }
    public int? ProjectId { get; set; }
    public StudyProject? Project { get; set; }
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public DateOnly? DueDate { get; set; }
    public string Priority { get; set; } = "medium";
    public string Status { get; set; } = "todo";
    public int Progress { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

