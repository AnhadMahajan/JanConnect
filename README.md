# JanConnect (जन कनेक्ट) — Civic Grievance AI Navigator

JanConnect is an AI-powered municipal and civic grievance navigation platform. It connects citizens to official governance processes via real-time multilingual intake, document intelligence entity extraction, local intent routing, and Azure AI-grounded department specialist agents.

---

## 🏛️ Pipeline Architecture

| Stage | Service / Module | Azure Resource / Tech | Status |
|---|---|---|---|
| Stage | Service / Module | Azure Resource / Tech | Status |
|---|---|---|---|
| **1. Citizen Intake** | `backend/services/intake.py` | Azure AI Translator + Azure Cognitive Services Speech | Live Multilingual Voice & Text (Hindi, Punjabi, English) |
| **2. Document Intelligence** | `backend/services/extraction.py` | Azure Document Intelligence (`prebuilt-layout`) + Azure OpenAI (GPT-5-mini) + Azure Blob Storage | Live OCR, Structured Entity Extraction & Cloud Archive |
| **3. Department Routing** | `backend/services/routing.py` | Keyword & Intent Classifier | Local zero-latency classifier |
| **4. Grounded Agent Response** | `backend/services/agents.py` | Azure AI Search (`department-policies-index`) + Azure OpenAI (GPT-5-mini) | Live Policy Grounding & Response Generation |
| **5. Filing & Tracking** | `backend/services/filing.py` & `storage.py` | Azure Table Storage Database + SLA Monitor | Persistent Cloud Tickets (`GRV-XXXXXX`) |

---

## ⚙️ Running Locally

### 1. Backend Setup
```bash
# From project root:
.\.venv\Scripts\python.exe backend/app.py
```
> Server starts on `http://localhost:5001`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
> Runs on `http://localhost:5173` and proxies `/api` calls to the backend on port 5001.

---

## 🧪 Testing & Verification

### Smoke Test Suite (Probes All 6 Azure Cloud Services):
```bash
.\.venv\Scripts\python.exe backend/smoke_test.py
```

### End-to-End API Integration Suite:
```bash
.\.venv\Scripts\python.exe -c "import sys; sys.path.insert(0, 'backend'); import e2e_test"
```

---

## 🔐 Environment Variables (`backend/.env`)

Configure your Azure credentials in `backend/.env`:
- `AZURE_OPENAI_ENDPOINT` & `AZURE_OPENAI_KEY`
- `AZURE_SEARCH_ENDPOINT` & `AZURE_SEARCH_KEY`
- `AZURE_DOC_INTEL_ENDPOINT` & `AZURE_DOC_INTEL_KEY`
- `AZURE_TRANSLATOR_KEY` & `AZURE_TRANSLATOR_REGION`
- `AZURE_SPEECH_KEY` & `AZURE_SPEECH_REGION`
- `AZURE_STORAGE_CONNECTION_STRING` (Azure Table Storage + Blob Storage)

