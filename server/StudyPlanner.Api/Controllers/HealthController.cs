using Microsoft.AspNetCore.Mvc;
using StudyPlanner.Api.Data;

namespace StudyPlanner.Api.Controllers;

[ApiController]
[Route("api/health")]
public class HealthController(PlannerDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken token)
    {
        var connected = await db.Database.CanConnectAsync(token);
        return StatusCode(connected ? 200 : 503, new
        {
            status = connected ? "ok" : "unavailable",
            message = connected ? "Сервер и SQL Server доступны" : "SQL Server недоступен. Проверьте настройки и миграции."
        });
    }
}

