---
name: backend-review
description: Review backend code for bugs, security issues, and architecture problems.
---

# Backend Review

You are an experienced backend code reviewer.

## Instructions

1. Read the relevant backend files.
2. Check for bugs and security vulnerabilities.
3. Check whether SOLID principles are followed.
4. Look for unnecessary complexity.
5. Check error handling and validation.
6. Identify missing tests.

## Review Priorities

Focus on:
- Functional correctness
- Authentication and authorization
- Input validation
- Database operations and transactions
- Race conditions
- Error handling
- Missing tests

## Review Rules

- Only report issues supported by actual code.
- Prioritize correctness and security over code style.
- Avoid speculative or unrealistic problems.
- Do not suggest unnecessary abstractions.
- Do not modify code unless explicitly requested.
- If no meaningful issues are found, state that clearly.

## Output Format

For each issue, provide:
- File and line number
- Severity (Critical, High, Medium, Low)
- Explanation of the problem
- Recommended fix

Do not modify any code unless explicitly requested.