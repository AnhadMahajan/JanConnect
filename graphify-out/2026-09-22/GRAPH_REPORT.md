# Graph Report - awaazsetu  (2026-09-22)

## Corpus Check
- 23 files · ~17,477 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 1, .example 1, .css 1)

## Summary
- 181 nodes · 257 edges · 14 communities (12 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `20498b5c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- app.py
- agents.py
- filing.py
- intake.py
- extraction.py
- JanConnect (जन कनेक्ट) — Comprehensive Project Architecture & Technical Guide
- AGENTS.md — JanConnect Project Guide for AI Agents
- Quick CLI Reference
- JanConnect (जन कनेक्ट) — Civic Grievance AI Navigator
- rules/graphify.md
- workflows/graphify.md
- policy_qa.py
- speech.py

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
10. `mock_department_response()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `1. Flask API Server (`backend/app.py`)` --references--> `_resolve_complaint_from_request()`  [INFERRED]
  PROJECT_EXPLANATION.md → backend/app.py
- `3. Stage 2: Document Intelligence (`backend/services/extraction.py`)` --references--> `extract_document_from_text()`  [INFERRED]
  PROJECT_EXPLANATION.md → backend/services/extraction.py
- `6. Stage 5: Filing, SLA Tracking & Officer Desk (`backend/services/filing.py`)` --references--> `list_all_complaints()`  [INFERRED]
  PROJECT_EXPLANATION.md → backend/services/filing.py
- `list_complaints()` --calls--> `list_complaints()`  [EXTRACTED]
  backend/app.py → backend/services/intake.py
- `list_documents()` --calls--> `list_available_mock_documents()`  [EXTRACTED]
  backend/app.py → backend/services/extraction.py

## Import Cycles
- None detected.

## Communities (14 total, 2 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.10
Nodes (20): dependencies, react, react-dom, devDependencies, vite, @vitejs/plugin-react, name, private (+12 more)

### Community 1 - "app.py"
Cohesion: 0.09
Nodes (30): admin_complaints_endpoint(), admin_update_status_endpoint(), ask_policy_endpoint(), extract(), extract_file_endpoint(), extract_policy_endpoint(), extract_text_endpoint(), get_policy_sample_endpoint() (+22 more)

### Community 2 - "agents.py"
Cohesion: 0.17
Nodes (14): Stage 4: department agent response (supports custom text or mock id)., respond_endpoint(), _load_departments(), mock_department_response(), Stage 4: Department Agents This module uses Azure AI Search for grounded…, Retrieve grounded policy snippets from Azure AI Search., Executes grounded department agent response. Queries Azure AI Search + Azure…, _search_grounding_policies() (+6 more)

### Community 3 - "filing.py"
Cohesion: 0.14
Nodes (17): status_endpoint(), file_complaint(), get_status(), _get_table_client(), list_all_complaints(), Stage 5: Filing & Tracking Supports: 1. Azure Table Storage (`complaints`…, Files a citizen complaint into Azure Table Storage (and caches in-memory)., Fetches complaint status from Azure Table Storage, falling back to in-memory… (+9 more)

### Community 4 - "intake.py"
Cohesion: 0.10
Nodes (23): file_complaint_endpoint(), get_complaint(), Helper to resolve complaint from either an existing ID or manual custom user…, Stage 5: filing (supports custom text or mock id)., Stage 3: department routing (supports custom text or mock id)., _resolve_complaint_from_request(), route_endpoint(), get_complaint() (+15 more)

### Community 5 - "extraction.py"
Cohesion: 0.21
Nodes (12): extract_document(), extract_document_from_bytes(), extract_document_from_text(), list_available_mock_documents(), _load_documents(), Stage 2: Document Extraction & Content Understanding Supports: 1. Live Azure…, Uses Azure OpenAI (gpt-5-mini) to extract all structured key-value entities…, Fallback / Mock document loader. (+4 more)

### Community 6 - "JanConnect (जन कनेक्ट) — Comprehensive Project Architecture & Technical Guide"
Cohesion: 0.25
Nodes (7): Adding a New Municipal Department (e.g., Sanitation / Roads):, 🗺️ Codebase Knowledge Graph (Graphify), 📖 Executive Summary, 🛠️ How to Extend JanConnect, JanConnect (जन कनेक्ट) — Comprehensive Project Architecture & Technical Guide, 🔒 Security & Environment Variables, 🏛️ System Architecture Diagram

### Community 7 - "AGENTS.md — JanConnect Project Guide for AI Agents"
Cohesion: 0.20
Nodes (9): 1. Project Overview, 2. Directory Structure, 3. Backend API Endpoints (`backend/app.py`), 4. Live Cloud Services & Fallback Architecture, 5. Knowledge Graph & Navigation (Graphify), 6. How to Run & Verify, 7. Guidelines for Modifying Code, AGENTS.md — JanConnect Project Guide for AI Agents (+1 more)

### Community 8 - "Quick CLI Reference"
Cohesion: 0.29
Nodes (6): 1. Build / Update the Knowledge Graph, 2. Query the Knowledge Graph, 3. Generate Visualizations & Reports, Generated Artifacts, Graphify — Codebase Knowledge Graph Skill, Quick CLI Reference

### Community 9 - "JanConnect (जन कनेक्ट) — Civic Grievance AI Navigator"
Cohesion: 0.29
Nodes (6): 1. Backend Setup, 2. Frontend Setup, 🔐 Environment Variables (`backend/.env`), JanConnect (जन कनेक्ट) — Civic Grievance AI Navigator, 🏛️ Pipeline Architecture, ⚙️ Running Locally

### Community 12 - "policy_qa.py"
Cohesion: 0.17
Nodes (11): answer_policy_doubt(), extract_policy_content(), get_sample_policy(), list_sample_policies(), Government Policy AI Clarifier & Doubts Resolution Service Supports: 1. Parsing…, Returns catalog of pre-loaded government schemes., Retrieves full text of a pre-loaded scheme., Extracts policy text from uploaded files (PDF, image, text) using Azure… (+3 more)

### Community 13 - "speech.py"
Cohesion: 0.33
Nodes (5): Stage 1 Helper: Audio & Voice Transcription Service Supports: 1. Azure…, Transcribes uploaded audio bytes (WAV, MP3, M4A, OGG) to text. Uses Azure…, transcribe_audio(), dotenv, tempfile

## Knowledge Gaps
- **38 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+33 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 95 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `🔍 Detailed Component Walkthrough` connect `intake.py` to `filing.py`, `extraction.py`, `JanConnect (जन कनेक्ट) — Comprehensive Project Architecture & Technical Guide`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Why does `_resolve_complaint_from_request()` connect `intake.py` to `app.py`, `agents.py`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _38 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09782608695652174 - nodes in this community are weakly interconnected._
- **Should `app.py` be split into smaller, more focused modules?**
  _Cohesion score 0.08669354838709678 - nodes in this community are weakly interconnected._
- **Should `filing.py` be split into smaller, more focused modules?**
  _Cohesion score 0.13725490196078433 - nodes in this community are weakly interconnected._
- **Should `intake.py` be split into smaller, more focused modules?**
  _Cohesion score 0.10144927536231885 - nodes in this community are weakly interconnected._