// screens-core.jsx — Home (live map), Search, Route preview.
// Relies on window: Icon, Glass, Chip, LAMap, makeTheme, ROUTE, ALT_ROUTE, pointAt
// Exports (to window): HomeScreen, SearchScreen, RoutePreviewScreen, DarkKeyboard

const F_UI = "'Plus Jakarta Sans', system-ui, sans-serif";
const F_NUM = "'Space Grotesk', system-ui, sans-serif";

function mapTheme(T) { return { accent: T.accent, isDay: T.isDay, contrast: T.contrast }; }

// floating round map-control button
function MapBtn({ icon, theme, active, onClick, badge }) {
  const T = theme;
  return (
    <button onClick={onClick} style={{
      width: 46, height: 46, borderRadius: 15, position: "relative",
      border: `1px solid ${active ? "transparent" : T.line}`,
      background: active ? T.accent : "rgba(14,19,28,0.78)",
      backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      color: active ? T.accentInk : T.ink, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 8px 22px rgba(0,0,0,0.4)",
    }}>
      <Icon name={icon} size={22} stroke={2.1} />
      {badge && <span style={{
        position: "absolute", top: -5, right: -5, minWidth: 18, height: 18, padding: "0 4px",
        borderRadius: 9, background: T.danger, color: "#fff", fontSize: 10.5, fontWeight: 800,
        fontFamily: F_NUM, display: "flex", alignItems: "center", justifyContent: "center",
        border: "2px solid #070a0f",
      }}>{badge}</span>}
    </button>
  );
}

function SheetHandle({ T }) {
  return <div style={{ width: 40, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.18)", margin: "9px auto 4px" }} />;
}

// ── HOME / LIVE MAP ───────────────────────────────────────────
function HomeScreen({ T, insetTop = 54, insetBottom = 30, tweaks, onSearch, onReport }) {
  const cats = [
    { i: "home", l: "Home", s: "18 min" },
    { i: "work", l: "Work", s: "26 min" },
    { i: "gas", l: "Gas" },
    { i: "park", l: "Parking" },
    { i: "plug", l: "EV" },
    { i: "star", l: "Saved" },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: T.bg, fontFamily: F_UI }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <LAMap theme={mapTheme(T)} trafficOn={tweaks.trafficOn} showRoute={false}
               progress={0.46} uid="home" />
      </div>

      {/* top search */}
      <div style={{ position: "absolute", top: insetTop, left: 14, right: 14, zIndex: 5 }}>
        <Glass theme={T} radius={18} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 0 16px", height: 54 }}>
          <Icon name="search" size={21} color={T.inkMute} />
          <button onClick={onSearch} style={{ flex: 1, textAlign: "left", background: "none", border: "none", color: T.inkMute, fontSize: 16, fontFamily: F_UI, cursor: "pointer" }}>Where to?</button>
          <div style={{ width: 1, height: 22, background: T.line }} />
          <button onClick={onSearch} style={{ width: 40, height: 40, borderRadius: 12, border: "none", background: "transparent", color: T.ink, display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="mic" size={20} /></button>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#2b3647,#161b24)", border: `1px solid ${T.line}`, display: "grid", placeItems: "center", color: T.accent, fontWeight: 800, fontFamily: F_NUM, fontSize: 15 }}>A</div>
        </Glass>
        {/* category chips */}
        <div style={{ display: "flex", gap: 8, marginTop: 10, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
          {cats.map((c, i) => (
            <Chip key={i} theme={T} style={{ flexShrink: 0 }}>
              <Icon name={c.i} size={16} color={T.accent} stroke={2.2} />
              <span>{c.l}</span>
              {c.s && <span style={{ color: T.inkMute, fontWeight: 600 }}>· {c.s}</span>}
            </Chip>
          ))}
        </div>
      </div>

      {/* right controls */}
      <div style={{ position: "absolute", right: 14, top: insetTop + 150, display: "flex", flexDirection: "column", gap: 10, zIndex: 5 }}>
        <MapBtn icon="layers" theme={T} />
        <MapBtn icon="traffic" theme={T} active={tweaks.trafficOn} />
        <MapBtn icon="locate" theme={T} />
      </div>

      {/* report FAB */}
      <button onClick={onReport} style={{
        position: "absolute", right: 16, bottom: insetBottom + 196, zIndex: 6,
        width: 58, height: 58, borderRadius: 19, border: "none", cursor: "pointer",
        background: T.accent, color: T.accentInk, display: "grid", placeItems: "center",
        boxShadow: `0 10px 30px ${T.accent}55, 0 4px 12px rgba(0,0,0,0.4)`,
      }}>
        <Icon name="warn" size={26} stroke={2.4} />
      </button>

      {/* bottom sheet */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 5 }}>
        <Glass theme={T} radius={28} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: `0 18px ${insetBottom + 14}px`, borderBottom: "none" }}>
          <SheetHandle T={T} />
          {/* traffic insight */}
          <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 2px 14px" }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(255,90,77,0.16)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Icon name="traffic" size={20} color={T.danger} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: T.ink, fontWeight: 700, fontSize: 14.5 }}>Heavier traffic than usual</div>
              <div style={{ color: T.inkMute, fontSize: 12.5, marginTop: 1 }}>I‑10 E backed up near La Brea · +8 min</div>
            </div>
            <Icon name="chevR" size={18} color={T.inkFaint} />
          </div>
          {/* saved row */}
          <div style={{ display: "flex", gap: 10 }}>
            {[{ i: "home", l: "Home", s: "18 min", d: "via I‑10 W" }, { i: "work", l: "Work", s: "26 min", d: "via US‑101" }].map((p, i) => (
              <button key={i} onClick={onSearch} style={{
                flex: 1, textAlign: "left", border: `1px solid ${T.line}`, cursor: "pointer",
                background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "12px 13px",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.06)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Icon name={p.i} size={18} color={T.accent} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: T.ink, fontWeight: 700, fontSize: 14 }}>{p.l}</div>
                  <div style={{ color: T.inkMute, fontSize: 11.5, whiteSpace: "nowrap" }}><span style={{ color: T.good, fontWeight: 700 }}>{p.s}</span> · {p.d}</div>
                </div>
              </button>
            ))}
          </div>
        </Glass>
      </div>
    </div>
  );
}

// ── compact dark keyboard ─────────────────────────────────────
function DarkKeyboard({ T, insetBottom = 0 }) {
  const rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
  const Key = ({ ch, w, dark, children, grow }) => (
    <div style={{
      height: 42, flex: grow ? 1 : (w ? `0 0 ${w}px` : 1), minWidth: 0,
      borderRadius: 8, background: dark ? "rgba(0,0,0,0.4)" : "rgba(70,80,95,0.55)",
      display: "grid", placeItems: "center", color: T.ink, fontSize: 17, fontWeight: 600,
      fontFamily: F_UI, boxShadow: "0 1px 0 rgba(0,0,0,0.4)",
    }}>{children || ch}</div>
  );
  return (
    <div style={{ background: "rgba(10,13,18,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", padding: `8px 5px ${8 + insetBottom}px`, display: "flex", flexDirection: "column", gap: 8, borderTop: `1px solid ${T.line}` }}>
      <div style={{ display: "flex", gap: 5 }}>{rows[0].split("").map(c => <Key key={c} ch={c} />)}</div>
      <div style={{ display: "flex", gap: 5, padding: "0 16px" }}>{rows[1].split("").map(c => <Key key={c} ch={c} />)}</div>
      <div style={{ display: "flex", gap: 5 }}>
        <Key w={40} dark><Icon name="chevR" size={18} style={{ transform: "rotate(-90deg)" }} /></Key>
        {rows[2].split("").map(c => <Key key={c} ch={c} />)}
        <Key w={40} dark><Icon name="close" size={16} /></Key>
      </div>
      <div style={{ display: "flex", gap: 5 }}>
        <Key w={68} dark><span style={{ fontSize: 13 }}>123</span></Key>
        <Key grow><span style={{ color: T.inkMute, fontSize: 13 }}>space</span></Key>
        <div style={{ flex: "0 0 76px", height: 42, borderRadius: 8, background: T.accent, color: T.accentInk, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 14 }}>Go</div>
      </div>
    </div>
  );
}

// ── SEARCH ────────────────────────────────────────────────────
function SearchScreen({ T, insetTop = 54, insetBottom = 30, tweaks, query = "Downtown LA", onBack, onPick }) {
  const results = [
    { i: "pin", t: "Downtown Los Angeles", s: "Los Angeles, CA · 12.4 mi", hot: true },
    { i: "work", t: "US Bank Tower", s: "633 W 5th St · 12.6 mi" },
    { i: "park", t: "Pershing Square Garage", s: "532 S Olive St · 12.1 mi" },
    { i: "pin", t: "Grand Central Market", s: "317 S Broadway · 12.8 mi" },
  ];
  const recents = [
    { i: "work", t: "Work", s: "1100 S Flower St" },
    { i: "star", t: "The Broad", s: "221 S Grand Ave" },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: T.bg, fontFamily: F_UI, display: "flex", flexDirection: "column" }}>
      {/* faint map peeking */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.4 }}>
        <LAMap theme={mapTheme(T)} trafficOn={tweaks.trafficOn} showRoute={false} dimmed labels={false} uid="srch" />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(7,10,15,0.5), rgba(7,10,15,0.92) 30%)" }} />

      {/* search bar */}
      <div style={{ position: "relative", zIndex: 5, padding: `${insetTop}px 14px 10px`, display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onBack} style={{ width: 44, height: 50, border: "none", background: "none", color: T.ink, cursor: "pointer", display: "grid", placeItems: "center" }}><Icon name="back" size={24} /></button>
        <Glass theme={T} radius={15} style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "0 12px", height: 50 }}>
          <Icon name="search" size={20} color={T.accent} />
          <div style={{ flex: 1, color: T.ink, fontSize: 16.5, fontWeight: 600, display: "flex", alignItems: "center" }}>
            {query}<span className="om-caret" style={{ width: 2, height: 20, background: T.accent, marginLeft: 1, display: "inline-block" }} />
          </div>
          <Icon name="close" size={18} color={T.inkMute} />
        </Glass>
      </div>

      {/* results */}
      <div style={{ position: "relative", zIndex: 5, flex: 1, overflow: "hidden", padding: "4px 6px" }}>
        {results.map((r, i) => (
          <button key={i} onClick={onPick} style={{
            width: "100%", textAlign: "left", border: "none", cursor: "pointer",
            background: r.hot ? "rgba(0,229,160,0.08)" : "transparent",
            borderRadius: 16, padding: "12px 14px", display: "flex", alignItems: "center", gap: 13,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: "grid", placeItems: "center",
              background: r.hot ? T.accent : "rgba(255,255,255,0.06)" }}>
              <Icon name={r.i} size={20} color={r.hot ? T.accentInk : T.inkMute} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: T.ink, fontWeight: 700, fontSize: 15.5 }}>{r.t}</div>
              <div style={{ color: T.inkMute, fontSize: 12.5, marginTop: 1 }}>{r.s}</div>
            </div>
            {r.hot && <div style={{ color: T.good, fontWeight: 800, fontFamily: F_NUM, fontSize: 14 }}>26 min</div>}
          </button>
        ))}
        <div style={{ color: T.inkFaint, fontSize: 11.5, fontWeight: 800, letterSpacing: "1.2px", padding: "12px 16px 6px" }}>RECENT</div>
        {recents.map((r, i) => (
          <button key={i} onClick={onPick} style={{ width: "100%", textAlign: "left", border: "none", background: "transparent", cursor: "pointer", borderRadius: 16, padding: "10px 14px", display: "flex", alignItems: "center", gap: 13 }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.05)" }}><Icon name={r.i} size={18} color={T.inkMute} /></div>
            <div style={{ flex: 1 }}><div style={{ color: T.ink, fontWeight: 600, fontSize: 14.5 }}>{r.t}</div><div style={{ color: T.inkMute, fontSize: 12 }}>{r.s}</div></div>
          </button>
        ))}
      </div>

      {/* keyboard */}
      <div style={{ position: "relative", zIndex: 6 }}>
        <DarkKeyboard T={T} insetBottom={insetBottom} />
      </div>
    </div>
  );
}

// ── ROUTE PREVIEW ─────────────────────────────────────────────
function RoutePreviewScreen({ T, insetTop = 54, insetBottom = 30, tweaks, choice = 0, setChoice, onStart, onBack }) {
  const routes = [
    { min: 26, label: "via I‑10 E", mi: "12.4 mi", note: "Fastest route, despite traffic", tag: "Fastest", good: true },
    { min: 31, label: "via Olympic Blvd", mi: "11.2 mi", note: "Less traffic", tag: null, good: false },
  ];
  const modes = [{ i: "car", l: "26 min" }, { i: "transit", l: "52 min" }, { i: "walk", l: "4 hr" }];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: T.bg, fontFamily: F_UI }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <LAMap theme={mapTheme(T)} trafficOn={tweaks.trafficOn} showRoute routeChoice={choice}
               progress={0} showPuck={false} uid="route" />
      </div>

      {/* top origin→dest bar */}
      <div style={{ position: "absolute", top: insetTop, left: 14, right: 14, zIndex: 5, display: "flex", gap: 10 }}>
        <button onClick={onBack} style={{ width: 50, height: 50, borderRadius: 15, border: `1px solid ${T.line}`, background: "rgba(14,19,28,0.8)", backdropFilter: "blur(16px)", color: T.ink, cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="back" size={22} /></button>
        <Glass theme={T} radius={16} style={{ flex: 1, padding: "9px 14px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", border: `2px solid ${T.inkMute}` }} />
            <span style={{ color: T.ink, fontSize: 14, fontWeight: 600, flex: 1 }}>Santa Monica Pier</span>
            <Icon name="swap" size={18} color={T.inkMute} />
          </div>
          <div style={{ height: 1, background: T.line }} />
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent }} />
            <span style={{ color: T.ink, fontSize: 14, fontWeight: 700, flex: 1 }}>Downtown Los Angeles</span>
          </div>
        </Glass>
      </div>

      {/* bottom sheet */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 5 }}>
        <Glass theme={T} radius={28} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: `0 16px ${insetBottom + 14}px`, borderBottom: "none" }}>
          <SheetHandle T={T} />
          {/* mode tabs */}
          <div style={{ display: "flex", gap: 8, padding: "6px 0 12px" }}>
            {modes.map((m, i) => (
              <div key={i} style={{ flex: 1, height: 50, borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
                background: i === 0 ? "rgba(0,229,160,0.12)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${i === 0 ? T.accent : T.line}` }}>
                <Icon name={m.i} size={19} color={i === 0 ? T.accent : T.inkMute} />
                <span style={{ fontSize: 11.5, fontWeight: 700, color: i === 0 ? T.ink : T.inkMute, fontFamily: F_NUM }}>{m.l}</span>
              </div>
            ))}
          </div>
          {/* route options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {routes.map((r, i) => {
              const sel = choice === i;
              return (
                <button key={i} onClick={() => setChoice(i)} style={{
                  width: "100%", textAlign: "left", cursor: "pointer", borderRadius: 18, padding: "13px 15px",
                  background: sel ? "rgba(0,229,160,0.10)" : "rgba(255,255,255,0.03)",
                  border: `1.5px solid ${sel ? T.accent : T.line}`,
                  display: "flex", alignItems: "center", gap: 13, position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: sel ? T.accent : "transparent" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ color: r.good ? T.good : T.ink, fontWeight: 800, fontSize: 24, fontFamily: F_NUM }}>{r.min}</span>
                      <span style={{ color: T.inkMute, fontSize: 13, fontWeight: 600 }}>min</span>
                      {r.tag && <span style={{ marginLeft: 4, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.5px", color: T.accentInk, background: T.accent, padding: "2px 7px", borderRadius: 7 }}>{r.tag.toUpperCase()}</span>}
                    </div>
                    <div style={{ color: T.ink, fontSize: 13.5, fontWeight: 600, marginTop: 3 }}>{r.label} · {r.mi}</div>
                    <div style={{ color: T.inkMute, fontSize: 12, marginTop: 1 }}>{r.note}</div>
                  </div>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${sel ? T.accent : T.inkFaint}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                    {sel && <div style={{ width: 12, height: 12, borderRadius: "50%", background: T.accent }} />}
                  </div>
                </button>
              );
            })}
          </div>
          {/* leave-by predictive */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "12px 4px 4px" }}>
            <Icon name="clock" size={16} color={T.warn} />
            <span style={{ color: T.inkMute, fontSize: 12.5 }}>Leave by <b style={{ color: T.ink }}>5:10 PM</b> to arrive by 5:34 PM</span>
          </div>
          {/* start */}
          <button onClick={onStart} style={{
            width: "100%", height: 56, marginTop: 10, border: "none", borderRadius: 18, cursor: "pointer",
            background: T.accent, color: T.accentInk, fontWeight: 800, fontSize: 17, fontFamily: F_UI,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            boxShadow: `0 10px 28px ${T.accent}44`,
          }}>
            <Icon name="nav" size={21} color={T.accentInk} /> Start
          </button>
        </Glass>
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, SearchScreen, RoutePreviewScreen, DarkKeyboard });
