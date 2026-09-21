import { useState, useRef } from "react";

export default function DocumentIntelligence({
  availableDocs,
  extractedDocs,
  setExtractedDocs,
  docLoading,
  setDocLoading
}) {
  const [docExtractMode, setDocExtractMode] = useState("file_upload");
  const [manualDocText, setManualDocText] = useState("");
  const [liveDocResult, setLiveDocResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const docTemplates = [
    {
      label: "💧 MCC Chandigarh Water Bill",
      text: "MUNICIPAL CORPORATION CHANDIGARH (MCC)\nWATER SUPPLY & SEWERAGE BILL\nAccount Number: CHD-WTR-22B-8902\nConsumer Name: Virender Sharma\nService Address: House No 1240, Sector 22-B, Chandigarh - 160022\nSub-Division: Sub Division No. 2, Sector 22\nBilling Period: August 2026\nMeter Number: MTR-CH-88319\nPrevious Reading: 1420 KL\nCurrent Reading: 2890 KL\nUnits Consumed: 1470 KL\nWater Charges: Rs. 3,850\nSewerage Cess (20%): Rs. 770\nTotal Amount Due: Rs. 4,850\nDue Date: 15-09-2026\nPayment Portal: e-Sampark Chandigarh / mcchandigarh.gov.in"
    },
    {
      label: "⚡ CPDL Chandigarh Electricity Bill",
      text: "CHANDIGARH POWER DISTRIBUTION LIMITED (CPDL)\nELECTRICITY BILL - UT CHANDIGARH\nConsumer ID / Account No: CPDL-DS-35C-4410\nConsumer Name: Harpreet Singh\nService Address: House 312, Sector 35-C, Chandigarh - 160035\nOperation Sub-Division: Sector 34\nTariff Category: Domestic Supply (DS)\nSanctioned Load: 5.00 KW\nMeter Status: Normal\nUnits Billed: 480 kWh\nEnergy Charges: Rs. 2,160\nElectricity Duty & Taxes: Rs. 480\nTotal Payable Amount: Rs. 2,640\nDue Date: 22-09-2026\n24x7 Call Centre: 19121"
    },
    {
      label: "🏛️ e-Sampark Citizen Receipt",
      text: "CHANDIGARH ADMINISTRATION - e-SAMPARK CENTER\nCITIZEN SERVICE ACKNOWLEDGEMENT RECEIPT\nCenter Location: e-Sampark Center, Sector 17, Chandigarh\nToken Number: CHD-SMP-2026-10492\nService Name: MCC Public Grievance Registration - Pipeline Leakage\nApplicant Name: Pooja Verma\nMobile Number: 9876543210\nAddress: Sector 19-C, Chandigarh\nSubmission Date: 08-09-2026\nStatutory Redressal Target: 48 Hours\nNodal Authority: Sub-Divisional Officer (PH), Municipal Corporation Chandigarh"
    }
  ];

  // Stage 2: Extract text manually
  const handleExtractManualText = async () => {
    if (!manualDocText.trim()) {
      alert("Please enter or paste document text to extract.");
      return;
    }
    setDocLoading(true);
    try {
      const res = await fetch("/api/extract-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: manualDocText }),
      });
      const data = await res.json();
      setLiveDocResult(data);
    } catch (e) {
      console.error("Error extracting text:", e);
    } finally {
      setDocLoading(false);
    }
  };

  // Stage 2: Extract from file upload
  const handleExtractFile = async () => {
    if (!selectedFile) {
      alert("Please choose a file to upload first.");
      return;
    }
    setDocLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/extract-file", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setLiveDocResult(data);
    } catch (e) {
      console.error("Error extracting file:", e);
    } finally {
      setDocLoading(false);
    }
  };

  // Stage 2: Extract sample mock document
  const handleExtractSampleDoc = async (docId) => {
    setDocLoading(true);
    try {
      const res = await fetch(`/api/extract/${docId}`);
      const data = await res.json();
      setExtractedDocs((prev) => ({ ...prev, [docId]: data }));
    } catch (e) {
      console.error("Error extracting document:", e);
    } finally {
      setDocLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <span>📄</span> Stage 2: Chandigarh Citizen Document Intelligence
        </h2>
        
        <div className="mode-toggle-group">
          <button
            className={`mode-btn ${docExtractMode === "manual_text" ? "active" : ""}`}
            onClick={() => setDocExtractMode("manual_text")}
          >
            ✍️ Enter / Paste Bill Text
          </button>
          <button
            className={`mode-btn ${docExtractMode === "upload" ? "active" : ""}`}
            onClick={() => setDocExtractMode("upload")}
          >
            📤 Upload Bill (PDF/Image)
          </button>
          <button
            className={`mode-btn ${docExtractMode === "samples" ? "active" : ""}`}
            onClick={() => setDocExtractMode("samples")}
          >
            📂 Chandigarh Doc Library
          </button>
        </div>
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
        Extract structured civic entities (Consumer number, Sector/Ward, Amount due, Meter reading, Sewerage cess) from proof attachments using Azure Document Intelligence and Azure OpenAI.
      </p>

      {/* OPTION 1: PASTE / ENTER DOCUMENT TEXT */}
      {docExtractMode === "manual_text" && (
        <div className="manual-form-card">
          <div className="form-group" style={{ marginBottom: "0.75rem" }}>
            <label className="form-label">Document Text / Receipt Data</label>
            <textarea
              placeholder="Paste or type text from an MCC water bill, CPDL electricity bill, or e-Sampark receipt here..."
              value={manualDocText}
              onChange={(e) => setManualDocText(e.target.value)}
              className="form-textarea"
              style={{ minHeight: 140 }}
            ></textarea>
          </div>

          <div className="quick-chips-wrapper" style={{ marginBottom: "1rem" }}>
            <span className="quick-chip-label">Load Chandigarh Template:</span>
            {docTemplates.map((tpl, i) => (
              <button
                key={i}
                type="button"
                className="quick-chip"
                onClick={() => setManualDocText(tpl.text)}
              >
                {tpl.label}
              </button>
            ))}
          </div>

          <button
            className="btn btn-primary"
            onClick={handleExtractManualText}
            disabled={docLoading || !manualDocText.trim()}
          >
            {docLoading ? "Extracting Entities with Azure OpenAI..." : "🔍 Extract Structured Entities"}
          </button>
        </div>
      )}

      {/* OPTION 2: UPLOAD FILE (PDF/IMAGE) */}
      {docExtractMode === "upload" && (
        <div className="manual-form-card">
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".pdf,.png,.jpg,.jpeg,.tiff"
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
          
          <div
            className="dropzone-box"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <div className="dropzone-icon">📁</div>
            <strong style={{ fontSize: "1rem", color: "var(--primary)" }}>
              {selectedFile ? `Selected: ${selectedFile.name}` : "Click to Browse & Upload Document"}
            </strong>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Supports PDF, JPG, PNG, TIFF (Stored in Azure Blob Storage & analyzed with Azure Document Intelligence)
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleExtractFile}
            disabled={docLoading || !selectedFile}
          >
            {docLoading ? "Processing with Azure Document Intelligence..." : "🔍 Analyze with Azure Document Intelligence"}
          </button>
        </div>
      )}

      {/* LIVE EXTRACTION RESULT DISPLAY */}
      {liveDocResult && (docExtractMode === "manual_text" || docExtractMode === "upload") && (
        liveDocResult.error ? (
          <div style={{ marginTop: "1.5rem", padding: "1.25rem", background: "var(--danger-light)", color: "#b91c1c", borderRadius: "var(--radius-md)", border: "1px solid #fecaca" }}>
            <strong>Extraction Error:</strong> {liveDocResult.error}
          </div>
        ) : (
          <div className="doc-card" style={{ marginTop: "1.5rem", border: "2px solid #818cf8" }}>
            <div className="doc-card-header">
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--primary)" }}>
                  ✓ Extracted Document Entities
                </strong>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Source: {liveDocResult._source || "Azure Document Intelligence"}
                </div>
              </div>
              <span className="badge badge-success">Verified Structured Fields</span>
            </div>

            <table className="doc-fields-table">
              <tbody>
                {Object.entries(liveDocResult)
                  .filter(([k]) => !k.startsWith("_"))
                  .map(([key, val]) => (
                    <tr key={key}>
                      <td className="doc-field-name">{key.replace(/_/g, " ").toUpperCase()}:</td>
                      <td className="doc-field-value">{String(val)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* OPTION 3: SAMPLES LIST */}
      {docExtractMode === "samples" && (
        <div className="doc-grid">
          {availableDocs.map((docId) => {
            const isExtracted = Boolean(extractedDocs[docId]);
            const docData = extractedDocs[docId];

            return (
              <div key={docId} className="doc-card">
                <div className="doc-card-header">
                  <div>
                    <strong style={{ fontSize: "1rem", color: "var(--text-main)" }}>{docId.toUpperCase()}</strong>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {docId === "doc_1" ? "MCC Water Supply & Sewerage Bill" :
                       docId === "doc_2" ? "CPDL Electricity Distribution Bill" :
                       "Chandigarh e-Sampark Citizen Receipt"}
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleExtractSampleDoc(docId)}
                    disabled={docLoading}
                  >
                    {isExtracted ? "Re-Extract" : "🔍 Extract Entities"}
                  </button>
                </div>

                {isExtracted && docData ? (
                  <table className="doc-fields-table">
                    <tbody>
                      {Object.entries(docData).map(([key, val]) => (
                        <tr key={key}>
                          <td className="doc-field-name">{key.replace(/_/g, " ")}:</td>
                          <td className="doc-field-value">{String(val)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: "1.5rem 0", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    Click "Extract Entities" to run content understanding model.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
