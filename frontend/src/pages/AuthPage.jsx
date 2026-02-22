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
const MailIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const ArrowRightIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);
const CheckCircleIcon = ({ size = 40 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
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
  mono: "'JetBrains Mono', 'Fira Code', monospace",
};

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
      <a href="#" onClick={() => setPage("home")} style={{
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
          <button key={key} onClick={() => setPage(key)}
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
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

      {/* Connect Wallet button (current page indicator) */}
      <span style={{
        padding: "6px 16px", borderRadius: 9999,
        border: `1px solid ${C.border}`,
        background: C.surface2, color: C.mutedFg,
        fontFamily: C.mono, fontSize: 11, letterSpacing: "0.05em",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        Connect Wallet
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.mutedFg, display: "inline-block" }} />
      </span>
    </nav>
  );
}

// ── Auth Form ──────────────────────────────────────────────────────────────
function AuthForm({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!valid) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onSuccess(email); }, 1200);
  };

  return (
    <div style={{
      borderRadius: 16, border: `1px solid ${C.border}`,
      background: C.card, padding: 24,
      display: "flex", flexDirection: "column", gap: 20,
    }}>
      {/* Header */}
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: C.fg, margin: 0 }}>
          Access Terminal
        </h1>
        <p style={{ fontFamily: C.mono, fontSize: 11, color: C.mutedFg, marginTop: 6 }}>
          Enter your email to receive a confirmation link
        </p>
      </div>

      {/* Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{
            fontFamily: C.mono, fontSize: 10,
            textTransform: "uppercase", letterSpacing: "0.15em", color: C.mutedFg,
          }}>
            Email
          </label>
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute", left: 12, top: "50%",
              transform: "translateY(-50%)", color: C.mutedFg,
              display: "flex", alignItems: "center", pointerEvents: "none",
            }}>
              <MailIcon size={16} />
            </span>
            <input
              type="email"
              required
              placeholder="operator@shadowmarket.ai"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                width: "100%",
                paddingLeft: 40, paddingRight: 16,
                paddingTop: 10, paddingBottom: 10,
                borderRadius: 10,
                border: `1px solid ${focused ? "rgba(16,185,129,0.4)" : C.border}`,
                background: C.surface2, color: C.fg,
                fontFamily: C.mono, fontSize: 13,
                outline: "none", transition: "border 0.2s",
                boxShadow: focused ? "0 0 0 3px rgba(16,185,129,0.08)" : "none",
              }}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!valid || loading}
          style={{
            width: "100%", padding: "11px 0", borderRadius: 10, border: "none",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: C.mono, fontSize: 13, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.1em",
            cursor: valid && !loading ? "pointer" : "not-allowed",
            background: valid && !loading ? C.primary : "rgba(16,185,129,0.2)",
            color: valid && !loading ? "#fff" : "rgba(16,185,129,0.4)",
            boxShadow: valid && !loading ? "0 0 20px rgba(16,185,129,0.3)" : "none",
            transition: "all 0.2s",
          }}
        >
          {loading ? (
            <Spinner />
          ) : (
            <>Send Confirmation <ArrowRightIcon size={16} /></>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Spinner ────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <span style={{
      width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)",
      borderTopColor: "#fff", borderRadius: "50%",
      display: "inline-block", animation: "spin 0.7s linear infinite",
    }} />
  );
}

// ── Success State ──────────────────────────────────────────────────────────
function SuccessCard({ email }) {
  return (
    <div style={{
      borderRadius: 16, border: `1px solid rgba(16,185,129,0.2)`,
      background: C.card, padding: 32,
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 16, textAlign: "center",
    }}>
      <span style={{ color: C.primary }}>
        <CheckCircleIcon size={48} />
      </span>
      <div>
        <h2 style={{ fontSize: 17, fontWeight: 600, color: C.fg, margin: "0 0 8px" }}>
          Check your inbox
        </h2>
        <p style={{ fontFamily: C.mono, fontSize: 11, color: C.mutedFg, lineHeight: 1.6 }}>
          A confirmation link has been sent to
          <br />
          <span style={{ color: C.primary }}>{email}</span>
        </p>
      </div>
      <div style={{
        padding: "8px 16px", borderRadius: 8,
        background: "rgba(16,185,129,0.06)",
        border: "1px solid rgba(16,185,129,0.15)",
        fontFamily: C.mono, fontSize: 10,
        textTransform: "uppercase", letterSpacing: "0.1em",
        color: C.mutedFg,
      }}>
        Link expires in 15 minutes
      </div>
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────
export default function AuthPage() {
  const [page, setPage] = useState("auth");
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const handleSuccess = (email) => {
    setSubmittedEmail(email);
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.fg, fontFamily: C.mono }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(113,113,122,0.4); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      <Navbar setPage={setPage} />

      {/* Centered layout */}
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

        {/* Glow orb */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
          filter: "blur(60px)", pointerEvents: "none",
        }} />

        {/* Card */}
        <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 380 }}>
          {/* Logo above card */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, marginBottom: 32,
          }}>
            <span style={{ color: C.primary }}><ShieldIcon size={24} /></span>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", color: C.fg }}>
              SHADOW<span style={{ color: C.primary }}>MARKET</span> AI
            </span>
          </div>

          {submitted
            ? <SuccessCard email={submittedEmail} />
            : <AuthForm onSuccess={handleSuccess} />
          }

          {/* Footer note */}
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
