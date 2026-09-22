# Graph Report - awaazsetu  (2026-09-22)

## Corpus Check
- 23 files · ~18,346 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 1, .example 1, .css 1)

## Summary
- 185 nodes · 266 edges · 17 communities (15 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `20498b5c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- app.py
- extraction.py
- filing.py
- intake.py
- extract_document_from_bytes
- 🔍 Detailed Component Walkthrough
- AGENTS.md — JanConnect Project Guide for AI Agents
- Quick CLI Reference
- JanConnect (जन कनेक्ट) — Civic Grievance AI Navigator
- rules/graphify.md
- workflows/graphify.md
- get_policy_sample_endpoint
- transcribe_audio_endpoint
- extract_policy_endpoint
- ask_policy_endpoint
- list_policy_samples_endpoint

## God Nodes (most connected - your core abstractions)
1. `🔍 Detailed Component Walkthrough` - 9 edges
2. `_resolve_complaint_from_request()` - 8 edges
3. `AGENTS.md — JanConnect Project Guide for AI Agents` - 8 edges
4. `respond_endpoint()` - 7 edges
5. `file_complaint_endpoint()` - 7 edges
6. `JanConnect (जन कनेक्ट) — Comprehensive Project Architecture & Technical Guide` - 7 edges
7. `route_endpoint()` - 6 edges
8. `_get_table_client()` - 6 edges
9. `route_complaint()` - 6 edges
10. `extract_policy_endpoint()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `1. Flask API Server (`backend/app.py`)` --references--> `_resolve_complaint_from_request()`  [INFERRED]
  PROJECT_EXPLANATION.md → backend/app.py
- `3. Stage 2: Document Intelligence (`backend/services/extraction.py`)` --references--> `extract_document_from_text()`  [INFERRED]
  PROJECT_EXPLANATION.md → backend/services/extraction.py
- `6. Stage 5: Filing, SLA Tracking & Officer Desk (`backend/services/filing.py`)` --references--> `list_all_complaints()`  [INFERRED]
  PROJECT_EXPLANATION.md → backend/services/filing.py
- `_resolve_complaint_from_request()` --calls--> `get_complaint()`  [EXTRACTED]
  backend/app.py → backend/services/intake.py
- `_resolve_complaint_from_request()` --calls--> `translate_text()`  [EXTRACTED]
  backend/app.py → backend/services/intake.py

## Import Cycles
- None detected.

## Communities (17 total, 2 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.10
Nodes (20): dependencies, react, react-dom, devDependencies, vite, @vitejs/plugin-react, name, private (+12 more)

### Community 1 - "app.py"
Cohesion: 0.10
Nodes (29): admin_complaints_endpoint(), admin_update_status_endpoint(), extract(), extract_text_endpoint(), file_complaint_endpoint(), get_complaint(), list_complaints(), Stage 4: department agent response (supports custom text or mock id). (+21 more)

### Community 2 - "extraction.py"
Cohesion: 0.12
Nodes (20): list_documents(), _load_departments(), mock_department_response(), Stage 4: Department Agents This module uses Azure AI Search for grounded…, Retrieve grounded policy snippets from Azure AI Search., Executes grounded department agent response. Queries Azure AI Search + Azure…, _search_grounding_policies(), extract_document() (+12 more)

### Community 3 - "filing.py"
Cohesion: 0.13
Nodes (19): status_endpoint(), file_complaint(), get_status(), _get_table_client(), list_all_complaints(), Stage 5: Filing & Tracking Supports: 1. Azure Table Storage (`complaints`…, Uploads an official citizen grievance dossier/report as formatted JSON into…, Files a citizen complaint into Azure Table Storage and stores official dossier… (+11 more)

### Community 4 - "intake.py"
Cohesion: 0.20
Nodes (11): Translates policy answer into target Indian regional language., translate_policy_endpoint(), get_complaint(), list_complaints(), _load_complaints(), Stage 1: Intake & Multilingual Processing Supports Azure AI Translator for…, Uses Azure AI Translator to detect language and translate to English., Translates text into any target language (e.g. hi, pa, bn, ta, te, mr, en). (+3 more)

### Community 5 - "extract_document_from_bytes"
Cohesion: 0.22
Nodes (9): extract_file_endpoint(), Stage 2: extract entities from uploaded document file using Azure Document…, extract_document_from_bytes(), extract_document_from_text(), Uses Azure OpenAI (gpt-5-mini) to extract all structured key-value entities…, Uploads an uploaded citizen document to Azure Blob Storage ('citizendocuments'…, Analyzes an uploaded citizen document (PDF, PNG, JPG) using Azure Document…, upload_document_to_blob() (+1 more)

### Community 6 - "🔍 Detailed Component Walkthrough"
Cohesion: 0.14
Nodes (13): 2. Stage 1: Multilingual Intake & Audio Transcription (`backend/services/intake.py` & `speech.py`), 4. Stage 3: Department Routing Classifier (`backend/services/routing.py`), 5. Stage 4: Grounded Specialist Agents (`backend/services/agents.py`), 7. Stage 6: Government Policy Clarifier & Multilingual Q&A (`backend/services/policy_qa.py` & `intake.py`), 8. Frontend User Interface (`frontend/src/App.jsx` & `index.css`), Adding a New Municipal Department (e.g., Sanitation / Roads):, 🗺️ Codebase Knowledge Graph (Graphify), 🔍 Detailed Component Walkthrough (+5 more)

### Community 7 - "AGENTS.md — JanConnect Project Guide for AI Agents"
Cohesion: 0.20
Nodes (9): 1. Project Overview, 2. Directory Structure, 3. Backend API Endpoints (`backend/app.py`), 4. Live Cloud Services & Fallback Architecture, 5. Knowledge Graph & Navigation (Graphify), 6. How to Run & Verify, 7. Guidelines for Modifying Code, AGENTS.md — JanConnect Project Guide for AI Agents (+1 more)

### Community 8 - "Quick CLI Reference"
Cohesion: 0.29
Nodes (6): 1. Build / Update the Knowledge Graph, 2. Query the Knowledge Graph, 3. Generate Visualizations & Reports, Generated Artifacts, Graphify — Codebase Knowledge Graph Skill, Quick CLI Reference

### Community 9 - "JanConnect (जन कनेक्ट) — Civic Grievance AI Navigator"
Cohesion: 0.29
Nodes (6): 1. Backend Setup, 2. Frontend Setup, 🔐 Environment Variables (`backend/.env`), JanConnect (जन कनेक्ट) — Civic Grievance AI Navigator, 🏛️ Pipeline Architecture, ⚙️ Running Locally

### Community 12 - "get_policy_sample_endpoint"
Cohesion: 0.50
Nodes (4): get_policy_sample_endpoint(), Returns full text of a pre-loaded scheme., get_sample_policy(), Retrieves full text of a pre-loaded scheme.

### Community 13 - "transcribe_audio_endpoint"
Cohesion: 0.50
Nodes (4): Stage 1: Speech-to-Text audio file transcription via Azure Speech SDK., transcribe_audio_endpoint(), Transcribes uploaded audio bytes (WAV, MP3, M4A, OGG) to text. Uses Azure…, transcribe_audio()

### Community 14 - "extract_policy_endpoint"
Cohesion: 0.40
Nodes (6): extract_policy_endpoint(), Extracts text from uploaded policy document (PDF/Image/Text)., extract_policy_content(), Uploads an official government policy circular into Azure Blob Storage…, Extracts policy text from uploaded files (PDF, image, text) using Azure…, upload_policy_to_blob()

### Community 15 - "ask_policy_endpoint"
Cohesion: 0.50
Nodes (4): ask_policy_endpoint(), Answers citizen doubt grounded in policy text with clause citations., answer_policy_doubt(), Uses Azure OpenAI (gpt-5-mini) to clarify citizen doubts with grounded clause…

### Community 16 - "list_policy_samples_endpoint"
Cohesion: 0.50
Nodes (4): list_policy_samples_endpoint(), Returns catalog of pre-loaded official government schemes., list_sample_policies(), Returns catalog of pre-loaded government schemes.

## Knowledge Gaps
- **38 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+33 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 97 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `🔍 Detailed Component Walkthrough` connect `🔍 Detailed Component Walkthrough` to `app.py`, `filing.py`, `extract_document_from_bytes`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Why does `_resolve_complaint_from_request()` connect `app.py` to `intake.py`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Why does `1. Flask API Server (`backend/app.py`)` connect `app.py` to `🔍 Detailed Component Walkthrough`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _38 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09782608695652174 - nodes in this community are weakly interconnected._
- **Should `app.py` be split into smaller, more focused modules?**
  _Cohesion score 0.0967741935483871 - nodes in this community are weakly interconnected._
- **Should `extraction.py` be split into smaller, more focused modules?**
  _Cohesion score 0.12318840579710146 - nodes in this community are weakly interconnected._