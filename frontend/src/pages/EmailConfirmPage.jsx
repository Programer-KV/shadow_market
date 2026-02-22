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
const MailIcon = ({ size = 32 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
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

const EMAIL = "y1757151@gmail.com";

// ── Navbar ─────────────────────────────────────────────────────────────────
function Navbar({ setPage }) {
  const [hovered, setHovered] = useState(null);
  const [walletHovered, setWalletHovered] = useState(false);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      height: 56, borderBottom: `1px solid ${C.border}`,
      background: "rgba(9,9,11,0.85)", backdropFilter: "blur(20px)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", fontFamily: C.mono,
    }}>
      <a href="#" onClick={() => setPage && setPage("home")} style={{
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
            onClick={() => setPage && setPage(key)}
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

      <a href="#"
        onMouseEnter={() => setWalletHovered(true)}
        onMouseLeave={() => setWalletHovered(false)}
        style={{
          padding: "6px 16px", borderRadius: 9999,
          border: `1px solid ${walletHovered ? "rgba(16,185,129,0.4)" : C.border}`,
          background: C.surface2,
          color: walletHovered ? C.fg : C.mutedFg,
          fontFamily: C.mono, fontSize: 11, letterSpacing: "0.05em",
          textDecoration: "none", display: "flex", alignItems: "center", gap: 8,
          transition: "all 0.2s",
        }}>
        Connect Wallet
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.mutedFg, display: "inline-block" }} />
      </a>
    </nav>
  );
}

// ── Confirmation Card ──────────────────────────────────────────────────────
function ConfirmationCard({ email }) {
  const [pulse, setPulse] = useState(true);

  return (
    <div style={{
      borderRadius: 16,
      border: `1px solid ${C.border}`,
      background: C.card,
      padding: 24,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 16,
      textAlign: "center",
    }}>
      {/* Animated mail icon */}
      <div style={{
        position: "relative",
        width: 64, height: 64,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {/* Pulse ring */}
        <div style={{
          position: "absolute", inset: -8,
          borderRadius: "50%",
          border: "1px solid rgba(16,185,129,0.2)",
          animation: "ring-pulse 2s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", inset: -16,
          borderRadius: "50%",
          border: "1px solid rgba(16,185,129,0.1)",
          animation: "ring-pulse 2s ease-in-out 0.4s infinite",
        }} />
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "rgba(16,185,129,0.08)",
          border: "1px solid rgba(16,185,129,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: C.primary,
        }}>
          <MailIcon size={28} />
        </div>
      </div>

      {/* Text */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <h1 style={{
          fontSize: 18, fontWeight: 600,
          color: C.fg, margin: 0,
          fontFamily: C.mono,
        }}>
          Check Your Email
        </h1>
        <p style={{
          fontFamily: C.mono, fontSize: 11,
          color: C.mutedFg, lineHeight: 1.7, margin: 0,
        }}>
          A confirmation link has been sent to{" "}
          <span style={{ color: C.primary }}>{email}</span>.<br />
          Click the link to verify and set your password.
        </p>
      </div>

      {/* Divider */}
      <div style={{
        width: "100%", height: 1,
        background: C.border,
      }} />

      {/* Status pills */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
        {[
          { dot: "#10b981", label: "Email dispatched via encrypted relay" },
          { dot: "#3c83f6", label: "Link expires in 15 minutes" },
          { dot: "#71717a", label: "No account data stored until verified" },
        ].map(({ dot, label }) => (
          <div key={label} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 12px", borderRadius: 8,
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${C.border}`,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: dot, flexShrink: 0,
              boxShadow: `0 0 6px ${dot}`,
            }} />
            <span style={{
              fontFamily: C.mono, fontSize: 10,
              color: C.mutedFg, letterSpacing: "0.05em",
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Resend link */}
      <ResendButton />
    </div>
  );
}

// ── Resend Button ──────────────────────────────────────────────────────────
function ResendButton() {
  const [state, setState] = useState("idle"); // idle | cooldown | done
  const [seconds, setSeconds] = useState(30);

  const handleResend = () => {
    if (state !== "idle") return;
    setState("cooldown");
    setSeconds(30);
    const interval = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(interval);
          setState("done");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  return (
    <button
      onClick={handleResend}
      disabled={state === "cooldown"}
      style={{
        background: "transparent", border: "none",
        fontFamily: C.mono, fontSize: 10,
        letterSpacing: "0.05em", cursor: state === "cooldown" ? "not-allowed" : "pointer",
        color: state === "idle" ? C.primary : C.mutedFg,
        textDecoration: state === "idle" ? "underline" : "none",
        transition: "color 0.2s",
        padding: 0,
      }}
    >
      {state === "idle" && "Resend confirmation email"}
      {state === "cooldown" && `Resend available in ${seconds}s`}
      {state === "done" && "✓ Email resent"}
    </button>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────
export default function EmailConfirmPage({ email = EMAIL, setPage }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.fg, fontFamily: C.mono }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes ring-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.08); }
        }
      `}</style>

      <Navbar setPage={setPage} />

      {/* Centered layout */}
      <div style={{
        minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0 24px", position: "relative", overflow: "hidden",
      }}>
        {/* Grid background */}
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

        {/* Content */}
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

          <ConfirmationCard email={email} />

          {/* Footer note */}
          <p style={{
            marginTop: 20, textAlign: "center",
            fontFamily: C.mono, fontSize: 10,
            color: C.mutedFg, letterSpacing: "0.05em",
          }}>
            Didn't request this?{" "}
            <span style={{ color: C.primary, cursor: "pointer", textDecoration: "underline" }}>
              Report suspicious activity
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
