"""
Deterministic rule logic for the Security Agent.
Phase 1: No LLM. All decisions are rule-based only.
"""

from datetime import datetime
from typing import Any


# Decision types
ALLOW = "allow"
LOG_ONLY = "log_only"
MEDIUM_ALERT = "medium_alert"
HIGH_ALERT = "high_alert"

# Night threshold (22:00)
NIGHT_HOUR = 22
NIGHT_MINUTE = 0


def _is_night(timestamp: datetime) -> bool:
    """True if current time is >= 22:00 (10 PM)."""
    return timestamp.hour >= NIGHT_HOUR and timestamp.minute >= NIGHT_MINUTE


def evaluate_rules(event: dict[str, Any]) -> dict[str, str]:
    """
    Evaluate deterministic rules on an entry event.
    Returns {"decision": "allow"|"log_only"|"medium_alert"|"high_alert", "reason": str}.
    """
    face_match = event.get("face_match", False)
    attempt_count_last_5min = event.get("attempt_count_last_5min", 0)
    timestamp = event.get("timestamp")
    if timestamp is None:
        timestamp = datetime.now()
    if hasattr(timestamp, "isoformat"):
        pass  # already datetime
    else:
        try:
            timestamp = datetime.fromisoformat(str(timestamp).replace("Z", "+00:00"))
        except Exception:
            timestamp = datetime.now()
    # Use local time for "night" check (strip tz for comparison if present)
    if hasattr(timestamp, "astimezone"):
        try:
            ts_local = timestamp.astimezone()
        except Exception:
            ts_local = timestamp
    else:
        ts_local = timestamp

    # Rule 1: Recognized face → allow
    if face_match is True:
        return {
            "decision": ALLOW,
            "reason": "Face matched; access allowed.",
        }

    # Unauthorized from here
    # Rule 5: High alert overrides all other rules (attempt_count >= 3)
    if attempt_count_last_5min >= 3:
        return {
            "decision": HIGH_ALERT,
            "reason": f"Multiple unauthorized attempts in last 5 minutes ({attempt_count_last_5min}); high alert.",
        }

    # Rule 3: Night time (>= 22:00) → medium alert
    if _is_night(ts_local):
        return {
            "decision": MEDIUM_ALERT,
            "reason": "Unauthorized attempt during night hours (>= 22:00); medium alert.",
        }

    # Rule 2: First attempt in window (0 previous in 5 min) → log only
    if attempt_count_last_5min <= 1:
        return {
            "decision": LOG_ONLY,
            "reason": "First unauthorized attempt in last 5 minutes; log only.",
        }

    # Rule 4: 2 attempts → medium (high is already handled above)
    return {
        "decision": MEDIUM_ALERT,
        "reason": f"Unauthorized attempt (count in last 5 min: {attempt_count_last_5min}); medium alert.",
    }
