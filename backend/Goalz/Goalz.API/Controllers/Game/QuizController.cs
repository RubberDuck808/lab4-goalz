using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Goalz.Data.Storage;

namespace Goalz.Api.Controllers.Game;

[Authorize]
[ApiController]
[Route("api/game/quiz")]
public class QuizController(AppDbContext db) : ControllerBase
{
    public record SubmitAnswerRequest(long QuestionId, long AnswerId);

    [HttpPost("answer")]
    public async Task<IActionResult> SubmitAnswer([FromBody] SubmitAnswerRequest req)
    {
        var answer = await db.Questions
            .Where(q => q.Id == req.QuestionId)
            .SelectMany(q => q.Answers)
            .FirstOrDefaultAsync(a => a.Id == req.AnswerId);

        if (answer == null) return NotFound();

        return Ok(new { correct = answer.IsCorrect, points = answer.IsCorrect ? 100 : 0 });
    }

    [HttpGet("question")]
    public async Task<IActionResult> GetRandomQuestion()
    {
        var count = await db.Questions.CountAsync();
        if (count == 0) return NotFound();

        var skip = Random.Shared.Next(0, count);
        var question = await db.Questions
            .Include(q => q.Answers)
            .Skip(skip)
            .FirstOrDefaultAsync();

        if (question == null) return NotFound();

        var shuffledAnswers = question.Answers
            .Select(a => new { id = a.Id, text = a.AnswerTxt })
            .OrderBy(_ => Random.Shared.Next())
            .ToList();

        return Ok(new
        {
            id = question.Id,
            text = question.QuestionTxt,
            answers = shuffledAnswers,
        });
    }
}
