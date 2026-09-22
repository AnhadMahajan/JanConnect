# Graph Report - awaazsetu  (2026-09-21)

## Corpus Check
- Corpus is ~7,169 words - fits in a single context window. You may not need a graph.

## Summary
- 90 nodes · 137 edges · 8 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Frontend React UI & Lifecycle
- Flask API Gateway & Endpoints
- Azure Grounded Agents & Policies
- Flask API Gateway & Endpoints
- Flask API Gateway & Endpoints
- Document Intelligence & Extraction
- Flask API Gateway & Endpoints
- Architecture Module 7

## God Nodes (most connected - your core abstractions)
1. `_resolve_complaint_from_request()` - 7 edges
2. `respond_endpoint()` - 7 edges
3. `file_complaint_endpoint()` - 7 edges
4. `route_endpoint()` - 6 edges
5. `route_complaint()` - 6 edges
6. `mock_department_response()` - 5 edges
7. `working_text()` - 5 edges
8. `list_complaints()` - 4 edges
9. `extract()` - 4 edges
10. `extract_text_endpoint()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `file_complaint_endpoint()` --calls--> `file_complaint()`  [EXTRACTED]
  backend/app.py → backend/services/filing.py
- `_resolve_complaint_from_request()` --calls--> `get_complaint()`  [EXTRACTED]
  backend/app.py → backend/services/intake.py
- `_resolve_complaint_from_request()` --calls--> `translate_text()`  [EXTRACTED]
  backend/app.py → backend/services/intake.py
- `extract()` --calls--> `extract_document()`  [EXTRACTED]
  backend/app.py → backend/services/extraction.py
- `respond_endpoint()` --calls--> `mock_department_response()`  [EXTRACTED]
  backend/app.py → backend/services/agents.py

## Import Cycles
- None detected.

## Communities (8 total, 0 thin omitted)

### Community 0 - "Frontend React UI & Lifecycle"
Cohesion: 0.12
Nodes (16): dependencies, react, react-dom, devDependencies, vite, @vitejs/plugin-react, name, private (+8 more)

### Community 1 - "Flask API Gateway & Endpoints"
Cohesion: 0.18
Nodes (14): file_complaint_endpoint(), Stage 4: department agent response (supports custom text or mock id)., Helper to resolve complaint from either an existing ID or manual custom user…, Stage 5: filing (supports custom text or mock id)., Stage 3: department routing (supports custom text or mock id)., _resolve_complaint_from_request(), respond_endpoint(), route_endpoint() (+6 more)

### Community 2 - "Azure Grounded Agents & Policies"
Cohesion: 0.17
Nodes (13): _load_departments(), mock_department_response(), Stage 4: Department Agents This module uses Azure AI Search for grounded…, Retrieve grounded policy snippets from Azure AI Search., Executes grounded department agent response. Queries Azure AI Search + Azure…, _search_grounding_policies(), Stage 1: Intake & Multilingual Processing Supports Azure AI Translator for…, Uses Azure AI Translator to detect language and translate to English. (+5 more)

### Community 3 - "Flask API Gateway & Endpoints"
Cohesion: 0.22
Nodes (7): status_endpoint(), file_complaint(), get_status(), Stage 5: Filing & Tracking Real version (later): an MCP tool server exposing…, flask, flask_cors, uuid

### Community 4 - "Flask API Gateway & Endpoints"
Cohesion: 0.25
Nodes (9): extract(), get_complaint(), list_complaints(), List available mock complaints., Stage 2: document extraction (mock ID)., get_complaint(), list_complaints(), _load_complaints() (+1 more)

### Community 5 - "Document Intelligence & Extraction"
Cohesion: 0.28
Nodes (8): list_documents(), extract_document(), list_available_mock_documents(), _load_documents(), Stage 2: Document Extraction & Content Understanding Supports: 1. Live Azure…, Fallback / Mock document loader., io, re

### Community 6 - "Flask API Gateway & Endpoints"
Cohesion: 0.25
Nodes (8): extract_file_endpoint(), extract_text_endpoint(), Stage 2: extract entities from custom pasted text., Stage 2: extract entities from uploaded document file using Azure Document…, extract_document_from_bytes(), extract_document_from_text(), Analyzes an uploaded citizen document (PDF, PNG, JPG) using Azure Document…, Uses Azure OpenAI (gpt-5-mini) to extract all structured key-value entities…

### Community 7 - "Architecture Module 7"
Cohesion: 0.50
Nodes (4): scripts, build, dev, preview

## Knowledge Gaps
- **11 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 40 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `respond_endpoint()` connect `Flask API Gateway & Endpoints` to `Azure Grounded Agents & Policies`, `Flask API Gateway & Endpoints`, `Flask API Gateway & Endpoints`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `file_complaint_endpoint()` connect `Flask API Gateway & Endpoints` to `Flask API Gateway & Endpoints`, `Flask API Gateway & Endpoints`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `_resolve_complaint_from_request()` connect `Flask API Gateway & Endpoints` to `Azure Grounded Agents & Policies`, `Flask API Gateway & Endpoints`, `Flask API Gateway & Endpoints`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Frontend React UI & Lifecycle` be split into smaller, more focused modules?**
  _Cohesion score 0.12105263157894737 - nodes in this community are weakly interconnected._