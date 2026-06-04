// screens-nav.jsx — Active navigation (3D perspective) + incident report sheet.
// Relies on window: Icon, Glass, LAMap, ROUTE, INCIDENTS, pointAt, lerpPath
// Exports (to window): NavigationScreen, ReportScreen, NavScene

const FN_UI = "'Plus Jakarta Sans', system-ui, sans-serif";
const FN_NUM = "'Space Grotesk', system-ui, sans-serif";

// helpers (route geometry)
function _toPath(pts) {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q${pts[i][0]},${pts[i][1]} ${mx},${my}`;
  }
  const l = pts[pts.length - 1];
  return d + ` L${l[0]},${l[1]}`;
}

const SEVCOL = { free: "#13c98a", mod: "#ffc24b", heavy: "#ff6a3d", sev: "#e23a3a" };
const NAV_CHUNKS = [
  { a: 0.0, b: 0.22, sev: "free" }, { a: 0.22, b: 0.40, sev: "mod" },
  { a: 0.40, b: 0.58, sev: "heavy" }, { a: 0.58, b: 0.66, sev: "sev" },
  { a: 0.66, b: 0.82, sev: "mod" }, { a: 0.82, b: 1.0, sev: "free" },
];

// ── 3D perspective scene ──────────────────────────────────────
function NavScene({ T, tweaks, progress }) {
  const route = ROUTE;
  const car = pointAt(route, progress);
  const theta = -(car.ang + 90); // align heading to screen-up
  const ax = 150, ay = 252; // car anchor in viewBox
  const G = `translate(${ax} ${ay}) rotate(${theta}) translate(${-car.x} ${-car.y})`;

  // cross streets along the route for motion reference
  const cross = [];
  for (let i = 1; i <= 16; i++) {
    const t = i / 17;
    const p = pointAt(route, t);
    const a = (p.ang + 90) * Math.PI / 180;
    const dx = Math.cos(a) * 60, dy = Math.sin(a) * 60;
    cross.push([p.x - dx, p.y - dy, p.x + dx, p.y + dy]);
  }
  // city blocks scattered beside the route (downtown side denser)
  const blocks = [];
  for (let i = 0; i < 26; i++) {
    const t = 0.12 + (i / 26) * 0.86;
    const p = pointAt(route, t);
    const a = (p.ang + 90) * Math.PI / 180;
    const side = i % 2 === 0 ? 1 : -1;
    const off = 24 + (i % 3) * 12;
    const bx = p.x + Math.cos(a) * off * side;
    const by = p.y + Math.sin(a) * off * side;
    const sz = 9 + (i % 4) * 4 + t * 8;
    blocks.push({ x: bx - sz / 2, y: by - sz / 2, w: sz, h: sz, lit: t > 0.75 });
  }

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: T.isDay ? "#cfe0ec" : "#05070b" }}>
      {/* sky / horizon glow */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "46%",
        background: T.isDay
          ? "linear-gradient(180deg,#acc7dc,#cfe0ec)"
          : `radial-gradient(120% 90% at 50% 100%, ${T.accent}22, rgba(5,7,11,0) 60%), linear-gradient(180deg,#05070b, #0a1018)` }} />
      <div style={{ position: "absolute", inset: 0, perspective: "640px", perspectiveOrigin: "50% 36%" }}>
        <div style={{ position: "absolute", left: "-20%", right: "-20%", top: "16%", bottom: "-26%",
          transform: "rotateX(64deg) scale(1.15)", transformOrigin: "50% 50%" }}>
          <svg viewBox="0 0 300 360" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ display: "block" }}>
            <defs>
              <radialGradient id="nav-ground" cx="50%" cy="64%" r="62%">
                <stop offset="0" stopColor={T.isDay ? "#dfe6ec" : "#11161f"} />
                <stop offset="1" stopColor={T.isDay ? "#c4d2dc" : "#0a0d14"} />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="300" height="360" fill="url(#nav-ground)" />
            <g transform={G}>
              {/* city blocks */}
              {blocks.map((b, i) => (
                <rect key={`b${i}`} x={b.x} y={b.y} width={b.w} height={b.h} rx="2"
                      fill={T.isDay ? "#b7c5cf" : (b.lit ? "#1b2433" : "#10151e")}
                      stroke={T.isDay ? "#a9b8c2" : "rgba(255,255,255,0.04)"} strokeWidth="0.6" />
              ))}
              {/* cross streets */}
              <g stroke={T.isDay ? "#ffffff" : "#1a2230"} strokeWidth="3.5" strokeLinecap="round">
                {cross.map((c, i) => <line key={`c${i}`} x1={c[0]} y1={c[1]} x2={c[2]} y2={c[3]} />)}
              </g>
              {/* asphalt band */}
              <path d={_toPath(route)} fill="none" stroke={T.isDay ? "#9fb0bb" : "#05070b"} strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" />
              <path d={_toPath(route)} fill="none" stroke={T.isDay ? "#e9eef2" : "#161c27"} strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />
              {/* lane divider */}
              <path d={_toPath(route)} fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="1.3" strokeDasharray="7 11" />
              {/* traffic-colored guidance */}
              {tweaks.trafficOn ? NAV_CHUNKS.map((c, i) => {
                const sub = lerpPath(route, c.a, c.b);
                const behind = c.b <= progress;
                return <path key={`tc${i}`} d={_toPath(sub)} fill="none" stroke={SEVCOL[c.sev]}
                             strokeWidth="13" strokeLinecap="round" opacity={behind ? 0.28 : 0.95} />;
              }) : (
                <path d={_toPath(route)} fill="none" stroke={T.accent} strokeWidth="13" strokeLinecap="round" />
              )}
              {/* accent edge highlight */}
              <path d={_toPath(lerpPath(route, progress, 1))} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.6" strokeDasharray="1 10" strokeLinecap="round" />

              {/* incidents ahead */}
              {INCIDENTS.filter(inc => inc.t > progress).map((inc, i) => {
                const p = pointAt(route, inc.t);
                const col = inc.kind === "police" ? T.blue : inc.kind === "crash" ? T.danger : T.warn;
                return (
                  <g key={`ni${i}`} transform={`translate(${p.x} ${p.y})`}>
                    <circle r="10" fill={col} opacity="0.2" className="om-pulse" />
                    <circle r="6.5" fill={col} stroke="#05070b" strokeWidth="1.4" />
                  </g>
                );
              })}
              {/* destination */}
              <g transform={`translate(${route[route.length-1][0]} ${route[route.length-1][1]})`}>
                <circle r="9" fill={T.accent} />
                <circle r="15" fill="none" stroke={T.accent} strokeWidth="1.5" opacity="0.5" />
              </g>
            </g>
          </svg>
        </div>
      </div>
      {/* depth fog at top of ground */}
      <div style={{ position: "absolute", left: 0, right: 0, top: "30%", height: "26%", pointerEvents: "none",
        background: T.isDay ? "linear-gradient(180deg, rgba(207,224,236,0.9), rgba(207,224,236,0))" : "linear-gradient(180deg, rgba(5,7,11,0.96), rgba(5,7,11,0))" }} />

      {/* the user chevron (upright, fixed) */}
      <div style={{ position: "absolute", left: "50%", top: "70%", transform: "translate(-50%,-50%)" }}>
        <svg width="58" height="58" viewBox="0 0 58 58">
          <ellipse cx="29" cy="40" rx="17" ry="6" fill="rgba(0,0,0,0.35)" />
          <circle cx="29" cy="29" r="22" fill={T.accent} opacity="0.12" className="om-pulse" />
          <path d="M29 10 L42 40 L29 33 L16 40 Z" fill={T.accent} stroke="#05231b" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

// ── lane guidance ─────────────────────────────────────────────
function LaneGuide({ T, recommend = [2, 3], count = 4, dir = "straight" }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 5 }}>
      {Array.from({ length: count }).map((_, i) => {
        const on = recommend.includes(i);
        return (
          <div key={i} style={{ width: 40, height: 34, borderRadius: 9, display: "grid", placeItems: "center",
            background: on ? "rgba(0,229,160,0.16)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${on ? T.accent : T.line}` }}>
            <Icon name={i === count - 1 ? "slight-right" : "straight"} size={18} color={on ? T.accent : T.inkFaint} stroke={2.4} />
          </div>
        );
      })}
    </div>
  );
}

// ── NAVIGATION (hero) ─────────────────────────────────────────
function NavigationScreen({ T, insetTop = 50, insetBottom = 28, tweaks, progress = 0, onEnd, onReport }) {
  const MANEUVERS = [
    { t: 0.0, icon: "merge", road: "I‑10 E · Santa Monica Fwy", text: "Merge onto I‑10 E" },
    { t: 0.30, icon: "straight", road: "I‑10 E", text: "Continue on I‑10 E" },
    { t: 0.58, icon: "slight-right", road: "I‑10 E", text: "Keep right at the fork" },
    { t: 0.80, icon: "turn-right", road: "Exit 14 · S Grand Ave", text: "Take exit toward Downtown" },
    { t: 0.93, icon: "turn-left", road: "W 1st St", text: "Turn left onto W 1st St" },
  ];
  const TOTAL_MI = 12.4, TOTAL_MIN = 26;
  const next = MANEUVERS.find(m => m.t > progress) || MANEUVERS[MANEUVERS.length - 1];
  const afterIdx = MANEUVERS.indexOf(next) + 1;
  const after = MANEUVERS[afterIdx];
  const distToNextMi = Math.max(0, (next.t - progress) * TOTAL_MI);
  const distLabel = distToNextMi < 0.19 ? `${Math.round(distToNextMi * 5280 / 50) * 50} ft` : `${distToNextMi.toFixed(1)} mi`;

  const remainMin = Math.max(1, Math.round(TOTAL_MIN * (1 - progress)));
  const remainMi = (TOTAL_MI * (1 - progress)).toFixed(1);
  const arrive = (() => { const d = new Date(); d.setMinutes(d.getMinutes() + remainMin); return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); })();

  // speed from severity near car
  const chunk = NAV_CHUNKS.find(c => progress >= c.a && progress < c.b) || NAV_CHUNKS[0];
  const speed = { free: 64, mod: 38, heavy: 22, sev: 9 }[chunk.sev];

  // incident ahead within range
  const incAhead = INCIDENTS.find(i => i.t > progress && i.t - progress < 0.16);
  const incMi = incAhead ? ((incAhead.t - progress) * TOTAL_MI).toFixed(1) : null;
  const incMeta = incAhead ? ({ police: { c: T.blue, l: "Police reported ahead" }, crash: { c: T.danger, l: "Crash · right lane blocked" }, hazard: { c: T.warn, l: "Object on road ahead" } }[incAhead.kind]) : null;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: T.bg, fontFamily: FN_UI }}>
      <NavScene T={T} tweaks={tweaks} progress={progress} />

      {/* TOP turn banner */}
      <div style={{ position: "absolute", top: insetTop, left: 12, right: 12, zIndex: 6 }}>
        <Glass theme={T} radius={20} tint="rgba(8,12,18,0.86)" style={{ padding: "13px 15px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: T.accent, display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Icon name={next.icon} size={36} color={T.accentInk} stroke={2.6} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ color: T.ink, fontSize: 30, fontWeight: 800, fontFamily: FN_NUM, lineHeight: 1 }}>{distLabel}</span>
            </div>
            <div style={{ color: T.ink, fontSize: 16, fontWeight: 700, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{next.text}</div>
          </div>
        </Glass>
        {/* then + lane guide */}
        <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "stretch" }}>
          {after && (
            <Glass theme={T} radius={14} tint="rgba(8,12,18,0.7)" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px" }}>
              <span style={{ color: T.inkMute, fontSize: 12, fontWeight: 700 }}>then</span>
              <Icon name={after.icon} size={20} color={T.ink} stroke={2.3} />
            </Glass>
          )}
          <Glass theme={T} radius={14} tint="rgba(8,12,18,0.7)" style={{ flex: 1, padding: "7px 10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LaneGuide T={T} recommend={progress > 0.55 ? [3] : [1, 2]} count={4} />
          </Glass>
        </div>
      </div>

      {/* incident alert */}
      {incMeta && (
        <div style={{ position: "absolute", top: insetTop + 152, left: 12, right: 12, zIndex: 6 }}>
          <Glass theme={T} radius={16} tint="rgba(8,12,18,0.82)" style={{ padding: "11px 14px", display: "flex", alignItems: "center", gap: 12, borderLeft: `4px solid ${incMeta.c}` }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `${incMeta.c}26`, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Icon name="warn" size={19} color={incMeta.c} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: T.ink, fontWeight: 700, fontSize: 13.5 }}>{incMeta.l}</div>
              <div style={{ color: T.inkMute, fontSize: 12 }}>in {incMi} mi · reported by drivers</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
              <button style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${T.line}`, background: "rgba(255,255,255,0.05)", color: T.good, display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="locate" size={15} /></button>
            </div>
          </Glass>
        </div>
      )}

      {/* speed + limit (bottom-left) */}
      <div style={{ position: "absolute", left: 14, bottom: insetBottom + 104, zIndex: 6, display: "flex", alignItems: "flex-end", gap: 9 }}>
        <div style={{ width: 56, height: 70, borderRadius: 12, background: "#fff", border: "3px solid #d22", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(0,0,0,0.4)" }}>
          <span style={{ fontSize: 8.5, fontWeight: 800, color: "#222", letterSpacing: "0.3px", marginTop: 2 }}>SPEED</span>
          <span style={{ fontSize: 8.5, fontWeight: 800, color: "#222", marginTop: -2 }}>LIMIT</span>
          <span style={{ fontSize: 26, fontWeight: 800, color: "#111", fontFamily: FN_NUM, lineHeight: 1 }}>65</span>
        </div>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(8,12,18,0.8)", backdropFilter: "blur(14px)", border: `1px solid ${speed > 65 ? T.danger : T.line}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: speed > 65 ? T.danger : T.ink, fontFamily: FN_NUM, lineHeight: 1 }}>{speed}</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: T.inkMute, letterSpacing: "0.5px" }}>mph</span>
        </div>
      </div>

      {/* right controls */}
      <div style={{ position: "absolute", right: 14, bottom: insetBottom + 104, zIndex: 6, display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={onReport} style={{ width: 52, height: 52, borderRadius: 16, border: "none", background: T.accent, color: T.accentInk, display: "grid", placeItems: "center", cursor: "pointer", boxShadow: `0 8px 22px ${T.accent}44` }}><Icon name="warn" size={24} stroke={2.4} /></button>
        <button style={{ width: 52, height: 52, borderRadius: 16, border: `1px solid ${T.line}`, background: "rgba(8,12,18,0.8)", backdropFilter: "blur(14px)", color: T.ink, display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="volume" size={22} /></button>
      </div>

      {/* bottom ETA bar */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 6 }}>
        <Glass theme={T} radius={26} tint="rgba(8,12,18,0.9)" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: "none", padding: `14px 18px ${insetBottom + 12}px`, display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={onEnd} style={{ width: 56, height: 56, borderRadius: 18, border: "none", background: T.danger, color: "#fff", fontWeight: 800, fontSize: 13.5, fontFamily: FN_UI, cursor: "pointer", flexShrink: 0, boxShadow: "0 8px 20px rgba(255,90,77,0.35)" }}>End</button>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 7 }}>
              <span style={{ color: T.good, fontSize: 28, fontWeight: 800, fontFamily: FN_NUM, lineHeight: 1 }}>{remainMin}</span>
              <span style={{ color: T.inkMute, fontSize: 14, fontWeight: 600 }}>min</span>
            </div>
            <div style={{ color: T.inkMute, fontSize: 13, marginTop: 3, fontFamily: FN_NUM }}>{arrive} · {remainMi} mi</div>
          </div>
          <button style={{ width: 56, height: 56, borderRadius: 18, border: `1px solid ${T.line}`, background: "rgba(255,255,255,0.05)", color: T.ink, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}><Icon name="layers" size={22} /></button>
        </Glass>
      </div>
    </div>
  );
}

// ── REPORT (Waze-style) ───────────────────────────────────────
function ReportScreen({ T, insetTop = 50, insetBottom = 28, tweaks, progress = 0.46, onClose }) {
  const [sent, setSent] = React.useState(null);
  const items = [
    { i: "crash", l: "Crash", c: T.danger },
    { i: "police", l: "Police", c: T.blue },
    { i: "traffic", l: "Traffic", c: T.warn },
    { i: "warn", l: "Hazard", c: "#ff8a3d" },
    { i: "close", l: "Closure", c: T.danger },
    { i: "eye", l: "Camera", c: "#a98bff" },
    { i: "gas", l: "Gas price", c: T.good },
    { i: "pin", l: "Map issue", c: T.inkMute },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: T.bg, fontFamily: FN_UI }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <NavScene T={T} tweaks={tweaks} progress={progress} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "rgba(5,7,11,0.55)", backdropFilter: "blur(2px)" }} onClick={onClose} />

      {/* sheet */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 5 }}>
        <Glass theme={T} radius={28} tint="rgba(11,15,22,0.96)" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: "none", padding: `0 18px ${insetBottom + 16}px` }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.18)", margin: "10px auto 6px" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 2px 16px" }}>
            <div style={{ color: T.ink, fontSize: 20, fontWeight: 800 }}>Report</div>
            <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 12, border: `1px solid ${T.line}`, background: "rgba(255,255,255,0.05)", color: T.ink, display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="close" size={18} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 11 }}>
            {items.map((it, i) => (
              <button key={i} onClick={() => setSent(it.l)} style={{
                border: "none", cursor: "pointer", background: "transparent",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              }}>
                <div style={{ width: "100%", aspectRatio: "1", borderRadius: 18, background: `${it.c}1c`, border: `1px solid ${it.c}40`, display: "grid", placeItems: "center" }}>
                  <Icon name={it.i} size={28} color={it.c} stroke={2.2} />
                </div>
                <span style={{ color: T.ink, fontSize: 12, fontWeight: 600 }}>{it.l}</span>
              </button>
            ))}
          </div>
          {sent && (
            <div style={{ marginTop: 16, padding: "13px 16px", borderRadius: 16, background: "rgba(0,229,160,0.12)", border: `1px solid ${T.accent}55`, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: T.accent, color: T.accentInk, display: "grid", placeItems: "center" }}><Icon name="locate" size={16} stroke={2.6} /></div>
              <span style={{ color: T.ink, fontSize: 14, fontWeight: 600 }}><b>{sent}</b> reported. Thanks — drivers nearby were alerted.</span>
            </div>
          )}
        </Glass>
      </div>
    </div>
  );
}

Object.assign(window, { NavigationScreen, ReportScreen, NavScene, LaneGuide });
