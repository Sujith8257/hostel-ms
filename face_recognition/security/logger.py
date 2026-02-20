"""
Security incident logging: persist to Supabase table `security_incidents`.
Also provides attempt count in last 5 minutes per gate (for agent input).
"""

import os
from datetime import datetime, timedelta
from typing import Any, Optional

# Supabase client is set by the face_recognition app (shared)
_supabase = None


def set_supabase_client(client: Any) -> None:
    global _supabase
    _supabase = client


def get_supabase():
    if _supabase is None:
        from supabase import create_client
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if not url or not key:
            raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required for security logger")
        set_supabase_client(create_client(url, key))
    return _supabase


def get_attempt_count_last_5min(gate_id: str) -> int:
    """
    Return number of security incidents (unauthorized attempts) for the given gate
    in the last 5 minutes. Used as input to the security agent (caller adds +1 for current).
    """
    try:
        sb = get_supabase()
        since = (datetime.utcnow() - timedelta(minutes=5)).isoformat()
        result = sb.table("security_incidents").select("id").eq("gate_id", gate_id).gte("timestamp", since).execute()
        return len(result.data or [])
    except Exception as e:
        print(f"[security.logger] get_attempt_count_last_5min error: {e}")
        return 0


def log_incident(
    gate_id: str,
    severity: str,
    confidence_score: Optional[float] = None,
    image_path: Optional[str] = None,
    attempt_count: Optional[int] = None,
    resolved: bool = False,
) -> Optional[dict]:
    """
    Insert one row into `security_incidents`.
    Returns the inserted row or None on failure. Never raises; logs errors.
    """
    try:
        sb = get_supabase()
        row = {
            "timestamp": datetime.utcnow().isoformat(),
            "gate_id": gate_id,
            "image_path": image_path or "",
            "confidence_score": confidence_score,
            "severity": severity,
            "attempt_count": attempt_count if attempt_count is not None else 0,
            "resolved": bool(resolved),
        }
        result = sb.table("security_incidents").insert(row).execute()
        data = result.data if hasattr(result, "data") else []
        out = data[0] if data else row
        print(f"[security.logger] Incident logged: gate_id={gate_id}, severity={severity}")
        return out
    except Exception as e:
        print(f"[security.logger] log_incident FAILED: {e}")
        print("  -> Make sure you ran migrations/001_security_incidents.sql in Supabase SQL Editor.")
        return None
