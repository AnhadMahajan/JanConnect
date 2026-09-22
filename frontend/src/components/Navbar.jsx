export default function Navbar({
  currentView = "citizen",
  isAdminAuthenticated = false,
  onOpenAdminPortal,
  onSwitchToCitizen,
  onLogout,
}) {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="brand-wrapper" onClick={onSwitchToCitizen} style={{ cursor: "pointer" }} title="JanConnect Home">
          <div className="brand-icon">🏛️</div>
          <div className="brand-titles">
            <div className="brand-title-row">
              <h1 className="brand-title">Chandigarh JanConnect</h1>
              <span className="brand-lang-badge">ਚੰਡੀਗੜ੍ਹ ਜਨ ਕਨੈਕਟ • चंडीगढ़ जन कनेक्ट</span>
            </div>
            <div className="brand-sub">
              Civic Grievance AI Resolution Bridge • Municipal Corporation (MCC) & UT Administration
            </div>
          </div>
        </div>

        <div className="nav-badges">
          {currentView === "admin" ? (
            <>
              <div className="mock-badge badge-admin-active">
                <span className="mock-dot dot-green"></span>
                <span>Officer Desk Active</span>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={onSwitchToCitizen}
                style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
              >
                ← Citizen Portal
              </button>
              <button
                className="btn btn-secondary btn-sm btn-logout"
                onClick={onLogout}
                style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
                title="Log out of Admin Portal"
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <div className="mock-badge badge-pilot">
                <span className="mock-dot dot-green"></span>
                <span>UT Chandigarh Pilot Active</span>
              </div>
              <div className="mock-badge badge-cloud">
                <span className="mock-dot dot-purple"></span>
                <span>Azure AI Connected</span>
              </div>
              <button
                type="button"
                className="btn-admin-portal"
                onClick={onOpenAdminPortal}
                title="Access Municipal Officer Resolution Desk (Protected Portal)"
              >
                <span>🛡️</span>
                <span>{isAdminAuthenticated ? "Admin Desk (Active)" : "Admin Portal"}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
