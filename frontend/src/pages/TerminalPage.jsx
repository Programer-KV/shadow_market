import { useState, useEffect } from "react";

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
const RadioIcon = ({ size = 12 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
    <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
    <circle cx="12" cy="12" r="2" />
    <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
    <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
  </svg>
);
const ChevronDownIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const DropletsIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" />
    <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" />
  </svg>
);

// ── Constants ──────────────────────────────────────────────────────────────
const C = {
  bg: "#09090b",
  card: "#111113",
  surface2: "#18181b",
  surface3: "#1f1f23",
  border: "rgba(255,255,255,0.07)",
  muted: "#52525b",
  mutedFg: "#71717a",
  fg: "#fafafa",
  primary: "#10b981",
  blue: "#3c83f6",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
};

const ASSETS = [
  { sym: "sNVDA", amt: "+100.00" },
  { sym: "sAAPL", amt: "+200.00" },
  { sym: "sBTC",  amt: "+0.5000" },
  { sym: "sETH",  amt: "+5.0000" },
  { sym: "sTSLA", amt: "+150.00" },
];

const ASSET_SYMBOLS = ["sNVDA", "sAAPL", "sBTC", "sETH", "sTSLA"];

const LOG_LINES = [
  "[RELAY] Heartbeat OK. All nodes responsive.",
  "[ZK-PROOF] Proof verified. No information leaked.",
  "[RELAY] Heartbeat OK. All nodes responsive.",
  "[DARK-POOL] Searching for counterparties...",
  "[MATCH] Fragment 47/128 matched...",
  "[SETTLE] Initiating trustless settlement via ICP...",
  "[DARK-POOL] Searching for counterparties...",
  "[SETTLE] Settlement finalized. Block #1,847,293.",
  "[RELAY] Latency: 12ms across 6 nodes.",
  "[RELAY] Latency: 12ms across 6 nodes.",
];

// ── Helpers ────────────────────────────────────────────────────────────────
function ts() {
  return new Date().toLocaleTimeString("en-US", { hour12: false });
}

// ── Sub-components ─────────────────────────────────────────────────────────
function Navbar() {
  const [hoveredLink, setHoveredLink] = useState(null);

  // Determine active page from current path
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/terminal";

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
              onMouseEnter={() => setHoveredLink(href)}
              onMouseLeave={() => setHoveredLink(null)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 16px", borderRadius: 6,
                textDecoration: "none",
                cursor: "pointer", fontFamily: C.mono, fontSize: 11,
                textTransform: "uppercase", letterSpacing: "0.1em",
                transition: "all 0.2s",
                background: active ? "rgba(16,185,129,0.1)" : hoveredLink === href ? "rgba(255,255,255,0.05)" : "transparent",
                color: active ? C.primary : hoveredLink === href ? C.fg : C.mutedFg,
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
          padding: 6, borderRadius: 6, background: "transparent", border: "none",
          color: C.mutedFg, cursor: "pointer",
        }}>
          <LogOutIcon size={16} />
        </button>
      </div>
    </nav>
  );
}

function LeakageGauge() {
  const r = 45;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{
      borderRadius: 16, border: `1px solid ${C.border}`,
      background: C.card, padding: 20,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
    }}>
      <span style={{ fontFamily: C.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: C.mutedFg }}>
        Information Leakage
      </span>
      <div style={{ position: "relative", width: 128, height: 128 }}>
        <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
          <circle cx="50" cy="50" r={r} fill="none" stroke={C.border} strokeWidth="6" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={C.primary} strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={circ}
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 6px rgba(16,183,127,0.5))", transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: C.mono, fontSize: 24, fontWeight: 700, color: C.primary, textShadow: "0 0 20px rgba(16,185,129,0.6)" }}>0%</span>
          <span style={{ fontFamily: C.mono, fontSize: 9, color: C.mutedFg, textTransform: "uppercase", letterSpacing: "0.1em" }}>Leakage</span>
        </div>
      </div>
    </div>
  );
}

function ConfidenceMatrix() {
  return (
    <div style={{
      borderRadius: 16, border: `1px solid ${C.border}`,
      background: C.card, padding: 20,
      display: "flex", flexDirection: "column", justifyContent: "center", gap: 16,
    }}>
      <span style={{ fontFamily: C.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: C.mutedFg }}>
        Liquidity Confidence Matrix
      </span>
      <div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontFamily: C.mono, fontSize: 30, fontWeight: 700, color: C.blue, textShadow: "0 0 20px rgba(60,131,246,0.5)" }}>94%</span>
          <span style={{ fontFamily: C.mono, fontSize: 10, color: C.mutedFg }}>AI Confidence</span>
        </div>
        <div style={{ width: "100%", height: 8, borderRadius: 9999, background: C.surface3, overflow: "hidden" }}>
          <div style={{
            width: "94%", height: "100%", borderRadius: 9999,
            background: C.blue, boxShadow: "0 0 10px rgba(60,131,246,0.4)",
            transition: "width 1s ease",
          }} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[["847K", "Depth"], ["0.02%", "Spread"], ["12", "Nodes"]].map(([val, lbl]) => (
          <div key={lbl} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: C.mono, fontSize: 14, fontWeight: 600, color: C.fg }}>{val}</div>
            <div style={{ fontFamily: C.mono, fontSize: 9, color: C.mutedFg, textTransform: "uppercase", letterSpacing: "0.1em" }}>{lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveLog() {
  const [logs, setLogs] = useState(() =>
    LOG_LINES.map((msg, i) => ({ id: i, time: ts(), msg }))
  );
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const blinkInterval = setInterval(() => setBlink(b => !b), 530);
    const logInterval = setInterval(() => {
      const msg = LOG_LINES[Math.floor(Math.random() * LOG_LINES.length)];
      setLogs(prev => [...prev.slice(-30), { id: Date.now(), time: ts(), msg }]);
    }, 2400);
    return () => { clearInterval(blinkInterval); clearInterval(logInterval); };
  }, []);



  return (
    <div style={{
      borderRadius: 12, overflow: "hidden",
      border: `1px solid ${C.border}`, background: C.surface2,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 12px", borderBottom: `1px solid ${C.border}`,
        background: "rgba(0,0,0,0.3)",
      }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.primary, display: "inline-block", animation: "pulse 2s infinite" }} />
        <span style={{ fontFamily: C.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: C.mutedFg }}>
          Live System Log
        </span>
      </div>
      <div style={{ height: 192, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 2 }}>
        {logs.map(({ id, time, msg }) => (
          <div key={id} style={{ display: "flex", gap: 8, fontFamily: C.mono, fontSize: 11 }}>
            <span style={{ color: C.mutedFg, flexShrink: 0 }}>{time}</span>
            <span style={{ color: "#4ade80" }}>{msg}</span>
          </div>
        ))}

      </div>
    </div>
  );
}

function OrderEntry() {
  const [asset, setAsset] = useState("sNVDA");
  const [venue, setVenue] = useState("shadow");
  const [qty, setQty] = useState("");
  const [dropOpen, setDropOpen] = useState(false);

  return (
    <div style={{
      borderRadius: 16, border: `1px solid ${C.border}`,
      background: C.card, padding: 20,
      display: "flex", flexDirection: "column", gap: 20,
    }}>
      <span style={{ fontFamily: C.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: C.mutedFg }}>
        Order Entry
      </span>

      {/* Asset selector */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontFamily: C.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: C.mutedFg }}>
          Synthetic Asset
        </label>
        <div style={{ position: "relative" }}>
          <button onClick={() => setDropOpen(o => !o)} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 16px", borderRadius: 10,
            border: `1px solid ${C.border}`, background: C.surface2,
            color: C.fg, fontFamily: C.mono, fontSize: 14, cursor: "pointer",
          }}>
            {asset}
            <ChevronDownIcon size={16} />
          </button>
          {dropOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 20,
              background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10,
              overflow: "hidden",
            }}>
              {ASSET_SYMBOLS.map(sym => (
                <button key={sym} onClick={() => { setAsset(sym); setDropOpen(false); }} style={{
                  width: "100%", textAlign: "left", padding: "8px 16px",
                  background: sym === asset ? "rgba(16,185,129,0.08)" : "transparent",
                  color: sym === asset ? C.primary : C.fg,
                  fontFamily: C.mono, fontSize: 13, border: "none", cursor: "pointer",
                }}>
                  {sym}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Venue toggle */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontFamily: C.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: C.mutedFg }}>
          Execution Venue
        </label>
        <div style={{
          display: "flex", borderRadius: 9999,
          border: `1px solid ${C.border}`, background: C.surface2, padding: 2,
        }}>
          {[["lit", "Lit Market"], ["shadow", "Shadow Pool"]].map(([key, label]) => (
            <button key={key} onClick={() => setVenue(key)} style={{
              flex: 1, padding: "8px 0", borderRadius: 9999,
              fontFamily: C.mono, fontSize: 12, letterSpacing: "0.05em",
              border: "none", cursor: "pointer", transition: "all 0.2s",
              background: venue === key ? C.primary : "transparent",
              color: venue === key ? "#fff" : C.mutedFg,
              boxShadow: venue === key ? "0 0 14px rgba(16,185,129,0.3)" : "none",
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontFamily: C.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: C.mutedFg }}>
          Quantity
        </label>
        <input
          type="number" placeholder="0" value={qty}
          onChange={e => setQty(e.target.value)}
          style={{
            padding: "12px 16px", borderRadius: 10,
            border: `1px solid ${qty ? "rgba(16,185,129,0.4)" : C.border}`,
            background: C.surface2, color: C.fg,
            fontFamily: C.mono, fontSize: 24, textAlign: "center",
            outline: "none", transition: "border 0.2s",
          }}
        />
      </div>

      {/* CTA */}
      <button disabled={!qty} style={{
        padding: "14px 0", borderRadius: 10, border: "none",
        fontFamily: C.mono, fontSize: 13, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.1em",
        cursor: qty ? "pointer" : "not-allowed",
        background: qty ? C.primary : "rgba(16,185,129,0.2)",
        color: qty ? "#fff" : "rgba(16,185,129,0.4)",
        boxShadow: qty ? "0 0 20px rgba(16,185,129,0.35)" : "none",
        transition: "all 0.2s",
      }}>
        Initiate Stealth Protocol
      </button>
    </div>
  );
}

function FaucetPanel() {
  const [claimed, setClaimed] = useState({});

  return (
    <div style={{
      borderRadius: 16, border: `1px solid ${C.border}`,
      background: C.card, padding: 20,
      display: "flex", flexDirection: "column", gap: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: C.blue }}><DropletsIcon size={16} /></span>
        <span style={{ fontFamily: C.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: C.mutedFg }}>
          Testnet Faucet
        </span>
      </div>
      <p style={{ fontFamily: C.mono, fontSize: 11, color: C.mutedFg, margin: 0 }}>
        Claim synthetic assets on the shadow testnet.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {ASSETS.map(({ sym, amt }) => (
          <div key={sym} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 12px", borderRadius: 10,
            background: C.surface2, border: `1px solid ${C.border}`,
          }}>
            <div>
              <span style={{ fontFamily: C.mono, fontSize: 14, fontWeight: 600, color: C.fg }}>{sym}</span>
              <span style={{ fontFamily: C.mono, fontSize: 12, color: C.mutedFg, marginLeft: 8 }}>{amt}</span>
            </div>
            <button onClick={() => setClaimed(c => ({ ...c, [sym]: true }))} style={{
              padding: "4px 12px", borderRadius: 6,
              border: `1px solid ${claimed[sym] ? "rgba(16,185,129,0.3)" : "rgba(60,131,246,0.25)"}`,
              background: claimed[sym] ? "rgba(16,185,129,0.1)" : "rgba(60,131,246,0.1)",
              color: claimed[sym] ? C.primary : C.blue,
              fontFamily: C.mono, fontSize: 10,
              textTransform: "uppercase", letterSpacing: "0.1em",
              cursor: claimed[sym] ? "default" : "pointer",
              transition: "all 0.2s",
            }}>
              {claimed[sym] ? "Claimed" : "Claim"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────
export default function TerminalPage() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.fg, fontFamily: C.mono }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
      `}</style>

      <Navbar />

      <div style={{ paddingTop: 56 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 600, color: C.fg, margin: 0 }}>Trade Terminal</h1>
              <p style={{ fontFamily: C.mono, fontSize: 11, color: C.mutedFg, margin: "4px 0 0" }}>
                Stealth Order Execution Engine
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: C.primary, animation: "pulse 2s infinite" }}><RadioIcon size={12} /></span>
              <span style={{ fontFamily: C.mono, fontSize: 10, color: C.primary, textTransform: "uppercase", letterSpacing: "0.15em" }}>
                System Online
              </span>
            </div>
          </div>

          {/* Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,2fr) minmax(0,3fr)",
            gap: 24,
          }}>
            {/* Left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <OrderEntry />
              <FaucetPanel />
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <LeakageGauge />
                <ConfidenceMatrix />
              </div>
              <LiveLog />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}