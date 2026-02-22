import { useState, useEffect } from "react";

const GlowOrb = () => (
  <div style={{
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    height: 600,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)",
    filter: "blur(40px)",
    pointerEvents: "none",
  }} />
);

const GridBg = () => (
  <div style={{
    position: "absolute",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(16,185,129,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(16,185,129,0.06) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px",
    opacity: 0.4,
    pointerEvents: "none",
  }} />
);

const ShieldIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  </svg>
);

const TerminalIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" x2="20" y1="19" y2="19" />
  </svg>
);

const VaultIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const ZapIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
  </svg>
);

const LockIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = ({ size = 12 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const LogOutIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

const features = [
  {
    icon: ZapIcon,
    badge: "AI-POWERED",
    title: "Zero Slippage",
    desc: "AI-driven order fragmentation eliminates market impact. Your size never moves the market.",
    delay: "0.2s",
  },
  {
    icon: LockIcon,
    badge: "SMPC-POWERED",
    title: "Cryptographic Anonymity",
    desc: "Secure Multi-Party Computation ensures no single node ever sees your full order.",
    delay: "0.35s",
  },
  {
    icon: ShieldIcon,
    badge: "ICP-NATIVE",
    title: "Trustless Settlement",
    desc: "On-chain settlement via Internet Computer Protocol. No intermediaries. No trust assumptions.",
    delay: "0.5s",
  },
];

const styles = {
  root: {
    minHeight: "100vh",
    background: "#09090b",
    color: "#fafafa",
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    overflowX: "hidden",
  },
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    height: 56,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(9,9,11,0.85)",
    backdropFilter: "blur(20px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    textDecoration: "none",
    color: "#fafafa",
    cursor: "pointer",
  },
  logoText: {
    fontFamily: "monospace",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: "0.1em",
  },
  primary: { color: "#10b981" },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 16px",
    borderRadius: 6,
    fontSize: 11,
    fontFamily: "monospace",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "#71717a",
    textDecoration: "none",
    transition: "all 0.2s",
    cursor: "pointer",
    background: "transparent",
    border: "none",
  },
  walletBadge: {
    padding: "6px 12px",
    borderRadius: 9999,
    fontFamily: "monospace",
    fontSize: 11,
    letterSpacing: "0.05em",
    border: "1px solid rgba(16,185,129,0.3)",
    background: "rgba(16,185,129,0.1)",
    color: "#10b981",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#10b981",
    display: "inline-block",
  },
  iconBtn: {
    padding: 6,
    borderRadius: 6,
    background: "transparent",
    border: "none",
    color: "#71717a",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s",
  },
  hero: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "128px 24px",
    textAlign: "center",
    overflow: "hidden",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 12px",
    borderRadius: 9999,
    border: "1px solid rgba(16,185,129,0.2)",
    background: "rgba(16,185,129,0.05)",
    marginBottom: 32,
    fontSize: 10,
    fontFamily: "monospace",
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    color: "#10b981",
  },
  h1: {
    fontSize: "clamp(40px, 7vw, 72px)",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
    marginBottom: 24,
    fontFamily: "monospace",
  },
  heroSub: {
    fontSize: 17,
    color: "#71717a",
    maxWidth: 480,
    lineHeight: 1.7,
    marginBottom: 48,
  },
  ctaBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 32px",
    borderRadius: 10,
    background: "#10b981",
    color: "#fff",
    fontFamily: "monospace",
    fontSize: 13,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 0 30px rgba(16,185,129,0.35), 0 4px 20px rgba(0,0,0,0.4)",
  },
  features: {
    padding: "0 24px 128px",
  },
  featGrid: {
    maxWidth: 960,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 24,
  },
  card: {
    position: "relative",
    padding: 24,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.02)",
    transition: "all 0.3s",
    cursor: "default",
    opacity: 0,
    transform: "translateY(20px)",
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "rgba(16,185,129,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    color: "#10b981",
  },
  cardBadge: {
    fontFamily: "monospace",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    color: "#52525b",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 600,
    margin: "4px 0 8px",
    color: "#fafafa",
  },
  cardDesc: {
    fontSize: 13,
    color: "#71717a",
    lineHeight: 1.6,
  },
  footer: {
    borderTop: "1px solid rgba(255,255,255,0.06)",
    padding: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: 960,
    margin: "0 auto",
    fontFamily: "monospace",
    fontSize: 10,
    color: "#52525b",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  },
};

function FeatureCard({ feature, index }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const Icon = feature.icon;

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), parseFloat(feature.delay) * 1000 + 200);
    return () => clearTimeout(timer);
  }, [feature.delay]);

  return (
    <div
      style={{
        ...styles.card,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.6s ease, transform 0.6s ease, border-color 0.3s, background 0.3s",
        borderColor: hovered ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.06)",
        background: hovered ? "rgba(16,185,129,0.03)" : "rgba(255,255,255,0.02)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.cardIconWrap}>
        <Icon size={20} />
      </div>
      <div style={styles.cardBadge}>{feature.badge}</div>
      <h3 style={styles.cardTitle}>{feature.title}</h3>
      <p style={styles.cardDesc}>{feature.desc}</p>
    </div>
  );
}

export default function ShadowMarketAI() {
  const [ctaHovered, setCtaHovered] = useState(false);
  const [navLinkHovered, setNavLinkHovered] = useState(null);

  return (
    <div style={styles.root}>
      {/* Navbar */}
      <nav style={styles.nav}>
        {/* Logo — navigates to home ("/") */}
        <a href="/" style={styles.logo}>
          <ShieldIcon size={20} style={{ color: "#10b981" }} />
          <span style={styles.logoText}>
            SHADOW<span style={styles.primary}>MARKET</span> AI
          </span>
        </a>

        <div style={styles.navLinks}>
          {[
            { label: "Terminal", icon: <TerminalIcon />, href: "/terminal" },
            { label: "Vault",    icon: <VaultIcon />,    href: "/vault"    },
          ].map(({ label, icon, href }) => (
            <a
              key={href}
              href={href}
              style={{
                ...styles.navLink,
                color: navLinkHovered === href ? "#fafafa" : "#71717a",
                background: navLinkHovered === href ? "rgba(255,255,255,0.05)" : "transparent",
              }}
              onMouseEnter={() => setNavLinkHovered(href)}
              onMouseLeave={() => setNavLinkHovered(null)}
            >
              {icon}
              {label}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={styles.walletBadge}>
            607a...1f71
            <span style={styles.dot} />
          </span>
          <button style={styles.iconBtn} title="Sign out">
            <LogOutIcon size={16} />
          </button>
        </div>
      </nav>

      {/* Main */}
      <div style={{ paddingTop: 56 }}>
        {/* Hero */}
        <section style={styles.hero}>
          <GridBg />
          <GlowOrb />

          <div style={{ position: "relative", zIndex: 10, maxWidth: 720, margin: "0 auto" }}>
            <div style={styles.heroBadge}>
              <EyeIcon size={12} />
              Institutional Grade • Decentralized
            </div>

            <h1 style={styles.h1}>
              <span style={{ color: "#fafafa" }}>The </span>
              <span style={{
                color: "#10b981",
                textShadow: "0 0 40px rgba(16,185,129,0.5)",
              }}>
                Zero-Knowledge
              </span>
              <br />
              <span style={{ color: "#fafafa" }}>Dark Pool.</span>
            </h1>

            <p style={styles.heroSub}>
              Execute institutional-size orders with cryptographic anonymity. No information leakage. No market impact. No trust required.
            </p>

            {/* CTA — navigates to /terminal */}
            <a
              href="/terminal"
              style={{
                ...styles.ctaBtn,
                transform: ctaHovered ? "scale(1.05)" : "scale(1)",
                boxShadow: ctaHovered
                  ? "0 0 50px rgba(16,185,129,0.5), 0 8px 30px rgba(0,0,0,0.5)"
                  : "0 0 30px rgba(16,185,129,0.35), 0 4px 20px rgba(0,0,0,0.4)",
              }}
              onMouseEnter={() => setCtaHovered(true)}
              onMouseLeave={() => setCtaHovered(false)}
            >
              <ShieldIcon size={16} />
              Launch Terminal
            </a>
          </div>
        </section>

        {/* Feature Cards */}
        <section style={styles.features}>
          <div style={styles.featGrid}>
            {features.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={styles.footer}>
            <span>ShadowMarket AI © 2026</span>
            <span>Protocol v2.1.0</span>
          </div>
        </footer>
      </div>
    </div>
  );
}