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
        var username = User.Identity!.Name!;
        var user = await db.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (user == null) return Unauthorized();

        var question = await db.Questions.FirstOrDefaultAsync(q => q.Id == req.QuestionId);
        if (question == null) return NotFound("Question not found");

        var answer = await db.Answers
            .FirstOrDefaultAsync(a => a.Id == req.AnswerId && a.QuestionId == req.QuestionId);

        if (answer == null) return NotFound("Answer not found");

        return Ok(new { correct = answer.IsCorrect, points = answer.IsCorrect ? 100 : 0 });
    }

    [HttpGet("question")]
    public async Task<IActionResult> GetRandomQuestion()
    {
        var username = User.Identity!.Name!;
        var user = await db.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (user == null) return Unauthorized();

        // Questions aren't currently scoped per-party/quiz in any way the app sets up
        // (no party is ever assigned a QuizId, and solo play has no party at all) —
        // serve at random from the whole question pool instead of gating on that.
        var count = await db.Questions.CountAsync();
        if (count == 0) return NotFound("No questions found.");

        var skip = Random.Shared.Next(0, count);
        var question = await db.Questions
            .Include(q => q.Answers)
            .Skip(skip)
            .FirstOrDefaultAsync();

        if (question == null) return NotFound("Question not found");

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
