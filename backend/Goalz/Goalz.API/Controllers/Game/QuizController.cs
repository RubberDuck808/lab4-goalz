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

        var activeParty = await db.PartyMembers
            .Where(pm => pm.UserId == user.Id)
            .Select(pm => pm.PartyGroup.Party)
            .FirstOrDefaultAsync(p => p.Status == "InGame");

        if (activeParty == null || activeParty.QuizId != question.QuizId)
        {
            return Forbid("You are not currently in an active game assigned to this question.");
        }

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

        var activeParty = await db.PartyMembers
            .Where(pm => pm.UserId == user.Id)
            .Select(pm => pm.PartyGroup.Party)
            .FirstOrDefaultAsync(p => p.Status == "InGame");

        if (activeParty == null || activeParty.QuizId == null)
        {
            return Forbid("You are not in an active game with an assigned quiz.");
        }

        var quizId = activeParty.QuizId.Value;
        var count = await db.Questions.CountAsync(q => q.QuizId == quizId);
        if (count == 0) return NotFound("No questions found for this quiz.");

        var skip = Random.Shared.Next(0, count);
        var question = await db.Questions
            .Include(q => q.Answers)
            .Where(q => q.QuizId == quizId)
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
