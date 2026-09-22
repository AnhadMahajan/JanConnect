import { useState, useEffect } from "react";

export default function OfficerDesk({ onBackToCitizen, onLogout, onComplaintUpdated }) {
  const [adminComplaints, setAdminComplaints] = useState([]);
  const [adminMetrics, setAdminMetrics] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminDeptFilter, setAdminDeptFilter] = useState("all");
  const [adminStatusFilter, setAdminStatusFilter] = useState("all");
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  
  // Status Edit Modal State
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [newStatusValue, setNewStatusValue] = useState("Assigned to Field Engineer");
  const [officerNameValue, setOfficerNameValue] = useState("Er. V. Sharma (Junior Engineer)");
  const [officerRemarksValue, setOfficerRemarksValue] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Load all complaints and KPI metrics from backend
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

  useEffect(() => {
    loadAdminComplaints();
  }, []);

  // Update Status handler
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
        if (onComplaintUpdated && data.complaint) {
          onComplaintUpdated(data.complaint);
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

  // Filter complaints based on search query, department, and status
  const filteredComplaints = adminComplaints.filter((c) => {
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
    <div className="card officer-desk-container">
      {/* Top Banner with Navigation & Authenticated Status */}
      <div className="card-header officer-desk-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <h2 className="card-title" style={{ margin: 0 }}>
              <span>🛡️</span> Municipal Officer Resolution Desk
            </h2>
            <span className="badge badge-admin-active">
              ● Officer Logged In
            </span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.35rem" }}>
            Official municipal administration portal for Chandigarh zonal officers, SDOs, and junior engineers.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn btn-secondary btn-sm" onClick={onBackToCitizen}>
            ← Citizen Portal
          </button>
          <button className="btn btn-secondary btn-sm" onClick={loadAdminComplaints} disabled={adminLoading}>
            {adminLoading ? "Refreshing..." : "🔄 Refresh Desk"}
          </button>
          <button className="btn btn-secondary btn-sm btn-logout" onClick={onLogout} title="Log out of Admin Portal">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* KPI Summary Metric Cards */}
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
          className="admin-search-input"
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
            {filteredComplaints.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                  {adminLoading ? "Loading grievances from cloud database..." : "No grievances found matching the selected filters."}
                </td>
              </tr>
            ) : (
              filteredComplaints.map((c) => (
                <tr key={c.tracking_id}>
                  <td>
                    <code style={{ fontWeight: 700, color: "var(--primary)" }}>{c.tracking_id}</code>
                  </td>
                  <td>
                    <strong>{c.citizen_name || "Chandigarh Citizen"}</strong>
                  </td>
                  <td>
                    <span className="badge badge-secondary" style={{ fontSize: "0.76rem" }}>{c.department_name}</span>
                  </td>
                  <td style={{ maxWidth: 280, fontSize: "0.85rem", color: "#475569" }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={c.complaint_text}>
                      {c.complaint_text}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.82rem", color: "#1e293b", fontWeight: 500 }}>
                      {c.assigned_officer || "Unassigned"}
                    </span>
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        fontSize: "0.75rem",
                        padding: "0.25rem 0.55rem",
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
                        border:
                          c.status === "Resolved"
                            ? "1px solid #a7f3d0"
                            : c.status === "Assigned to Field Engineer"
                            ? "1px solid #c7d2fe"
                            : "1px solid #cbd5e1"
                      }}
                    >
                      ● {c.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
                      onClick={() => {
                        setEditingComplaint(c);
                        setNewStatusValue(c.status);
                        setOfficerNameValue(c.assigned_officer && c.assigned_officer !== "Unassigned" ? c.assigned_officer : "Er. V. Sharma (Junior Engineer)");
                        setOfficerRemarksValue(c.remarks && c.remarks !== "No remarks" ? c.remarks : "");
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
        <div className="modal-overlay" onClick={() => setEditingComplaint(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Update Grievance Status</h3>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
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

            <form onSubmit={handleUpdateStatusSubmit} style={{ padding: "1.25rem" }}>
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
                  style={{ minHeight: "85px" }}
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
  );
}
