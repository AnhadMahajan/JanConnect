import { useState } from "react";

export default function AdminLoginModal({ onLoginSuccess, onClose }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Hardcoded Admin Credentials for municipal review
  const VALID_USER = "admin";
  const VALID_PASS = "admin123";

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (username.trim().toLowerCase() === VALID_USER && password === VALID_PASS) {
        sessionStorage.setItem("janconnect_admin_auth", "true");
        onLoginSuccess();
      } else {
        setError("Invalid Officer ID or Password. Restricted to authorized municipal personnel.");
        setLoading(false);
      }
    }, 400);
  };

  const handleFillDemo = () => {
    setUsername(VALID_USER);
    setPassword(VALID_PASS);
    setError("");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog admin-login-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 460 }}
      >
        <div className="admin-login-header">
          <div className="admin-seal-icon">🏛️</div>
          <h3 className="admin-login-title">Chandigarh Municipal Officer Portal</h3>
          <p className="admin-login-sub">
            Restricted administrative gateway for Municipal Corporation Chandigarh (MCC) & CPDL Zonal Engineers.
          </p>
        </div>

        <form onSubmit={handleLogin} className="admin-login-form">
          {error && (
            <div className="admin-login-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label className="form-label">Officer ID / Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "1.25rem" }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Quick Demo Credentials Autofill Banner */}
          <div className="demo-creds-banner">
            <div className="demo-creds-text">
              <span style={{ fontWeight: 700, color: "#1e1b4b" }}>Demo Credentials:</span>
              <span> ID: <code>admin</code> • Password: <code>admin123</code></span>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm demo-autofill-btn"
              onClick={handleFillDemo}
            >
              ⚡ Auto-Fill
            </button>
          </div>

          <div className="admin-login-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !username || !password}
              style={{ minWidth: 140 }}
            >
              {loading ? "Verifying..." : "🛡️ Log In to Desk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
