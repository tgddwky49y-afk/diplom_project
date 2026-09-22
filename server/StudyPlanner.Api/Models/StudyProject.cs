namespace StudyPlanner.Api.Models;

public class StudyProject
{
    public int Id { get; set; }
    public int? OwnerId { get; set; }
    public PlannerUser? Owner { get; set; }
    public string Title { get; set; } = "";
    public string? Description { get; set; }
}

