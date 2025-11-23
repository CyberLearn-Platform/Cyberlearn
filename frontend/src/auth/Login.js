import React, { useState } from "react";
import "./login.css";

// 2FA-enabled Login component for Cyberquest
// - Uses your Flask endpoints at http://localhost:5000
// - Supports: login -> (if 2FA enabled) prompt OTP -> verify OTP (/2fa/login-verify)
// - Supports: 2FA setup (call /2fa/setup to get provisioning_uri, display QR, then /2fa/confirm)

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const [twoFaRequired, setTwoFaRequired] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [otp, setOtp] = useState("");

  const [setupMode, setSetupMode] = useState(false);
  const [provisioningUri, setProvisioningUri] = useState("");
  const [setupSecret, setSetupSecret] = useState("");

  const canSubmit = email.trim() !== "" && password.trim() !== "" && !loading;
  const canVerifyOtp = otp.trim().length >= 4 && !loading;
  const canConfirmSetup = otp.trim().length >= 4 && !loading;

  // Helper: check response JSON for both snake_case and camelCase variants
  function isTwoFaResponse(data) {
    return !!(data && (data.twoFaRequired || data["2fa_required"]));
  }

  async function handleSubmit(e) {
    e && e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      // Normal login success
      if (data && data.success) {
        alert("Logged in!");
        // TODO: redirect or store session/JWT
        return;
      }

      // 2FA required: server returns either data.twoFaRequired or data['2fa_required']
      if (isTwoFaResponse(data)) {
        const token = data.temp_token || data.tempToken || data.tempToken || "";
        setTempToken(token);
        setTwoFaRequired(true);
        return;
      }

      alert("Login failed: " + (data.message || res.statusText));
    } catch (err) {
      setLoading(false);
      alert("Network error: " + err.message);
    }
  }

  async function handleVerifyOtp(e) {
    e && e.preventDefault();
    if (!canVerifyOtp || !tempToken) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/2fa/login-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ temp_token: tempToken, token: otp }),
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok && data.success) {
        alert("2FA success — logged in!");
        setTwoFaRequired(false);
        setTempToken("");
        setOtp("");
        // TODO: store session or redirect
      } else {
        alert("2FA failed: " + (data.message || res.statusText));
      }
    } catch (err) {
      setLoading(false);
      alert("Network error: " + err.message);
    }
  }

  // 2FA setup: request provisioning URI + secret from server
  async function handleStartSetup(e) {
    e && e.preventDefault();
    if (!canSubmit) return alert("Enter email & password first to setup 2FA.");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok && data.success) {
        setProvisioningUri(data.provisioning_uri);
        setSetupSecret(data.secret || "");
        setSetupMode(true);
      } else {
        alert("Setup failed: " + (data.message || res.statusText));
      }
    } catch (err) {
      setLoading(false);
      alert("Network error: " + err.message);
    }
  }

  // Confirm setup: user enters the OTP shown in their authenticator after scanning QR
  async function handleConfirmSetup(e) {
    e && e.preventDefault();
    if (!canConfirmSetup) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/2fa/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, token: otp }),
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok && data.success) {
        alert("2FA enabled successfully.");
        setSetupMode(false);
        setOtp("");
      } else {
        alert("2FA confirmation failed: " + (data.message || res.statusText));
      }
    } catch (err) {
      setLoading(false);
      alert("Network error: " + err.message);
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="card">
          <div className="brand">
            <div className="logo">CQ</div>
            <div className="brand-text">
              <div className="muted">Sign in to</div>
              <div className="title">Cyberquest</div>
            </div>
          </div>

          {/* LOGIN FORM */}
          {!twoFaRequired && !setupMode && (
            <form onSubmit={handleSubmit} autoComplete="on">
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="field password-wrap">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  aria-label={showPw ? "Hide password" : "Show password"}
                  onClick={() => setShowPw((s) => !s)}
                  className="eye-btn"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>

              <div className="row between">
                <a className="muted-link" href="#">
                  Forgot Password?
                </a>
                <button
                  type="button"
                  className="muted-link"
                  onClick={handleStartSetup}
                >
                  Enable 2FA
                </button>
              </div>

              <button
                type="submit"
                className={`signin-btn ${canSubmit ? "enabled" : "disabled"}`}
                disabled={!canSubmit}
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>

              <div className="divider">
                <span>or</span>
              </div>

              <div className="socials">
                <a className="social-btn" href="#">
                  Sign in with Google
                </a>
                <a className="social-btn" href="#">
                  Sign in with LinkedIn
                </a>
                <a className="social-btn" href="#">
                  Sign in with Github
                </a>
              </div>

              <div className="create-line">
                New to Cyberquest?{" "}
                <a className="create" href="#">
                  Create Account →
                </a>
              </div>
            </form>
          )}

          {/* TWO-FA OTP FORM */}
          {twoFaRequired && (
            <form onSubmit={handleVerifyOtp}>
              <div className="field">
                <label>Enter 6-digit code from your authenticator</label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white placeholder:text-slate-400 outline-none"
                />
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="signin-btn enabled"
                  onClick={handleVerifyOtp}
                  disabled={!canVerifyOtp || loading}
                >
                  Verify
                </button>
                <button
                  type="button"
                  className="signin-btn"
                  onClick={() => {
                    setTwoFaRequired(false);
                    setTempToken("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* 2FA SETUP FLOW */}
          {setupMode && (
            <div>
              <div className="field">
                <label>Scan this QR with an authenticator app</label>
                {provisioningUri ? (
                  <div
                    style={{ display: "flex", gap: 12, alignItems: "center" }}
                  >
                    <img
                      alt="QR code"
                      src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                        provisioningUri
                      )}&size=200x200`}
                    />
                    <div>
                      <div style={{ marginBottom: 8 }}>
                        Or enter secret manually:
                      </div>
                      <div
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          padding: "8px 12px",
                          borderRadius: 8,
                        }}
                      >
                        {setupSecret}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>Generating QR…</div>
                )}
              </div>

              <form onSubmit={handleConfirmSetup}>
                <div className="field">
                  <label>
                    Enter the first 6-digit code from your app to confirm
                  </label>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                  />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="submit"
                    className="signin-btn enabled"
                    disabled={!canConfirmSetup || loading}
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    className="signin-btn"
                    onClick={() => {
                      setSetupMode(false);
                      setProvisioningUri("");
                      setSetupSecret("");
                      setOtp("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="page-footer">
          Copyright © 2017–2025 Cyberquest. <a href="#">User Agreement</a>,{" "}
          <a href="#">Privacy Notice</a>
        </div>
      </div>
    </div>
  );
}
