import { useState } from "react";

// ── Icons ──────────────────────────────────────────────────────────────────
const ShieldIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  </svg>
);
const TerminalIcon = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5" /><line x1="12" x2="20" y1="19" y2="19" />
  </svg>
);
const VaultIcon = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    <path d="m7.9 7.9 2.7 2.7" />
    <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
    <path d="m13.4 10.6 2.7-2.7" />
    <circle cx="7.5" cy="16.5" r=".5" fill="currentColor" />
    <path d="m7.9 16.1 2.7-2.7" />
    <circle cx="16.5" cy="16.5" r=".5" fill="currentColor" />
    <path d="m13.4 13.4 2.7 2.7" />
  </svg>
);
const LockIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const LogOutIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);
const ArrowRightIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);
const EyeIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
    <path d="m2 2 20 20" />
  </svg>
);

// ── Constants ──────────────────────────────────────────────────────────────
const C = {
  bg: "#09090b",
  card: "#111113",
  surface2: "#18181b",
  border: "rgba(255,255,255,0.07)",
  mutedFg: "#71717a",
  fg: "#fafafa",
  primary: "#10b981",
  error: "#ef4444",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
};

// ── Strength meter ─────────────────────────────────────────────────────────
function getStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: "Weak",   color: "#ef4444" },
    { label: "Fair",   color: "#f59e0b" },
    { label: "Good",   color: "#3c83f6" },
    { label: "Strong", color: "#10b981" },
  ];
  return { score, ...levels[score - 1] || { label: "Weak", color: "#ef4444" } };
}

// ── Password field ─────────────────────────────────────────────────────────
function PasswordField({ label, value, onChange, placeholder = "••••••••" }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontFamily: C.mono, fontSize: 10,
        textTransform: "uppercase", letterSpacing: "0.15em", color: C.mutedFg,
      }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <span style={{
          position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          color: C.mutedFg, display: "flex", pointerEvents: "none",
        }}>
          <LockIcon size={15} />
        </span>
        <input
          type={show ? "text" : "password"}
          required
          minLength={6}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            paddingLeft: 38, paddingRight: 40,
            paddingTop: 10, paddingBottom: 10,
            borderRadius: 10,
            border: `1px solid ${focused ? "rgba(16,185,129,0.4)" : C.border}`,
            background: C.surface2, color: C.fg,
            fontFamily: C.mono, fontSize: 13,
            outline: "none", transition: "border 0.2s, box-shadow 0.2s",
            boxShadow: focused ? "0 0 0 3px rgba(16,185,129,0.08)" : "none",
            letterSpacing: show ? "normal" : "0.15em",
          }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{
            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
            background: "transparent", border: "none", cursor: "pointer",
            color: C.mutedFg, display: "flex", alignItems: "center", padding: 2,
            transition: "color 0.15s",
          }}
        >
          {show ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
        </button>
      </div>
    </div>
  );
}

// ── Navbar ─────────────────────────────────────────────────────────────────
function Navbar({ setPage }) {
  const [hovered, setHovered] = useState(null);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      height: 56, borderBottom: `1px solid ${C.border}`,
      background: "rgba(9,9,11,0.85)", backdropFilter: "blur(20px)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", fontFamily: C.mono,
    }}>
      <a href="#" onClick={() => setPage?.("home")} style={{
        display: "flex", alignItems: "center", gap: 8,
        textDecoration: "none", color: C.fg,
      }}>
        <span style={{ color: C.primary }}><ShieldIcon size={20} /></span>
        <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.1em" }}>
          SHADOW<span style={{ color: C.primary }}>MARKET</span> AI
        </span>
      </a>

      <div style={{ display: "flex", gap: 4 }}>
        {[
          { key: "terminal", label: "Terminal", Icon: TerminalIcon },
          { key: "vault",    label: "Vault",    Icon: VaultIcon },
        ].map(({ key, label, Icon }) => (
          <button key={key}
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => setPage?.(key)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 16px", borderRadius: 6, border: "none",
              cursor: "pointer", fontFamily: C.mono, fontSize: 11,
              textTransform: "uppercase", letterSpacing: "0.1em",
              transition: "all 0.2s",
              background: hovered === key ? "rgba(255,255,255,0.05)" : "transparent",
              color: hovered === key ? C.fg : C.mutedFg,
            }}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* Wallet badge (authenticated state) */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{
          padding: "6px 12px", borderRadius: 9999,
          border: "1px solid rgba(16,185,129,0.3)",
          background: "rgba(16,185,129,0.1)", color: C.primary,
          fontFamily: C.mono, fontSize: 11, letterSpacing: "0.05em",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          f7fc...002a
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.primary, display: "inline-block" }} />
        </span>
        <button title="Sign out" style={{
          padding: 6, borderRadius: 6, background: "transparent",
          border: "none", color: C.mutedFg, cursor: "pointer",
        }}>
          <LogOutIcon size={16} />
        </button>
      </div>
    </nav>
  );
}

// ── Main export ────────────────────────────────────────────────────────────
export default function SetPasswordPage({ setPage }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const strength = getStrength(password);
  const mismatch = confirm.length > 0 && password !== confirm;
  const canSubmit = password.length >= 6 && password === confirm && !loading;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 1200);
  };

  if (done) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, color: C.fg, fontFamily: C.mono }}>
        <Navbar setPage={setPage} />
        <div style={{
          minHeight: "100vh", display: "flex", alignItems: "center",
          justifyContent: "center", padding: "0 24px",
        }}>
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28,
            }}>🔐</div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: C.fg, margin: 0 }}>Account Secured</h2>
            <p style={{ fontFamily: C.mono, fontSize: 11, color: C.mutedFg }}>
              Your password has been set. Redirecting to terminal...
            </p>
            <button onClick={() => setPage?.("terminal")} style={{
              padding: "10px 24px", borderRadius: 10, border: "none",
              background: C.primary, color: "#fff",
              fontFamily: C.mono, fontSize: 12, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.1em",
              cursor: "pointer", boxShadow: "0 0 20px rgba(16,185,129,0.3)",
            }}>
              Enter Terminal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.fg, fontFamily: C.mono }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(113,113,122,0.35); letter-spacing: normal; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      <Navbar setPage={setPage} />

      <div style={{
        minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0 24px", position: "relative", overflow: "hidden",
      }}>
        {/* Grid bg */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(rgba(16,185,129,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,185,129,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px", opacity: 0.3, pointerEvents: "none",
        }} />
        {/* Glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
          filter: "blur(60px)", pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 380 }}>

          {/* Logo */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, marginBottom: 32,
          }}>
            <span style={{ color: C.primary }}><ShieldIcon size={24} /></span>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", color: C.fg }}>
              SHADOW<span style={{ color: C.primary }}>MARKET</span> AI
            </span>
          </div>

          {/* Card */}
          <div style={{
            borderRadius: 16, border: `1px solid ${C.border}`,
            background: C.card, padding: 24,
            display: "flex", flexDirection: "column", gap: 20,
          }}>
            {/* Header */}
            <div style={{ textAlign: "center" }}>
              <h1 style={{ fontSize: 18, fontWeight: 600, color: C.fg, margin: 0 }}>
                Set Your Password
              </h1>
              <p style={{ fontFamily: C.mono, fontSize: 11, color: C.mutedFg, marginTop: 6 }}>
                Email verified. Set a password to secure your account.
              </p>
            </div>

            {/* Form fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <PasswordField
                label="Password"
                value={password}
                onChange={setPassword}
              />

              {/* Strength meter */}
              {password.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", gap: 3 }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 9999,
                        background: i <= strength.score ? strength.color : "rgba(255,255,255,0.08)",
                        transition: "background 0.3s",
                      }} />
                    ))}
                  </div>
                  <span style={{
                    fontFamily: C.mono, fontSize: 9,
                    color: strength.color, letterSpacing: "0.1em",
                    textTransform: "uppercase", transition: "color 0.3s",
                  }}>
                    {strength.label}
                    {strength.score < 3 && " — add uppercase, numbers, or symbols"}
                  </span>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <PasswordField
                  label="Confirm Password"
                  value={confirm}
                  onChange={setConfirm}
                />
                {mismatch && (
                  <span style={{
                    fontFamily: C.mono, fontSize: 10,
                    color: C.error, letterSpacing: "0.05em",
                  }}>
                    Passwords do not match
                  </span>
                )}
              </div>

              {/* Requirements checklist */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {[
                  { ok: password.length >= 6, label: "At least 6 characters" },
                  { ok: /[A-Z]/.test(password), label: "One uppercase letter" },
                  { ok: /[0-9]/.test(password), label: "One number" },
                ].map(({ ok, label }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: ok ? C.primary : C.mutedFg,
                      transition: "background 0.2s", flexShrink: 0,
                    }} />
                    <span style={{
                      fontFamily: C.mono, fontSize: 10,
                      color: ok ? C.primary : C.mutedFg,
                      transition: "color 0.2s", letterSpacing: "0.05em",
                    }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{
                  width: "100%", padding: "11px 0", borderRadius: 10, border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontFamily: C.mono, fontSize: 13, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  background: canSubmit ? C.primary : "rgba(16,185,129,0.2)",
                  color: canSubmit ? "#fff" : "rgba(16,185,129,0.4)",
                  boxShadow: canSubmit ? "0 0 20px rgba(16,185,129,0.3)" : "none",
                  transition: "all 0.2s",
                  marginTop: 4,
                }}
              >
                {loading
                  ? <span style={{
                      width: 16, height: 16,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff", borderRadius: "50%",
                      display: "inline-block", animation: "spin 0.7s linear infinite",
                    }} />
                  : <><LockIcon size={15} /> Set Password</>
                }
              </button>
            </div>
          </div>

          <p style={{
            marginTop: 20, textAlign: "center",
            fontFamily: C.mono, fontSize: 10,
            color: C.mutedFg, letterSpacing: "0.05em",
          }}>
            Protected by zero-knowledge cryptography
          </p>
        </div>
      </div>
    </div>
  );
}
