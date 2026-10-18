import json
import os
import re
from typing import Iterator

from groq import Groq

from prompts.resume_analysis import build_prompt
from prompts.career_chat import CAREER_CHAT_SYSTEM_PROMPT
from prompts.internship_recommendation import build_recommendation_prompt

# Solid general-purpose model on Groq's free tier — fast + good instruction
# following for structured JSON output.
MODEL_NAME = "openai/gpt-oss-120b"


class AIAnalysisError(Exception):
    pass


class AIChatError(Exception):
    pass


def _get_client() -> Groq:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key or api_key == "your_key_here":
        raise AIAnalysisError(
            "GROQ_API_KEY is not set. Add it to backend/.env (see .env.example)."
        )
    return Groq(api_key=api_key)


def _extract_json(raw_text: str):
    """Groq/Llama models sometimes wrap JSON in markdown fences despite
    instructions not to — strip those before parsing."""
    text = raw_text.strip()
    fence_match = re.match(r"^```(?:json)?\s*(.*?)\s*```$", text, re.DOTALL)
    if fence_match:
        text = fence_match.group(1).strip()
    return json.loads(text)


def analyze_resume(resume_text: str) -> dict:
    """Sends the resume text to Groq and returns a parsed dict matching
    the AnalysisResult schema. Raises AIAnalysisError on any failure."""
    client = _get_client()
    prompt = build_prompt(resume_text)

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.4,
        )
    except Exception as exc:
        raise AIAnalysisError(f"Groq request failed: {exc}") from exc

    raw_text = response.choices[0].message.content or ""
    try:
        return _extract_json(raw_text)
    except json.JSONDecodeError as exc:
        raise AIAnalysisError(f"Model did not return valid JSON: {exc}") from exc


def recommend_internships(
    overall_score: int,
    strengths: list[str],
    weaknesses: list[str],
    ats_breakdown: list[dict],
) -> list[dict]:
    """Generates illustrative internship role suggestions based on a stored
    resume analysis. Raises AIAnalysisError on any failure."""
    client = _get_client()
    prompt = build_recommendation_prompt(overall_score, strengths, weaknesses, ats_breakdown)

    try:
        # No response_format here: this prompt asks for a top-level JSON
        # *array*, and Groq's JSON mode requires the output to be a JSON
        # object, so we rely on the prompt instructions + tolerant parsing
        # below instead.
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
        )
    except Exception as exc:
        raise AIAnalysisError(f"Groq request failed: {exc}") from exc

    raw_text = response.choices[0].message.content or ""
    try:
        data = _extract_json(raw_text)
    except json.JSONDecodeError as exc:
        raise AIAnalysisError(f"Model did not return valid JSON: {exc}") from exc

    # Be tolerant if the model wraps the array in an object.
    if isinstance(data, dict):
        data = next((v for v in data.values() if isinstance(v, list)), [])
    return data


def stream_chat(history: list[dict], new_message: str) -> Iterator[str]:
    """Streams a career-chat reply. `history` is a list of
    {'role': 'user'|'assistant', 'content': str} in chronological order.
    Yields text chunks as they arrive. Raises AIChatError on failure."""
    client = _get_client()

    messages = [{"role": "system", "content": CAREER_CHAT_SYSTEM_PROMPT}]
    messages += [{"role": m["role"], "content": m["content"]} for m in history]
    messages.append({"role": "user", "content": new_message})

    try:
        stream = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            stream=True,
        )
        for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta
    except Exception as exc:
        raise AIChatError(f"Groq chat request failed: {exc}") from exc
