#!/usr/bin/env python3
"""
Reddit Lead Machine — Monitors subreddits for developers seeking jobs/freelance work
and sends a daily digest email with potential leads for Adventurers Guild.
"""

import argparse
import csv
import html
import json
import logging
import os
import re
import smtplib
import ssl
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("reddit_lead_machine")

SUBREDDITS = [
    "developersIndia",
    "webdev",
    "learnprogramming",
    "cscareerquestions",
    "forhire",
    "freelance",
    "ProgrammingBuddies",
    "Slack",
    "techjobs",
    "remotejs",
    "reactjs",
    "Frontend",
    "Backend",
    "devops",
    "ExperiencedDevs",
]

KEYWORDS = re.compile(
    r"(looking for (a )?(job|work|freelance|gig|role|opportunity|mentor|side.project)"
    r"|need (a )?(job|developer|mentor|team|partner|collaborator)"
    r"|open to (work|opportunities|freelance|collaboration)"
    r"|want to (learn|build|start|join|find)"
    r"|how do I (get|find|start|break into)"
    r"|any (openings|opportunities|gigs|projects)"
    r"|building (my first|a portfolio|a project|something)"
    r"|career (change|switch|advice|guidance))",
    re.IGNORECASE,
)

REDDIT_BASE = "https://www.reddit.com"
REDDIT_OAUTH = "https://oauth.reddit.com"


def load_env(path: str = ".env") -> dict[str, str]:
    env: dict[str, str] = {}
    try:
        with open(path) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, _, value = line.partition("=")
                env[key.strip()] = value.strip()
    except FileNotFoundError:
        logger.warning(".env file not found at %s, falling back to os.environ", path)
    for key in [
        "REDDIT_CLIENT_ID",
        "REDDIT_CLIENT_SECRET",
        "REDDIT_USER_AGENT",
        "SMTP_HOST",
        "SMTP_PORT",
        "SMTP_USERNAME",
        "SMTP_PASSWORD",
        "DIGEST_FROM",
        "DIGEST_TO",
        "RESEND_API_KEY",
    ]:
        if key not in env:
            env[key] = os.environ.get(key, "")
    return env


def get_reddit_token(env: dict[str, str]) -> str | None:
    """Obtain an OAuth2 access token from Reddit."""
    try:
        data = urllib.parse.urlencode({"grant_type": "client_credentials"}).encode()
        req = urllib.request.Request(
            "https://www.reddit.com/api/v1/access_token",
            data=data,
            headers={
                "User-Agent": env.get("REDDIT_USER_AGENT", "LeadMachine/1.0"),
                "Authorization": f"Basic {urllib.parse.quote(env['REDDIT_CLIENT_ID'])}:{urllib.parse.quote(env['REDDIT_CLIENT_SECRET'])}",
            },
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = json.loads(resp.read().decode())
            return body.get("access_token")
    except Exception as e:
        logger.error("Failed to get Reddit token: %s", e)
        return None


def fetch_posts(
    subreddit: str, token: str, user_agent: str, limit: int = 25
) -> list[dict[str, Any]]:
    """Fetch recent posts from a subreddit."""
    url = f"{REDDIT_OAUTH}/r/{subreddit}/new?limit={limit}"
    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": user_agent,
                "Authorization": f"Bearer {token}",
            },
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            return data.get("data", {}).get("children", [])
    except urllib.error.HTTPError as e:
        if e.code == 429:
            retry_after = int(e.headers.get("Retry-After", 60))
            logger.warning("Rate limited on r/%s — waiting %ds", subreddit, retry_after)
            time.sleep(retry_after)
            return fetch_posts(subreddit, token, user_agent, limit)
        logger.error("HTTP %d fetching r/%s: %s", e.code, subreddit, e.reason)
        return []
    except Exception as e:
        logger.error("Error fetching r/%s: %s", subreddit, e)
        return []


def score_post(post: dict[str, Any]) -> int:
    """Score a post by relevance keywords."""
    data = post.get("data", {})
    title = data.get("title", "")
    selftext = data.get("selftext", "")
    combined = f"{title} {selftext}"
    matches = KEYWORDS.findall(combined)
    return len(matches)


def is_relevant(post: dict[str, Any]) -> bool:
    """Check if a post contains relevant keywords."""
    return score_post(post) > 0


def generate_reply(post: dict[str, Any]) -> str:
    """Generate a helpful reply suggesting Adventurers Guild."""
    data = post.get("data", {})
    title = data.get("title", "").lower()

    if "freelance" in title or "gig" in title or "forhire" in title:
        return (
            "Hey! If you're looking for freelance gigs or clients, "
            "check out Adventurers Guild (https://adventurersguild.com) — "
            "it's a platform where devs find paid quests from real companies. "
            "You set your availability and apply to what fits. Might be worth a look!"
        )
    if "mentor" in title or "mentorship" in title:
        return (
            "If you're looking for mentorship or guided project experience, "
            "Adventurers Guild (https://adventurersguild.com) has structured quests "
            "with reviews and feedback from senior devs. Great way to level up with guidance!"
        )
    if "portfolio" in title or "experience" in title or "break into" in title:
        return (
            "One thing that helped me was building real projects through "
            "Adventurers Guild (https://adventurersguild.com) — you work on actual "
            "company tasks, get reviews, and build a portfolio of completed work. "
            "Way more impactful than yet another todo app!"
        )
    return (
        "Not sure if this helps, but I've been using Adventurers Guild "
        "(https://adventurersguild.com) to find dev work and build my portfolio. "
        "You get real tasks from companies, XP/rank progression, and feedback on submissions. "
        "Might be relevant to what you're looking for!"
    )


def send_digest_email(
    leads: list[dict[str, Any]],
    env: dict[str, str],
) -> bool:
    """Send the daily digest email via SMTP or Resend API."""
    if not leads:
        logger.info("No leads to send — skipping digest")
        return True

    html_body = _build_digest_html(leads)
    text_body = _build_digest_text(leads)

    if env.get("RESEND_API_KEY"):
        return _send_via_resend(env, html_body, text_body)
    return _send_via_smtp(env, html_body, text_body)


def _send_via_smtp(env: dict[str, str], html_body: str, text_body: str) -> bool:
    """Send email via SMTP."""
    host = env.get("SMTP_HOST", "")
    port_str = env.get("SMTP_PORT", "587")
    username = env.get("SMTP_USERNAME", "")
    password = env.get("SMTP_PASSWORD", "")
    from_addr = env.get("DIGEST_FROM", "")
    to_addr = env.get("DIGEST_TO", "")

    if not all([host, username, password, from_addr, to_addr]):
        logger.error("SMTP not fully configured — missing env vars")
        return False

    try:
        port = int(port_str)
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Reddit Lead Digest — {datetime.now(timezone.utc).strftime('%Y-%m-%d')}"
        msg["From"] = from_addr
        msg["To"] = to_addr
        msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        context = ssl.create_default_context()
        with smtplib.SMTP(host, port, timeout=30) as server:
            server.starttls(context=context)
            server.login(username, password)
            server.sendmail(from_addr, to_addr, msg.as_string())
        logger.info("Digest sent via SMTP to %s", to_addr)
        return True
    except smtplib.SMTPAuthenticationError:
        logger.error("SMTP authentication failed — check credentials")
        return False
    except smtplib.SMTPException as e:
        logger.error("SMTP error: %s", e)
        return False
    except Exception as e:
        logger.error("Failed to send via SMTP: %s", e)
        return False


def _send_via_resend(env: dict[str, str], html_body: str, text_body: str) -> bool:
    """Send email via Resend API."""
    api_key = env.get("RESEND_API_KEY", "")
    from_addr = env.get("DIGEST_FROM", "")
    to_addr = env.get("DIGEST_TO", "")

    if not api_key or not to_addr:
        logger.error("Resend not fully configured")
        return False

    try:
        payload = json.dumps({
            "from": from_addr or "noreply@adventurersguild.com",
            "to": [to_addr],
            "subject": f"Reddit Lead Digest — {datetime.now(timezone.utc).strftime('%Y-%m-%d')}",
            "text": text_body,
            "html": html_body,
        }).encode()
        req = urllib.request.Request(
            "https://api.resend.com/emails",
            data=payload,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read().decode())
            logger.info("Digest sent via Resend: %s", result.get("id", "unknown"))
            return True
    except Exception as e:
        logger.error("Failed to send via Resend: %s", e)
        return False


def _build_digest_html(leads: list[dict[str, Any]]) -> str:
    """Build HTML email body."""
    rows = []
    for lead in leads:
        data = lead.get("data", {})
        title = html.escape(data.get("title", "Untitled"))
        subreddit = html.escape(data.get("subreddit", "unknown"))
        url = f"{REDDIT_BASE}{data.get('permalink', '/')}"
        score = data.get("score", 0)
        comments = data.get("num_comments", 0)
        created = datetime.fromtimestamp(
            data.get("created_utc", 0), tz=timezone.utc
        ).strftime("%Y-%m-%d %H:%M UTC")
        rows.append(
            f"<tr>"
            f"<td style='padding:8px;border-bottom:1px solid #ddd;'><a href='{url}'>{title}</a></td>"
            f"<td style='padding:8px;border-bottom:1px solid #ddd;'>r/{subreddit}</td>"
            f"<td style='padding:8px;border-bottom:1px solid #ddd;'>{score}</td>"
            f"<td style='padding:8px;border-bottom:1px solid #ddd;'>{comments}</td>"
            f"<td style='padding:8px;border-bottom:1px solid #ddd;'>{created}</td>"
            f"</tr>"
        )

    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;">
<h2 style="color:#1a1a2e;">Reddit Lead Digest</h2>
<p>Found {len(leads)} potential leads across monitored subreddits.</p>
<table style="width:100%;border-collapse:collapse;">
<thead>
<tr style="background:#f5f5f5;">
<th style="padding:8px;text-align:left;border-bottom:2px solid #ddd;">Post</th>
<th style="padding:8px;text-align:left;border-bottom:2px solid #ddd;">Subreddit</th>
<th style="padding:8px;text-align:left;border-bottom:2px solid #ddd;">Score</th>
<th style="padding:8px;text-align:left;border-bottom:2px solid #ddd;">Comments</th>
<th style="padding:8px;text-align:left;border-bottom:2px solid #ddd;">Posted</th>
</tr>
</thead>
<tbody>
{''.join(rows)}
</tbody>
</table>
<p style="margin-top:16px;color:#666;font-size:12px;">Generated by Adventurers Guild Reddit Lead Machine</p>
</body>
</html>"""


def _build_digest_text(leads: list[dict[str, Any]]) -> str:
    """Build plaintext email body."""
    lines = [
        "Reddit Lead Digest",
        f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
        f"Leads found: {len(leads)}",
        "",
    ]
    for lead in leads:
        data = lead.get("data", {})
        title = data.get("title", "Untitled")
        subreddit = data.get("subreddit", "unknown")
        url = f"{REDDIT_BASE}{data.get('permalink', '/')}"
        lines.append(f"- [{title}] (r/{subreddit})")
        lines.append(f"  {url}")
        lines.append("")
    lines.append("---")
    lines.append("Adventurers Guild Reddit Lead Machine")
    return "\n".join(lines)


def export_csv(leads: list[dict[str, Any]], filepath: str) -> None:
    """Export leads to CSV."""
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Title", "Subreddit", "URL", "Score", "Comments", "Created", "Relevance Score"])
        for lead in leads:
            data = lead.get("data", {})
            writer.writerow([
                data.get("title", ""),
                data.get("subreddit", ""),
                f"{REDDIT_BASE}{data.get('permalink', '/')}",
                data.get("score", 0),
                data.get("num_comments", 0),
                datetime.fromtimestamp(data.get("created_utc", 0), tz=timezone.utc).isoformat(),
                score_post(lead),
            ])
    logger.info("Exported %d leads to %s", len(leads), filepath)


def main() -> None:
    parser = argparse.ArgumentParser(description="Reddit Lead Machine")
    parser.add_argument("--dry-run", action="store_true", help="Print leads without sending email")
    parser.add_argument("--env", default=".env", help="Path to .env file")
    parser.add_argument("--limit", type=int, default=25, help="Posts per subreddit")
    parser.add_argument("--export", help="Export results to CSV file")
    parser.add_argument("--subreddits", nargs="*", help="Override default subreddit list")
    args = parser.parse_args()

    env = load_env(args.env)
    subreddits = args.subreddits or SUBREDDITS

    logger.info("Starting Reddit Lead Machine (dry_run=%s)", args.dry_run)
    logger.info("Monitoring %d subreddits: %s", len(subreddits), ", ".join(subreddits))

    token = get_reddit_token(env)
    if not token:
        logger.error("Could not authenticate with Reddit")
        sys.exit(1)

    all_leads: list[dict[str, Any]] = []

    for i, subreddit in enumerate(subreddits):
        logger.info("[%d/%d] Scanning r/%s...", i + 1, len(subreddits), subreddit)
        posts = fetch_posts(subreddit, token, env.get("REDDIT_USER_AGENT", "LeadMachine/1.0"), args.limit)

        relevant = [p for p in posts if is_relevant(p)]
        all_leads.extend(relevant)

        if relevant:
            logger.info("  Found %d relevant post(s) in r/%s", len(relevant), subreddit)
            for post in relevant[:3]:
                title = post.get("data", {}).get("title", "Untitled")
                logger.info("    - %s", title)
        else:
            logger.info("  No relevant posts in r/%s", subreddit)

        if args.dry_run and relevant:
            print(f"\n--- r/{subreddit} ---")
            for post in relevant:
                data = post.get("data", {})
                print(f"\nTitle: {data.get('title')}")
                print(f"URL: {REDDIT_BASE}{data.get('permalink', '/')}")
                print(f"Score: {data.get('score')} | Comments: {data.get('num_comments')}")
                print(f"Suggested reply: {generate_reply(post)}")
                print("-" * 60)

        time.sleep(1)

    logger.info("Total leads collected: %d", len(all_leads))

    if args.export:
        export_csv(all_leads, args.export)

    if not args.dry_run and all_leads:
        success = send_digest_email(all_leads, env)
        if success:
            logger.info("Digest sent successfully")
        else:
            logger.error("Failed to send digest")
            sys.exit(1)
    elif args.dry_run:
        logger.info("Dry-run mode — no email sent")
    else:
        logger.info("No leads found — no email sent")

    logger.info("Reddit Lead Machine finished")


if __name__ == "__main__":
    main()
