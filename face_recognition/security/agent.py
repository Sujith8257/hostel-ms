"""
Security Agent: agentic AI first, rule-based fallback.
When AI is enabled and the LLM returns a valid decision, use it; otherwise use deterministic rules.
"""

import os
from typing import Any

from .rules import evaluate_rules, ALLOW, LOG_ONLY, MEDIUM_ALERT, HIGH_ALERT
from .logger import get_attempt_count_last_5min
from .llm_agent import run_agentic_agent


def _tool_callback(name: str, args: dict) -> Any:
    """Handle tool calls from the LLM (agentic behavior)."""
    if name == "get_recent_attempts":
        gate_id = args.get("gate_id") or ""
        count = get_attempt_count_last_5min(gate_id)
        return {"gate_id": gate_id, "attempt_count_last_5min": count}
    return {"error": f"Unknown tool: {name}"}


def security_agent(event: dict[str, Any]) -> dict[str, str]:
    """
    Run the security agent: try agentic AI first (if enabled), else rule-based.

    Expected event keys:
        - timestamp: datetime or ISO str
        - face_match: bool
        - confidence_score: float
        - person_id: str | None
        - gate_id: str
        - image_path: str (optional)
        - attempt_count_last_5min: int

    Returns:
        {"decision": "allow"|"log_only"|"medium_alert"|"high_alert", "reason": str}
        and optionally "reasoning", "recommended_action" if from AI.
    """
    use_ai = os.environ.get("SECURITY_AGENT_AI_ENABLED", "true").strip().lower() in ("1", "true", "yes")
    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip() or os.environ.get("GOOGLE_API_KEY", "").strip()
    openai_key = os.environ.get("OPENAI_API_KEY", "").strip()
    
    if use_ai and (gemini_key or openai_key):
        print(f"[security.agent] Attempting AI agent (Gemini: {bool(gemini_key)}, OpenAI: {bool(openai_key)})...")
        result = run_agentic_agent(event, _tool_callback)
        if result is not None:
            print(f"[security.agent] AI agent returned decision: {result.get('decision')}")
            return {
                "decision": result["decision"],
                "reason": result.get("reason", ""),
                "reasoning": result.get("reasoning", ""),
                "recommended_action": result.get("recommended_action", ""),
            }
        else:
            print(f"[security.agent] AI agent returned None, falling back to rules")
    else:
        if not use_ai:
            print(f"[security.agent] AI disabled (SECURITY_AGENT_AI_ENABLED=false)")
        elif not gemini_key and not openai_key:
            print(f"[security.agent] No API keys found (GEMINI_API_KEY/GOOGLE_API_KEY or OPENAI_API_KEY)")
    
    print(f"[security.agent] Using rule-based decision")
    return evaluate_rules(event)
