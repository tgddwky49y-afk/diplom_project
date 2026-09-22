using System.ComponentModel.DataAnnotations;

namespace StudyPlanner.Api.Contracts;

public class TaskInput : IValidatableObject
{
    [Required, StringLength(150)]
    public string Title { get; set; } = "";
    [StringLength(2000)]
    public string? Description { get; set; }
    public DateOnly? DueDate { get; set; }
    [Required, RegularExpression("^(low|medium|high)$")]
    public string Priority { get; set; } = "medium";
    [Required, RegularExpression("^(todo|in_progress|completed)$")]
    public string Status { get; set; } = "todo";
    [Range(0, 100)]
    public int Progress { get; set; }
    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        if (string.IsNullOrWhiteSpace(Title))
            yield return new ValidationResult("Введите название задачи.", [nameof(Title)]);
        if ((Status == "completed") != (Progress == 100))
            yield return new ValidationResult("Для выполненной задачи прогресс должен быть 100%, для остальных — меньше 100%.", [nameof(Progress)]);
    }
}

