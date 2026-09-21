# JanConnect (जन कनेक्ट) — Comprehensive Project Architecture & Technical Guide

---

## 📖 Executive Summary

**JanConnect** is an AI-powered civic grievance navigation system engineered to bridge the gap between Indian citizens and municipal authorities. Public administration processes—such as billing disputes, electricity outages, and Right to Information (RTI) filings—are often bogged down by bureaucratic complexity, confusing jurisdictional boundaries, and language barriers. 

JanConnect solves this by implementing an autonomous **5-Stage Agentic Pipeline**:
1. **Multilingual Intake**: Transcribes and translates citizen complaints across regional Indian languages (Hindi, Punjabi, English).
2. **Document Intelligence**: Performs layout-aware OCR on uploaded proof documents (water bills, electricity bills, voter ID cards) and extracts structured JSON entities.
3. **Intent-Based Routing**: Accurately maps the grievance to the correct administrative department using zero-latency keyword and intent overlap algorithms.
4. **Policy-Grounded Specialist Agent**: Retrieves authoritative legal guidelines and municipal SLAs via Azure AI Search, prompting a reasoning model (GPT-5-mini) to generate verified citizen guidance.
5. **Filing & SLA Tracking**: Issues unique official tracking identifiers (`GRV-XXXXXX`) backed by an MCP-ready ticket store with transparent SLA deadlines.

---

## 🏛️ System Architecture Diagram

```
                       ┌──────────────────────────────────────┐
                       │     Citizen User (Web / Mobile)      │
                       │    Text / Voice / Document Upload    │
                       └──────────────────┬───────────────────┘
                                          │
                                          ▼
                ┌────────────────────────────────────────────────────┐
                │          Frontend (React 18 + Vite)                │
                │  • 5-Stage Stepper   • Voice Dictation (WebSpeech) │
                │  • Document Dropzone • Real-Time Tracking Lookup   │
                └─────────────────────────┬──────────────────────────┘
                                          │ HTTP Proxy (/api)
                                          ▼
                ┌────────────────────────────────────────────────────┐
                │             Backend Gateway (Flask API)            │
                │                     `app.py`                       │
                └──────┬──────────────┬─────────────┬───────────┬────┘
                       │              │             │           │
      ┌────────────────┘              │             │           └────────────────┐
      ▼                               ▼             ▼                            ▼
┌──────────────┐             ┌──────────────┐ ┌──────────────┐            ┌──────────────┐
│   Stage 1:   │             │   Stage 2:   │ │   Stage 3:   │            │ Stage 4 & 5: │
│ Intake & NLP │             │ Document AI  │ │ Routing Unit │            │ Agent & File │
└──────┬───────┘             └──────┬───────┘ └──────┬───────┘            └──────┬───────┘
       │                            │                │                           │
       ▼                            ▼                ▼                           ▼
┌──────────────┐             ┌──────────────┐ ┌──────────────┐            ┌──────────────┐
│   Azure AI   │             │   Azure Doc  │ │   Keyword    │            │ Azure Search │
│  Translator  │             │ Intelligence │ │  Classifier  │            │ (Policy RAG) │
└──────────────┘             └──────┬───────┘ └──────────────┘            └──────┬───────┘
                                    │                                            │
                                    ▼                                            ▼
                             ┌──────────────┐                             ┌──────────────┐
                             │ Azure OpenAI │                             │ Azure OpenAI │
                             │ (GPT-5-mini) │                             │ (GPT-5-mini) │
                             └──────────────┘                             └──────┬───────┘
                                                                                 │
                                                                                 ▼
                                                                          ┌──────────────┐
                                                                          │ MCP Ticket & │
                                                                          │  Status DB   │
                                                                          └──────────────┘
```

---

## 🔍 Detailed Component Walkthrough

### 1. Flask API Server (`backend/app.py`)
Acts as the central orchestrator and gateway.
- **Unified Request Resolver (`_resolve_complaint_from_request`)**: Seamlessly accommodates both manual live citizen input (`raw_text`, `citizen_name`) and predefined scenario IDs (`complaint_id`). When custom text is provided, it dynamically calls Azure Translator to normalize non-English text.
- **Routing Endpoints**:
  - `POST /api/respond`: Chained execution of intake normalization, routing classification, and grounded AI agent response.
  - `POST /api/file-complaint`: Registers a ticket with department assignment, citizen name, complaint summary, and generates a tracking ID.
  - `GET /api/status/<tracking_id>`: Looks up real-time complaint status.
  - `POST /api/extract-file`: Handles multipart uploads (`PDF`, `PNG`, `JPG`), streaming bytes to Azure Document Intelligence.
  - `POST /api/extract-text`: Direct text entity extraction for pasted documents.

### 2. Stage 1: Multilingual Intake (`backend/services/intake.py`)
- **`translate_text(text)`**: Uses the Azure AI Translator REST API (`/translate?api-version=3.0&to=en`). Auto-detects input language (`hi`, `pa`, etc.). If the language is not English, returns both the detected language code and an English working copy.
- **Fallback**: Returns the raw text as working text if translator keys are missing.

### 3. Stage 2: Document Intelligence (`backend/services/extraction.py`)
- **`extract_document_from_bytes(file_bytes, content_type)`**: 
  - Streams binary file bytes to Azure Document Intelligence using the `prebuilt-layout` model.
  - Retrieves full OCR content and text structure.
  - Passes extracted text to `extract_document_from_text()`.
- **`extract_document_from_text(doc_text)`**:
  - Invokes Azure OpenAI (`gpt-5-mini`) with a specialized prompt requesting clean uppercase JSON key-value pairs (e.g., `CITIZEN_NAME`, `CA_NUMBER`, `BILL_DATE`, `UNITS_CONSUMED_KWH`, `NET_AMOUNT_PAYABLE`).
  - Employs token budget allocation (`max_completion_tokens=1500`) and markdown fence stripping to prevent JSON parsing errors.

### 4. Stage 3: Department Routing Classifier (`backend/services/routing.py`)
- **`route_complaint(complaint_text)`**:
  - Loads department profiles from `backend/mock_data/department_policies.json`.
  - Performs case-insensitive keyword overlap scoring against domain lexicons (e.g. `["water", "meter", "bill", "leak"]` vs `["electricity", "power", "outage", "bijli", "transformer"]`).
  - Returns best matching department ID, official name, and match score.

### 5. Stage 4: Grounded Specialist Agents (`backend/services/agents.py`)
- **`_search_grounding_policies(query, department_name)`**:
  - Uses `azure.search.documents.SearchClient` to query the Azure AI Search index (`department-policies-index`).
  - Retrieves relevant policy clauses and municipal SLA constraints.
- **`mock_department_response(department_id, complaint_text)`**:
  - Constructs a grounded prompt combining the citizen's complaint with retrieved policy clauses.
  - Executes Azure OpenAI (`gpt-5-mini`) with `DEPARTMENT_AGENT_PROMPT` to synthesize an authoritative advisory with specific resolution timelines and escalation steps.

### 6. Stage 5: Filing & Status Tracking (`backend/services/filing.py`)
- **`file_complaint(...)`**: Generates a cryptographically randomized tracking identifier (`GRV-XXXXXX`) and persists the complaint record.
- **`get_status(tracking_id)`**: Returns current progress state (`Filed`, `Under Verification`, `Assigned to Field Engineer`, `Resolved`).

### 7. Frontend User Interface (`frontend/src/App.jsx` & `index.css`)
- **Visual 5-Stage Stepper Ribbon**: Tracks citizen progress through the resolution lifecycle.
- **Dual Intake Modes**:
  - ✍️ *Manual Entry / Voice*: Allows custom typing or voice dictation via browser `SpeechRecognition` in Hindi/English, supplemented with quick suggestion chips.
  - 📂 *Sample Library*: Immediate access to pre-configured test scenarios.
- **Document Intelligence Tab**:
  - Drag-and-drop file upload for PDFs/images with live progress feedback.
  - Plain-text document parser with one-click templates (Municipal Water Bill, Electricity Board Bill, RTI Form).
  - Clean table visualizer for extracted key-value entities.
- **Live Status Tracker Tab**: Instant search for any `GRV-XXXXXX` tracking ID.
- **Department Knowledge Matrix Tab**: Public directory of supported municipal cells, keywords, and statutory resolution SLAs.

---

## 🔒 Security & Environment Variables

All secrets reside in `backend/.env`, strictly excluded from version control via `.gitignore`:

```env
# Azure OpenAI (Foundry)
AZURE_OPENAI_ENDPOINT=https://<your-foundry-resource>.openai.azure.com/
AZURE_OPENAI_KEY=<your-key>
AZURE_OPENAI_DEPLOYMENT=gpt-5-mini

# Azure AI Search
AZURE_SEARCH_ENDPOINT=https://<your-search-resource>.search.windows.net
AZURE_SEARCH_KEY=<your-key>
AZURE_SEARCH_INDEX=department-policies-index

# Azure Speech & Translator
AZURE_SPEECH_KEY=<your-key>
AZURE_SPEECH_REGION=eastus2
AZURE_TRANSLATOR_KEY=<your-key>
AZURE_TRANSLATOR_REGION=eastus2
AZURE_TRANSLATOR_ENDPOINT=https://api.cognitive.microsofttranslator.com/

# Azure Document Intelligence
AZURE_DOC_INTEL_ENDPOINT=https://<your-doc-intel>.cognitiveservices.azure.com/
AZURE_DOC_INTEL_KEY=<your-key>
```

---

## 🗺️ Codebase Knowledge Graph (Graphify)

JanConnect features an integrated AST-parsed knowledge graph in `graphify-out/`:
- **Interactive Visualizer**: Open `graphify-out/graph.html` in any browser.
- **Mermaid Call-Flow Architecture**: Open `graphify-out/awaazsetu-callflow.html` for complete function interaction charts.
- **Codebase Querying**:
  ```bash
  graphify query "How does intake routing connect to department agents?"
  graphify path "route_complaint" "mock_department_response"
  graphify explain "_resolve_complaint_from_request"
  ```
- **Wiki**: Browse `graphify-out/wiki/index.md` for article-level component explanations.

---

## 🛠️ How to Extend JanConnect

### Adding a New Municipal Department (e.g., Sanitation / Roads):
1. **Add Department Profile**: In `backend/mock_data/department_policies.json`, define the new department key (e.g. `"sanitation"`), official name, keyword triggers (e.g. `["garbage", "waste", "cleaning", "drainage"]`), and official policy snippets.
2. **Update Policy Index**: Add the department's statutory policies to `policies.txt` and re-index in Azure AI Search.
3. **Frontend UI Badge**: Add the department entry and icon (`🧹`) to `departmentsList` in `frontend/src/App.jsx`.
4. **Update Knowledge Graph**: Run `graphify update .` to map the new connections.
