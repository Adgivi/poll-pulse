# Poll Pulse Roadmap

## Purpose
Define an incremental path to evolve Poll Pulse from MVP to a safer and more reliable public app.

## Current Security Snapshot
- Poll creation is currently open (no auth).
- Vote identity is cookie-based (`pp_voter_id`) and can be bypassed across browsers/devices.
- DB uniqueness protects one vote per cookie/poll, but not abuse at source level.
- No explicit per-IP or per-user rate limiting on write endpoints.

## Guiding Principles
- Prioritize abuse prevention before adding new product features.
- Keep changes incremental and verifiable.
- Prefer controls at API edge and DB levels (defense in depth).
- Measure every security control (logs, counters, alerts).

## Phase 1: Immediate Hardening (P0)
Target: stop basic abuse (poll flooding, automated write spam) with minimal product impact.

### 1. Write Rate Limiting
- Scope:
  - `POST /api/polls`
  - `POST /api/polls/[slug]/vote`
- Strategy:
  - IP-based limits with sliding window (for example: Upstash Redis rate limit or Vercel KV equivalent).
  - Separate limits for create vs vote.
- Defaults:
  - Create poll: 5 req / 10 min / IP.
  - Vote: 30 req / 10 min / IP.
- Expected response on block:
  - HTTP `429` + structured error `{ code: "RATE_LIMITED" }`.

### 2. Daily Quota Per Identity
- Scope:
  - Poll creation endpoint.
- Strategy:
  - Use `pp_voter_id` (or fallback fingerprint key) to cap creates/day.
- Default:
  - Max 20 new polls per day per identity.
- DB/Cache:
  - Counter in Redis keyed by day or materialized DB counter table.

### 3. Bot Challenge on Poll Creation
- Scope:
  - Home create form only.
- Strategy:
  - Cloudflare Turnstile (or hCaptcha) server verification in create action/route.
- Rollout:
  - Optional flag in env (`BOT_CHALLENGE_ENABLED=true`) for staged enablement.

### 4. Audit Logging for Write Operations
- Scope:
  - Poll create, vote submit, rate-limit denials.
- Minimum fields:
  - timestamp, endpoint, outcome, reason code, hashed IP, voter key.
- Output:
  - Structured JSON logs for Vercel Log Drains / observability.

### Phase 1 Exit Criteria
- Abuse scripts cannot create polls indefinitely from one IP.
- Abuse scripts cannot burst votes indefinitely from one IP.
- Logs show blocked attempts with reason codes.

## Phase 2: Identity & Integrity Hardening (P1)
Target: make evasion harder and reduce data-quality attacks.

### 1. Stronger Client Identity
- Add signed token (HMAC/JWT) derived server-side and rotated.
- Keep cookie as transport, but validate signature/expiry server-side.

### 2. Poll Content Controls
- Add deny-list/heuristics for spammy titles/options.
- Add minimum entropy checks (avoid repetitive junk payloads).
- Optional manual moderation flag (`isHidden`, `isFlagged`) in schema.

### 3. Duplicate Poll Suppression
- Heuristic to block repeated identical question/options bursts from same source.
- Cooldown window (for example 10 minutes) per normalized poll signature.

### Phase 2 Exit Criteria
- Cookie tampering gets rejected.
- Obvious spam payloads are blocked before persistence.
- Repeated duplicate poll bursts are throttled/suppressed.

## Phase 3: Operational Security & Resilience (P2)
Target: improve incident response and reduce blast radius.

### 1. Security Dashboards
- Metrics:
  - rate-limited requests/min
  - create success vs deny ratio
  - vote success vs deny ratio
  - top abused slugs/endpoints

### 2. Alerting
- Alerts for:
  - sudden spikes in create attempts
  - high 429 rate
  - unusual vote volume on one poll

### 3. Data Lifecycle Controls
- Optional retention policy for stale polls (archive/delete by age).
- Admin backfill script to clean obvious abuse records.

### Phase 3 Exit Criteria
- Team can detect abuse within minutes.
- Clear runbook exists for mitigations.

## Implementation Order (Recommended)
1. Phase 1.1 Rate limiting.
2. Phase 1.4 Audit logging.
3. Phase 1.2 Daily creation quota.
4. Phase 1.3 Bot challenge.
5. Phase 2 identity hardening.
6. Phase 3 monitoring/alerting/retention.

## Security Backlog (Ready-to-Implement Tickets)
- Add `RATE_LIMITED` error contract and 429 handling in frontend messages.
- Implement Redis-backed limiter utility in `lib/security/rate-limit.ts`.
- Add `verifyBotChallenge()` helper and env-gated enforcement.
- Add write event logger helper `lib/security/audit-log.ts`.
- Add integration tests for limiter and quota boundaries.

## Out of Scope (for now)
- Full user authentication/authorization.
- Enterprise-grade WAF custom rules.
- Formal compliance controls (SOC2/ISO processes).
