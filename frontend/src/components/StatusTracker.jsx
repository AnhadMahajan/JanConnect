import { useState, useEffect } from "react";

export default function StatusTracker({
  lookupId,
  setLookupId,
  trackedStatus,
  setTrackedStatus,
  trackingLoading,
  setTrackingLoading
}) {
  const [advancing, setAdvancing] = useState(false);
  const [recentGrievances, setRecentGrievances] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);

  // Fetch live grievances from Azure Table Storage
  const loadCloudGrievances = async () => {
    setFeedLoading(true);
    try {
      const res = await fetch("/api/grievances");
      const data = await res.json();
      if (Array.isArray(data)) {
        setRecentGrievances(data);
      }
    } catch (e) {
      console.error("Error loading cloud grievances:", e);
    } finally {
      setFeedLoading(false);
    }
  };

  useEffect(() => {
    loadCloudGrievances();
  }, []);

  // Lookup Status by specific ID
  const handleLookupStatus = async (idToLookup) => {
    const target = typeof idToLookup === "string" ? idToLookup : lookupId;
    const cleanId = (target || "").trim().toUpperCase();
    if (!cleanId) return;
    setLookupId(cleanId);
    setTrackingLoading(true);
    try {
      const res = await fetch(`/api/status/${encodeURIComponent(cleanId)}`);
      const data = await res.json();
      setTrackedStatus(data);
    } catch (e) {
      console.error("Error looking up status:", e);
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    if (e) e.preventDefault();
    handleLookupStatus();
  };

  // Status Progression
  const handleAdvanceStatus = async () => {
    if (!trackedStatus || !trackedStatus.tracking_id) return;
    setAdvancing(true);
    try {
      const res = await fetch(`/api/status/${trackedStatus.tracking_id}/advance`, {
        method: "POST"
      });
      const data = await res.json();
      setTrackedStatus(data);
      loadCloudGrievances(); // Refresh list after status change
    } catch (e) {
      console.error("Error advancing status:", e);
    } finally {
      setAdvancing(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === "Resolved") return "#16a34a";
    if (status === "Investigation In Progress") return "#2563eb";
    if (status === "Assigned to Field Officer") return "#d97706";
    return "#4f46e5";
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <span>🔍</span> Stage 5: Live Grievance Tracking & SLA Monitor
        </h2>
        <span className="badge badge-success">Azure Table Database</span>
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        Look up the real-time lifecycle status of any filed grievance tracking identifier:
      </p>

      <form onSubmit={handleFormSubmit} className="tracker-input-group">
        <input
          type="text"
          placeholder="Enter Tracking ID (e.g. GRV-CHD-WTR-22B or GRV-XXXXXXXX)"
          value={lookupId}
          onChange={(e) => setLookupId(e.target.value)}
          className="tracker-input"
        />
        <button type="submit" className="btn btn-primary tracker-btn" disabled={trackingLoading || !lookupId.trim()}>
          {trackingLoading ? "Searching..." : "🔍 Check Status"}
        </button>
      </form>

      {/* Quick Lookup Chips */}
      <div className="quick-chips-wrapper" style={{ marginTop: "0.25rem", marginBottom: "1.25rem", borderTop: "none", paddingTop: 0 }}>
        <div className="quick-chips-header">
          <span>💡</span>
          <span>Sample Chandigarh Tickets for Quick Lookup:</span>
        </div>
        <div className="quick-chips-list">
          {[
            { id: "GRV-CHD-WTR-22B", label: "💧 GRV-CHD-WTR-22B (Sec 22 Water)" },
            { id: "GRV-CHD-PWR-35C", label: "⚡ GRV-CHD-PWR-35C (Sec 35 Power)" },
            { id: "GRV-CHD-PWR-13M", label: "⚡ GRV-CHD-PWR-13M (Manimajra)" },
            { id: "GRV-CHD-SAN-46D", label: "🗑️ GRV-CHD-SAN-46D (Sec 46 Waste)" },
            { id: "GRV-CHD-RDS-19C", label: "🚧 GRV-CHD-RDS-19C (Sec 19 Pothole)" }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              className="quick-chip"
              onClick={() => handleLookupStatus(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {trackedStatus && (
        <div style={{ marginTop: "1.5rem" }}>
          {trackedStatus.error ? (
            <div style={{ padding: "1.25rem", background: "var(--danger-light)", color: "#b91c1c", borderRadius: "var(--radius-md)", border: "1px solid #fecaca" }}>
              <strong>Not Found:</strong> {trackedStatus.error}
            </div>
          ) : (
            <div className="filing-receipt">
              <div className="receipt-header">
                <div className="receipt-title">
                  <span>📋</span> Tracking ID: {trackedStatus.tracking_id}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span className="badge badge-primary">{trackedStatus._storage || "Azure Table Storage"}</span>
                  <span
                    className="badge"
                    style={{
                      background: `${getStatusColor(trackedStatus.status)}20`,
                      color: getStatusColor(trackedStatus.status),
                      border: `1px solid ${getStatusColor(trackedStatus.status)}`
                    }}
                  >
                    ● {trackedStatus.status}
                  </span>
                </div>
              </div>

              <div className="receipt-grid">
                <div className="receipt-item">
                  <label>Citizen</label>
                  <span>{trackedStatus.citizen_name || "N/A"}</span>
                </div>
                <div className="receipt-item">
                  <label>Department Assigned</label>
                  <span>{trackedStatus.department_name}</span>
                </div>
                <div className="receipt-item">
                  <label>Resolution SLA</label>
                  <span>{trackedStatus.sla_target_days ? `${trackedStatus.sla_target_days} Days` : "Standard SLA"}</span>
                </div>
                <div className="receipt-item">
                  <label>Target SLA Deadline</label>
                  <span style={{ fontSize: "0.8rem" }}>
                    {trackedStatus.sla_deadline ? new Date(trackedStatus.sla_deadline).toLocaleDateString() : "Pending"}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: "1.25rem", padding: "1rem", background: "#ffffff", borderRadius: "var(--radius-md)", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                  Filed Grievance Content:
                </div>
                <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>"{trackedStatus.complaint_text}"</p>
              </div>

              {trackedStatus.report_blob_url && (
                <div style={{ marginTop: "0.75rem", padding: "0.75rem 1rem", background: "#eff6ff", borderRadius: "var(--radius-md)", border: "1px solid #bfdbfe", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1e40af" }}>☁️ Official Grievance Dossier in Azure Blob Storage</span>
                    <div style={{ fontSize: "0.72rem", color: "#3b82f6" }}>Immutable municipal audit file registered for this complaint</div>
                  </div>
                  <a
                    href={trackedStatus.report_blob_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: "0.75rem", padding: "0.25rem 0.65rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                  >
                    <span>📑</span> Open Cloud Dossier ↗
                  </a>
                </div>
              )}

              {/* Classroom Demo Action: Advance Status */}
              <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", paddingTop: "1rem", borderTop: "1px dashed #cbd5e1" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  💡 <strong>Classroom Live Action:</strong> Advance ticket lifecycle state in Azure Table Storage:
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAdvanceStatus}
                  disabled={advancing || trackedStatus.status === "Resolved"}
                >
                  {advancing ? "Updating..." : trackedStatus.status === "Resolved" ? "✓ Ticket Fully Resolved" : `Advance Ticket Status ➔`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Real-time Azure Table Grievances Feed */}
      <div style={{ marginTop: "2.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-color)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>🗄️</span> Live Azure Table Storage Grievance Feed
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              All tickets actively stored in Azure Table Storage ({recentGrievances.length} records in cloud):
            </p>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={loadCloudGrievances}
            disabled={feedLoading}
          >
            {feedLoading ? "Refreshing..." : "🔄 Refresh Cloud Feed"}
          </button>
        </div>

        {recentGrievances.length === 0 ? (
          <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", background: "#f8fafc", borderRadius: "var(--radius-md)" }}>
            {feedLoading ? "Loading complaints from Azure Table Storage..." : "No grievances found in database yet. File one in Stage 1!"}
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Citizen</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentGrievances.map((g, idx) => (
                  <tr key={idx} style={{ background: trackedStatus?.tracking_id === g.tracking_id ? "#f0fdf4" : undefined }}>
                    <td>
                      <code style={{ fontWeight: 700, color: "var(--primary)" }}>{g.tracking_id}</code>
                    </td>
                    <td>
                      <strong>{g.citizen_name || "Chandigarh Citizen"}</strong>
                    </td>
                    <td style={{ fontSize: "0.82rem", color: "#475569" }}>{g.department_name}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.25rem 0.55rem",
                          background: `${getStatusColor(g.status)}15`,
                          color: getStatusColor(g.status),
                          border: `1px solid ${getStatusColor(g.status)}40`
                        }}
                      >
                        ● {g.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
                        onClick={() => handleLookupStatus(g.tracking_id)}
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
