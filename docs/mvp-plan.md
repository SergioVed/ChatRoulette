# TeacherStudent MVP plan

Planning snapshot: 2026-11-07.

This document records the agreed product scope and the proposed design and roadmap. Confirmed requirements are distinguished from proposals. Saving this plan does not authorize implementation; the remaining design decisions should be reviewed before business logic is implemented.

## Goal and confirmed scope

Build a local demonstration where a beginner can instantly find an available teacher for a skill and have a one-to-one audio/video conversation, similar to chat roulette.

Confirmed requirements:

- Simple registration with name, email, password, and skill selection, plus sign-in.
- One account can both teach and learn, for different skills.
- The project owner creates the skill catalog; users select existing skills rather than creating skills themselves.
- Selecting a teaching skill makes a user immediately eligible to teach it. No individual teacher approval or qualification verification is required.
- Instant matching through **Find teacher**; participants connect while both are online.
- One-to-one audio/video calls.
- All sessions are free. Payments, paid calls, and payouts are outside the product direction.
- Text messaging and AI summaries are excluded from the MVP.
- The delivery target is a local demo.

The broader project context in `AGENTS.md` mentions AI summaries. The explicit MVP agreement above excludes them; any future AI feature needs separate planning.

## Roles and proposed onboarding

Student and teacher are roles in a particular interaction, not separate account types. A person can learn one skill and teach another.

Proposed onboarding: collect account details, then provide separate selections for **I can teach** and **I want to learn** from the predefined catalog. Whether both selections are mandatory at registration remains open.

The project owner maintains the catalog. For the local demo, seed data is proposed instead of a skill-management interface.

Eligibility and availability are separate: selecting a teaching skill makes someone eligible; pressing **Start teaching** makes them available for matching. The availability control is proposed behavior.

## Proposed student journey

1. Register or sign in.
2. Select a skill from their learning interests.
3. Preview their camera and microphone and grant browser permissions.
4. Press **Find teacher** to join the waiting queue.
5. See a waiting state with a cancel action if nobody is available.
6. Automatically enter a video call when matched with an available teacher for that skill.
7. End the call, or press **Next teacher** to leave and search again.

## Proposed teacher journey

1. Register or sign in and select teaching skills from the catalog.
2. Choose one teaching skill for the current availability period.
3. Preview the camera and microphone.
4. Press **Start teaching** and wait for a compatible student.
5. Automatically enter the matched video call.
6. End the call or respond to the other participant leaving.
7. Explicitly choose whether to become available again.

These journeys propose automatic connection after opting into a queue, without a separate acceptance screen. Explicit re-entry after a call avoids unexpected automatic video connections. **Next teacher** is a proposed control and needs approval.

## Proposed business rules

- Match a student and teacher for exactly the same active skill.
- Serve waiting students in arrival order and randomly choose among eligible available teachers.
- Never match a person with themselves.
- Allow at most one waiting entry or active session per account, including across browser tabs.
- Reserve both participants together so concurrent matching cannot assign either person twice.
- Allow only the matched participants to exchange connection information for their session.
- Queue cancellation removes availability immediately. Handle races between cancellation and assignment consistently.
- Ending or skipping a call ends the session for both participants.
- Disconnection removes waiting entries and closes or fails the associated session according to its state.
- A connection timeout fails the session and offers another search; the timeout duration is undecided.
- Repeated end, cancel, and disconnect events must be safe to process more than once.
- Store session metadata. Recording audio/video is outside the proposed MVP scope.

Proposed session states:

```text
connecting -> active -> ended
connecting -> failed
connecting -> ended (participant cancels or leaves)
```

The exact definition of a connected call, disconnect grace period, and reconnect behavior still need agreement.

## Candidate domain model

This is a design proposal, not a finalized database schema.

| Entity | Main attributes | Relationships and constraints |
| --- | --- | --- |
| User | ID, name, normalized email, password hash, created/updated timestamps | Unique normalized email; never store plaintext passwords |
| Skill | ID, name, normalized name, active status | Unique normalized name; maintained by the project owner |
| UserSkill | User ID, skill ID, purpose (`teach` or `learn`) | References user and skill; unique user–skill pair, with one purpose at a time |
| LearningSession | ID, student ID, teacher ID, skill ID, status, created/started/ended timestamps, end reason | References two different users and a skill; lifecycle changes must be valid |
| QueueEntry | User ID, skill ID, role, joined time | Temporary availability state; at most one entry per user |

The UserSkill constraint reflects teaching and learning different skills. Changing a skill's purpose is proposed to be allowed only outside a queue or call. Deactivate catalog skills instead of deleting historical references; behavior for existing queues and calls needs a decision.

Messages, transcripts, payments, and AI summary entities are unnecessary for this MVP.

## Proposed architecture

- Keep React and Vite for the browser application.
- Use a modular NestJS monolith with accounts, skills, matching, and call/session responsibilities.
- Use PostgreSQL for accounts, skill associations, and session metadata.
- Use WebSockets for queue updates, pairing, and WebRTC signaling.
- Use WebRTC for browser audio/video, with STUN/TURN configuration as needed for connectivity.
- Start with an in-memory waiting queue in one backend instance. Restarting the process clears pending matches and availability; users must rejoin.
- Select the database library, authentication approach, and signaling library during technical planning rather than treating them as settled here.

Redis, microservices, and multi-instance coordination are unnecessary for the proposed local demo. Prove a video connection between two browsers early to expose device and connectivity issues before polishing the UI.

## Implementation roadmap

All milestones below are planned work, not completed work.

| Milestone | Deliverable | Acceptance criteria |
| --- | --- | --- |
| 0. Approve behavior | Resolve the open decisions and confirm session transitions | Student/teacher journeys and failure outcomes are agreed before business implementation |
| 1. Accounts and skills | Persistence setup, migrations, seeded catalog, registration, sign-in, skill selection | Two accounts can sign in and select different teaching/learning skills; duplicate emails and unknown skill IDs are rejected |
| 2. Matching | Availability controls, queues, pairing, cancellation | Compatible users match once; incompatible users wait; self-matches, duplicate entries, and double assignment are prevented |
| 3. Video | Signaling and local/remote audio/video with mute and camera controls | Two signed-in participants can see and hear each other; unrelated users cannot join their session |
| 4. Call lifecycle | End, optional next-teacher action, disconnect and failure handling | Leaving closes the old session; permissions errors and connection timeouts are visible; users can deliberately search again |
| 5. Local demonstration | Reproducible setup and full-flow verification | Complete the flow with two accounts; check empty queues, rapid repeated clicks, multiple tabs, refresh, and abrupt disconnect |

Validate each milestone with focused checks. Matching and lifecycle tests should exercise state transitions and race conditions; browser/device verification is also required for actual media behavior.

## Open decisions before implementation

1. Must registration include both a teaching and learning skill, or can a user begin with only one purpose?
2. Approve automatic connection after queue entry, or require both participants to confirm a proposed match?
3. Approve student arrival-order handling and random teacher selection?
4. Approve **Next teacher** and explicit teacher re-entry after each call? Should the immediately previous partner be excluded from the next match when possible?
5. Should refresh/disconnect end a call immediately, or allow a short reconnect window? What connection timeout should apply?
6. Should session history be visible in the MVP, or should session metadata initially be internal only?
7. Approve catalog management through seed data and choose the initial skills. Decide how skill deactivation affects waiting users and active calls.

## Deferred features and boundaries

- Text messaging and AI summaries: excluded from this MVP; future inclusion requires a separate decision.
- Scheduled sessions, booking requests, and teacher browsing.
- Ratings, reviews, qualification verification, and individual teacher approval.
- Notifications, calendar integrations, recordings, and transcription.
- A catalog-management interface and advanced matching or recommendation algorithms.
- Public deployment, production hardening, and broader moderation tooling.
- Multi-instance scaling and service extraction.

Payments are outside the product direction, not a planned later milestone.

A one-day local demo is a plausible target, not a delivery guarantee. Media setup, permissions, and device testing are the main uncertainties. The acceptance criteria above determine completion.
