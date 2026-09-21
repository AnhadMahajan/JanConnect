export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="brand-wrapper">
          <div className="brand-icon">🏛️</div>
          <div className="brand-titles">
            <div className="brand-title">
              Chandigarh JanConnect <span style={{ fontSize: "0.85rem", opacity: 0.9, fontWeight: 500 }}>ਚੰਡੀਗੜ੍ਹ ਜਨ ਕਨੈਕਟ • चंडीगढ़ जन कनेक्ट</span>
            </div>
            <div className="brand-sub">Civic Grievance AI Resolution Bridge • Municipal Corporation & UT Administration</div>
          </div>
        </div>

        <div className="nav-badges">
          <div className="mock-badge" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#065f46", borderColor: "rgba(16, 185, 129, 0.3)" }}>
            <div className="mock-dot" style={{ background: "#10b981" }}></div>
            <span>UT Chandigarh Pilot Active</span>
          </div>
          <div className="mock-badge">
            <div className="mock-dot"></div>
            <span>Azure Cloud AI & Storage Connected</span>
          </div>
        </div>
      </div>
    </header>
  );
}
