RECOMMENDATION_PROMPT = """You are a career advisor helping a student find internships that fit their \
current skill level, based on their resume analysis below.

Generate 4-6 realistic, illustrative internship role suggestions — the kind \
of roles and companies that commonly hire for this profile. These are \
example role types to guide the person's search, NOT live job postings or \
real open positions, so avoid naming real specific companies with exact, \
verifiable current openings; use realistic company *types* or well-known \
company names only as illustrative examples of the kind of employer, \
making it clear in "reason" that this is a suggested role type.

Return ONLY a JSON array (no markdown fences, no commentary) matching this \
exact shape:

[
  {{
    "title": "<role title>",
    "company": "<illustrative company name or type, e.g. 'Series A fintech startup'>",
    "requiredSkills": [<3-6 short strings>],
    "eligibility": "<who's typically eligible, e.g. class year / prerequisite skills>",
    "reason": "<1-2 sentences on why this fits their resume>",
    "learningResources": [<2-3 short strings naming a skill/topic to learn, not URLs>]
  }}
  ... 4 to 6 of these
]

Resume analysis:
---
Overall score: {overall_score}/100
Strengths: {strengths}
Weaknesses: {weaknesses}
ATS breakdown: {ats_breakdown}
---
"""


def build_recommendation_prompt(
    overall_score: int,
    strengths: list[str],
    weaknesses: list[str],
    ats_breakdown: list[dict],
) -> str:
    return RECOMMENDATION_PROMPT.format(
        overall_score=overall_score,
        strengths="; ".join(strengths) or "none listed",
        weaknesses="; ".join(weaknesses) or "none listed",
        ats_breakdown=", ".join(f"{c['label']}: {c['score']}" for c in ats_breakdown),
    )
