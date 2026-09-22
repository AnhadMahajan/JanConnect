import { useState, useRef } from "react";

export default function GrievanceNavigator({
  complaints,
  selectedComplaintId,
  setSelectedComplaintId,
  routingResult,
  setRoutingResult,
  filedResult,
  setFiledResult,
  loading,
  setLoading,
  filingLoading,
  setFilingLoading,
  onNavigateToTracker
}) {
  const [intakeMode, setIntakeMode] = useState("manual");
  const [citizenName, setCitizenName] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [customText, setCustomText] = useState("");
  const [apiError, setApiError] = useState(null);
  const [filingError, setFilingError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUploading, setAudioUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const audioInputRef = useRef(null);

  // List of authentic Chandigarh administrative sectors & localities
  const chandigarhSectors = [
    "Sector 1", "Sector 2", "Sector 3", "Sector 4", "Sector 5",
    "Sector 6", "Sector 7", "Sector 8", "Sector 9", "Sector 10",
    "Sector 11", "Sector 12", "Sector 12 West (Sarangpur)",
    "Sector 13 (Manimajra)", "Sector 14 (Panjab University)",
    "Sector 14 West (Dhanas)", "Sector 15", "Sector 16", "Sector 17 (City Center)",
    "Sector 18", "Sector 19", "Sector 20", "Sector 21", "Sector 22",
    "Sector 23", "Sector 24", "Sector 25", "Sector 26 (Grain Market)",
    "Sector 27", "Sector 28", "Sector 29", "Sector 30", "Sector 31",
    "Sector 32 (GMCH)", "Sector 33", "Sector 34 (Commercial Hub)",
    "Sector 35", "Sector 36", "Sector 37", "Sector 38", "Sector 38 West",
    "Sector 39", "Sector 39 West (Maloya & Dadu Majra)", "Sector 40",
    "Sector 41", "Sector 42", "Sector 43 (ISBT 43)", "Sector 44",
    "Sector 45 (Burail)", "Sector 46", "Sector 47", "Sector 48",
    "Sector 49", "Sector 50", "Sector 51", "Sector 52 (Kajheri)",
    "Sector 53", "Sector 54", "Sector 55", "Sector 56",
    "Industrial Area Phase 1", "Industrial Area Phase 2", "Hallomajra"
  ];

  const sampleChips = [
    {
      label: "💧 Sector 22 Water Bill Inflated",
      text: "I received an inflated water bill of Rs. 4,850 for House No 1240, Sector 22-B via e-Sampark. Last month was Rs. 650. I suspect the smart water meter is faulty.",
      sector: "Sector 22",
      name: "Virender Sharma"
    },
    {
      label: "⚡ Manimajra Power Cut (Punjabi)",
      text: "Manimajra sub-division vich pichhle 4 ghante to bijli band hai. 19121 helpline te koi phone nahi chuk reha, kripya local transformer check karvao.",
      sector: "Sector 13 (Manimajra)",
      name: "Gurpreet Singh Sandhu"
    },
    {
      label: "💡 Sector 35-C Streetlight Out (Hindi)",
      text: "Sector 35-C ke inner park aur V4 road ki street lights pichhle 5 din se band hain, raat ko pura andhera rehta hai aur chori ka darr hai.",
      sector: "Sector 35",
      name: "Sunita Aggarwal"
    },
    {
      label: "🗑️ Sector 46 Door-to-Door Waste Missed",
      text: "The MCC door-to-door waste collection tipper vehicle has missed Sector 46-D for two consecutive days. Segregated garbage is piling up.",
      sector: "Sector 46",
      name: "Deepak Mehta"
    },
    {
      label: "🚧 Sector 19 Market Dangerous Pothole",
      text: "A dangerous deep pothole and road caving has formed near Sector 19 market roundabout causing two-wheeler accidents. Needs urgent patchwork.",
      sector: "Sector 19",
      name: "Pooja Verma"
    }
  ];

  // Browser Speech-to-Text Voice Dictation
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser speech recognition not supported in this browser. Please use Chrome/Edge or upload an audio file for Azure Speech.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "hi-IN";

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = (e) => {
        console.error("Speech recognition error:", e);
        setIsRecording(false);
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setCustomText((prev) => (prev ? prev + " " + transcript : transcript));
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  // Azure Cognitive Services Speech Audio Upload
  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAudioUploading(true);
    try {
      const formData = new FormData();
      formData.append("audio", file);

      const res = await fetch("/api/transcribe-audio", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.transcribed_text) {
        setCustomText((prev) => (prev ? prev + " " + data.transcribed_text : data.transcribed_text));
      } else if (data.error) {
        alert("Azure Speech note: " + data.error);
      }
    } catch (err) {
      console.error("Audio transcription error:", err);
    } finally {
      setAudioUploading(false);
    }
  };

  // Process & Route Grievance
  const handleProcessComplaint = async () => {
    setApiError(null);
    let bodyData = {};
    if (intakeMode === "manual") {
      if (!customText || !customText.trim()) {
        setApiError("Please enter your grievance details or choose a Chandigarh scenario below before routing.");
        return;
      }
      // Append selected sector to raw text if not already included
      let fullText = customText.trim();
      if (selectedSector && !fullText.toLowerCase().includes(selectedSector.toLowerCase())) {
        fullText = `[Location: ${selectedSector}] ${fullText}`;
      }
      bodyData = {
        raw_text: fullText,
        citizen_name: citizenName.trim() || "Chandigarh Citizen",
      };
    } else {
      if (!selectedComplaintId) {
        setApiError("Please select a Chandigarh grievance scenario from the list above.");
        return;
      }
      bodyData = { complaint_id: selectedComplaintId };
    }

    setLoading(true);
    setFiledResult(null);
    try {
      const res = await fetch("/api/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || data.error || !data.routing) {
        throw new Error(data?.error || `Server returned error (${res.status}). Please check backend status.`);
      }
      setRoutingResult(data);
    } catch (e) {
      console.error("Error processing complaint:", e);
      setApiError(e.message || "Failed to reach backend server. Please verify Python Flask is running on port 5001.");
    } finally {
      setLoading(false);
    }
  };

  // Official Complaint Filing
  const handleFileComplaint = async () => {
    if (!routingResult) return;
    setFilingLoading(true);
    setFilingError(null);
    try {
      let bodyData = {};
      if (intakeMode === "manual") {
        bodyData = {
          raw_text: routingResult.complaint?.raw_text || customText,
          citizen_name: routingResult.complaint?.citizen_name || citizenName || "Chandigarh Citizen",
        };
      } else {
        bodyData = { complaint_id: selectedComplaintId };
      }

      const res = await fetch("/api/file-complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || data.error || !data.tracking_id) {
        throw new Error(data?.error || `Failed to file grievance (status ${res.status})`);
      }
      setFiledResult(data);
    } catch (e) {
      console.error("Error filing complaint:", e);
      setFilingError(e.message || "Could not register grievance in Azure Table Storage.");
    } finally {
      setFilingLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const getDepartmentBadge = (deptId) => {
    if (!deptId || deptId === "general") return <span className="badge badge-primary">🏛️ Municipal Cell</span>;
    if (deptId === "water") return <span className="badge badge-water">💧 MCC Water Supply</span>;
    if (deptId === "electricity") return <span className="badge badge-electricity">⚡ CPDL Electricity</span>;
    if (deptId === "sanitation") return <span className="badge badge-sanitation">🗑️ MCC Sanitation</span>;
    if (deptId === "roads") return <span className="badge badge-roads">🚧 MCC Roads and Lights</span>;
    return <span className="badge badge-primary">{deptId}</span>;
  };

  const getLanguageBadge = (lang) => {
    if (!lang) return <span className="badge badge-en">🌐 English</span>;
    if (lang.startsWith("hi")) return <span className="badge badge-hi">🇮🇳 Hindi (हिन्दी)</span>;
    if (lang.startsWith("pa")) return <span className="badge badge-pa">🇮🇳 Punjabi (ਪੰਜਾਬੀ)</span>;
    return <span className="badge badge-en">🌐 {lang.toUpperCase()}</span>;
  };

  return (
    <div>
      {/* CHANDIGARH HELPLINES BANNER */}
      <div className="chd-helpline-banner">
        <div className="helpline-left">
          <span className="helpline-icon">🚨</span>
          <div>
            <div className="helpline-title">UT Chandigarh Official 24x7 Civic Helplines</div>
            <div className="helpline-sub">Integrated Command & Control Centre (ICCC) • Citizen Charters</div>
          </div>
        </div>

        <div className="helpline-pills">
          <div className="helpline-pill">
            <span>⚡ Electricity (CPDL):</span> <strong>19121</strong>
          </div>
          <div className="helpline-pill">
            <span>💧 Water Supply:</span> <strong>0172-2540200</strong>
          </div>
          <div className="helpline-pill">
            <span>🗑️ MOH WhatsApp:</span> <strong>9915762917</strong>
          </div>
          <div className="helpline-pill">
            <span>🏛️ ICCC Central:</span> <strong>0172-2787200</strong>
          </div>
        </div>
      </div>

      {/* STAGE 1: INTAKE */}
      <section className="card">
        <div className="card-header">
          <h2 className="card-title">
            <span>1.</span> Chandigarh Citizen Grievance Intake
          </h2>
          
          <div className="mode-toggle-group">
            <button
              className={`mode-btn ${intakeMode === "manual" ? "active" : ""}`}
              onClick={() => {
                setIntakeMode("manual");
                setRoutingResult(null);
                setFiledResult(null);
              }}
            >
              ✍️ Manual / Voice Entry
            </button>
            <button
              className={`mode-btn ${intakeMode === "sample" ? "active" : ""}`}
              onClick={() => {
                setIntakeMode("sample");
                setRoutingResult(null);
                setFiledResult(null);
              }}
            >
              📂 Chandigarh Scenarios
            </button>
          </div>
        </div>

        {intakeMode === "manual" && (
          <div className="manual-form-card">
            <div className="intake-form-grid">
              <div className="form-group">
                <label className="form-label">Citizen Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Sharma"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sector / Area (Optional)</label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="form-input form-select"
                >
                  <option value="">🔍 Auto-detect sector from text</option>
                  {chandigarhSectors.map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Voice Intake</label>
                <div className="voice-btn-row">
                  {/* Browser Speech */}
                  <button
                    type="button"
                    className={`voice-btn ${isRecording ? "recording" : ""}`}
                    onClick={toggleSpeechRecognition}
                    title="Speak in Hindi, Punjabi, or English"
                  >
                    <span>🎙️</span>
                    <span>{isRecording ? "Listening..." : "Browser Voice"}</span>
                  </button>

                  {/* Azure Speech File Upload */}
                  <input
                    type="file"
                    ref={audioInputRef}
                    style={{ display: "none" }}
                    accept="audio/*,.wav,.mp3,.webm,.ogg,.m4a"
                    onChange={handleAudioUpload}
                  />
                  <button
                    type="button"
                    className="voice-btn voice-btn-cloud"
                    onClick={() => audioInputRef.current && audioInputRef.current.click()}
                    disabled={audioUploading}
                    title="Transcribe recorded audio file using Azure Speech SDK"
                  >
                    <span>☁️</span>
                    <span>{audioUploading ? "Transcribing..." : "Azure Speech"}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">Grievance Description (Hindi, Punjabi, English)</label>
                <span className="char-counter">{customText.length} characters</span>
              </div>
              <textarea
                placeholder="Describe your civic problem (e.g. 'Sector 22 water meter reading is excessively high' or 'Manimajra vich bijli pichhle 4 ghante to band hai' or 'Sector 46 kooda gadi nahi aayi')..."
                value={customText}
                onChange={(e) => {
                  setCustomText(e.target.value);
                  setRoutingResult(null);
                  setFiledResult(null);
                }}
                className="form-textarea"
              ></textarea>
            </div>

            <div className="quick-chips-wrapper">
              <div className="quick-chips-header">
                <span>💡</span>
                <span>Quick Test Scenarios (Click to Fill):</span>
              </div>
              <div className="quick-chips-list">
                {sampleChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="quick-chip"
                    onClick={() => {
                      setCustomText(chip.text);
                      setSelectedSector(chip.sector);
                      setCitizenName(chip.name);
                      setRoutingResult(null);
                      setFiledResult(null);
                    }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}


        {intakeMode === "sample" && (
          <div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
              Select a pre-configured Chandigarh citizen grievance scenario:
            </p>
            <div className="complaints-grid">
              {complaints.map((c) => {
                const isSelected = c.id === selectedComplaintId;
                return (
                  <div
                    key={c.id}
                    className={`complaint-card ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedComplaintId(c.id);
                      setRoutingResult(null);
                      setFiledResult(null);
                    }}
                  >
                    <div className="complaint-card-header">
                      <div className="citizen-info">
                        <div className="citizen-avatar">{c.citizen_name ? c.citizen_name.charAt(0) : "C"}</div>
                        <div>
                          <span style={{ fontWeight: 600 }}>{c.citizen_name || c.id}</span>
                          {c.sector && (
                            <div style={{ fontSize: "0.75rem", color: "var(--primary)" }}>📍 {c.sector}</div>
                          )}
                        </div>
                      </div>
                      {getLanguageBadge(c.language)}
                    </div>
                    <p className="complaint-text-snippet">"{c.raw_text}"</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* STAGE 2/3/4: ROUTING & GROUNDED SPECIALIST AGENT */}
      <section className="card">
        <div className="card-header">
          <h2 className="card-title">
            <span>2.</span> Department Routing and Grounded Specialist Advisory
          </h2>
          {routingResult?.routing && getDepartmentBadge(routingResult.routing.department_id)}
        </div>

        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
          Synthesizes Azure AI Translation + Sector Intelligence + Azure AI Search policy retrieval with GPT-5-mini reasoning:
        </p>

        <button
          className="btn btn-primary"
          onClick={handleProcessComplaint}
          disabled={loading}
          style={{ width: "100%", padding: "0.85rem 1.25rem", fontSize: "0.95rem" }}
        >
          {loading ? (
            <>
              <span className="pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff", display: "inline-block" }}></span>
              Routing Grievance with Azure AI and GPT-5-mini...
            </>
          ) : (
            <>⚡ Route and Generate Grounded Municipal Advisory</>
          )}
        </button>

        {loading && (
          <div style={{
            marginTop: "0.75rem",
            padding: "0.65rem 1rem",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "var(--radius-sm)",
            color: "#1e40af",
            fontSize: "0.82rem",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem"
          }}>
            <span className="pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563eb", display: "inline-block" }}></span>
            <span>Querying Azure AI Search policies and synthesizing grounded officer advice with GPT-5-mini (usually 5-15s)...</span>
          </div>
        )}

        {apiError && (
          <div style={{
            marginTop: "1rem",
            padding: "0.85rem 1.25rem",
            background: "#fef2f2",
            border: "1.5px solid #f87171",
            borderRadius: "var(--radius-md)",
            color: "#991b1b",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            fontSize: "0.88rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ fontSize: "1.2rem" }}>⚠️</span>
              <div>
                <strong>Notice:</strong> {apiError}
              </div>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setApiError(null)}
              style={{ padding: "0.2rem 0.6rem", fontSize: "0.75rem" }}
            >
              Dismiss
            </button>
          </div>
        )}

        {routingResult?.routing && (
          <div style={{ marginTop: "1.5rem" }}>
            {routingResult.complaint?.translated_text && (
              <div className="active-complaint-box" style={{ marginBottom: "1.25rem" }}>
                <div className="active-complaint-meta">
                  <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>
                    Azure AI Translation:
                  </span>
                  {getLanguageBadge(routingResult.complaint?.language)}
                  <span style={{ fontSize: "0.8rem", color: "#6366f1" }}>➔ English Working Copy</span>
                </div>
                <div className="translated-box">
                  <div className="translated-label">Normalized Working Text (Used for Policy Search & Routing):</div>
                  <p>{routingResult.complaint?.translated_text}</p>
                </div>
              </div>
            )}

            <div className="routing-banner">
              <div className="routing-dept-info">
                <div className="routing-icon">
                  {routingResult.routing.department_id === "water" ? "💧" :
                   routingResult.routing.department_id === "electricity" ? "⚡" :
                   routingResult.routing.department_id === "sanitation" ? "🗑️" :
                   routingResult.routing.department_id === "roads" ? "🚧" : "🏛️"}
                </div>
                <div className="routing-text-group">
                  <h4>{routingResult.routing.department_name}</h4>
                  <p>
                    Authority: <strong>{routingResult.routing.official_authority || "Municipal Corporation Chandigarh"}</strong>
                    {routingResult.routing.office_location && ` • ${routingResult.routing.office_location}`}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                {routingResult.routing.detected_sector && (
                  <div className="score-pill" style={{ borderColor: "#6366f1", color: "#4338ca", background: "#eef2ff" }}>
                    <span>Jurisdiction:</span>
                    <strong>📍 {routingResult.routing.detected_sector}</strong>
                  </div>
                )}
                <div className="score-pill">
                  <span>Relevance:</span>
                  <strong style={{ color: "var(--primary)" }}>{routingResult.routing.score} pts</strong>
                </div>
              </div>
            </div>

            {/* DIRECT EMERGENCY HELPLINE CALLOUT */}
            {routingResult.routing.helpline && (
              <div style={{
                margin: "0.75rem 0",
                padding: "0.6rem 1rem",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.82rem"
              }}>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Direct Department Helpline: </span>
                  <strong style={{ color: "var(--primary)" }}>{routingResult.routing.helpline}</strong>
                </div>
                <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 600 }}>● Active Line</span>
              </div>
            )}

            <div className="agent-response-card">
              <div className="agent-response-header">
                <div className="agent-title">
                  <span>🏛️</span> {routingResult.routing.department_name} — Specialist Officer
                </div>
                <span className="badge badge-success" style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "none" }}>
                  Azure AI Search Grounded (GPT-5-mini)
                </span>
              </div>
              <div className="agent-body">
                <div className="agent-speech-bubble">
                  <p style={{ fontWeight: 600, color: "var(--primary)", marginBottom: "0.3rem", fontSize: "0.8rem", textTransform: "uppercase" }}>
                    Official Citizen Advisory and Statutory Timelines:
                  </p>
                  <p style={{ whiteSpace: "pre-line" }}>{routingResult.response?.answer || "Processing advisory..."}</p>
                </div>

                <div className="grounding-notice">
                  <span>✓</span> Grounded against the Chandigarh Right to Service (RTS) Act and Municipal Corporation policies in Azure AI Search.
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* STAGE 5: FILING & TICKET GENERATION */}
      <section className="card">
        <div className="card-header">
          <h2 className="card-title">
            <span>3.</span> Official Filing and Azure Table Storage
          </h2>
          {filedResult && <span className="badge badge-success">✓ Ticket Registered in Cloud</span>}
        </div>

        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
          Persist grievance to Azure Table Storage database with official tracking ID and Right to Service (RTS) SLA deadline:
        </p>

        {filingError && (
          <div style={{
            marginBottom: "1rem",
            padding: "0.85rem 1.25rem",
            background: "#fef2f2",
            border: "1.5px solid #f87171",
            borderRadius: "var(--radius-md)",
            color: "#991b1b",
            fontSize: "0.88rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <span>⚠️</span>
            <div><strong>Filing Notice:</strong> {filingError}</div>
          </div>
        )}

        <button
          className="btn btn-success"
          onClick={handleFileComplaint}
          disabled={!routingResult || filingLoading}
        >
          {filingLoading ? "Registering Grievance in Azure Storage..." : "📥 File Official Chandigarh Civic Grievance"}
        </button>

        {!routingResult && (
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginLeft: "1rem" }}>
            (Please process & route grievance first)
          </span>
        )}

        {filedResult && (
          <div className="filing-receipt">
            <div className="receipt-header">
              <div className="receipt-title">
                <span>🏛️</span> Chandigarh Municipal Corporation Grievance Acknowledgement
              </div>
              <span className="badge badge-success">Status: {filedResult.status}</span>
            </div>

            <div className="tracking-code-box">
              <div>
                <div style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>
                  Official Grievance Tracking ID
                </div>
                <div className="tracking-id-text">{filedResult.tracking_id}</div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => copyToClipboard(filedResult.tracking_id)}
              >
                {copiedId ? "✓ Copied!" : "📋 Copy ID"}
              </button>
            </div>

            <div className="receipt-grid">
              <div className="receipt-item">
                <label>Citizen Name</label>
                <span>{filedResult.citizen_name || citizenName || "Citizen"}</span>
              </div>
              <div className="receipt-item">
                <label>Assigned Department</label>
                <span>{filedResult.department_name}</span>
              </div>
              <div className="receipt-item">
                <label>Statutory RTS SLA</label>
                <span style={{ fontWeight: 600, color: "#b45309" }}>
                  {filedResult.department_id === "water" ? "15 Working Days (RTS Rule 4)" :
                   filedResult.department_id === "electricity" ? "7 Working Days (RTS Rule 2)" :
                   filedResult.department_id === "sanitation" ? "2 Working Days (24h Collection)" :
                   filedResult.department_id === "roads" ? "7 Working Days (RTS Rule 6)" : "14 Working Days"}
                </span>
              </div>
              <div className="receipt-item">
                <label>Cloud Database</label>
                <span style={{ color: "var(--primary)", fontWeight: 600 }}>
                  {filedResult._storage || "Azure Table Storage"}
                </span>
              </div>
            </div>

            {filedResult.report_blob_url && (
              <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#166534" }}>☁️ Official Grievance Dossier Archived in Azure Blob Vault</span>
                  <div style={{ fontSize: "0.75rem", color: "#15803d" }}>Permanent cloud audit file registered for this complaint</div>
                </div>
                <a
                  href={filedResult.report_blob_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: "0.75rem", padding: "0.3rem 0.75rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                >
                  <span>📑</span> View Official Dossier (JSON) ↗
                </a>
              </div>
            )}

            <div style={{ marginTop: "1rem", textAlign: "right" }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigateToTracker(filedResult.tracking_id, filedResult)}
              >
                Track in Live Tracker →
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
