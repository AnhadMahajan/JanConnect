"""
Stage 2: Document Extraction & Content Understanding

Supports:
1. Live Azure Document Intelligence SDK (prebuilt-layout model) for OCR and layout parsing on uploaded files.
2. Azure OpenAI (gpt-5-mini) with robust JSON parsing to structure extracted OCR text into rich municipal key-value entities.
3. Fallback to mock documents for testing.
"""

import io
import json
import os
import re
from dotenv import load_dotenv

ENV_PATH = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(ENV_PATH)


MOCK_PATH = os.path.join(
    os.path.dirname(__file__), "..", "mock_data", "citizen_documents.json"
)


def _load_documents():
    with open(MOCK_PATH, "r") as f:
        return json.load(f)


def extract_document(doc_id: str) -> dict:
    """Fallback / Mock document loader."""
    docs = _load_documents()
    if doc_id not in docs:
        raise ValueError(f"Unknown mock document id: {doc_id}")
    return docs[doc_id]


def list_available_mock_documents() -> list:
    return list(_load_documents().keys())


def extract_document_from_bytes(file_bytes: bytes, content_type: str = "application/pdf", file_name: str = None) -> dict:
    """
    Analyzes an uploaded citizen document (PDF, PNG, JPG) using Azure Document Intelligence,
    persists attachment to Azure Blob Storage, and extracts structured entities via Azure OpenAI.
    """
    from services import storage

    endpoint = os.getenv("AZURE_DOC_INTEL_ENDPOINT")
    key = os.getenv("AZURE_DOC_INTEL_KEY")
    extracted_text = ""

    # Optional: Persist copy to Azure Blob Storage
    blob_url = None
    if file_name and file_bytes:
        safe_name = f"{int(os.times().system * 1000)}_{os.path.basename(file_name)}"
        blob_url = storage.upload_document_blob(safe_name, file_bytes, content_type)

    # If plain text file, parse directly with Azure OpenAI without calling OCR
    is_plain_text = (
        (file_name and file_name.lower().endswith((".txt", ".csv", ".json", ".log")))
        or content_type in ("text/plain", "text/csv", "application/json")
    )

    if is_plain_text:
        try:
            raw_text = file_bytes.decode("utf-8", errors="ignore").strip()
            if raw_text:
                structured = extract_document_from_text(raw_text)
                structured["_source"] = "Plain Document + Azure OpenAI (GPT-5-mini)"
                if blob_url:
                    structured["_blob_url"] = blob_url
                return structured
        except Exception as e:
            print(f"[Plain text extraction notice] {e}")

    # Detect supported binary formats for Azure Document Intelligence
    if file_bytes.startswith(b"%PDF"):
        actual_content_type = "application/pdf"
    elif file_bytes.startswith(b"\x89PNG"):
        actual_content_type = "image/png"
    elif file_bytes.startswith(b"\xff\xd8"):
        actual_content_type = "image/jpeg"
    elif file_bytes.startswith(b"II*\x00") or file_bytes.startswith(b"MM\x00*"):
        actual_content_type = "image/tiff"
    elif file_bytes.startswith(b"BM"):
        actual_content_type = "image/bmp"
    else:
        actual_content_type = content_type if content_type in ("application/pdf", "image/png", "image/jpeg", "image/tiff") else None

    if endpoint and key and "<your" not in endpoint and actual_content_type:
        try:
            from azure.core.credentials import AzureKeyCredential
            from azure.ai.documentintelligence import DocumentIntelligenceClient

            client = DocumentIntelligenceClient(
                endpoint=endpoint,
                credential=AzureKeyCredential(key)
            )

            # Analyze document with prebuilt-layout
            poller = client.begin_analyze_document(
                model_id="prebuilt-layout",
                body=io.BytesIO(file_bytes),
                content_type=actual_content_type
            )
            result = poller.result()

            if hasattr(result, "content") and result.content:
                extracted_text = result.content
                print(f"[Doc Intel Success] Extracted {len(extracted_text)} characters of OCR text.")

        except Exception as e:
            print(f"[Azure Document Intelligence Warning] {e}")

    # If OCR text was retrieved, extract structured entities using Azure OpenAI
    if extracted_text:
        structured = extract_document_from_text(extracted_text)
        structured["_source"] = "Azure Document Intelligence + Azure OpenAI (GPT-5-mini)"
        if blob_url:
            structured["_blob_url"] = blob_url
        return structured

    # Safe Fallback: Check if file is a binary document (PDF / Image) vs plain text
    is_binary = (
        file_bytes.startswith(b"%PDF")
        or file_bytes.startswith(b"\x89PNG")
        or file_bytes.startswith(b"\xff\xd8")
        or file_bytes.startswith(b"II*\x00")
    )

    if is_binary:
        return {
            "DOCUMENT_TYPE": "Binary Document (PDF / Image Attachment)",
            "STATUS": "Attachment Registered",
            "FILE_SIZE_KB": round(len(file_bytes) / 1024, 2),
            "CONTENT_TYPE": content_type or "application/octet-stream",
            "VERIFICATION_NOTICE": "Attached to grievance dossier for official municipal inspection.",
            "_source": "Azure Storage Attachment Store",
            "_blob_url": blob_url or ""
        }

    # Plain text document fallback
    try:
        raw_preview = file_bytes[:3000].decode("utf-8", errors="ignore").strip()
        if raw_preview and any(c.isalnum() for c in raw_preview):
            structured = extract_document_from_text(raw_preview)
            if blob_url:
                structured["_blob_url"] = blob_url
            return structured
    except Exception:
        pass

    return {
        "DOCUMENT_TYPE": "Uploaded Citizen Attachment",
        "STATUS": "File received",
        "_source": "Local Store",
        "_blob_url": blob_url or ""
    }



def extract_document_from_text(doc_text: str) -> dict:
    """
    Uses Azure OpenAI (gpt-5-mini) to extract all structured key-value entities
    from raw/pasted/OCR document text with robust JSON sanitization.
    """
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
                "You are an expert document analysis engine for Indian civic and municipal records, specifically configured for Chandigarh (MCC water bills, CPDL electricity bills, e-Sampark receipts, property tax, voter ID).\n"
                "Extract ALL available details from the document text below into a clean JSON dictionary.\n\n"
                "Include all identifiable fields present in the text, such as:\n"
                "- SERVICE_PROVIDER (e.g. Municipal Corporation Chandigarh - MCC, Chandigarh Power Distribution Limited - CPDL, e-Sampark)\n"
                "- CITIZEN_NAME / CONSUMER_NAME\n"
                "- CA_NUMBER / CONSUMER_NUMBER / ACCOUNT_NUMBER\n"
                "- CHANDIGARH_SECTOR / WARD\n"
                "- BILL_DATE\n"
                "- DUE_DATE\n"
                "- BILL_PERIOD\n"
                "- SANCTIONED_LOAD\n"
                "- TARIFF_CATEGORY / CONNECTION_TYPE\n"
                "- CURRENT_METER_READING / PREVIOUS_METER_READING\n"
                "- UNITS_CONSUMED_KL / UNITS_CONSUMED_KWH\n"
                "- WATER_CHARGES / SEWERAGE_CESS\n"
                "- NET_AMOUNT_PAYABLE / AMOUNT_DUE\n"
                "- SERVICE_ADDRESS / BILLING_ADDRESS\n\n"
                "Return ONLY a single valid JSON object. Keys must be clean UPPERCASE names with underscores. "
                "Do NOT include empty or null keys.\n\n"
                f"Document OCR Text:\n\"\"\"\n{doc_text}\n\"\"\""
            )

            resp = client.chat.completions.create(
                model=openai_deployment,
                messages=[{"role": "user", "content": prompt}],
                max_completion_tokens=1500,
            )

            content = resp.choices[0].message.content.strip()
            
            # Strip potential ```json ... ``` markdown code fences
            clean_json_str = re.sub(r"^```json\s*", "", content, flags=re.IGNORECASE)
            clean_json_str = re.sub(r"^```\s*", "", clean_json_str)
            clean_json_str = re.sub(r"\s*```$", "", clean_json_str).strip()
            
            # Find the JSON object boundaries
            start_idx = clean_json_str.find("{")
            end_idx = clean_json_str.rfind("}")
            if start_idx != -1 and end_idx != -1:
                clean_json_str = clean_json_str[start_idx : end_idx + 1]

            data = json.loads(clean_json_str)
            data["_source"] = "Azure Document Intelligence + Azure OpenAI (GPT-5-mini)"
            return data
        except Exception as e:
            print(f"[LLM Entity Extraction Warning] {e}")

    # Fallback regex parser from raw text if LLM call fails
    extracted = {"_source": "Local OCR Parser"}
    for line in doc_text.splitlines():
        if ":" in line:
            parts = line.split(":", 1)
            k = parts[0].strip().upper().replace(" ", "_")
            v = parts[1].strip()
            if k and v and len(k) < 30:
                extracted[k] = v
    if len(extracted) > 1:
        return extracted

    return {
        "DOCUMENT_TYPE": "Civic Record",
        "PREVIEW": doc_text[:120],
        "_source": "local_parser"
    }
