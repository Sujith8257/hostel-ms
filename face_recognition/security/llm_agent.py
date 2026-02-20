"""
Agentic AI Security Agent: LLM reasons over entry events and can use tools.
Supports Gemini (free tier) and OpenAI. Prefers Gemini when GEMINI_API_KEY or GOOGLE_API_KEY is set.
Returns structured decision + reason; falls back to rule-based if LLM fails.
"""

import json
import os
from typing import Any, Callable, Optional

# Decision types (must match rules.py)
ALLOW = "allow"
LOG_ONLY = "log_only"
MEDIUM_ALERT = "medium_alert"
HIGH_ALERT = "high_alert"
VALID_DECISIONS = {ALLOW, LOG_ONLY, MEDIUM_ALERT, HIGH_ALERT}


SYSTEM_PROMPT = """You are a security officer for a hostel management system. Your job is to classify unauthorized entry attempts and decide the severity of the response.

You will receive an entry event (face recognition result). When face_match is false, it is an unauthorized attempt. You must output a single decision and a clear reason.

Decisions (use exactly these strings):
- allow: Face was recognized; access granted (only use when face_match is true).
- log_only: First or low-risk unauthorized attempt; log only, no alert.
- medium_alert: Unauthorized attempt that warrants alerting staff (e.g. night time, or 2nd attempt).
- high_alert: Serious risk (e.g. 3+ attempts in 5 minutes); immediate alert and possible escalation.

Consider: time of day (night >= 22:00 is higher risk), number of attempts in the last 5 minutes at this gate, and confidence score of the failed match. You may call the get_recent_attempts tool to confirm attempt count for a gate if needed.

Respond with valid JSON only, no markdown, in this exact shape:
{"decision": "<allow|log_only|medium_alert|high_alert>", "reason": "<one sentence>", "reasoning": "<short chain of thought>", "recommended_action": "<optional one line>"}
"""


def _serialize_event(event: dict[str, Any]) -> str:
    """Build a JSON-safe event for the LLM."""
    ts = event.get("timestamp")
    if hasattr(ts, "isoformat"):
        ts = ts.isoformat()
    return json.dumps({
        "timestamp": ts,
        "face_match": event.get("face_match", False),
        "confidence_score": event.get("confidence_score"),
        "person_id": event.get("person_id"),
        "gate_id": event.get("gate_id", ""),
        "attempt_count_last_5min": event.get("attempt_count_last_5min", 0),
    }, indent=2)


def _get_tools_schema_openai() -> list[dict]:
    """OpenAI-style tools for chat.completions."""
    return [
        {
            "type": "function",
            "function": {
                "name": "get_recent_attempts",
                "description": "Get the number of unauthorized entry attempts in the last 5 minutes for a given gate.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "gate_id": {"type": "string", "description": "The gate or location ID (e.g. 'Main Gate', 'Building A')."},
                    },
                    "required": ["gate_id"],
                },
            },
        },
    ]


def _get_tools_schema_gemini() -> list[dict]:
    """Gemini function declarations."""
    return [
        {
            "name": "get_recent_attempts",
            "description": "Get the number of unauthorized entry attempts in the last 5 minutes for a given gate. Use this to confirm attempt count before deciding severity.",
            "parameters": {
                "type": "object",
                "properties": {
                    "gate_id": {"type": "string", "description": "The gate or location ID (e.g. 'Main Gate', 'Building A')."},
                },
                "required": ["gate_id"],
            },
        },
    ]


def _parse_llm_response(content: str) -> Optional[dict[str, str]]:
    """Extract decision and reason from LLM text. Returns None if invalid."""
    if not content:
        return None
    content = content.strip()
    if content.startswith("```"):
        lines = content.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        content = "\n".join(lines)
    try:
        data = json.loads(content)
        decision = (data.get("decision") or "").strip().lower()
        if decision not in VALID_DECISIONS:
            return None
        reason = (data.get("reason") or data.get("reasoning") or "No reason given.").strip()
        return {
            "decision": decision,
            "reason": reason,
            "reasoning": (data.get("reasoning") or "").strip(),
            "recommended_action": (data.get("recommended_action") or "").strip(),
        }
    except (json.JSONDecodeError, TypeError):
        return None


# ---------- Gemini (free tier) ----------


def _run_gemini_agent_simple(
    event: dict[str, Any],
    tool_callback: Callable[[str, dict], Any],
) -> Optional[dict[str, str]]:
    """
    Use Google Gemini API (free tier). Single turn: event already has attempt_count_last_5min,
    so the model has full context. Get a free key at https://aistudio.google.com/apikey
    """
    api_key = (
        os.environ.get("GEMINI_API_KEY", "").strip()
        or os.environ.get("GOOGLE_API_KEY", "").strip()
    )
    model_name = os.environ.get("SECURITY_AGENT_LLM_MODEL", "gemini-1.5-flash").strip()
    if not api_key:
        return None
    try:
        import google.generativeai as genai
    except ImportError:
        print("[security.llm_agent] google-generativeai not installed; pip install google-generativeai")
        return None

    genai.configure(api_key=api_key)
    event_str = _serialize_event(event)
    prompt = (
        f"{SYSTEM_PROMPT}\n\nEntry event:\n{event_str}\n\n"
        "Classify this event and respond with valid JSON only (no markdown), "
        "with keys: decision, reason, reasoning, recommended_action."
    )

    model = genai.GenerativeModel(model_name=model_name)
    response = model.generate_content(prompt)
    if not response or not response.candidates:
        return None
    # Extract text from response (different SDK versions use .text or .parts[0].text)
    text = getattr(response, "text", None) if hasattr(response, "text") else None
    if not text and response.candidates:
        parts = getattr(response.candidates[0].content, "parts", None) or []
        for part in parts:
            if getattr(part, "text", None):
                text = part.text
                break
    if not text:
        return None
    return _parse_llm_response(text.strip())


# ---------- OpenAI ----------


def _run_openai_agent(
    event: dict[str, Any],
    tool_callback: Callable[[str, dict], Any],
) -> Optional[dict[str, str]]:
    """Use OpenAI Chat Completions with optional tool use."""
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    model = os.environ.get("SECURITY_AGENT_LLM_MODEL", "gpt-4o-mini").strip()
    if not api_key:
        return None
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
    except ImportError:
        print("[security.llm_agent] openai package not installed")
        return None

    event_str = _serialize_event(event)
    user_msg = f"Entry event:\n{event_str}\n\nClassify this event and respond with JSON (decision, reason, reasoning, recommended_action)."

    messages: list[dict] = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_msg},
    ]
    tools = _get_tools_schema_openai()
    max_tool_rounds = 3
    last_content = ""

    for _ in range(max_tool_rounds):
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            tools=tools,
            tool_choice="auto",
        )
        choice = response.choices[0] if response.choices else None
        if not choice:
            return None
        msg = choice.message
        if getattr(msg, "content", None) and msg.content:
            last_content = msg.content.strip()
            parsed = _parse_llm_response(last_content)
            if parsed:
                return parsed
        if getattr(msg, "tool_calls", None) and msg.tool_calls:
            for tc in msg.tool_calls:
                name = getattr(tc.function, "name", None) or ""
                try:
                    args = json.loads(getattr(tc.function, "arguments", None) or "{}")
                except json.JSONDecodeError:
                    args = {}
                result = tool_callback(name, args)
                messages.append({
                    "role": "assistant",
                    "content": msg.content or "",
                    "tool_calls": [
                        {
                            "id": getattr(tc, "id", ""),
                            "type": "function",
                            "function": {"name": name, "arguments": getattr(tc.function, "arguments", "{}")},
                        }
                    ],
                })
                messages.append({
                    "role": "tool",
                    "tool_call_id": getattr(tc, "id", ""),
                    "content": json.dumps(result),
                })
            continue
        break

    if last_content:
        return _parse_llm_response(last_content)
    return None


# ---------- Provider selection ----------


def run_agentic_agent(
    event: dict[str, Any],
    tool_callback: Callable[[str, dict], Any],
) -> Optional[dict[str, str]]:
    """
    Run the agentic AI agent. Prefers Gemini (free) if GEMINI_API_KEY or GOOGLE_API_KEY is set,
    otherwise uses OPENAI_API_KEY. Returns {"decision", "reason", "reasoning", "recommended_action"} or None.
    """
    gemini_key = (
        os.environ.get("GEMINI_API_KEY", "").strip()
        or os.environ.get("GOOGLE_API_KEY", "").strip()
    )
    openai_key = os.environ.get("OPENAI_API_KEY", "").strip()

    if gemini_key:
        result = _run_gemini_agent_simple(event, tool_callback)
        if result is not None:
            return result
        print("[security.llm_agent] Gemini returned no valid decision; fallback to rules.")
    if openai_key:
        result = _run_openai_agent(event, tool_callback)
        if result is not None:
            return result
        print("[security.llm_agent] OpenAI returned no valid decision; fallback to rules.")

    if not gemini_key and not openai_key:
        print("[security.llm_agent] No GEMINI_API_KEY / GOOGLE_API_KEY or OPENAI_API_KEY set")
    return None
