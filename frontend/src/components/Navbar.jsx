export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="brand-wrapper">
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
          <div className="mock-badge badge-pilot">
            <span className="mock-dot dot-green"></span>
            <span>UT Chandigarh Pilot Active</span>
          </div>
          <div className="mock-badge badge-cloud">
            <span className="mock-dot dot-purple"></span>
            <span>Azure AI & Storage Connected</span>
          </div>
        </div>
      </div>
    </header>
  );
}

