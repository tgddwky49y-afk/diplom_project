using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using StudyPlanner.Api.Contracts;
using StudyPlanner.Api.Data;

static bool Valid(TaskInput input) =>
    Validator.TryValidateObject(input, new ValidationContext(input), new List<ValidationResult>(), true);
static void Check(bool condition, string name)
{
    if (!condition) throw new Exception("FAIL: " + name);
    Console.WriteLine("PASS: " + name);
}
Check(Valid(new() { Title = "Задача" }), "Valid task");
Check(!Valid(new() { Title = " " }), "Whitespace title");
Check(!Valid(new() { Title = new string('a', 151) }), "Title limit");
Check(!Valid(new() { Title = "Task", Description = new string('x', 2001) }), "Description limit");
Check(!Valid(new() { Title = "Task", Priority = "urgent" }), "Priority");
Check(!Valid(new() { Title = "Task", Status = "bad" }), "Status");
Check(!Valid(new() { Title = "Task", Progress = -1 }), "Progress lower bound");
Check(!Valid(new() { Title = "Task", Progress = 101 }), "Progress upper bound");
Check(!Valid(new() { Title = "Task", Status = "completed", Progress = 0 }), "Status consistency");
Check(Valid(new() { Title = "Task", Status = "completed", Progress = 100 }), "Completed task");
var options = new DbContextOptionsBuilder<PlannerDbContext>()
    .UseSqlServer("Server=localhost;Database=ModelChecks;Integrated Security=true").Options;
using var db = new PlannerDbContext(options);
var sql = db.Database.GenerateCreateScript();
Check(sql.Contains("CREATE TABLE [Tasks]"), "SQL Server schema generation");
Check(sql.Contains("CK_Tasks_Progress"), "Database constraints");
Check(db.Database.GetMigrations().Any(), "Migration discovery");
Console.WriteLine("These checks do not connect to SQL Server.");

