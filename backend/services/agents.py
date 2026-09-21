"""
Stage 4: Chandigarh Grounded Specialist Agents

This module uses Azure AI Search for grounded departmental policy retrieval
and Azure OpenAI (gpt-5-mini via Foundry) to synthesize verified citizen guidance
tailored to the Union Territory of Chandigarh (MCC & CPDL).
"""

import json
import os
from dotenv import load_dotenv

ENV_PATH = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(ENV_PATH)

POLICY_PATH = os.path.join(
    os.path.dirname(__file__), "..", "mock_data", "department_policies.json"
)

DEPARTMENT_AGENT_PROMPT = """You are an official municipal specialist officer representing the Chandigarh Civic Administration (Municipal Corporation Chandigarh & Chandigarh Power Distribution Limited).
You assist citizens residing in the Union Territory of Chandigarh (Sectors 1-63, Manimajra/Sector 13, Dhanas, Maloya, Industrial Area).

Your task:
Answer the citizen's grievance authoritatively using the departmental policy guidelines and Chandigarh Right to Service (RTS) rules provided below.

Mandatory Guidelines:
1. State the exact statutory resolution deadline under the Chandigarh Right to Service Act / Citizen Charter.
2. Provide the official 24x7 helpline or contact channel (e.g. Electricity Outages: 19121, Water Supply: 0172-2540200, Sanitation WhatsApp: 9915762917, MCC ICCC: 0172-2787200, e-Sampark: 1800-180-1725).
3. Outline immediate citizen action (e.g., visit e-Sampark, contact SDO/divisional officer, or file the official ticket below).
4. Maintain a polite, efficient, citizen-first tone. Keep the answer concise (3-4 bullet points or short paragraphs).
"""


def _load_departments() -> dict:
    """Loads department metadata dynamically from Azure Table Storage."""
    try:
        from services import storage
        depts = storage.get_departments()
        if depts:
            return {
                d["id"]: {
                    "department_name": d["name"],
                    "policy_snippets": d.get("policies", [])
                }
                for d in depts
            }
    except Exception as e:
        print(f"[Agents Storage Warning] {e}")

    with open(POLICY_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _search_grounding_policies(query: str, department_name: str) -> list[str]:
    """Retrieve grounded policy snippets from Azure AI Search."""
    endpoint = os.getenv("AZURE_SEARCH_ENDPOINT")
    key = os.getenv("AZURE_SEARCH_KEY")
    index = os.getenv("AZURE_SEARCH_INDEX", "department-policies-index")

    if not endpoint or not key or "<your-search" in endpoint:
        return []

    try:
        from azure.core.credentials import AzureKeyCredential
        from azure.search.documents import SearchClient

        client = SearchClient(endpoint=endpoint, index_name=index, credential=AzureKeyCredential(key))
        search_query = f"Chandigarh {department_name} {query}"
        results = list(client.search(search_text=search_query, top=3))
        
        snippets = []
        for r in results:
            text = r.get("snippet") or r.get("content") or r.get("text")
            if text:
                snippets.append(text)
        return snippets
    except Exception as e:
        print(f"[Azure AI Search Warning] {e}")
        return []


def mock_department_response(department_id: str, complaint_text: str) -> dict:
    """
    Executes grounded department agent response.
    Queries Azure AI Search + Azure OpenAI if available, with automatic mock fallback.
    """
    departments = _load_departments()
    dept = departments.get(department_id)
    dept_name = dept["department_name"] if dept else "Municipal Corporation Chandigarh"
    fallback_snippets = dept["policy_snippets"] if dept else [
        "Standard Chandigarh municipal grievance resolution timeline is 14 working days. Call MCC ICCC 0172-2787200."
    ]

    # Step 1: Grounding via Azure AI Search
    retrieved_snippets = _search_grounding_policies(complaint_text, dept_name)
    all_snippets = retrieved_snippets if retrieved_snippets else fallback_snippets
    policy_context = "\n".join(f"- {s}" for s in all_snippets)

    # Step 2: Generate response using Azure OpenAI (Foundry)
    openai_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    openai_key = os.getenv("AZURE_OPENAI_KEY")
    openai_deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-5-mini")

    if openai_endpoint and openai_key and "<your" not in openai_endpoint:
        try:
            from openai import AzureOpenAI

            client = AzureOpenAI(
                azure_endpoint=openai_endpoint,
                api_key=openai_key,
                api_version="2024-12-01-preview",
            )

            prompt = (
                f"Authority / Department: {dept_name}\n"
                f"Official Policy & RTS Knowledge:\n{policy_context}\n\n"
                f"Citizen Complaint: \"{complaint_text}\"\n\n"
                f"Provide clear, actionable official advice including resolution timelines and helplines."
            )

            resp = client.chat.completions.create(
                model=openai_deployment,
                messages=[
                    {"role": "system", "content": DEPARTMENT_AGENT_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                max_completion_tokens=1500,
            )
            answer = resp.choices[0].message.content.strip()

            if answer:
                return {
                    "department_name": dept_name,
                    "answer": answer,
                    "all_relevant_policy": all_snippets,
                    "source": "foundry_agent",
                }
        except Exception as e:
            print(f"[Azure OpenAI Agent Warning] {e}")

    # Fallback to local policy answer
    return {
        "department_name": dept_name,
        "answer": fallback_snippets[0],
        "all_relevant_policy": fallback_snippets,
        "source": "mock_agent",
    }
