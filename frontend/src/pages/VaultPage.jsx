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
const LockOpenIcon = ({ size = 12 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);
const LockIcon = ({ size = 12 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// ── Constants ──────────────────────────────────────────────────────────────
const C = {
  bg: "#09090b",
  card: "#111113",
  surface2: "#18181b",
  border: "rgba(255,255,255,0.07)",
  muted: "#52525b",
  mutedFg: "#71717a",
  fg: "#fafafa",
  primary: "#10b981",
  blue: "#3c83f6",
  warning: "#f59e0b",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
};

const HOLDINGS = [
  { sym: "sNVDA", balance: "1,250.00",  value: "$168,750.00", locked: false },
  { sym: "sBTC",  balance: "3.4500",    value: "$345,000.00", locked: true  },
  { sym: "sAAPL", balance: "5,000.00",  value: "$125,000.00", locked: false },
  { sym: "sETH",  balance: "42.0000",   value: "$84,000.00",  locked: true  },
  { sym: "sTSLA", balance: "800.00",    value: "$56,000.00",  locked: false },
];

const TOTAL = "$778,750.00";

// ── Navbar ─────────────────────────────────────────────────────────────────
function Navbar() {
  const [hovered, setHovered] = useState(null);
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/vault";

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      height: 56, borderBottom: `1px solid ${C.border}`,
      background: "rgba(9,9,11,0.85)", backdropFilter: "blur(20px)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", fontFamily: C.mono,
    }}>
      {/* Logo — back to home */}
      <a href="/" style={{
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
          { href: "/terminal", label: "Terminal", Icon: TerminalIcon },
          { href: "/vault",    label: "Vault",    Icon: VaultIcon },
        ].map(({ href, label, Icon }) => {
          const active = currentPath === href;
          return (
            <a
              key={href}
              href={href}
              onMouseEnter={() => setHovered(href)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 16px", borderRadius: 6,
                textDecoration: "none",
                cursor: "pointer", fontFamily: C.mono, fontSize: 11,
                textTransform: "uppercase", letterSpacing: "0.1em",
                transition: "all 0.2s",
                background: active ? "rgba(16,185,129,0.1)" : hovered === href ? "rgba(255,255,255,0.05)" : "transparent",
                color: active ? C.primary : hovered === href ? C.fg : C.mutedFg,
                boxShadow: active ? "0 0 10px rgba(16,185,129,0.15)" : "none",
              }}>
              <Icon size={14} />{label}
            </a>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{
          padding: "6px 12px", borderRadius: 9999,
          border: "1px solid rgba(16,185,129,0.3)",
          background: "rgba(16,185,129,0.1)", color: C.primary,
          fontFamily: C.mono, fontSize: 11, letterSpacing: "0.05em",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          607a...1f71
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

// ── Status Badge ───────────────────────────────────────────────────────────
function StatusBadge({ locked }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 9999,
      fontFamily: C.mono, fontSize: 10,
      textTransform: "uppercase", letterSpacing: "0.1em",
      background: locked ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)",
      color: locked ? C.warning : C.primary,
      border: `1px solid ${locked ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)"}`,
    }}>
      {locked ? <LockIcon size={12} /> : <LockOpenIcon size={12} />}
      {locked ? "Locked in Shadow Pool" : "Available"}
    </span>
  );
}

// ── Table Row ──────────────────────────────────────────────────────────────
function VaultRow({ sym, balance, value, locked, delay }) {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useState(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  });

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderBottom: `1px solid rgba(255,255,255,0.04)`,
        transition: "opacity 0.4s ease, transform 0.4s ease, background 0.15s",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        background: hovered ? "rgba(255,255,255,0.025)" : "transparent",
      }}
    >
      <td style={{ padding: "16px 20px", fontFamily: C.mono, fontSize: 14, fontWeight: 600, color: C.fg }}>
        {sym}
      </td>
      <td style={{ padding: "16px 20px", fontFamily: C.mono, fontSize: 14, color: C.fg }}>
        {balance}
      </td>
      <td style={{ padding: "16px 20px", fontFamily: C.mono, fontSize: 14, color: C.blue }}>
        {value}
      </td>
      <td style={{ padding: "16px 20px" }}>
        <StatusBadge locked={locked} />
      </td>
    </tr>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────
export default function VaultPage() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.fg, fontFamily: C.mono }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      <Navbar />

      <div style={{ paddingTop: 56 }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: C.fg, margin: 0 }}>The Vault</h1>
            <p style={{ fontFamily: C.mono, fontSize: 11, color: C.mutedFg, marginTop: 4 }}>
              Portfolio Overview
            </p>
          </div>

          {/* Total Value Card */}
          <div style={{
            borderRadius: 16, border: `1px solid ${C.border}`,
            background: C.card, padding: "32px 24px",
            textAlign: "center", marginBottom: 24,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: 300, height: 100,
              background: "radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 70%)",
              filter: "blur(20px)", pointerEvents: "none",
            }} />
            <span style={{
              fontFamily: C.mono, fontSize: 10,
              textTransform: "uppercase", letterSpacing: "0.15em",
              color: C.mutedFg, display: "block", marginBottom: 10,
            }}>
              Total Vault Value
            </span>
            <span style={{
              fontFamily: C.mono, fontSize: 52, fontWeight: 700,
              color: C.primary,
              textShadow: "0 0 40px rgba(16,185,129,0.4), 0 0 80px rgba(16,185,129,0.15)",
              letterSpacing: "-0.02em",
            }}>
              {TOTAL}
            </span>
          </div>

          {/* Holdings Table */}
          <div style={{
            borderRadius: 16, border: `1px solid ${C.border}`,
            background: C.card, overflow: "hidden",
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["Asset", "Balance", "Value", "Status"].map(col => (
                    <th key={col} style={{
                      padding: "12px 20px", textAlign: "left",
                      fontFamily: C.mono, fontSize: 10,
                      textTransform: "uppercase", letterSpacing: "0.15em",
                      color: C.mutedFg, fontWeight: 500,
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOLDINGS.map((h, i) => (
                  <VaultRow key={h.sym} {...h} delay={i * 80} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary strip */}
          <div style={{
            marginTop: 16, display: "flex", gap: 16, justifyContent: "flex-end",
          }}>
            {[
              { label: "Available", count: HOLDINGS.filter(h => !h.locked).length, color: C.primary },
              { label: "Locked", count: HOLDINGS.filter(h => h.locked).length, color: C.warning },
            ].map(({ label, count, color }) => (
              <span key={label} style={{
                fontFamily: C.mono, fontSize: 10,
                textTransform: "uppercase", letterSpacing: "0.1em",
                color: C.mutedFg,
              }}>
                <span style={{ color, fontWeight: 700 }}>{count}</span> {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}