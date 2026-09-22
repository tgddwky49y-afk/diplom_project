using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyPlanner.Api.Contracts;
using StudyPlanner.Api.Data;
using StudyPlanner.Api.Models;

namespace StudyPlanner.Api.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private readonly PlannerDbContext db;

    public TasksController(PlannerDbContext context)
    {
        db = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<StudyTask>>> GetAll()
    {
        var tasks = await db.Tasks
            .AsNoTracking()
            .OrderBy(x => x.Status == "completed")
            .ThenBy(x => x.DueDate == null)
            .ThenBy(x => x.DueDate)
            .ThenByDescending(x => x.Id)
            .ToListAsync();
        return Ok(tasks);
    }

    [HttpGet("{id:int:min(1)}")]
    public async Task<ActionResult<StudyTask>> Get(int id)
    {
        var task = await db.Tasks.FindAsync(id);
        if (task == null)
        {
            return NotFound();
        }
        return Ok(task);
    }

    [HttpPost]
    public async Task<ActionResult<StudyTask>> Create(TaskInput input)
    {
        var task = new StudyTask();
        Apply(task, input);
        db.Tasks.Add(task);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = task.Id }, task);
    }

    [HttpPut("{id:int:min(1)}")]
    public async Task<ActionResult<StudyTask>> Update(int id, TaskInput input)
    {
        var task = await db.Tasks.FindAsync(id);
        if (task == null)
        {
            return NotFound();
        }
        Apply(task, input);
        await db.SaveChangesAsync();
        return Ok(task);
    }

    [HttpDelete("{id:int:min(1)}")]
    public async Task<IActionResult> Delete(int id)
    {
        var task = await db.Tasks.FindAsync(id);
        if (task == null)
        {
            return NotFound();
        }
        db.Tasks.Remove(task);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static void Apply(StudyTask task, TaskInput input)
    {
        task.Title = input.Title.Trim();
        task.Description = input.Description?.Trim();
        task.DueDate = input.DueDate;
        task.Priority = input.Priority;
        task.Status = input.Status;
        task.Progress = input.Progress;
        task.UpdatedAt = DateTime.UtcNow;
    }
}
