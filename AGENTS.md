# Repository Guidance — TeacherStudent

## Project and Current Scope

TeacherStudent connects people for practical knowledge sharing through video calls.
Teachers need relevant experience, not formal qualifications.

Source code is authoritative. Current code includes:
- Registration/login with JWT and Argon2id password hashing.
- Skill onboarding with teacher/student roles and PostgreSQL persistence.
- WebRTC media handling and WebSocket signaling with in-memory queue matching.
- Dockerfiles and Docker Compose configuration.

Matching currently ignores skill/role selections. Signaling has no JWT
authentication, and WebRTC has STUN configuration without TURN.
AI conversation summaries are planned, not implemented.
Do not infer runtime reliability from the presence of implementation code.

## Repository and Architecture

Each application has its own package.json and package-lock.json.
There is no root npm workspace.

Backend: NestJS, TypeScript, PostgreSQL, TypeORM, JWT, Argon2id, and ws.
- backend/src/: auth, users, skills, user-skills, and user-matching modules.
- Controllers handle HTTP transport; services own business logic.
- Use DTO validation, dependency injection, and TypeORM repositories.
- Preserve the global ValidationPipe and established authorization patterns.
- Runtime database configuration: backend/src/app.module.ts.
- Migration configuration: backend/src/data-source.ts.
- Schema changes require explicit migrations; keep synchronize: false.
- Keep entity registration and migrations consistent with both configurations.

Frontend: React, TypeScript, Vite, React Router, and CSS Modules.
- frontend/src/pages/: route-level composition.
- frontend/src/features/: feature components, hooks, API helpers, and contracts.
- frontend/src/shared/api/: API and WebSocket URL configuration.
- frontend/src/shared/context/: authentication/onboarding state.
- Reuse existing components and hooks; separate requests from presentation.
- Handle loading, error, and empty states.
- Prefer CSS Modules; reserve global CSS for application-wide styles.

Verify dependency versions against manifests and lockfiles before changing them.

## Workflow

Read-only investigation and review may proceed without implementation approval.

Before non-trivial implementation, inspect relevant code and present a concise
plan naming affected files, architectural decisions, risks, and validation.
Non-trivial work includes cross-module behavior, schema, authentication, and
signaling changes. Wait for explicit approval unless already given in the
conversation. Small changes may proceed when directly authorized.

After approval:
- Stay within scope and preserve existing conventions.
- Reuse existing code; justify new dependencies.
- Seek approval for significant departures from the approved plan.
- For complex tasks, consider delegating independent
  frontend, backend, or review work to subagents.
- Avoid multiple agents editing the same files concurrently.
- Perform an independent code review after substantial changes.
- The main agent remains responsible for integration,
  validation, and the final report.
- Review changes for correctness, security, typing, and compatibility.

## Security and Real-Time Communication

- Never commit credentials or expose backend secrets to the browser.
- Never log passwords, password hashes, tokens, or sensitive user records.
- HTTP authentication uses Bearer JWTs, HS256, and UUID user subjects.
- Registration and login return accessToken; tokens expire after one hour.
- POST /auth/auth-me supplies authenticated user/onboarding information.
- Protect user-owned resources and validate untrusted input.
- Preserve signaling event/payload compatibility across both applications.
- Check disconnect cleanup, queue/pair state, media tracks, sockets, peer
  connections, and failure handling when changing call behavior.
- Verify media changes with two browser clients when possible; report
  browser, permission, HTTPS, and network limitations.

## Setup and Commands

Use npm. Node 22.13+ within the 22.x line satisfies the current lockfile
engine requirements; verify compatibility before selecting another major.

Run these commands from the repository root:

| Task | Command |
|---|---|
| Install backend | npm --prefix backend ci |
| Install frontend | npm --prefix frontend ci |
| Backend development | npm --prefix backend run dev |
| Frontend development | npm --prefix frontend run dev |
| Backend build | npm --prefix backend run build |
| Backend typecheck | npm --prefix backend run typecheck |
| Backend unit tests (Jest) | npm --prefix backend test |
| Backend e2e | npm --prefix backend run test:e2e |
| Frontend build | npm --prefix frontend run build |
| Frontend lint | npm --prefix frontend run lint |
| Run migrations | npm --prefix backend run migration:run |

Package scripts are authoritative. Frontend lint uses Oxlint.
There is no frontend test script or backend lint script.

Backend unit tests require Node 24.9+ so Jest can load NestJS ES modules
from compiled CommonJS tests. Run a single suite with
`npm --prefix backend test -- chat.service.spec`.
The separate e2e test uses Node's runner, expects an unregistered Hello World
route, and requires backend environment configuration and PostgreSQL.

## Environment and Docker

- Root .env supplies Compose interpolation; local backend commands read
  process variables or backend/.env.
- Document backend/Compose variables in root .env.example and frontend
  server variables in frontend/.env.example. Never commit real .env files.
- Backend requires DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME,
  and JWT_SECRET.
- Backend HTTP defaults to 3000; Docker sets PORT=9000.
  The current frontend uses http://localhost:9000, so set PORT=9000
  for local backend development.
- Signaling listens on 4321; frontend development uses 5173.
- Compose exposes PostgreSQL at localhost:5433; backend containers use db:5432.
- API_PROXY_TARGET only controls Vite's /api proxy. Current API helpers
  use the absolute URL in frontend/src/shared/api/http.ts.
- Inspect compose.yaml and Dockerfiles before changing container behavior.
  Current containers run development servers.
- Ensure PostgreSQL is ready and apply migrations before backend startup.
  Compose does not automate migrations or database readiness ordering.

## Quality and Validation

- Preserve unrelated working-tree changes.
- Prefer single quotes, backend semicolons, and frontend no semicolons;
  follow nearby code without unrelated formatting changes.
- Do not edit generated dist/, .test-dist/, or node_modules/ files.
- Keep manifests and lockfiles synchronized.
- Do not weaken compiler settings or remove tests to pass checks.
- Avoid destructive schema changes without explicit authorization.

For frontend changes, run build and lint; inspect affected browser behavior.
For backend changes, run build, typecheck, and relevant tests; verify affected
endpoints when practical, accounting for the test limitations above.
For documentation changes, verify paths/commands and run git diff --check.

Report changed files, checks actually executed, results, and remaining
limitations. Separate existing failures from regressions.
Keep this file concise and update it when stable project conventions change.
