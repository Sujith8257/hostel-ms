# Security Agent (Agentic AI + Rules Fallback)

Agentic security layer: an LLM reasons over each entry attempt and can use tools (e.g. `get_recent_attempts`); if AI is disabled or fails, deterministic rules are used.

## Flow

1. **Entry event** (from `/recognize_face/` when `recognized=False`): timestamp, face_match, confidence_score, gate_id, attempt_count_last_5min.
2. **Agent** (`security_agent(event)`):
   - If **AI enabled** and **OPENAI_API_KEY** set: LLM classifies the event (with optional tool call to confirm attempt count), returns `decision` + `reason` + `reasoning` + `recommended_action`.
   - Else or on failure: **rule-based** fallback → `decision` + `reason`.
3. **Logger**: every unauthorized attempt is written to Supabase `security_incidents`.
4. **Notifier**: for `medium_alert` or `high_alert`, email is sent to `ADMIN_EMAIL` in a background thread.

## Agentic AI

- **Model**: OpenAI Chat Completions (default `gpt-4o-mini`).
- **Tool**: `get_recent_attempts(gate_id)` — the agent can call this to fetch attempt count for a gate (true agentic behavior).
- **Output**: JSON with `decision`, `reason`, `reasoning`, `recommended_action`.

## Rule fallback (when AI disabled or fails)

- **face_match == True** → `allow`
- **face_match == False** and **attempt_count_last_5min >= 3** → `high_alert`
- **face_match == False** and **time >= 22:00** → `medium_alert`
- **face_match == False** and **attempt_count_last_5min <= 1** → `log_only`
- Otherwise → `medium_alert`

## Environment

- **Supabase**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- **AI (agentic)** — prefers **Gemini (free)** when key is set:
  - **Gemini (free tier)**:
    - `GEMINI_API_KEY` or `GOOGLE_API_KEY` — get one at [Google AI Studio](https://aistudio.google.com/apikey).
    - `SECURITY_AGENT_LLM_MODEL` — optional (default `gemini-1.5-flash`).
  - **OpenAI** (optional):
    - `OPENAI_API_KEY`
    - `SECURITY_AGENT_LLM_MODEL` — optional (default `gpt-4o-mini` when using OpenAI).
  - `SECURITY_AGENT_AI_ENABLED` — set to `false`/`0` to use rules only.
- **Email**: `ADMIN_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, optional `SMTP_FROM`.

## Database

Run `migrations/001_security_incidents.sql` in the Supabase SQL Editor if the table does not exist.

## Phase 2

`report_generator.py` will host an LLM that only produces natural-language reports from `event` + `decision`; it will not change the decision.
