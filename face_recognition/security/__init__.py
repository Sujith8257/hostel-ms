# Security Agent layer for Hostel Management System
# Agentic AI: LLM reasons over entry attempts (with optional tool use); fallback to rule-based.

from .rules import evaluate_rules
from .agent import security_agent
from .logger import log_incident, get_attempt_count_last_5min
from .notifier import send_alert_email_async
from .llm_agent import run_agentic_agent

__all__ = [
    "evaluate_rules",
    "security_agent",
    "log_incident",
    "get_attempt_count_last_5min",
    "send_alert_email_async",
    "run_agentic_agent",
]
