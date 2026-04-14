# Goalz.Domain

## What is this?

This is the **heart of the application**. It defines *what the app is about* — the real-world concepts like Users, Parties, Quizzes, and Answers — without caring at all about databases, web requests, or any other technical details.

Think of it like a blueprint. If someone asked "what does this app deal with?", the answer lives here.

---

## Why does this exist separately?

In a well-structured application, the core concepts shouldn't depend on anything else. If you swap out the database from Supabase to something else, or change from a web API to a desktop app, the Domain shouldn't need to change at all.

This layer has **no dependencies on any other project** in the solution.

---

## What's inside?

### `Entities/`
These are the real-world objects the app works with. Each file represents one concept:

| File | What it represents |
|---|---|
| `User.cs` | A person using the app — either a player or a staff/admin member |
| `Role.cs` | Whether a user is a `Player`, `Staff`, or `Admin` |
| `Quiz.cs` | A quiz that gets assigned to a party during the game |
| `Question.cs` | A single question inside a quiz |
| `Answer.cs` | One of the possible answers to a question (can be correct or incorrect) |
| `Party.cs` | A group of players in a game session |
| `PartyGroup.cs` | A sub-team within a party |
| `PartyMember.cs` | Links a user to a party group (who is in which group) |
| `PartyGroupAnswer.cs` | Records which answer a party group submitted and how many points they got |

### `Interfaces/`
These are **contracts** — they describe what operations are available without saying *how* they work. For example, `IRepository<T>` says "you can get, add, update, and delete things" but doesn't say anything about databases.

The actual implementation of these contracts lives in `Goalz.Infrastructure`.

---

## Analogy

If this were a restaurant:
- **Domain** = the menu and the concept of food, orders, and customers
- It doesn't care if the kitchen uses a gas stove or electric — that's an infrastructure concern
