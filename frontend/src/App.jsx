import { useState, useEffect } from "react";
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
  const [activeTab, setActiveTab] = useState("navigator"); // "navigator", "documents", "tracker", "departments"
  
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

  // Dynamic Department Catalog (Fetched directly from Azure Table Storage)
  const [departmentsList, setDepartmentsList] = useState([]);

  // Load departments, initial complaints & available documents
  useEffect(() => {
    fetch("/api/departments")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDepartmentsList(data);
        }
      })
      .catch((err) => console.error("Error loading departments from Azure:", err));

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

  // Determine current active pipeline step
  const currentStep = filedResult ? 5 : routingResult ? 4 : selectedComplaintId ? 2 : 1;

  return (
    <div className="app-layout">
      {/* Top Navigation Bar */}
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
            className={`tab-btn ${activeTab === "departments" ? "active" : ""}`}
            onClick={() => setActiveTab("departments")}
          >
            <span>🏛️</span> Chandigarh Authorities
          </button>
        </nav>

        {/* TAB 1: GRIEVANCE NAVIGATOR */}
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

        {/* TAB 2: DOCUMENT INTELLIGENCE (STAGE 2) */}
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

        {/* TAB 4: DEPARTMENT POLICIES & KEYWORDS */}
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
          Powered by Azure AI Foundry (gpt-5-mini) • Azure AI Translator • Azure Document Intelligence • Azure AI Search • Azure Speech • Azure Storage
        </p>
      </footer>
    </div>
  );
}
