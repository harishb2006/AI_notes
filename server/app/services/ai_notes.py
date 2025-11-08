from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional, Tuple

try:
    import google.generativeai as genai
except Exception:  # pragma: no cover - optional dependency during tests
    genai = None

from app.core.config import get_settings


@dataclass
class AIResult:
    """Container for AI enrichment output."""

    summary: Optional[str]
    tags: Optional[List[str]]


class AINoteService:
    """Lightweight wrapper around Gemini to summarize and tag notes."""

    def __init__(self, model_name: str = "gemini-1.5-flash"):
        self.settings = get_settings()
        self.model_name = model_name
        self._client = None

    def _ensure_client(self) -> None:
        """Lazy-initialize Gemini client if an API key exists."""
        if self._client or not self.settings.GEMINI_API_KEY or not genai:
            return

        genai.configure(api_key=self.settings.GEMINI_API_KEY)
        self._client = genai.GenerativeModel(self.model_name)

    def enrich(self, title: str, content: str, manual_tags: Optional[List[str]] = None) -> AIResult:
        """
        Generate AI summary and tags for the given note content.

        Falls back to deterministic heuristics when Gemini is unavailable.
        """
        summary: Optional[str] = None
        tags: Optional[List[str]] = manual_tags

        # Prefer manual tags but still let AI extend them.
        if self.settings.GEMINI_API_KEY and genai:
            self._ensure_client()
            if self._client:
                prompt = (
                    "You are an assistant that summarizes notes and extracts concise tags.\n"
                    f"Title: {title}\n\n"
                    f"Content:\n{content}\n\n"
                    "Return JSON with `summary` (<=80 words) and `tags` (3-6 short tags)."
                )
                try:
                    response = self._client.generate_content(prompt)
                    text = response.text.strip()
                    summary, tags = self._parse_response(text, manual_tags)
                except Exception:
                    summary, tags = self._fallback_processing(title, content, manual_tags)
            else:
                summary, tags = self._fallback_processing(title, content, manual_tags)
        else:
            summary, tags = self._fallback_processing(title, content, manual_tags)

        return AIResult(summary=summary, tags=tags)

    @staticmethod
    def _fallback_processing(title: str, content: str, manual_tags: Optional[List[str]]) -> Tuple[str, List[str]]:
        """Provide deterministic summary/tags to keep UX smooth offline."""
        full_text = (title.strip() + " " + content.strip()).strip()
        summary = full_text[:280] + ("..." if len(full_text) > 280 else "")

        tags = manual_tags[:] if manual_tags else []
        if not tags:
            tags = AINoteService._keywordize(content)
        return summary, tags

    @staticmethod
    def _parse_response(raw_text: str, manual_tags: Optional[List[str]]) -> Tuple[Optional[str], Optional[List[str]]]:
        """Best-effort parse of Gemini free-form text."""
        summary = None
        tags = manual_tags[:] if manual_tags else None

        lower = raw_text.lower()
        if "`" in raw_text or "```" in raw_text:
            raw_text = raw_text.replace("```json", "").replace("```", "").strip()

        # Try JSON parsing first
        try:
            import json

            data = json.loads(raw_text)
            summary = data.get("summary")
            tags = data.get("tags") or tags
            if isinstance(tags, str):
                tags = [tag.strip() for tag in tags.split(",") if tag.strip()]
            return summary, tags
        except Exception:
            pass

        # crude fallback parsing
        if "summary" in lower:
            parts = raw_text.split("\n")
            for line in parts:
                if "summary" in line.lower():
                    summary = line.split(":", 1)[-1].strip()
                if "tag" in line.lower():
                    tags_line = line.split(":", 1)[-1]
                    tags = [tag.strip(" -") for tag in tags_line.split(",") if tag.strip()]
        else:
            summary = raw_text[:280]
            tags = manual_tags

        return summary, tags

    @staticmethod
    def _keywordize(content: str) -> List[str]:
        """Very small helper to generate pseudo-tags locally."""
        words = [word.strip(".,!?").lower() for word in content.split()]
        keywords = []
        for word in words:
            if len(word) < 4 or not word.isalpha():
                continue
            if word in keywords:
                continue
            keywords.append(word)
            if len(keywords) == 5:
                break
        return keywords or ["notes"]
