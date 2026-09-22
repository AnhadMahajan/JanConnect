import { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import PipelineStepper from "./components/PipelineStepper";
import GrievanceNavigator from "./components/GrievanceNavigator";
import DocumentIntelligence from "./components/DocumentIntelligence";
import StatusTracker from "./components/StatusTracker";
import DepartmentMatrix from "./components/DepartmentMatrix";

const DEFAULT_CHANDIGARH_COMPLAINTS = [
  {
    id: "complaint_1",
    citizen_name: "Virender Sharma",
    language: "en",
    sector: "Sector 22-B",
    raw_text: "I received an inflated water bill of Rs. 4,850 for House No 1240, Sector 22-B via e-Sampark. Last month our bill was only Rs. 650. The smart water meter reading appears to be running erratically."
  },
  {
    id: "complaint_2",
    citizen_name: "Sunita Aggarwal",
    language: "hi",
    sector: "Sector 35-C",
    raw_text: "Sector 35-C ke inner park aur V4 road ki street lights pichhle 5 din se band hain, raat ko pura andhera rehta hai aur chori ka darr hai.",
    translated_text: "The street lights in the inner park and V4 road of Sector 35-C have been off for the last 5 days, it remains pitch dark at night with fear of theft."
  },
  {
    id: "complaint_3",
    citizen_name: "Gurpreet Singh Sandhu",
    language: "pa",
    sector: "Sector 13 (Manimajra)",
    raw_text: "Manimajra sub-division vich pichhle 4 ghante to bijli band hai. 19121 helpline te koi phone nahi chuk reha, kripya local transformer check karvao.",
    translated_text: "Electricity has been out in Manimajra sub-division for the last 4 hours. No one is picking up on the 19121 helpline, please get the local transformer checked."
  },
  {
    id: "complaint_4",
    citizen_name: "Deepak Mehta",
    language: "en",
    sector: "Sector 46-D",
    raw_text: "The MCC door-to-door waste collection tipper vehicle has missed Sector 46-D for two days straight. Household waste is piling up outside houses."
  },
  {
    id: "complaint_5",
    citizen_name: "Pooja Verma",
    language: "en",
    sector: "Sector 19-C",
    raw_text: "A dangerous deep pothole has formed near the Sector 19 market roundabout following recent rains, causing frequent two-wheeler accidents."
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState("navigator"); // "navigator", "documents", "tracker", "admin", "policy_qa", "departments"
  
  // Pipeline State
  const [complaints, setComplaints] = useState(DEFAULT_CHANDIGARH_COMPLAINTS);
  const [selectedComplaintId, setSelectedComplaintId] = useState("complaint_1");
  const [routingResult, setRoutingResult] = useState(null);
  const [filedResult, setFiledResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filingLoading, setFilingLoading] = useState(false);
  
  // Document Extraction State
  const [availableDocs, setAvailableDocs] = useState([]);
  const [extractedDocs, setExtractedDocs] = useState({});
  const [docLoading, setDocLoading] = useState(false);

  // Tracking Lookup State
  const [lookupId, setLookupId] = useState("");
  const [trackedStatus, setTrackedStatus] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Dynamic Department Catalog (Fetched directly from Azure Table Storage / local)
  const [departmentsList, setDepartmentsList] = useState([]);

  // Feature D: Officer Desk State
  const [adminComplaints, setAdminComplaints] = useState([]);
  const [adminMetrics, setAdminMetrics] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminDeptFilter, setAdminDeptFilter] = useState("all");
  const [adminStatusFilter, setAdminStatusFilter] = useState("all");
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [newStatusValue, setNewStatusValue] = useState("Assigned to Field Engineer");
  const [officerNameValue, setOfficerNameValue] = useState("Er. V. Sharma (Junior Engineer)");
  const [officerRemarksValue, setOfficerRemarksValue] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Policy Clarifier & Doubts Q&A State
  const [samplePolicies, setSamplePolicies] = useState([]);
  const [activePolicyTitle, setActivePolicyTitle] = useState("");
  const [activePolicyText, setActivePolicyText] = useState("");
  const [activePolicyDept, setActivePolicyDept] = useState("");
  const [policyUploadMode, setPolicyUploadMode] = useState("preset"); // "preset", "upload", "paste"
  const [policyPasteText, setPolicyPasteText] = useState("");
  const [selectedPolicyFile, setSelectedPolicyFile] = useState(null);
  const [policyExtractLoading, setPolicyExtractLoading] = useState(false);
  const policyFileInputRef = useRef(null);
  const [policyQuestion, setPolicyQuestion] = useState("");
  const [policyAsking, setPolicyAsking] = useState(false);
  const [policyAnswerResult, setPolicyAnswerResult] = useState(null);
  const [targetLang, setTargetLang] = useState("en");
  const [translatedAnswer, setTranslatedAnswer] = useState("");
  const [translatingAnswer, setTranslatingAnswer] = useState(false);
  const [copiedPolicyAnswer, setCopiedPolicyAnswer] = useState(false);
  const [isPolicyRecording, setIsPolicyRecording] = useState(false);
  const [showDocPreview, setShowDocPreview] = useState(false);
  const [policyBlobUrl, setPolicyBlobUrl] = useState("");

  // Load initial departments, complaints, and documents
  useEffect(() => {
    fetch("/api/departments")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDepartmentsList(data);
        }
      })
      .catch((err) => console.error("Error loading departments:", err));

    fetch("/api/complaints")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setComplaints(data);
          setSelectedComplaintId(data[0].id);
        }
      })
      .catch((err) => console.error("Error loading complaints:", err));

    fetch("/api/documents")
      .then((r) => r.json())
      .then((data) => setAvailableDocs(data))
      .catch((err) => console.error("Error loading documents:", err));
  }, []);

  // Shortcut from receipt to tracker tab
  const handleNavigateToTracker = (id, ticketData) => {
    setLookupId(id);
    setTrackedStatus(ticketData);
    setActiveTab("tracker");
  };

  // Officer Desk: Load all complaints and metrics
  const loadAdminComplaints = async () => {
    setAdminLoading(true);
    try {
      const res = await fetch("/api/admin/complaints");
      const data = await res.json();
      setAdminComplaints(data.complaints || []);
      setAdminMetrics(data.metrics || null);
    } catch (e) {
      console.error("Error loading admin complaints:", e);
    } finally {
      setAdminLoading(false);
    }
  };

  // Officer Desk: Update status
  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!editingComplaint) return;
    setStatusUpdating(true);
    try {
      const res = await fetch("/api/admin/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tracking_id: editingComplaint.tracking_id,
          new_status: newStatusValue,
          officer_name: officerNameValue,
          remarks: officerRemarksValue,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await loadAdminComplaints();
        if (trackedStatus && trackedStatus.tracking_id === editingComplaint.tracking_id) {
          setTrackedStatus(data.complaint);
        }
        setEditingComplaint(null);
      } else {
        alert("Failed to update status: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Error updating status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  // Policy Clarifier Handlers
  const loadSamplePolicies = async () => {
    try {
      const res = await fetch("/api/policy/samples");
      const data = await res.json();
      setSamplePolicies(data);
      if (data.length > 0 && !activePolicyText) {
        handleSelectSamplePolicy(data[0].id);
      }
    } catch (e) {
      console.error("Error loading sample policies:", e);
    }
  };

  const handleSelectSamplePolicy = async (id) => {
    try {
      const res = await fetch(`/api/policy/sample/${id}`);
      const data = await res.json();
      setActivePolicyTitle(data.title);
      setActivePolicyText(data.text);
      setActivePolicyDept(data.department);
      setPolicyBlobUrl("");
      setPolicyAnswerResult(null);
      setTranslatedAnswer("");
    } catch (e) {
      console.error("Error selecting sample policy:", e);
    }
  };

  const handleExtractPolicyFile = async () => {
    if (!selectedPolicyFile) {
      alert("Please choose a policy circular file (PDF/Image) first.");
      return;
    }
    setPolicyExtractLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedPolicyFile);
      const res = await fetch("/api/policy/extract", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setActivePolicyTitle(data.title || selectedPolicyFile.name);
      setActivePolicyText(data.text);
      setActivePolicyDept("Uploaded Government Circular");
      setPolicyBlobUrl(data.blob_url || "");
      setPolicyAnswerResult(null);
      setTranslatedAnswer("");
    } catch (e) {
      console.error("Error extracting policy file:", e);
      alert("Failed to analyze policy file.");
    } finally {
      setPolicyExtractLoading(false);
    }
  };

  const handleApplyPastedPolicy = async () => {
    if (!policyPasteText.trim()) {
      alert("Please paste government policy text first.");
      return;
    }
    setPolicyExtractLoading(true);
    try {
      const res = await fetch("/api/policy/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: policyPasteText.trim() }),
      });
      const data = await res.json();
      setActivePolicyTitle(data.title || "Custom Policy Notification");
      setActivePolicyText(data.text || policyPasteText.trim());
      setActivePolicyDept("Custom Policy Notification");
      setPolicyBlobUrl(data.blob_url || "");
      setPolicyAnswerResult(null);
      setTranslatedAnswer("");
    } catch (e) {
      const lines = policyPasteText.trim().split("\n");
      setActivePolicyTitle(lines[0].slice(0, 80));
      setActivePolicyText(policyPasteText.trim());
      setActivePolicyDept("Custom Policy Notification");
      setPolicyBlobUrl("");
      setPolicyAnswerResult(null);
      setTranslatedAnswer("");
    } finally {
      setPolicyExtractLoading(false);
    }
  };

  const handleAskPolicyDoubt = async (queryText) => {
    const q = queryText || policyQuestion;
    if (!q || !q.trim()) {
      alert("Please type or speak your doubt regarding the policy.");
      return;
    }
    if (!activePolicyText) {
      alert("Please select or upload a government policy document first.");
      return;
    }
    setPolicyAsking(true);
    setTranslatedAnswer("");
    setTargetLang("en");
    try {
      const res = await fetch("/api/policy/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policy_text: activePolicyText,
          question: q.trim(),
          language: "en",
        }),
      });
      const data = await res.json();
      setPolicyAnswerResult(data);
    } catch (e) {
      console.error("Error asking policy doubt:", e);
      alert("Error getting answer from policy engine.");
    } finally {
      setPolicyAsking(false);
    }
  };

  const handleTranslatePolicyAnswer = async (langCode) => {
    if (!policyAnswerResult || !policyAnswerResult.answer) return;
    if (langCode === "en") {
      setTargetLang("en");
      setTranslatedAnswer("");
      return;
    }
    setTargetLang(langCode);
    setTranslatingAnswer(true);
    try {
      const res = await fetch("/api/policy/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: policyAnswerResult.answer,
          target_lang: langCode,
        }),
      });
      const data = await res.json();
      setTranslatedAnswer(data.translated_text || "");
    } catch (e) {
      console.error("Error translating answer:", e);
    } finally {
      setTranslatingAnswer(false);
    }
  };

  const togglePolicySpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome/Edge or type directly.");
      return;
    }
    if (isPolicyRecording) {
      setIsPolicyRecording(false);
      return;
    }
    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "hi-IN";
      rec.onstart = () => setIsPolicyRecording(true);
      rec.onend = () => setIsPolicyRecording(false);
      rec.onerror = () => setIsPolicyRecording(false);
      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setPolicyQuestion((prev) => (prev ? prev + " " + transcript : transcript));
      };
      rec.start();
    } catch (e) {
      setIsPolicyRecording(false);
    }
  };

  // Determine current active pipeline step
  const currentStep = filedResult ? 5 : routingResult ? 4 : selectedComplaintId ? 2 : 1;

  // Filter complaints for Officer Desk
  const filteredAdminComplaints = adminComplaints.filter((c) => {
    const matchesDept = adminDeptFilter === "all" || c.department_id === adminDeptFilter;
    const matchesStatus = adminStatusFilter === "all" || c.status === adminStatusFilter;
    const q = adminSearchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      c.tracking_id.toLowerCase().includes(q) ||
      (c.citizen_name && c.citizen_name.toLowerCase().includes(q)) ||
      (c.complaint_text && c.complaint_text.toLowerCase().includes(q));
    return matchesDept && matchesStatus && matchesSearch;
  });

  return (
    <div className="app-layout">
      {/* Top Navigation Bar with UT Chandigarh Pilot Branding */}
      <Navbar />

      {/* Main Container */}
      <main className="main-content">
        {/* Navigation Tabs */}
        <nav className="nav-tabs" aria-label="Sections">
          <button
            className={`tab-btn ${activeTab === "navigator" ? "active" : ""}`}
            onClick={() => setActiveTab("navigator")}
          >
            <span>⚡</span> Grievance Navigator
          </button>
          <button
            className={`tab-btn ${activeTab === "documents" ? "active" : ""}`}
            onClick={() => setActiveTab("documents")}
          >
            <span>📄</span> Document Intelligence (Stage 2)
          </button>
          <button
            className={`tab-btn ${activeTab === "tracker" ? "active" : ""}`}
            onClick={() => setActiveTab("tracker")}
          >
            <span>🔍</span> Track Status (Stage 5)
          </button>
          <button
            className={`tab-btn ${activeTab === "admin" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("admin");
              loadAdminComplaints();
            }}
          >
            <span>🛡️</span> Officer Desk
          </button>
          <button
            className={`tab-btn ${activeTab === "policy_qa" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("policy_qa");
              if (samplePolicies.length === 0) loadSamplePolicies();
            }}
          >
            <span>📜</span> Policy Clarifier & Q&A
          </button>
          <button
            className={`tab-btn ${activeTab === "departments" ? "active" : ""}`}
            onClick={() => setActiveTab("departments")}
          >
            <span>🏛️</span> Chandigarh Authorities
          </button>
        </nav>

        {/* TAB 1: CHANDIGARH GRIEVANCE NAVIGATOR */}
        {activeTab === "navigator" && (
          <div>
            <PipelineStepper currentStep={currentStep} />
            <GrievanceNavigator
              complaints={complaints}
              selectedComplaintId={selectedComplaintId}
              setSelectedComplaintId={setSelectedComplaintId}
              routingResult={routingResult}
              setRoutingResult={setRoutingResult}
              filedResult={filedResult}
              setFiledResult={setFiledResult}
              loading={loading}
              setLoading={setLoading}
              filingLoading={filingLoading}
              setFilingLoading={setFilingLoading}
              onNavigateToTracker={handleNavigateToTracker}
            />
          </div>
        )}

        {/* TAB 2: CITIZEN DOCUMENT INTELLIGENCE (STAGE 2) */}
        {activeTab === "documents" && (
          <DocumentIntelligence
            availableDocs={availableDocs}
            extractedDocs={extractedDocs}
            setExtractedDocs={setExtractedDocs}
            docLoading={docLoading}
            setDocLoading={setDocLoading}
          />
        )}

        {/* TAB 3: TRACK GRIEVANCE STATUS (STAGE 5) */}
        {activeTab === "tracker" && (
          <StatusTracker
            lookupId={lookupId}
            setLookupId={setLookupId}
            trackedStatus={trackedStatus}
            setTrackedStatus={setTrackedStatus}
            trackingLoading={trackingLoading}
            setTrackingLoading={setTrackingLoading}
          />
        )}

        {/* TAB 4: MUNICIPAL OFFICER DESK */}
        {activeTab === "admin" && (
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">
                  <span>🛡️</span> Municipal Officer Resolution Desk
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                  Official municipal administration dashboard for Chandigarh zonal officers and engineers.
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={loadAdminComplaints} disabled={adminLoading}>
                {adminLoading ? "Refreshing..." : "🔄 Refresh Desk"}
              </button>
            </div>

            {/* KPI Summary Tiles */}
            {adminMetrics && (
              <div className="admin-kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: "rgba(79, 70, 229, 0.1)", color: "var(--primary)" }}>📋</div>
                  <div>
                    <div className="kpi-value">{adminMetrics.total}</div>
                    <div className="kpi-label">Total Grievances</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#d97706" }}>⏳</div>
                  <div>
                    <div className="kpi-value">{adminMetrics.pending_verification}</div>
                    <div className="kpi-label">Pending Verification</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#2563eb" }}>👷</div>
                  <div>
                    <div className="kpi-value">{adminMetrics.in_progress}</div>
                    <div className="kpi-label">Assigned / In Progress</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#059669" }}>✅</div>
                  <div>
                    <div className="kpi-value">{adminMetrics.resolved}</div>
                    <div className="kpi-label">Resolved & Closed</div>
                  </div>
                </div>
              </div>
            )}

            {/* Search & Filter Controls */}
            <div className="admin-controls-bar">
              <input
                type="text"
                placeholder="Search by Tracking ID, Citizen Name, or Keyword..."
                value={adminSearchQuery}
                onChange={(e) => setAdminSearchQuery(e.target.value)}
                className="form-input admin-search-input"
              />
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <select
                  value={adminDeptFilter}
                  onChange={(e) => setAdminDeptFilter(e.target.value)}
                  className="form-input"
                  style={{ width: "auto" }}
                >
                  <option value="all">All Departments</option>
                  <option value="water">💧 Water Supply (MCC)</option>
                  <option value="electricity">⚡ Electricity (CPDL)</option>
                  <option value="sanitation">🗑️ Sanitation (MOH)</option>
                  <option value="roads">🚧 Roads & B&R (MCC)</option>
                  <option value="rti">📜 RTI Cell</option>
                </select>

                <select
                  value={adminStatusFilter}
                  onChange={(e) => setAdminStatusFilter(e.target.value)}
                  className="form-input"
                  style={{ width: "auto" }}
                >
                  <option value="all">All Statuses</option>
                  <option value="Filed">Filed</option>
                  <option value="Under Verification">Under Verification</option>
                  <option value="Assigned to Field Engineer">Assigned to Field Engineer</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Complaints Table */}
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tracking ID</th>
                    <th>Citizen</th>
                    <th>Department</th>
                    <th>Grievance Summary</th>
                    <th>Assigned Officer</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdminComplaints.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                        No grievances found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAdminComplaints.map((c) => (
                      <tr key={c.tracking_id}>
                        <td>
                          <code style={{ fontWeight: 700, color: "var(--primary)" }}>{c.tracking_id}</code>
                        </td>
                        <td>
                          <strong>{c.citizen_name}</strong>
                        </td>
                        <td>
                          <span className="badge badge-secondary">{c.department_name}</span>
                        </td>
                        <td style={{ maxWidth: 280, fontSize: "0.85rem", color: "#475569" }}>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {c.complaint_text}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: "0.82rem", color: "#1e293b" }}>{c.assigned_officer}</span>
                        </td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              background:
                                c.status === "Resolved"
                                  ? "#d1fae5"
                                  : c.status === "Assigned to Field Engineer"
                                  ? "#e0e7ff"
                                  : c.status === "Under Verification"
                                  ? "#fef3c7"
                                  : "#f1f5f9",
                              color:
                                c.status === "Resolved"
                                  ? "#065f46"
                                  : c.status === "Assigned to Field Engineer"
                                  ? "#3730a3"
                                  : c.status === "Under Verification"
                                  ? "#92400e"
                                  : "#475569",
                            }}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                            onClick={() => {
                              setEditingComplaint(c);
                              setNewStatusValue(c.status);
                              setOfficerNameValue(c.assigned_officer !== "Unassigned" ? c.assigned_officer : "Er. V. Sharma (Junior Engineer)");
                              setOfficerRemarksValue(c.remarks !== "No remarks" ? c.remarks : "");
                            }}
                          >
                            ✏️ Update
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal: Update Complaint Status Dialog */}
            {editingComplaint && (
              <div className="modal-overlay">
                <div className="modal-dialog">
                  <div className="modal-header">
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Update Grievance Status</h3>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        Ticket: <strong>{editingComplaint.tracking_id}</strong> ({editingComplaint.citizen_name})
                      </div>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setEditingComplaint(null)}
                      style={{ border: "none", background: "transparent", fontSize: "1.2rem", cursor: "pointer" }}
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleUpdateStatusSubmit} style={{ marginTop: "1rem" }}>
                    <div className="form-group" style={{ marginBottom: "1rem" }}>
                      <label className="form-label">Workflow Status</label>
                      <select
                        value={newStatusValue}
                        onChange={(e) => setNewStatusValue(e.target.value)}
                        className="form-input"
                        required
                      >
                        <option value="Filed">Filed</option>
                        <option value="Under Verification">Under Verification</option>
                        <option value="Assigned to Field Engineer">Assigned to Field Engineer</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: "1rem" }}>
                      <label className="form-label">Assigned Officer / Engineer</label>
                      <input
                        type="text"
                        value={officerNameValue}
                        onChange={(e) => setOfficerNameValue(e.target.value)}
                        className="form-input"
                        placeholder="e.g. Er. S. K. Verma (Assistant Engineer)"
                        required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                      <label className="form-label">Official Resolution Remarks</label>
                      <textarea
                        value={officerRemarksValue}
                        onChange={(e) => setOfficerRemarksValue(e.target.value)}
                        className="form-textarea"
                        placeholder="Detail site visit, actions taken, pipeline/transformer repair notes..."
                        style={{ minHeight: "80px" }}
                        required
                      ></textarea>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setEditingComplaint(null)}
                        disabled={statusUpdating}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={statusUpdating}>
                        {statusUpdating ? "Saving to Azure..." : "✓ Confirm & Update Status"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: POLICY CLARIFIER & DOUBTS Q&A */}
        {activeTab === "policy_qa" && (
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">
                  <span>📜</span> Government Policy Clarifier & Doubts Q&A
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                  Ask questions about government schemes, rules, and circulars with clause-by-clause legal grounding and instant multi-language translation.
                </p>
              </div>
              <span className="badge badge-primary">AI Legal Specialist</span>
            </div>

            {/* Ingestion Mode Toggle */}
            <div className="mode-toggle-group" style={{ marginBottom: "1.5rem" }}>
              <button
                className={`mode-btn ${policyUploadMode === "preset" ? "active" : ""}`}
                onClick={() => setPolicyUploadMode("preset")}
              >
                🏛️ Official Schemes Library
              </button>
              <button
                className={`mode-btn ${policyUploadMode === "upload" ? "active" : ""}`}
                onClick={() => setPolicyUploadMode("upload")}
              >
                📁 Upload Circular (PDF/Image)
              </button>
              <button
                className={`mode-btn ${policyUploadMode === "paste" ? "active" : ""}`}
                onClick={() => setPolicyUploadMode("paste")}
              >
                ✍️ Paste Policy Text
              </button>
            </div>

            {/* PRESET SCHEMES SELECTOR */}
            {policyUploadMode === "preset" && (
              <div style={{ marginBottom: "1.5rem" }}>
                <label className="form-label" style={{ marginBottom: "0.5rem" }}>
                  Select an Official Government Welfare Policy to Clarify:
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.85rem" }}>
                  {samplePolicies.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectSamplePolicy(p.id)}
                      className={`complaint-card policy-sample-card ${activePolicyTitle === p.title ? "selected" : ""}`}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-main)", marginBottom: "0.3rem" }}>
                          {p.title}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--primary)", fontWeight: 600, marginBottom: "0.5rem" }}>
                          🏛️ {p.department}
                        </div>
                        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.45 }}>
                          {p.summary}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* UPLOAD CIRCULAR (PDF/IMAGE) */}
            {policyUploadMode === "upload" && (
              <div className="manual-form-card" style={{ marginBottom: "1.5rem" }}>
                <div className="form-group" style={{ marginBottom: "1rem" }}>
                  <label className="form-label">Upload Policy Notification / Gazette / Circular (PDF, PNG, JPG)</label>
                  <input
                    type="file"
                    ref={policyFileInputRef}
                    accept=".pdf,image/png,image/jpeg"
                    onChange={(e) => setSelectedPolicyFile(e.target.files[0] || null)}
                    className="form-input"
                  />
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    Layout-aware OCR extracts all clauses, sections, eligibility conditions, and statutory rules.
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={handleExtractPolicyFile}
                  disabled={policyExtractLoading || !selectedPolicyFile}
                >
                  {policyExtractLoading ? "Analyzing Circular with Document Intelligence..." : "🔍 Analyze & Ingest Circular"}
                </button>
              </div>
            )}

            {/* PASTE TEXT OPTION */}
            {policyUploadMode === "paste" && (
              <div className="manual-form-card" style={{ marginBottom: "1.5rem" }}>
                <div className="form-group" style={{ marginBottom: "0.75rem" }}>
                  <label className="form-label">Official Circular / Policy Text</label>
                  <textarea
                    placeholder="Paste full text of municipal notification, subsidy circular, or statutory gazette here..."
                    value={policyPasteText}
                    onChange={(e) => setPolicyPasteText(e.target.value)}
                    className="form-textarea"
                    style={{ minHeight: 140 }}
                  ></textarea>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleApplyPastedPolicy}
                  disabled={!policyPasteText.trim()}
                >
                  ✓ Load Custom Policy Document
                </button>
              </div>
            )}

            {/* ACTIVE POLICY SUMMARY CARD */}
            {activePolicyText && (
              <div className="policy-active-card">
                <div className="policy-active-header">
                  <div>
                    <span style={{ fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700, color: "var(--primary)" }}>
                      Current Grounding Document ({activePolicyDept})
                    </span>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)", marginTop: "0.2rem" }}>
                      {activePolicyTitle}
                    </h3>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", background: "#e2e8f0", padding: "0.2rem 0.6rem", borderRadius: "4px", color: "#475569" }}>
                      {activePolicyText.length.toLocaleString()} characters
                    </span>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem" }}
                      onClick={() => setShowDocPreview(!showDocPreview)}
                    >
                      {showDocPreview ? "Hide Preview ▲" : "View Text Preview ▼"}
                    </button>
                  </div>
                </div>

                {policyBlobUrl && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <a
                      href={policyBlobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="blob-link-badge"
                    >
                      <span>☁️</span> <strong>Stored in Azure Blob Vault:</strong> <code>{policyBlobUrl.split('/').pop()}</code> ↗
                    </a>
                  </div>
                )}

                {showDocPreview && (
                  <div className="policy-doc-preview-box">
                    {activePolicyText}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: INTERACTIVE DOUBTS & Q&A CONSOLE */}
            <div className="qa-console-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <label className="form-label" style={{ margin: 0, fontSize: "0.95rem" }}>
                  ❓ What is your doubt or question regarding this policy?
                </label>
                <button
                  type="button"
                  className={`mic-btn ${isPolicyRecording ? "recording" : ""}`}
                  onClick={togglePolicySpeechRecognition}
                  title="Ask your doubt using voice in Hindi or English"
                >
                  <span>🎙️</span>
                  <span>{isPolicyRecording ? "Listening..." : "Ask with Voice (Hindi/English)"}</span>
                </button>
              </div>

              {/* Sample Doubt Chips */}
              <div className="doubt-chips-group">
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", alignSelf: "center", marginRight: "0.2rem" }}>
                  Suggested Doubts:
                </span>
                {activePolicyTitle.includes("Water") ? (
                  <>
                    <button type="button" className="doubt-chip" onClick={() => { setPolicyQuestion("What happens if my consumption is 21,000 litres instead of 20,000?"); handleAskPolicyDoubt("What happens if my consumption is 21,000 litres instead of 20,000?"); }}>
                      💧 What if I consume 21,000 litres?
                    </button>
                    <button type="button" className="doubt-chip" onClick={() => { setPolicyQuestion("Who is eligible for the 20kL free water scheme?"); handleAskPolicyDoubt("Who is eligible for the 20kL free water scheme?"); }}>
                      💧 Who is eligible?
                    </button>
                    <button type="button" className="doubt-chip" onClick={() => { setPolicyQuestion("What is the rule if my water meter is defective or stopped?"); handleAskPolicyDoubt("What is the rule if my water meter is defective or stopped?"); }}>
                      💧 Rule for defective water meters?
                    </button>
                  </>
                ) : activePolicyTitle.includes("Surya") ? (
                  <>
                    <button type="button" className="doubt-chip" onClick={() => { setPolicyQuestion("How much subsidy will I get for a 3 kW solar system?"); handleAskPolicyDoubt("How much subsidy will I get for a 3 kW solar system?"); }}>
                      ⚡ Subsidy for 3 kW solar?
                    </button>
                    <button type="button" className="doubt-chip" onClick={() => { setPolicyQuestion("What documents are required to apply for PM Surya Ghar?"); handleAskPolicyDoubt("What documents are required to apply for PM Surya Ghar?"); }}>
                      ⚡ Required documents to apply?
                    </button>
                    <button type="button" className="doubt-chip" onClick={() => { setPolicyQuestion("What is the DISCOM timeline to install net meters?"); handleAskPolicyDoubt("What is the DISCOM timeline to install net meters?"); }}>
                      ⚡ Net meter installation timeline?
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className="doubt-chip" onClick={() => { setPolicyQuestion("What is the penalty if the PIO delays the response beyond 30 days?"); handleAskPolicyDoubt("What is the penalty if the PIO delays the response beyond 30 days?"); }}>
                      📜 Penalty for PIO delay?
                    </button>
                    <button type="button" className="doubt-chip" onClick={() => { setPolicyQuestion("Are BPL cardholders exempt from RTI fees?"); handleAskPolicyDoubt("Are BPL cardholders exempt from RTI fees?"); }}>
                      📜 Are BPL citizens exempt?
                    </button>
                    <button type="button" className="doubt-chip" onClick={() => { setPolicyQuestion("When can I file a First Appeal under RTI?"); handleAskPolicyDoubt("When can I file a First Appeal under RTI?"); }}>
                      📜 When to file First Appeal?
                    </button>
                  </>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <textarea
                  placeholder="Type your question or doubt here in any language (e.g. 'Can commercial shops apply for this?' or 'Kya mujhe subsidised rate milega?')..."
                  value={policyQuestion}
                  onChange={(e) => setPolicyQuestion(e.target.value)}
                  className="form-textarea"
                  style={{ minHeight: "85px" }}
                ></textarea>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => handleAskPolicyDoubt()}
                disabled={policyAsking || !policyQuestion.trim() || !activePolicyText}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {policyAsking ? "Reasoning with GPT-5-mini Legal Specialist..." : "🔍 Clarify & Resolve Doubt"}
              </button>
            </div>

            {/* STEP 3 & 4: GROUNDED ANSWER & MULTILINGUAL TRANSLATION TOOL */}
            {policyAnswerResult && (
              <div className="policy-answer-box">
                <div className="policy-answer-header">
                  <div>
                    <strong style={{ fontSize: "1.05rem", color: "var(--primary)" }}>
                      ✓ Official Grounded Policy Clarification
                    </strong>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      Source: {policyAnswerResult.source}
                    </div>
                  </div>
                  <span className="badge badge-success">Grounded & Verified</span>
                </div>

                {/* Cited Clauses Badges */}
                {policyAnswerResult.cited_clauses && policyAnswerResult.cited_clauses.length > 0 && (
                  <div className="cited-clauses-container">
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>
                      📌 Cited Policy Clauses:
                    </span>
                    {policyAnswerResult.cited_clauses.map((clause, idx) => (
                      <span key={idx} className="clause-tag">
                        {clause}
                      </span>
                    ))}
                  </div>
                )}

                {/* Plain-Language Answer */}
                <div className="policy-answer-text">
                  {translatingAnswer ? (
                    <div style={{ fontStyle: "italic", color: "var(--text-muted)", padding: "0.5rem 0" }}>
                      Translating explanation into regional language...
                    </div>
                  ) : (
                    translatedAnswer || policyAnswerResult.answer || (
                      <div style={{ fontStyle: "italic", color: "var(--text-muted)" }}>
                        No specific answer could be formulated for this query. Please consult the designated department nodal officer.
                      </div>
                    )
                  )}
                </div>

                {/* MULTILINGUAL TRANSLATION TOOL */}
                <div className="translation-toolbar-card">
                  <div className="translation-toolbar-header">
                    <div>
                      <strong style={{ fontSize: "0.85rem", color: "#1e293b" }}>
                        🌐 Multilingual Translation Tool
                      </strong>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        Translate this official explanation into your native regional language:
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: "0.75rem", padding: "0.2rem 0.55rem" }}
                        onClick={() => {
                          const textToCopy = translatedAnswer || policyAnswerResult.answer;
                          navigator.clipboard.writeText(textToCopy);
                          setCopiedPolicyAnswer(true);
                          setTimeout(() => setCopiedPolicyAnswer(false), 2000);
                        }}
                      >
                        {copiedPolicyAnswer ? "✓ Copied" : "📋 Copy"}
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: "0.75rem", padding: "0.2rem 0.55rem" }}
                        onClick={() => {
                          const textToSpeak = translatedAnswer || policyAnswerResult.answer;
                          const cleanText = textToSpeak.replace(/[#\*_]/g, "");
                          const utterance = new SpeechSynthesisUtterance(cleanText);
                          if (targetLang === "hi") utterance.lang = "hi-IN";
                          else if (targetLang === "pa") utterance.lang = "pa-IN";
                          else if (targetLang === "bn") utterance.lang = "bn-IN";
                          else if (targetLang === "ta") utterance.lang = "ta-IN";
                          else utterance.lang = "en-IN";
                          window.speechSynthesis.speak(utterance);
                        }}
                      >
                        🔊 Listen
                      </button>
                    </div>
                  </div>

                  <div className="lang-pills-row">
                    <button
                      className={`lang-pill-btn ${targetLang === "en" ? "active" : ""}`}
                      onClick={() => handleTranslatePolicyAnswer("en")}
                    >
                      🌐 English
                    </button>
                    <button
                      className={`lang-pill-btn ${targetLang === "hi" ? "active" : ""}`}
                      onClick={() => handleTranslatePolicyAnswer("hi")}
                    >
                      🇮🇳 हिन्दी (Hindi)
                    </button>
                    <button
                      className={`lang-pill-btn ${targetLang === "pa" ? "active" : ""}`}
                      onClick={() => handleTranslatePolicyAnswer("pa")}
                    >
                      🇮🇳 ਪੰਜਾਬੀ (Punjabi)
                    </button>
                    <button
                      className={`lang-pill-btn ${targetLang === "bn" ? "active" : ""}`}
                      onClick={() => handleTranslatePolicyAnswer("bn")}
                    >
                      🇮🇳 বাংলা (Bengali)
                    </button>
                    <button
                      className={`lang-pill-btn ${targetLang === "ta" ? "active" : ""}`}
                      onClick={() => handleTranslatePolicyAnswer("ta")}
                    >
                      🇮🇳 தமிழ் (Tamil)
                    </button>
                    <button
                      className={`lang-pill-btn ${targetLang === "te" ? "active" : ""}`}
                      onClick={() => handleTranslatePolicyAnswer("te")}
                    >
                      🇮🇳 తెలుగు (Telugu)
                    </button>
                    <button
                      className={`lang-pill-btn ${targetLang === "mr" ? "active" : ""}`}
                      onClick={() => handleTranslatePolicyAnswer("mr")}
                    >
                      🇮🇳 मराठी (Marathi)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: CHANDIGARH AUTHORITIES & POLICY MATRIX */}
        {activeTab === "departments" && (
          <DepartmentMatrix departmentsList={departmentsList} />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          <strong>Chandigarh JanConnect (ਚੰਡੀਗੜ੍ਹ ਜਨ ਕਨੈਕਟ / चंडीगढ़ जन कनेक्ट)</strong> — Civic Grievance Navigation System for The City Beautiful.
        </p>
        <p style={{ marginTop: "0.3rem", fontSize: "0.75rem", opacity: 0.8 }}>
          Municipal Corporation Chandigarh (MCC) • Chandigarh Power Distribution Limited (CPDL) • Powered by Azure AI Foundry (gpt-5-mini) • Azure Document Intelligence • Azure Storage
        </p>
      </footer>
    </div>
  );
}
