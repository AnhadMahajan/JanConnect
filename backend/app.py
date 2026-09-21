import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from flask import Flask, jsonify, request
from flask_cors import CORS

from services import intake, extraction, routing, agents, filing


app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10 MB upload limit
CORS(app)


def _resolve_complaint_from_request(body: dict) -> dict:
    """Helper to resolve complaint from either an existing ID or manual custom user input."""
    if not body:
        raise ValueError("Missing request body")

    if "raw_text" in body and body["raw_text"].strip():
        raw_text = body["raw_text"].strip()
        citizen_name = body.get("citizen_name", "").strip() or "Citizen"
        
        # Live Azure Translator detection & translation
        trans_res = intake.translate_text(raw_text)
        return {
            "id": "manual_submission",
            "citizen_name": citizen_name,
            "language": trans_res.get("language", "en"),
            "raw_text": raw_text,
            "translated_text": trans_res.get("translated_text"),
        }
    elif "complaint_id" in body:
        return intake.get_complaint(body["complaint_id"])
    else:
        raise ValueError("Must provide either 'raw_text' or 'complaint_id'")


@app.route("/api/health", methods=["GET"])
def health_endpoint():
    """Health check endpoint showing active cloud configuration."""
    return jsonify({
        "status": "healthy",
        "service": "JanConnect Civic Grievance Gateway",
        "storage": "Azure Table Storage (Active / Fallback Ready)",
        "model": "Azure OpenAI (gpt-5-mini)"
    })


@app.route("/api/departments", methods=["GET"])
def get_departments_endpoint():
    """Returns dynamic department catalog from Azure Table Storage."""
    from services import storage
    return jsonify(storage.get_departments())


@app.route("/api/grievances", methods=["GET"])
def list_grievances_endpoint():
    """Lists all complaints filed in Azure Table Storage in real time."""
    from services import storage
    limit = request.args.get("limit", 50, type=int)
    return jsonify(storage.list_all_complaints(limit=limit))


@app.route("/api/complaints", methods=["GET"])
def list_complaints():
    """List available mock complaints."""
    return jsonify(intake.list_complaints())


@app.route("/api/complaint/<complaint_id>", methods=["GET"])
def get_complaint(complaint_id):
    """Stage 1: intake."""
    try:
        return jsonify(intake.get_complaint(complaint_id))
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@app.route("/api/transcribe-audio", methods=["POST"])
def transcribe_audio_endpoint():
    """Stage 1: Ingest recorded audio and transcribe using Azure Cognitive Services Speech."""
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]
    if not audio_file.filename:
        return jsonify({"error": "Empty audio filename"}), 400

    audio_bytes = audio_file.read()
    result = intake.transcribe_audio(audio_bytes, audio_file.filename)
    return jsonify(result)


@app.route("/api/documents", methods=["GET"])
def list_documents():
    return jsonify(extraction.list_available_mock_documents())


@app.route("/api/extract/<doc_id>", methods=["GET"])
def extract(doc_id):
    """Stage 2: document extraction (mock ID)."""
    try:
        return jsonify(extraction.extract_document(doc_id))
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@app.route("/api/extract-text", methods=["POST"])
def extract_text_endpoint():
    """Stage 2: extract entities from custom pasted text."""
    body = request.get_json() or {}
    text = body.get("text", "").strip()
    if not text:
        return jsonify({"error": "No document text provided"}), 400
    return jsonify(extraction.extract_document_from_text(text))


@app.route("/api/extract-file", methods=["POST"])
def extract_file_endpoint():
    """Stage 2: extract entities from uploaded document file using Azure Document Intelligence."""
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded in request"}), 400
    
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400
    
    file_bytes = file.read()
    content_type = file.content_type or "application/pdf"
    result = extraction.extract_document_from_bytes(file_bytes, content_type, file.filename)
    return jsonify(result)


@app.route("/api/route", methods=["POST"])
def route_endpoint():
    """Stage 3: department routing (supports custom text or mock id)."""
    try:
        body = request.get_json(silent=True) or {}
        complaint = _resolve_complaint_from_request(body)
        text = intake.working_text(complaint)
        result = routing.route_complaint(text)
        return jsonify({"complaint": complaint, "routing": result})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Internal error during routing: {str(e)}"}), 500


@app.route("/api/respond", methods=["POST"])
def respond_endpoint():
    """Stage 4: department agent response (supports custom text or mock id)."""
    try:
        body = request.get_json(silent=True) or {}
        complaint = _resolve_complaint_from_request(body)
        text = intake.working_text(complaint)
        routing_result = routing.route_complaint(text)
        response = agents.mock_department_response(routing_result["department_id"], text)
        return jsonify({"complaint": complaint, "routing": routing_result, "response": response})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Internal error during response synthesis: {str(e)}"}), 500


@app.route("/api/file-complaint", methods=["POST"])
def file_complaint_endpoint():
    """Stage 5: filing (supports custom text or mock id, persisted to Azure Storage)."""
    try:
        body = request.get_json(silent=True) or {}
        complaint = _resolve_complaint_from_request(body)
        text = intake.working_text(complaint)
        routing_result = routing.route_complaint(text)

        dept_id = routing_result["department_id"] or "general"
        dept_name = routing_result["department_name"]
        if dept_id == "general" and (not dept_name or dept_name == "Unclassified"):
            dept_name = "General Municipal Administration"

        filed = filing.file_complaint(
            department_id=dept_id,
            department_name=dept_name,
            complaint_text=complaint.get("raw_text") or text,
            citizen_name=complaint.get("citizen_name", "Citizen"),
            blob_url=body.get("blob_url")
        )
        return jsonify(filed)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Internal error during complaint filing: {str(e)}"}), 500


@app.route("/api/status/<tracking_id>", methods=["GET"])
def status_endpoint(tracking_id):
    """Lookup complaint status from Azure Table Storage / persistent DB."""
    cleaned_id = (tracking_id or "").strip().upper()
    return jsonify(filing.get_status(cleaned_id))


@app.route("/api/status/<tracking_id>/advance", methods=["POST"])
def advance_status_endpoint(tracking_id):
    """Simulate ticket lifecycle progression for classroom demonstration."""
    cleaned_id = (tracking_id or "").strip().upper()
    return jsonify(filing.advance_status(cleaned_id))


if __name__ == "__main__":
    app.run(debug=True, port=5001)

