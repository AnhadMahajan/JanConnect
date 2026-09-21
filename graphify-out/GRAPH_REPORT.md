# Graph Report - JanConnect  (2026-09-21)

## Corpus Check
- 31 files · ~16,899 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 196 nodes · 282 edges · 15 communities (13 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `20498b5c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- mock_department_response
- routing.py
- storage.py
- intake.py
- app.py
- App.jsx
- 🔍 Detailed Component Walkthrough
- AGENTS.md — JanConnect Project Guide for AI Agents
- Quick CLI Reference
- JanConnect (जन कनेक्ट) — Civic Grievance AI Navigator
- rules/graphify.md
- workflows/graphify.md
- extraction.py

## God Nodes (most connected - your core abstractions)
1. `route_complaint()` - 8 edges
2. `AGENTS.md — JanConnect Project Guide for AI Agents` - 8 edges
3. `🔍 Detailed Component Walkthrough` - 8 edges
4. `_resolve_complaint_from_request()` - 7 edges
5. `respond_endpoint()` - 7 edges
6. `file_complaint_endpoint()` - 7 edges
7. `JanConnect (जन कनेक्ट) — Comprehensive Project Architecture & Technical Guide` - 7 edges
8. `route_endpoint()` - 6 edges
9. `mock_department_response()` - 5 edges
10. `extract_document_from_bytes()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `get_departments_endpoint()` --calls--> `get_departments()`  [EXTRACTED]
  backend/app.py → backend/services/storage.py
- `list_grievances_endpoint()` --calls--> `list_all_complaints()`  [EXTRACTED]
  backend/app.py → backend/services/storage.py
- `list_complaints()` --calls--> `list_complaints()`  [EXTRACTED]
  backend/app.py → backend/services/intake.py
- `get_complaint()` --calls--> `get_complaint()`  [EXTRACTED]
  backend/app.py → backend/services/intake.py
- `transcribe_audio_endpoint()` --calls--> `transcribe_audio()`  [EXTRACTED]
  backend/app.py → backend/services/intake.py

## Import Cycles
- None detected.

## Communities (15 total, 2 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.11
Nodes (18): dependencies, react, react-dom, devDependencies, vite, @vitejs/plugin-react, name, private (+10 more)

### Community 1 - "mock_department_response"
Cohesion: 0.25
Nodes (8): _load_departments(), mock_department_response(), Loads department metadata dynamically from Azure Table Storage., Retrieve grounded policy snippets from Azure AI Search., Executes grounded department agent response. Queries Azure AI Search + Azure…, _search_grounding_policies(), get_departments(), Retrieves all municipal departments dynamically from Azure Table Storage.

### Community 2 - "routing.py"
Cohesion: 0.24
Nodes (10): detect_chandigarh_sector(), _keyword_matches(), _load_departments(), Stage 3: Department Routing & Chandigarh Sector Detection This module performs:…, Loads department metadata dynamically from Azure Table Storage., Extracts mentioned Chandigarh sector or area from grievance text., Accurate keyword matching with word boundaries for short words to avoid…, Returns the best-matching department id + name + score, along with any detected… (+2 more)

### Community 3 - "storage.py"
Cohesion: 0.21
Nodes (12): file_complaint(), advance_complaint_status(), _get_azure_blob_container(), _get_azure_table_client(), get_complaint(), list_all_complaints(), Azure Storage Service for JanConnect Provides durable cloud storage for: 1.…, Advances ticket status for demonstration: Filed -> Assigned to Field Officer ->… (+4 more)

### Community 4 - "intake.py"
Cohesion: 0.15
Nodes (18): file_complaint_endpoint(), Stage 3: department routing (supports custom text or mock id)., Stage 4: department agent response (supports custom text or mock id)., Stage 5: filing (supports custom text or mock id, persisted to Azure Storage)., Helper to resolve complaint from either an existing ID or manual custom user…, _resolve_complaint_from_request(), respond_endpoint(), route_endpoint() (+10 more)

### Community 5 - "app.py"
Cohesion: 0.09
Nodes (28): advance_status_endpoint(), extract(), extract_file_endpoint(), extract_text_endpoint(), get_complaint(), get_departments_endpoint(), health_endpoint(), list_complaints() (+20 more)

### Community 6 - "App.jsx"
Cohesion: 0.17
Nodes (9): App(), DEFAULT_CHANDIGARH_COMPLAINTS, DepartmentMatrix(), DocumentIntelligence(), GrievanceNavigator(), Navbar(), PipelineStepper(), StatusTracker() (+1 more)

### Community 7 - "🔍 Detailed Component Walkthrough"
Cohesion: 0.12
Nodes (15): 1. Flask API Server (`backend/app.py`), 2. Stage 1: Multilingual Intake (`backend/services/intake.py`), 3. Stage 2: Document Intelligence (`backend/services/extraction.py`), 4. Stage 3: Department Routing Classifier (`backend/services/routing.py`), 5. Stage 4: Grounded Specialist Agents (`backend/services/agents.py`), 6. Stage 5: Filing & Status Tracking (`backend/services/filing.py`), 7. Frontend User Interface (`frontend/src/App.jsx` & `index.css`), Adding a New Municipal Department (e.g., Sanitation / Roads): (+7 more)

### Community 8 - "AGENTS.md — JanConnect Project Guide for AI Agents"
Cohesion: 0.20
Nodes (9): 1. Project Overview, 2. Directory Structure, 3. Backend API Endpoints (`backend/app.py`), 4. Live Cloud Services & Fallback Architecture, 5. Knowledge Graph & Navigation (Graphify), 6. How to Run & Verify, 7. Guidelines for Modifying Code, AGENTS.md — JanConnect Project Guide for AI Agents (+1 more)

### Community 9 - "Quick CLI Reference"
Cohesion: 0.29
Nodes (6): 1. Build / Update the Knowledge Graph, 2. Query the Knowledge Graph, 3. Generate Visualizations & Reports, Generated Artifacts, Graphify — Codebase Knowledge Graph Skill, Quick CLI Reference

### Community 10 - "JanConnect (जन कनेक्ट) — Civic Grievance AI Navigator"
Cohesion: 0.20
Nodes (9): 1. Backend Setup, 2. Frontend Setup, End-to-End API Integration Suite:, 🔐 Environment Variables (`backend/.env`), JanConnect (जन कनेक्ट) — Civic Grievance AI Navigator, 🏛️ Pipeline Architecture, ⚙️ Running Locally, Smoke Test Suite (Probes All 6 Azure Cloud Services): (+1 more)

### Community 14 - "extraction.py"
Cohesion: 0.10
Nodes (19): list_documents(), End-to-End API Integration Test Suite for Chandigarh JanConnect Exercises every…, Stage 4: Chandigarh Grounded Specialist Agents This module uses Azure AI Search…, extract_document(), extract_document_from_bytes(), extract_document_from_text(), list_available_mock_documents(), _load_documents() (+11 more)

## Knowledge Gaps
- **43 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+38 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `respond_endpoint()` connect `intake.py` to `mock_department_response`, `routing.py`, `app.py`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `file_complaint_endpoint()` connect `intake.py` to `routing.py`, `storage.py`, `app.py`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `route_complaint()` connect `routing.py` to `intake.py`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _43 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `intake.py` be split into smaller, more focused modules?**
  _Cohesion score 0.14619883040935672 - nodes in this community are weakly interconnected._
- **Should `app.py` be split into smaller, more focused modules?**
  _Cohesion score 0.09247311827956989 - nodes in this community are weakly interconnected._