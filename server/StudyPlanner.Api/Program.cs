using Microsoft.EntityFrameworkCore;
using StudyPlanner.Api.Data;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true);
builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddDbContext<PlannerDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Planner")));
var app = builder.Build();
app.UseExceptionHandler();
app.MapControllers();
if (args.Contains("--migrate"))
{
    using var scope = app.Services.CreateScope();
    await scope.ServiceProvider.GetRequiredService<PlannerDbContext>().Database.MigrateAsync();
    return;
}
app.Run();
