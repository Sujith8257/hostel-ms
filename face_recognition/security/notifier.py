"""
Email notifier: send structured security alerts to admin.
Runs in a background thread so it never blocks the camera/recognition loop.
"""

import os
import smtplib
import threading
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from typing import Optional, Tuple


def _build_email_bodies(
    severity: str,
    timestamp: str,
    gate_id: str,
    confidence_score: Optional[float],
    attempt_count: int,
    reasoning: Optional[str],
    recommended_action: Optional[str],
) -> Tuple[str, str]:
    """
    Build plain-text and HTML bodies for the security alert email,
    using the HostelMS color palette and severity styling.
    """
    confidence_text = (
        f"{confidence_score:.3f}"
        if isinstance(confidence_score, (int, float))
        else "N/A"
    )

    severity_key = (severity or "").lower()
    severity_labels = {
        "high_alert": "High",
        "medium_alert": "Medium",
        "log_only": "Info",
        "allow": "Info",
    }
    banner_colors = {
        "high_alert": "#b91c1c",
        "medium_alert": "#b45309",
        "log_only": "#4b5563",
        "allow": "#15803d",
    }
    badge_class = {
        "high_alert": "badge-high",
        "medium_alert": "badge-medium",
        "log_only": "badge-log",
        "allow": "badge-allow",
    }

    severity_label = severity_labels.get(severity_key, "Info")
    banner_color = banner_colors.get(severity_key, "#4b5563")
    badge_cls = badge_class.get(severity_key, "badge-log")

    short_summary = "Unauthorized entry attempt"

    # Plain text body (fallback)
    lines = [
        "HostelMS Security Alert",
        "",
        f"Severity:      {severity_label} ({severity})",
        f"Timestamp:     {timestamp}",
        f"Gate / Location: {gate_id}",
        f"Confidence:    {confidence_text}",
        f"Attempt count: {attempt_count}",
        "",
        "Summary:",
        reasoning or "Security agent classified this as a security-relevant event.",
    ]
    if recommended_action:
        lines.extend(["", "Recommended action:", recommended_action])
    text_body = "\n".join(lines)

    # HTML body
    html_body = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Security Alert – HostelMS</title>
  <style>
    body {{
      margin: 0;
      padding: 0;
      background-color: #faf9f5;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #3d3929;
    }}
    .wrapper {{
      width: 100%;
      padding: 24px 0;
      background-color: #faf9f5;
    }}
    .container {{
      max-width: 640px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      border: 1px solid #dad9d4;
      box-shadow: 0 4px 16px rgba(0,0,0,0.04);
      overflow: hidden;
    }}
    .header {{
      padding: 16px 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      background: linear-gradient(135deg, #c96442, #d97757);
      color: #ffffff;
    }}
    .logo-badge {{
      width: 36px;
      height: 36px;
      border-radius: 12px;
      background: rgba(255,255,255,0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 16px;
    }}
    .title-block h1 {{
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.02em;
    }}
    .title-block p {{
      margin: 2px 0 0;
      font-size: 12px;
      opacity: 0.85;
    }}
    .severity-banner {{
      padding: 10px 24px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #ffffff;
    }}
    .content {{
      padding: 20px 24px 24px;
    }}
    .section-title {{
      font-size: 14px;
      font-weight: 600;
      margin: 16px 0 6px;
      color: #3d3929;
    }}
    .meta-table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }}
    .meta-table td {{
      padding: 4px 0;
      vertical-align: top;
    }}
    .meta-label {{
      width: 32%;
      color: #6b7280;
    }}
    .meta-value {{
      width: 68%;
      color: #111827;
      font-weight: 500;
    }}
    .badge {{
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }}
    .badge-high {{
      background-color: #fee2e2;
      color: #b91c1c;
    }}
    .badge-medium {{
      background-color: #fef3c7;
      color: #b45309;
    }}
    .badge-log {{
      background-color: #e5e7eb;
      color: #4b5563;
    }}
    .badge-allow {{
      background-color: #dcfce7;
      color: #15803d;
    }}
    .text-muted {{
      font-size: 12px;
      color: #6b7280;
    }}
    .box {{
      border-radius: 10px;
      border: 1px solid #e5e7eb;
      padding: 10px 12px;
      background-color: #fafafa;
      font-size: 13px;
      line-height: 1.5;
      white-space: pre-wrap;
    }}
    .footer {{
      padding: 12px 24px 18px;
      border-top: 1px solid #e5e7eb;
      font-size: 11px;
      color: #9ca3af;
    }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-badge">H</div>
        <div class="title-block">
          <h1>HostelMS – Security Alert</h1>
          <p>Automated notification from the Hostel Management System</p>
        </div>
      </div>
      <div class="severity-banner" style="background-color: {banner_color}">
        {severity_label} alert – {short_summary}
      </div>
      <div class="content">
        <p style="margin:0 0 10px;font-size:13px;">
          Dear Admin,
        </p>
        <p style="margin:0 0 12px;font-size:13px;">
          The system has detected a <strong>{severity_label}</strong> security event at
          <strong>{gate_id}</strong>.
        </p>
        <div class="section-title">Incident details</div>
        <table class="meta-table">
          <tr>
            <td class="meta-label">Timestamp</td>
            <td class="meta-value">{timestamp}</td>
          </tr>
          <tr>
            <td class="meta-label">Gate / Location</td>
            <td class="meta-value">{gate_id}</td>
          </tr>
          <tr>
            <td class="meta-label">Decision</td>
            <td class="meta-value">
              <span class="badge {badge_cls}">{severity}</span>
            </td>
          </tr>
          <tr>
            <td class="meta-label">Confidence</td>
            <td class="meta-value">
              {confidence_text}
              <span class="text-muted">(similarity score)</span>
            </td>
          </tr>
          <tr>
            <td class="meta-label">Attempts (5 min)</td>
            <td class="meta-value">{attempt_count}</td>
          </tr>
        </table>
"""

    if reasoning:
        html_body += f"""
        <div class="section-title">AI reasoning</div>
        <div class="box">
          {reasoning}
        </div>
"""
    if recommended_action:
        html_body += f"""
        <div class="section-title">Recommended action</div>
        <div class="box">
          {recommended_action}
        </div>
"""

    html_body += """
        <div class="section-title">Summary</div>
        <p class="text-muted" style="margin-top:4px;">
          This message was generated automatically by the HostelMS security agent
          (Gemini + rule-based fallback).
        </p>
      </div>
      <div class="footer">
        You are receiving this email because you are registered as a security or
        administrative contact for the Hostel Management System.
        <br/>
        If you believe you received this in error, please contact your system administrator.
      </div>
    </div>
  </div>
</body>
</html>
"""

    return text_body, html_body


def _send_sync(
    to_email: str,
    subject: str,
    body_text: str,
    body_html: str,
    image_path: Optional[str] = None,
) -> bool:
    """Actually send email (synchronous). Returns True on success."""
    host = os.environ.get("SMTP_HOST", "").strip()
    port = int(os.environ.get("SMTP_PORT", "587"))
    user = os.environ.get("SMTP_USER", "").strip()
    password = os.environ.get("SMTP_PASSWORD", "").strip()
    from_addr = os.environ.get("SMTP_FROM", user or "noreply@hostelms.local")

    if not host or not to_email:
        print("[security.notifier] SMTP_HOST or admin email not set; skip send")
        return False

    try:
        # multipart/alternative: text + HTML
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = from_addr
        msg["To"] = to_email

        msg.attach(MIMEText(body_text, "plain"))
        msg.attach(MIMEText(body_html, "html"))

        if image_path and os.path.isfile(image_path):
            with open(image_path, "rb") as f:
                part = MIMEBase("image", "jpeg")
                part.set_payload(f.read())
                encoders.encode_base64(part)
                part.add_header("Content-Disposition", "attachment", filename="snapshot.jpg")
                msg.attach(part)

        with smtplib.SMTP(host, port) as server:
            if user and password:
                server.starttls()
                server.login(user, password)
            server.sendmail(from_addr, [to_email], msg.as_string())
        print(f"[security.notifier] Email sent to {to_email}")
        return True
    except Exception as e:
        print(f"[security.notifier] Email failed: {e}")
        return False


def send_alert_email_async(
    severity: str,
    timestamp: str,
    gate_id: str,
    confidence_score: Optional[float],
    attempt_count: int,
    image_path: Optional[str] = None,
    reasoning: Optional[str] = None,
    recommended_action: Optional[str] = None,
) -> None:
    """
    Send "Security Alert: Unauthorized Entry Attempt" email to admin in a background thread.
    Does not block. Admin email from env: ADMIN_EMAIL.
    Optional reasoning and recommended_action from the AI agent are included when provided.
    """
    to_email = os.environ.get("ADMIN_EMAIL", "").strip()
    if not to_email:
        print("[security.notifier] ADMIN_EMAIL not set; skip email")
        return

    subject = "HostelMS Security Alert – Unauthorized Entry Attempt"
    text_body, html_body = _build_email_bodies(
        severity=severity,
        timestamp=timestamp,
        gate_id=gate_id,
        confidence_score=confidence_score,
        attempt_count=attempt_count,
        reasoning=reasoning,
        recommended_action=recommended_action,
    )

    def _run():
        _send_sync(to_email, subject, text_body, html_body, image_path)

    t = threading.Thread(target=_run, daemon=True)
    t.start()
