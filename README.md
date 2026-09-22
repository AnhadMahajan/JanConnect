# JanConnect (जन कनेक्ट) — Civic Grievance AI Navigator

JanConnect is an AI-powered municipal and civic grievance navigation platform. It connects citizens to official governance processes via real-time multilingual intake, document intelligence entity extraction, local intent routing, and Azure AI-grounded department specialist agents.

---

## 🏛️ Pipeline Architecture

| Stage | Service / Module | Azure Resource / Tech | Status |
|---|---|---|---|
| **1. Citizen Intake** | `backend/services/intake.py` | Azure AI Translator + Web Speech API / Audio | Live Multilingual (Hindi, Punjabi, English) |
| **2. Document Intelligence** | `backend/services/extraction.py` | Azure Document Intelligence (`prebuilt-layout`) + Azure OpenAI (GPT-5-mini) | Live OCR & Structured Entity Extraction |
| **3. Department Routing** | `backend/services/routing.py` | Keyword & Intent Classifier | Local zero-latency classifier |
| **4. Grounded Agent Response** | `backend/services/agents.py` | Azure AI Search (`department-policies-index`) + Azure OpenAI (GPT-5-mini) | Live Policy Grounding & Response Generation |
| **5. Filing & Tracking** | `backend/services/filing.py` | Ticket Generator & Status Tracker | Active Tracking IDs (`GRV-XXXXXX`) |

---

## ⚙️ Running Locally

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python app.py
```
> Runs on `http://localhost:5001`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
> Runs on `http://localhost:5173` and proxies `/api` calls to the backend.

---

## 🔐 Environment Variables (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and configure your Azure API keys:
- `AZURE_OPENAI_ENDPOINT` & `AZURE_OPENAI_KEY`
- `AZURE_SEARCH_ENDPOINT` & `AZURE_SEARCH_KEY`
- `AZURE_DOC_INTEL_ENDPOINT` & `AZURE_DOC_INTEL_KEY`
- `AZURE_TRANSLATOR_KEY` & `AZURE_TRANSLATOR_REGION`
