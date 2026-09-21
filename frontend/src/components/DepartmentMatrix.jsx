export default function DepartmentMatrix({ departmentsList }) {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <span>🏛️</span> Chandigarh Municipal Authorities & Routing Matrix
        </h2>
        <span className="badge badge-primary">4 UT Municipal Departments</span>
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        Explore the departmental policy grounding rules, monitored keywords for automatic sector routing, official head offices, and Right to Service (RTS) statutory deadlines:
      </p>

      <div style={{ display: "grid", gap: "1.25rem" }}>
        {departmentsList.map((dept) => (
          <div key={dept.id} style={{ border: "1.5px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "1.25rem", background: "#ffffff" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={{ fontSize: "1.6rem" }}>{dept.icon}</span>
                <div>
                  <strong style={{ fontSize: "1.05rem", color: dept.accentColor }}>{dept.name}</strong>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Authority: {dept.authority} • Office: {dept.office}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span className="badge" style={{ background: "#f8fafc", color: "#334155", border: "1px solid #cbd5e1" }}>
                  📞 {dept.helpline}
                </span>
                <span className={`badge ${dept.badgeClass}`}>SLA: {dept.sla}</span>
              </div>
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginRight: "0.5rem" }}>
                Monitored Grievance Keywords (English, Hindi, Punjabi):
              </span>
              <div style={{ display: "inline-flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.25rem" }}>
                {dept.keywords.map((kw) => (
                  <span key={kw} style={{ background: "#f1f5f9", color: "#334155", padding: "0.15rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 500 }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>
                Grounding Policy Rules (Indexed in Azure AI Search & RTS Act):
              </span>
              <ul style={{ paddingLeft: "1.25rem", fontSize: "0.85rem", color: "#475569", marginTop: "0.35rem", lineHeight: 1.5 }}>
                {dept.policies.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
