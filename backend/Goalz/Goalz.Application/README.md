# Goalz.Application

## What is this?

This is the **business logic layer** — it contains the rules and processes that make the app actually *do* things. While the Domain defines *what* things are, the Application layer defines *what can happen*.

For example: "A user wants to log in" → the Application layer handles checking their email, verifying their password, and deciding whether to let them in.

---

## Why does this exist separately?

Keeping business logic separate from the web layer (controllers) means:
- The same logic can be reused across different entry points (web API, background jobs, etc.)
- It's easier to test — you don't need a web server running to test if login works
- Controllers stay thin and simple — they just receive a request and hand it to the Application

---

## What's inside?

### `Services/`
Services contain the actual business logic — the *how* of the application.

| File | What it does |
|---|---|
| `AuthService.cs` | Handles authentication — checks if a user's email and password are correct using secure password hashing (BCrypt) |

### `DTOs/`
DTO stands for **Data Transfer Object**. These are simple containers used to pass data between layers — for example, what information comes in from a login request.

| File | What it represents |
|---|---|
| `LoginRequest.cs` | The email, name, and password sent when a user tries to log in |

DTOs are intentionally simple — no logic, just data shapes.

---

## Dependencies

- **Goalz.Domain** — needs to know about entities (like `User`) to work with them
- **Goalz.Infrastructure** — needs access to the database to look users up

---

## Analogy

If this were a restaurant:
- **Application** = the waiter — takes your order, passes it to the kitchen, brings back the result
- The waiter knows *what* to do with your order but doesn't cook the food themselves
