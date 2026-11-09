# Repository guidance

## Project context

TeacherStudent is a chat roulette project designed to connect beginners in an activity or field with people who have more experience. Its purpose is to make it easy to ask questions and get practical advice through direct conversation.

The intended experience is:

- A beginner presses **Find teacher** to be matched through chat roulette with someone more experienced in the relevant activity or field.
- The participants chat so the beginner can ask questions and receive advice. A "teacher" can be any person with relevant experience; formal teaching qualifications are not required.
- After each chat, an AI integration produces a short summary of the conversation.

These describe the product direction. Check the code to establish which features are implementedSo  before making changes.

## Repository structure

- `backend/`: NestJS API. `src/main.ts` bootstraps the application; modules register controllers and injectable services.
- `frontend/`: React with Vite, functional components, hooks, and plain CSS.
- `compose.yaml`: backend, frontend, and PostgreSQL services.

There is no root `package.json` or npm workspace. Each application has its own manifest and lockfile. Use package scripts and source code to establish current behavior; application READMEs contain template instructions.

## Setup and commands

Use npm and Node.js 22.12 or newer, satisfying the backend and locked Vite engine requirements. Run these commands from the repository root:

| Task | Command |
| --- | --- |
| Install backend dependencies | `npm --prefix backend ci` |
| Install frontend dependencies | `npm --prefix frontend ci` |
| Run backend in watch mode | `npm --prefix backend run dev` |
| Run frontend development server | `npm --prefix frontend run dev` |
| Build backend | `npm --prefix backend run build` |
| Check backend types | `npm --prefix backend run typecheck` |
| Run backend unit and e2e tests | `npm --prefix backend test` |
| Run backend e2e tests | `npm --prefix backend run test:e2e` |
| Build and type-check frontend | `npm --prefix frontend run build` |
| Lint frontend with Oxlint | `npm --prefix frontend run lint` |
| Run compiled backend | `npm --prefix backend start` (build first) |

The backend defaults to port `3000` locally unless `PORT` is set. Its Dockerfile sets `PORT=9000`, matching Compose. Vite normally serves on port `5173`.

For Compose configuration, copy `.env.example` to `.env` only if `.env` does not exist and set local PostgreSQL credentials. Check `compose.yaml` and the relevant Dockerfile when changing container behavior. The backend Dockerfile currently starts `dist/main.js` without building it; do not assume a clean Compose build produces a working backend.

## Implementation conventions

- Keep API behavior in NestJS controllers and injectable services; register new providers and controllers in the appropriate module.
- Follow the surrounding style: backend TypeScript uses semicolons and single quotes; frontend TypeScript uses single quotes without semicolons. Backend formatting settings live in `backend/.prettierrc`.
- Keep frontend components and styles under `frontend/src/`; use the existing React/hooks and CSS approach unless the task calls for a different architecture.
- Keep dependency changes in the affected application's `package.json` and `package-lock.json`. Do not introduce a second package manager or edit generated `dist/` and `node_modules/` files.
- When adding client/server integration, explicitly configure the API URL and any proxy or CORS behavior; none is currently configured. Keep credentials out of frontend code and browser-exposed configuration.
- Document new environment variables with placeholder values in `.env.example` and implement any necessary environment loading. Do not commit local `.env` files or real credentials.

## Validation and known gaps

Choose checks for the changed application:

- Frontend code: run its build and lint scripts. For UI behavior changes, also inspect the affected screen in a browser when available.
- Backend code: run its build, typecheck, and test scripts. For endpoint changes, exercise the affected route against the running application.
- Documentation-only changes: verify referenced paths and commands and run `git diff --check`; application builds are unnecessary.

Backend tests use `node:test`, `node:assert/strict`, and `@nestjs/testing`. The test scripts compile TypeScript with decorator metadata into ignored `.test-dist/` before running unit and end-to-end tests. `tsconfig.test.json` includes both `src/` and `test/` for typechecking. End-to-end tests require permission to listen on a loopback port and close their application after each test. The frontend has no test script. The backend ESLint configuration still references undeclared packages, and there is no backend lint script.

Use the package scripts as the source of truth for available checks. If the task includes enabling frontend tests or backend linting, configure the necessary dependencies and scripts together; otherwise, report these limitations separately from failures introduced by the change. Do not weaken compiler settings or remove tests just to obtain a passing check.

In the final response, state what changed, which checks ran, and any remaining failures or unverified behavior.

## Maintaining these instructions

Keep this file focused on durable repository facts, commands, and consequential pitfalls. Update it when the relevant setup changes, especially when the starter tooling gaps are resolved. Read supporting files as needed for the task instead of requiring a full repository review for every edit.

For future directory-specific guidance, place an `AGENTS.md` in that directory rather than expanding unrelated root instructions.

References used to structure this file:

- [OpenAI: Custom instructions with AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [OpenAI: Keeping AGENTS.md current and focused](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra)

## Authentication and persistence

The backend uses TypeORM/PostgreSQL with explicit migrations and `synchronize: false`. Run `npm --prefix backend run migration:run` before starting it. Local npm commands load `backend/.env`; configure `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `JWT_SECRET`. Compose reads the root `.env`, passes configuration to the backend, and exposes PostgreSQL on host port 5433.

`POST /auth/register` and `POST /auth/login` return only an access token, valid for one hour. Passwords use Argon2id. Existing users without password hashes cannot log in. The normalized-email unique index rejects case/whitespace duplicates; migrations fail if existing duplicates need resolution. Auth setup details are in `backend/README.md`.
