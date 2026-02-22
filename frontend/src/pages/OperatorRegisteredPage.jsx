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
const LogOutIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);
const CircleCheckIcon = ({ size = 40 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
const CopyIcon = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);
const CheckIcon = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const ArrowRightIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
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

const OPERATOR_ID = "f7fcf419-f26e-4492-a8d9-1f1068c8002a";

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

// ── Copy button ────────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy ID"}
      style={{
        flexShrink: 0,
        padding: 6, borderRadius: 6,
        background: copied ? "rgba(16,185,129,0.12)" : "transparent",
        border: `1px solid ${copied ? "rgba(16,185,129,0.3)" : "transparent"}`,
        cursor: "pointer",
        color: copied ? C.primary : C.mutedFg,
        display: "flex", alignItems: "center",
        transition: "all 0.2s",
      }}
    >
      {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
    </button>
  );
}

// ── Main export ────────────────────────────────────────────────────────────
export default function OperatorRegisteredPage({ setPage, operatorId = OPERATOR_ID }) {
  const [btnHovered, setBtnHovered] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.fg, fontFamily: C.mono }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes check-pop {
          0%   { transform: scale(0.6); opacity: 0; }
          60%  { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
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
        {/* Glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)",
          filter: "blur(60px)", pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 380 }}>

          {/* Logo */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, marginBottom: 32,
            animation: "fade-up 0.5s ease both",
          }}>
            <span style={{ color: C.primary }}><ShieldIcon size={24} /></span>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", color: C.fg }}>
              SHADOW<span style={{ color: C.primary }}>MARKET</span> AI
            </span>
          </div>

          {/* Card */}
          <div style={{
            borderRadius: 16,
            border: `1px solid rgba(16,185,129,0.15)`,
            background: C.card, padding: 24,
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 20, textAlign: "center",
            animation: "fade-up 0.5s ease 0.1s both",
            boxShadow: "0 0 60px rgba(16,185,129,0.04)",
          }}>

            {/* Animated check icon */}
            <div style={{
              color: C.primary,
              animation: "check-pop 0.5s ease 0.2s both",
            }}>
              <CircleCheckIcon size={48} />
            </div>

            {/* Title */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <h1 style={{ fontSize: 18, fontWeight: 600, color: C.fg, margin: 0 }}>
                Operator Registered
              </h1>
            </div>

            {/* Operator ID section */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{
                fontFamily: C.mono, fontSize: 10,
                textTransform: "uppercase", letterSpacing: "0.15em",
                color: C.mutedFg, display: "block",
              }}>
                Your Unique Operator ID
              </span>

              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 12px", borderRadius: 10,
                background: C.surface2,
                border: `1px solid ${C.border}`,
              }}>
                <code style={{
                  fontFamily: C.mono, fontSize: 11,
                  color: C.primary, flex: 1,
                  textAlign: "left", wordBreak: "break-all",
                  textShadow: "0 0 20px rgba(16,185,129,0.3)",
                  lineHeight: 1.5,
                }}>
                  {operatorId}
                </code>
                <CopyButton text={operatorId} />
              </div>

              <p style={{
                fontFamily: C.mono, fontSize: 10,
                color: C.mutedFg, lineHeight: 1.6,
              }}>
                Save this ID — it uniquely identifies your operator node on the shadow network.
              </p>
            </div>

            {/* Divider */}
            <div style={{ width: "100%", height: 1, background: C.border }} />

            {/* Enter Terminal CTA */}
            <button
              onClick={() => setPage?.("terminal")}
              onMouseEnter={() => setBtnHovered(true)}
              onMouseLeave={() => setBtnHovered(false)}
              style={{
                width: "100%", padding: "12px 0", borderRadius: 10, border: "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontFamily: C.mono, fontSize: 13, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.1em",
                cursor: "pointer",
                background: C.primary, color: "#fff",
                boxShadow: btnHovered
                  ? "0 0 40px rgba(16,185,129,0.5), 0 4px 20px rgba(0,0,0,0.4)"
                  : "0 0 20px rgba(16,185,129,0.3), 0 4px 12px rgba(0,0,0,0.3)",
                transform: btnHovered ? "scale(1.02)" : "scale(1)",
                transition: "all 0.2s",
              }}
            >
              Enter Terminal <ArrowRightIcon size={16} />
            </button>
          </div>

          {/* Footer note */}
          <p style={{
            marginTop: 20, textAlign: "center",
            fontFamily: C.mono, fontSize: 10,
            color: C.mutedFg, letterSpacing: "0.05em",
            animation: "fade-up 0.5s ease 0.3s both",
          }}>
            Protected by zero-knowledge cryptography
          </p>
        </div>
      </div>
    </div>
  );
}
