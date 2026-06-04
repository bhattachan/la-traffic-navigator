// map.jsx — Stylized dark vector map of West LA → Downtown (the I-10 corridor).
// Hand-authored GIS abstraction: Santa Monica Bay, street grid, freeways,
// the active route, animated traffic-flow segments, incidents, user puck.
// Exports (to window): LAMap, ROUTE, ALT_ROUTE, lerpPath, pointAt, INCIDENTS

// ── Logical canvas ────────────────────────────────────────────
const MAP_W = 440, MAP_H = 900;

// Santa Monica Bay — ocean fills the lower-left, coastline runs NW→SE
const COAST = `M0,0 L150,0 C130,120 80,210 60,320 C44,430 70,560 30,690 C12,760 -10,820 0,900 L0,900 Z`;

// A couple of green parks
const PARKS = [
  // Westside park
  "M250,470 C300,455 330,470 345,505 C355,540 330,580 290,585 C255,588 235,560 235,520 C236,495 235,478 250,470 Z",
  // Downtown-adjacent green
  "M360,150 C392,142 420,158 422,192 C424,222 402,242 374,238 C350,234 344,205 348,180 C350,166 350,153 360,150 Z",
];

// Freeway centerlines (polylines in logical coords)
const FWY = {
  // I-10 Santa Monica Fwy — the route corridor (SW coast → NE downtown)
  i10: [[92,742],[150,690],[205,622],[246,540],[281,456],[311,372],[341,292],[366,216],[388,168]],
  // I-405 — north-south on the west
  i405: [[120,40],[132,150],[150,300],[150,470],[140,620],[120,760],[96,880]],
  // US-101 near downtown
  us101: [[300,60],[330,120],[360,170],[392,210],[420,250]],
};

// Active route (follows I-10) + a slower alternate (surface streets dip)
const ROUTE = FWY.i10;
const ALT_ROUTE = [[92,742],[160,710],[225,675],[270,600],[300,520],[300,430],[330,350],[360,265],[388,170]];

// Incidents along the corridor — {t: 0..1 along route, kind, label}
const INCIDENTS = [
  { t: 0.30, kind: "police",  label: "Police reported" },
  { t: 0.52, kind: "crash",   label: "Crash · right lane" },
  { t: 0.74, kind: "hazard",  label: "Object on road" },
];

const INCIDENT_STYLE = {
  police: { c: "#3da5ff", glyph: "P" },
  crash:  { c: "#ff5a4d", glyph: "!" },
  hazard: { c: "#ffb020", glyph: "▲" },
  closure:{ c: "#ff5a4d", glyph: "✕" },
};

// ── polyline helpers ──────────────────────────────────────────
function toPath(pts) {
  // smooth-ish path via quadratic midpoints
  if (pts.length < 2) return "";
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q${pts[i][0]},${pts[i][1]} ${mx},${my}`;
  }
  const last = pts[pts.length - 1];
  d += ` L${last[0]},${last[1]}`;
  return d;
}
function segLengths(pts) {
  const L = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1];
    const d = Math.hypot(dx, dy);
    L.push(d); total += d;
  }
  return { L, total };
}
// point + heading at t in [0,1] along polyline
function pointAt(pts, t) {
  const { L, total } = segLengths(pts);
  let target = Math.max(0, Math.min(1, t)) * total;
  for (let i = 0; i < L.length; i++) {
    if (target <= L[i]) {
      const f = L[i] === 0 ? 0 : target / L[i];
      const x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f;
      const y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f;
      const ang = Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]) * 180 / Math.PI;
      return { x, y, ang };
    }
    target -= L[i];
  }
  const n = pts.length - 1;
  const ang = Math.atan2(pts[n][1] - pts[n - 1][1], pts[n][0] - pts[n - 1][0]) * 180 / Math.PI;
  return { x: pts[n][0], y: pts[n][1], ang };
}
// sub-polyline between t0..t1 (for colored traffic chunks)
function lerpPath(pts, t0, t1) {
  const { L, total } = segLengths(pts);
  const d0 = t0 * total, d1 = t1 * total;
  const out = [];
  let acc = 0;
  for (let i = 0; i < L.length; i++) {
    const segStart = acc, segEnd = acc + L[i];
    if (segEnd >= d0 && segStart <= d1) {
      const a = Math.max(d0, segStart), b = Math.min(d1, segEnd);
      const fa = L[i] === 0 ? 0 : (a - segStart) / L[i];
      const fb = L[i] === 0 ? 0 : (b - segStart) / L[i];
      const pa = [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * fa, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * fa];
      const pb = [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * fb, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * fb];
      if (out.length === 0) out.push(pa);
      out.push(pb);
    }
    acc = segEnd;
  }
  return out;
}

// ── street grid (rotated, clipped to land) ────────────────────
function buildGrid(rot, spacing, region) {
  const lines = [];
  const rad = rot * Math.PI / 180;
  const cos = Math.cos(rad), sin = Math.sin(rad);
  const span = 1400;
  for (let k = -span; k <= span; k += spacing) {
    // lines in two directions
    const a1 = [-span, k], a2 = [span, k];
    const b1 = [k, -span], b2 = [k, span];
    const rotate = (p) => [
      p[0] * cos - p[1] * sin + region.cx,
      p[0] * sin + p[1] * cos + region.cy,
    ];
    lines.push([rotate(a1), rotate(a2)]);
    lines.push([rotate(b1), rotate(b2)]);
  }
  return lines;
}

// ── component ─────────────────────────────────────────────────
function LAMap({
  theme = {}, trafficOn = true, showRoute = true, routeChoice = 0,
  progress = 0, viewBox = `0 0 ${MAP_W} ${MAP_H}`, showIncidents = true,
  showPuck = true, puckChevron = false, dimmed = false, labels = true,
  uid = "m",
}) {
  const accent = theme.accent || "#00e5a0";
  const day = theme.isDay;
  const contrast = theme.contrast == null ? 1 : theme.contrast;

  // palette (night default / day variant)
  const P = day ? {
    land: "#e9edf2", land2: "#dfe4ea", water: "#bcd6e6", park: "#c4e2c0",
    minor: "#ffffff", major: "#f6c34a", fwy: "#f4a23a", fwyEdge: "#e08a1e",
    grid: "rgba(120,135,155,0.30)", ink: "#1a2230", inkMute: "#5a6678",
  } : {
    land: "#0c1018", land2: "#0e131c", water: "#0a1a26", park: "#0f2118",
    minor: "#1a2230", major: "#2b3647", fwy: "#37425a", fwyEdge: "#222b3c",
    grid: "rgba(120,140,170,0.07)", ink: "#eaf0f8", inkMute: "#7a869a",
  };

  const route = routeChoice === 1 ? ALT_ROUTE : ROUTE;

  // traffic severity chunks along the route (t ranges)
  const trafficChunks = [
    { a: 0.00, b: 0.22, sev: "free" },
    { a: 0.22, b: 0.40, sev: "mod" },
    { a: 0.40, b: 0.58, sev: "heavy" },
    { a: 0.58, b: 0.66, sev: "sev" },
    { a: 0.66, b: 0.82, sev: "mod" },
    { a: 0.82, b: 1.00, sev: "free" },
  ];
  const SEV = {
    free:  "#13c98a",
    mod:   "#ffc24b",
    heavy: "#ff6a3d",
    sev:   "#e23a3a",
  };

  const grid = buildGrid(28, 26, { cx: 250, cy: 360 });
  const gridFine = buildGrid(28, 13, { cx: 250, cy: 360 });
  const car = pointAt(route, progress);

  return (
    <svg viewBox={viewBox} width="100%" height="100%" preserveAspectRatio="xMidYMid slice"
         style={{ display: "block", filter: dimmed ? "saturate(0.7) brightness(0.6)" : "none" }}>
      <defs>
        <linearGradient id={`${uid}-land`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={P.land} />
          <stop offset="1" stopColor={P.land2} />
        </linearGradient>
        <radialGradient id={`${uid}-vig`} cx="50%" cy="42%" r="75%">
          <stop offset="55%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor={day ? "rgba(40,60,80,0.18)" : "rgba(0,0,0,0.55)"} />
        </radialGradient>
        <filter id={`${uid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <clipPath id={`${uid}-land-clip`}>
          <rect x="0" y="0" width={MAP_W} height={MAP_H} />
        </clipPath>
      </defs>

      {/* base land */}
      <rect x="0" y="0" width={MAP_W} height={MAP_H} fill={`url(#${uid}-land)`} />

      <g clipPath={`url(#${uid}-land-clip)`} opacity={contrast}>
        {/* street grid */}
        <g stroke={P.grid} strokeWidth="0.6">
          {gridFine.map((l, i) => (
            <line key={`gf${i}`} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} />
          ))}
        </g>
        <g stroke={P.minor} strokeWidth="2.2" strokeLinecap="round">
          {grid.map((l, i) => (
            <line key={`g${i}`} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} />
          ))}
        </g>

        {/* parks */}
        {PARKS.map((d, i) => <path key={`pk${i}`} d={d} fill={P.park} />)}

        {/* major arterials (a few thicker lines from the grid feel) */}
        <g stroke={P.major} strokeWidth="3.4" strokeLinecap="round" opacity={day ? 0.9 : 0.85}>
          <path d={toPath([[40,250],[160,260],[300,250],[430,235]])} fill="none" />
          <path d={toPath([[60,520],[200,505],[360,500],[440,495]])} fill="none" />
          <path d={toPath([[210,40],[225,260],[235,520],[250,820]])} fill="none" />
        </g>
      </g>

      {/* ocean on top of land edge */}
      <path d={COAST} fill={P.water} />
      <path d={COAST} fill="none" stroke={day ? "#a7c6d8" : "#112a3a"} strokeWidth="1.5" opacity="0.5" />
      {/* gentle wave hints */}
      <g stroke={day ? "rgba(255,255,255,0.5)" : "rgba(120,170,200,0.12)"} strokeWidth="1" fill="none">
        <path d="M14,180 q14,-8 28,0" /><path d="M8,260 q14,-8 28,0" />
        <path d="M18,360 q14,-8 28,0" /><path d="M6,470 q14,-8 28,0" />
        <path d="M16,560 q14,-8 28,0" />
      </g>

      {/* freeways (casing + fill) */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {Object.values(FWY).map((pts, i) => (
          <path key={`fwc${i}`} d={toPath(pts)} stroke={P.fwyEdge} strokeWidth="9" />
        ))}
        {Object.values(FWY).map((pts, i) => (
          <path key={`fw${i}`} d={toPath(pts)} stroke={P.fwy} strokeWidth="6" />
        ))}
      </g>

      {/* TRAFFIC FLOW on the route corridor */}
      {trafficOn && (
        <g fill="none" strokeLinecap="round">
          {trafficChunks.map((c, i) => {
            const sub = lerpPath(route, c.a, c.b);
            const d = toPath(sub);
            return (
              <g key={`tf${i}`}>
                <path d={d} stroke={SEV[c.sev]} strokeWidth="7" opacity="0.92" />
                <path d={d} stroke="rgba(255,255,255,0.55)" strokeWidth="1.6"
                      strokeDasharray="2 12" className="om-flow" />
              </g>
            );
          })}
        </g>
      )}

      {/* ACTIVE ROUTE */}
      {showRoute && (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={toPath(route)} stroke="rgba(0,0,0,0.35)" strokeWidth="11" />
          <path d={toPath(route)} stroke={accent} strokeWidth="6.5"
                filter={`url(#${uid}-glow)`} opacity={trafficOn ? 0.0 : 1} />
          {!trafficOn && (
            <path d={toPath(route)} stroke="rgba(255,255,255,0.7)" strokeWidth="1.6"
                  strokeDasharray="2 12" className="om-flow" />
          )}
          {/* origin pin */}
          <circle cx={route[0][0]} cy={route[0][1]} r="6" fill={day ? "#1a2230" : "#0c1018"} stroke={accent} strokeWidth="3" />
          {/* destination flag */}
          <g transform={`translate(${route[route.length-1][0]}, ${route[route.length-1][1]})`}>
            <circle r="9" fill={accent} />
            <circle r="9" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
            <path d="M-2,-5 h7 l-2,3 l2,3 h-7 z" fill="#06231b" transform="translate(-1,0)" />
          </g>
        </g>
      )}

      {/* INCIDENTS */}
      {showIncidents && INCIDENTS.map((inc, i) => {
        const p = pointAt(route, inc.t);
        const st = INCIDENT_STYLE[inc.kind];
        return (
          <g key={`inc${i}`} transform={`translate(${p.x},${p.y})`}>
            <circle r="11" fill={st.c} opacity="0.18" className="om-pulse" />
            <path d="M0,-11 C7,-11 11,-6 11,-1 C11,6 0,15 0,15 C0,15 -11,6 -11,-1 C-11,-6 -7,-11 0,-11 Z"
                  fill={st.c} stroke="rgba(0,0,0,0.3)" strokeWidth="0.8" />
            <text x="0" y="2" textAnchor="middle" fontSize="9" fontWeight="800"
                  fill="#0a0e14" fontFamily="'Space Grotesk',system-ui">{st.glyph}</text>
          </g>
        );
      })}

      {/* district labels */}
      {labels && (
        <g fontFamily="'Plus Jakarta Sans',system-ui" fill={P.inkMute} fontWeight="600"
           style={{ textTransform: "uppercase", letterSpacing: "1.5px" }}>
          <text x="36" y="430" fontSize="9" fill={day ? "#5a7a8a" : "#3f5a6a"}>SANTA MONICA BAY</text>
          <text x="120" y="770" fontSize="10">SANTA MONICA</text>
          <text x="250" y="640" fontSize="10">CULVER CITY</text>
          <text x="300" y="300" fontSize="10">MID-CITY</text>
          <text x="370" y="130" fontSize="10" fill={accent} opacity="0.8">DOWNTOWN</text>
        </g>
      )}

      {/* USER PUCK */}
      {showPuck && (
        <g transform={`translate(${car.x},${car.y})`}>
          <circle r="20" fill={accent} opacity="0.14" className="om-pulse" />
          {puckChevron ? (
            <g transform={`rotate(${car.ang + 90})`}>
              <path d="M0,-13 L10,11 L0,5 L-10,11 Z" fill={accent} stroke="#06231b" strokeWidth="1.2" />
            </g>
          ) : (
            <g>
              <circle r="8.5" fill={accent} stroke="#06231b" strokeWidth="2.5" />
              <circle r="3.4" fill="#06231b" />
            </g>
          )}
        </g>
      )}

      {/* vignette */}
      <rect x="0" y="0" width={MAP_W} height={MAP_H} fill={`url(#${uid}-vig)`} pointerEvents="none" />
    </svg>
  );
}

Object.assign(window, { LAMap, ROUTE, ALT_ROUTE, lerpPath, pointAt, INCIDENTS, MAP_W, MAP_H });
