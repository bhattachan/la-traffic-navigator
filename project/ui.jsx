// ui.jsx — shared dark/neon UI kit: icon set + glass primitives + theme.
// Exports (to window): Icon, Glass, Chip, theme tokens helper makeTheme.

function makeTheme(t = {}) {
  const accent = t.accent || "#00e5a0";
  return {
    accent,
    accentInk: "#06231b",
    bg: "#070a0f",
    surface: "rgba(17,22,31,0.82)",
    surfaceSolid: "#11161f",
    surface2: "rgba(28,35,47,0.9)",
    line: "rgba(255,255,255,0.09)",
    line2: "rgba(255,255,255,0.06)",
    ink: "#eef3f9",
    inkMute: "#8a94a6",
    inkFaint: "#5c6677",
    danger: "#ff5a4d",
    warn: "#ffc24b",
    good: "#13c98a",
    blue: "#3da5ff",
    isDay: !!t.isDay,
    contrast: t.contrast == null ? 1 : t.contrast,
  };
}

// ── Icon ──────────────────────────────────────────────────────
function Icon({ name, size = 22, color = "currentColor", stroke = 2, fill = "none", style }) {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24", fill,
    stroke: color, strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round",
    style,
  };
  const P = {
    search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
    mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0014 0M12 18v3" /></>,
    locate: <><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></>,
    layers: <><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /></>,
    traffic: <><rect x="8" y="2" width="8" height="20" rx="3" /><circle cx="12" cy="7" r="1.6" fill={color} stroke="none"/><circle cx="12" cy="12" r="1.6" fill={color} stroke="none"/><circle cx="12" cy="17" r="1.6" fill={color} stroke="none"/></>,
    close: <><path d="M6 6l12 12M18 6L6 18" /></>,
    back: <><path d="M15 5l-7 7 7 7" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    warn: <><path d="M12 3l9 16H3l9-16z" /><path d="M12 10v4M12 17.5v.01" /></>,
    home: <><path d="M4 11l8-7 8 7" /><path d="M6 10v9h12v-9" /></>,
    work: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /></>,
    star: <><path d="M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6L12 17l-5.3 2.6 1.1-6L3.4 9.4l6-.8L12 3z" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    car: <><path d="M5 16l1.5-5.5A2 2 0 018.4 9h7.2a2 2 0 011.9 1.5L19 16" /><path d="M3 16h18v3a1 1 0 01-1 1h-2a1 1 0 01-1-1v-1H7v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-3z" /><circle cx="7" cy="16" r="0.5" fill={color}/><circle cx="17" cy="16" r="0.5" fill={color}/></>,
    walk: <><circle cx="13" cy="4" r="2" /><path d="M11 21l1.5-6L9 12l1-5 4 2 2 3" /><path d="M12.5 15l-1 6" /></>,
    transit: <><rect x="5" y="3" width="14" height="13" rx="3" /><path d="M5 11h14M8 20l2-3M16 20l-2-3" /><circle cx="9" cy="13.5" r="0.6" fill={color}/><circle cx="15" cy="13.5" r="0.6" fill={color}/></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8L6 18M18 6l1.8-1.8" /></>,
    volume: <><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M17 8a5 5 0 010 8" /></>,
    share: <><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 11l7.6-4M8.2 13l7.6 4"/></>,
    swap: <><path d="M7 4v13M7 4L4 7M7 4l3 3" /><path d="M17 20V7M17 20l3-3M17 20l-3-3" /></>,
    pin: <><path d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
    gas: <><rect x="4" y="3" width="9" height="17" rx="2"/><path d="M4 20h9M13 8h3a2 2 0 012 2v6a1.5 1.5 0 003 0v-7l-2.5-2.5"/></>,
    plug: <><path d="M9 3v5M15 3v5M7 8h10v3a5 5 0 01-10 0V8zM12 16v5"/></>,
    park: <><circle cx="12" cy="12" r="9"/><path d="M10 16V8h3a2.5 2.5 0 010 5h-3"/></>,
    flag: <><path d="M5 21V4M5 4h11l-2 3 2 3H5"/></>,
    nav: <><path d="M3 11l18-8-8 18-2-8-8-2z" fill={color} stroke={color}/></>,
    chevR: <><path d="M9 6l6 6-6 6" /></>,
    police: <><path d="M12 3l7 3v5c0 4-3 7.5-7 9-4-1.5-7-5-7-9V6l7-3z" /><path d="M9.5 12l1.8 1.8L15 10" /></>,
    bolt: <><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill={color} stroke={color}/></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>,
  };
  // turn arrows for guidance
  const TURNS = {
    "turn-right": <><path d="M9 20V10a3 3 0 013-3h5" /><path d="M14 4l4 3-4 3" /></>,
    "turn-left": <><path d="M15 20V10a3 3 0 00-3-3H7" /><path d="M10 4L6 7l4 3" /></>,
    "slight-right": <><path d="M8 20V13a4 4 0 014-4h4" /><path d="M13 6l4 3-4 3" /></>,
    "straight": <><path d="M12 20V5" /><path d="M8 9l4-4 4 4" /></>,
    "merge": <><path d="M12 20v-7c0-3 2-5 5-6" /><path d="M14 6l3-1 1 3" /><path d="M12 13c0-3-2-5-5-6" /></>,
    "uturn": <><path d="M8 20V10a4 4 0 018 0v2" /><path d="M13 12l3 2 3-2" transform="rotate(180 16 13)"/><path d="M19 12l-3 2-3-2"/></>,
  };
  const content = TURNS[name] || P[name] || P.pin;
  return <svg {...common}>{content}</svg>;
}

// ── Glass surface ─────────────────────────────────────────────
function Glass({ children, style = {}, radius = 22, blur = 22, tint, border = true, theme }) {
  const T = theme || makeTheme();
  return (
    <div style={{
      position: "relative", borderRadius: radius, overflow: "hidden",
      background: tint || T.surface,
      backdropFilter: `blur(${blur}px) saturate(150%)`,
      WebkitBackdropFilter: `blur(${blur}px) saturate(150%)`,
      border: border ? `1px solid ${T.line}` : "none",
      boxShadow: "0 18px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
      ...style,
    }}>{children}</div>
  );
}

// ── Pill chip ─────────────────────────────────────────────────
function Chip({ children, active, theme, onClick, style = {} }) {
  const T = theme || makeTheme();
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 7,
      height: 38, padding: "0 15px", borderRadius: 19,
      border: `1px solid ${active ? "transparent" : T.line}`,
      background: active ? T.accent : "rgba(20,26,36,0.7)",
      backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
      color: active ? T.accentInk : T.ink,
      fontFamily: "'Plus Jakarta Sans',system-ui", fontWeight: 600, fontSize: 13.5,
      cursor: "pointer", whiteSpace: "nowrap", letterSpacing: "0.1px",
      ...style,
    }}>{children}</button>
  );
}

Object.assign(window, { Icon, Glass, Chip, makeTheme });
