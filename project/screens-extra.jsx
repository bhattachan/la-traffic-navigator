// screens-extra.jsx — Arrival/Parking, Saved Places, Settings, Trip Overview+Share
// Relies on window: Icon, Glass, Chip, LAMap, makeTheme, ROUTE, pointAt
// Exports (to window): ArrivalScreen, SavedPlacesScreen, SettingsScreen, TripOverviewScreen

const FX_UI = "'Plus Jakarta Sans', system-ui, sans-serif";
const FX_NUM = "'Space Grotesk', system-ui, sans-serif";

// ── ARRIVAL + PARKING ─────────────────────────────────────────
function ArrivalScreen({ T, insetTop = 54, insetBottom = 30, tweaks, onDone }) {
  const [selected, setSelected] = React.useState(null);

  const lots = [
    { id: 0, name: "5th & Grand Garage", available: 142, price: "$6 / hr", walk: "3 min", dist: "0.2 mi", type: "garage" },
    { id: 1, name: "Pershing Square Garage", available: 48, price: "$8 / hr", walk: "5 min", dist: "0.3 mi", type: "garage" },
    { id: 2, name: "Street Parking · S Hill St", available: null, price: "$2 / hr", walk: "1 min", dist: "0.1 mi", type: "street", limited: true },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: T.bg, fontFamily: FX_UI }}>
      {/* map zoomed to destination */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "46%" }}>
        <LAMap theme={{ accent: T.accent, isDay: T.isDay, contrast: T.contrast }}
               trafficOn={false} showRoute showPuck={false} progress={1}
               viewBox="300 80 140 200" uid="arr" labels={false} />
      </div>
      <div style={{ position: "absolute", top: "30%", left: 0, right: 0, height: "20%",
        background: "linear-gradient(180deg, rgba(7,10,15,0), rgba(7,10,15,0.98))" }} />

      {/* arrival banner */}
      <div style={{ position: "absolute", top: insetTop + 10, left: 14, right: 14, zIndex: 5 }}>
        <Glass theme={T} radius={18} style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 50, height: 50, borderRadius: 16, background: T.accent, display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Icon name="pin" size={26} color={T.accentInk} stroke={2.2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: T.accent, fontWeight: 800, fontSize: 11.5, letterSpacing: "0.8px", marginBottom: 3 }}>YOU'VE ARRIVED</div>
            <div style={{ color: T.ink, fontWeight: 700, fontSize: 16 }}>Downtown Los Angeles</div>
            <div style={{ color: T.inkMute, fontSize: 12.5, marginTop: 2 }}>633 W 5th St · 5:31 PM</div>
          </div>
        </Glass>
      </div>

      {/* parking bottom sheet */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 5 }}>
        <Glass theme={T} radius={28} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: `0 16px ${insetBottom + 14}px`, borderBottom: "none" }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.18)", margin: "10px auto 6px" }} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 2px 12px" }}>
            <div style={{ color: T.ink, fontWeight: 800, fontSize: 18 }}>Nearby Parking</div>
            <Chip theme={T} style={{ height: 32, fontSize: 12 }}>
              <Icon name="locate" size={14} color={T.accent} />
              <span>Map view</span>
            </Chip>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {lots.map((lot) => {
              const sel = selected === lot.id;
              return (
                <button key={lot.id} onClick={() => setSelected(lot.id)} style={{
                  width: "100%", textAlign: "left", cursor: "pointer", borderRadius: 18, padding: "13px 14px",
                  background: sel ? "rgba(0,229,160,0.10)" : "rgba(255,255,255,0.03)",
                  border: `1.5px solid ${sel ? T.accent : T.line}`,
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: "grid", placeItems: "center",
                    background: sel ? `${T.accent}28` : "rgba(255,255,255,0.06)" }}>
                    <Icon name={lot.type === "street" ? "car" : "park"} size={20} color={sel ? T.accent : T.inkMute} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: T.ink, fontWeight: 700, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lot.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 3 }}>
                      <span style={{ color: T.good, fontWeight: 700, fontSize: 12.5 }}>{lot.walk} walk</span>
                      <span style={{ color: T.inkFaint, fontSize: 11 }}>·</span>
                      <span style={{ color: T.inkMute, fontSize: 12 }}>{lot.dist}</span>
                      {lot.limited && <span style={{ color: T.warn, fontWeight: 700, fontSize: 11 }}>Limited</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ color: T.ink, fontWeight: 800, fontSize: 14.5, fontFamily: FX_NUM }}>{lot.price}</div>
                    {lot.available !== null && (
                      <div style={{ color: lot.available < 60 ? T.warn : T.good, fontSize: 11.5, fontWeight: 700, marginTop: 2 }}>{lot.available} spots</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {selected !== null ? (
            <button style={{
              width: "100%", height: 52, marginTop: 12, border: "none", borderRadius: 16, cursor: "pointer",
              background: T.accent, color: T.accentInk, fontWeight: 800, fontSize: 16, fontFamily: FX_UI,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: `0 8px 24px ${T.accent}44`,
            }}>
              <Icon name="walk" size={20} color={T.accentInk} /> Walk to Parking
            </button>
          ) : (
            <button onClick={onDone} style={{
              width: "100%", height: 52, marginTop: 12, border: `1px solid ${T.line}`, borderRadius: 16, cursor: "pointer",
              background: "rgba(255,255,255,0.04)", color: T.inkMute, fontWeight: 700, fontSize: 15, fontFamily: FX_UI,
            }}>
              Done
            </button>
          )}
        </Glass>
      </div>
    </div>
  );
}

// ── SAVED PLACES ──────────────────────────────────────────────
function SavedPlacesScreen({ T, insetTop = 54, insetBottom = 30, tweaks }) {
  const saved = [
    { i: "home", l: "Home", s: "2847 Ocean Ave, Santa Monica", t: "18 min", pinned: true },
    { i: "work", l: "Work", s: "1100 S Flower St, Los Angeles", t: "26 min", pinned: true },
    { i: "star", l: "The Broad Museum", s: "221 S Grand Ave, DTLA", t: "26 min" },
    { i: "star", l: "Grand Central Market", s: "317 S Broadway, DTLA", t: "27 min" },
    { i: "star", l: "Santa Monica Pier", s: "200 Santa Monica Pier", t: "14 min" },
  ];
  const recent = [
    { l: "LAX Airport", s: "1 World Way, Los Angeles", t: "32 min" },
    { l: "Dodger Stadium", s: "1000 Vin Scully Ave, LA", t: "21 min" },
    { l: "Venice Beach", s: "Venice Beach Boardwalk", t: "20 min" },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: T.bg, fontFamily: FX_UI, display: "flex", flexDirection: "column" }}>
      {/* faint map backdrop */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.18 }}>
        <LAMap theme={{ accent: T.accent, isDay: T.isDay, contrast: T.contrast }}
               trafficOn={false} showRoute={false} showPuck={false} uid="saved" labels={false} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(7,10,15,0.85) 0%, rgba(7,10,15,0.97) 30%)" }} />

      {/* header */}
      <div style={{ position: "relative", zIndex: 5, paddingTop: insetTop, paddingLeft: 16, paddingRight: 16, paddingBottom: 10, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
          <div style={{ flex: 1, color: T.ink, fontWeight: 800, fontSize: 24 }}>Saved Places</div>
          <button style={{ width: 42, height: 42, borderRadius: 13, border: `1px solid ${T.line}`, background: "rgba(255,255,255,0.04)", display: "grid", placeItems: "center", cursor: "pointer" }}>
            <Icon name="plus" size={20} color={T.accent} />
          </button>
        </div>
        <Glass theme={T} radius={14} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 14px", height: 46 }}>
          <Icon name="search" size={18} color={T.inkMute} />
          <span style={{ color: T.inkFaint, fontSize: 15 }}>Search saved places</span>
        </Glass>
      </div>

      {/* list */}
      <div style={{ position: "relative", zIndex: 5, flex: 1, overflowY: "auto", padding: "0 10px", scrollbarWidth: "none" }}>
        <div style={{ color: T.inkFaint, fontSize: 11.5, fontWeight: 800, letterSpacing: "1.2px", padding: "8px 8px 6px" }}>SAVED</div>
        {saved.map((p, i) => (
          <button key={i} style={{
            width: "100%", textAlign: "left", border: "none", background: "transparent",
            cursor: "pointer", borderRadius: 16, padding: "11px 10px",
            display: "flex", alignItems: "center", gap: 13,
          }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, flexShrink: 0, display: "grid", placeItems: "center",
              background: p.pinned ? `${T.accent}1a` : "rgba(255,255,255,0.06)",
              border: `1px solid ${p.pinned ? T.accent + "33" : T.line}` }}>
              <Icon name={p.i} size={20} color={p.pinned ? T.accent : T.inkMute} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: T.ink, fontWeight: 700, fontSize: 15 }}>{p.l}</div>
              <div style={{ color: T.inkMute, fontSize: 12, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.s}</div>
            </div>
            <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <span style={{ color: T.good, fontWeight: 800, fontSize: 13, fontFamily: FX_NUM }}>{p.t}</span>
              <Icon name="chevR" size={16} color={T.inkFaint} />
            </div>
          </button>
        ))}

        <div style={{ color: T.inkFaint, fontSize: 11.5, fontWeight: 800, letterSpacing: "1.2px", padding: "14px 8px 6px" }}>RECENT</div>
        {recent.map((p, i) => (
          <button key={i} style={{
            width: "100%", textAlign: "left", border: "none", background: "transparent",
            cursor: "pointer", borderRadius: 16, padding: "11px 10px",
            display: "flex", alignItems: "center", gap: 13,
          }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, flexShrink: 0, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.05)" }}>
              <Icon name="clock" size={19} color={T.inkMute} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: T.ink, fontWeight: 600, fontSize: 14.5 }}>{p.l}</div>
              <div style={{ color: T.inkMute, fontSize: 12, marginTop: 1 }}>{p.s}</div>
            </div>
            <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: T.inkMute, fontSize: 13, fontFamily: FX_NUM }}>{p.t}</span>
              <Icon name="chevR" size={16} color={T.inkFaint} />
            </div>
          </button>
        ))}

        <div style={{ height: insetBottom + 20 }} />
      </div>
    </div>
  );
}

// ── SETTINGS ──────────────────────────────────────────────────
function SettingsScreen({ T, insetTop = 54, insetBottom = 30 }) {
  const [avoidTolls, setAvoidTolls] = React.useState(false);
  const [avoidHighways, setAvoidHighways] = React.useState(false);
  const [voice, setVoice] = React.useState(true);
  const [alerts, setAlerts] = React.useState(true);
  const [trafficNotif, setTrafficNotif] = React.useState(true);
  const [speedCams, setSpeedCams] = React.useState(true);
  const [units, setUnits] = React.useState("mi");

  const Toggle = ({ value, onChange }) => (
    <button onClick={() => onChange(!value)} style={{
      width: 44, height: 26, borderRadius: 13, padding: 0, border: "none",
      background: value ? T.accent : "rgba(255,255,255,0.12)",
      cursor: "pointer", position: "relative", flexShrink: 0,
      transition: "background 0.2s",
    }}>
      <div style={{
        position: "absolute", top: 3, width: 20, height: 20, borderRadius: "50%",
        background: value ? T.accentInk : "#fff",
        left: value ? "calc(100% - 23px)" : 3,
        transition: "left 0.2s, background 0.2s",
        boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
      }} />
    </button>
  );

  const Row = ({ icon, label, sub, right, noBorder }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "12px 0",
      borderBottom: noBorder ? "none" : `1px solid ${T.line2}` }}>
      {icon && (
        <div style={{ width: 36, height: 36, borderRadius: 11, background: "rgba(255,255,255,0.06)", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Icon name={icon} size={18} color={T.accent} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: T.ink, fontWeight: 600, fontSize: 14.5 }}>{label}</div>
        {sub && <div style={{ color: T.inkMute, fontSize: 12, marginTop: 1 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );

  const Sect = ({ label }) => (
    <div style={{ color: T.inkFaint, fontSize: 11.5, fontWeight: 800, letterSpacing: "1.2px", padding: "18px 0 6px" }}>{label}</div>
  );

  const UnitToggle = () => (
    <div style={{ display: "flex", background: "rgba(255,255,255,0.07)", borderRadius: 9, padding: 2, gap: 2 }}>
      {["mi", "km"].map((u) => (
        <button key={u} onClick={() => setUnits(u)} style={{
          width: 38, height: 26, borderRadius: 7, border: "none", cursor: "pointer",
          fontSize: 13, fontWeight: 700,
          background: units === u ? T.accent : "transparent",
          color: units === u ? T.accentInk : T.inkMute,
          transition: "all 0.15s",
        }}>{u}</button>
      ))}
    </div>
  );

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: T.bg, fontFamily: FX_UI, display: "flex", flexDirection: "column" }}>
      {/* header */}
      <div style={{ paddingTop: insetTop, paddingLeft: 18, paddingRight: 18, paddingBottom: 8, flexShrink: 0, background: T.bg }}>
        <div style={{ color: T.ink, fontWeight: 800, fontSize: 24 }}>Settings</div>
      </div>

      {/* scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 18px", scrollbarWidth: "none" }}>
        {/* profile card */}
        <Glass theme={T} radius={18} style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, marginTop: 4, marginBottom: 4 }}>
          <div style={{ width: 52, height: 52, borderRadius: 17, flexShrink: 0,
            background: `linear-gradient(135deg, ${T.accent}55, ${T.accent}22)`,
            border: `2px solid ${T.accent}66`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: T.accent, fontWeight: 800, fontSize: 22, fontFamily: FX_NUM }}>A</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: T.ink, fontWeight: 700, fontSize: 16 }}>Alex Chen</div>
            <div style={{ color: T.inkMute, fontSize: 13, marginTop: 2 }}>Pro member · joined 2023</div>
          </div>
          <Icon name="chevR" size={18} color={T.inkFaint} />
        </Glass>

        <Sect label="NAVIGATION" />
        <Row icon="car" label="Avoid tolls" right={<Toggle value={avoidTolls} onChange={setAvoidTolls} />} />
        <Row icon="layers" label="Avoid highways" right={<Toggle value={avoidHighways} onChange={setAvoidHighways} />} />
        <Row icon="locate" label="Distance units" sub={units === "mi" ? "Miles · imperial" : "Kilometers · metric"} right={<UnitToggle />} noBorder />

        <Sect label="SOUND" />
        <Row icon="volume" label="Voice guidance" sub={voice ? "English · normal speed" : "Muted"} right={<Toggle value={voice} onChange={setVoice} />} noBorder />

        <Sect label="ALERTS" />
        <Row icon="warn" label="Incident alerts" sub="Crashes, hazards, police" right={<Toggle value={alerts} onChange={setAlerts} />} />
        <Row icon="traffic" label="Traffic notifications" sub="Delay warnings & re-routes" right={<Toggle value={trafficNotif} onChange={setTrafficNotif} />} noBorder />

        <Sect label="MAP" />
        <Row icon="layers" label="Map display" sub="Dark · stylized vector" right={<Icon name="chevR" size={18} color={T.inkFaint} />} />
        <Row icon="eye" label="Speed cameras" right={<Toggle value={speedCams} onChange={setSpeedCams} />} noBorder />

        <Sect label="ACCOUNT" />
        <Row icon="share" label="Share feedback" right={<Icon name="chevR" size={18} color={T.inkFaint} />} />
        <Row icon="flag" label="Privacy & data" right={<Icon name="chevR" size={18} color={T.inkFaint} />} noBorder />

        <div style={{ height: insetBottom + 30 }} />
      </div>
    </div>
  );
}

// ── TRIP OVERVIEW / SHARE ─────────────────────────────────────
function TripOverviewScreen({ T, insetTop = 54, insetBottom = 30, tweaks }) {
  const [rating, setRating] = React.useState(0);
  const [shared, setShared] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const stats = [
    { label: "Distance", value: "12.4 mi" },
    { label: "Time", value: "28 min" },
    { label: "Arrived", value: "5:31 PM" },
  ];
  const trafficBreakdown = [
    { label: "Free", pct: 0.38, color: "#13c98a" },
    { label: "Moderate", pct: 0.30, color: "#ffc24b" },
    { label: "Heavy", pct: 0.22, color: "#ff6a3d" },
    { label: "Severe", pct: 0.10, color: "#e23a3a" },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: T.bg, fontFamily: FX_UI }}>
      {/* route map at top */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "42%" }}>
        <LAMap theme={{ accent: T.accent, isDay: T.isDay, contrast: T.contrast }}
               trafficOn={tweaks.trafficOn} showRoute showPuck={false}
               progress={1} uid="trip" labels />
      </div>
      <div style={{ position: "absolute", top: "28%", left: 0, right: 0, height: "18%",
        background: "linear-gradient(180deg, rgba(7,10,15,0), rgba(7,10,15,0.99))" }} />

      {/* stats pill */}
      <div style={{ position: "absolute", top: "37%", left: 14, right: 14, zIndex: 5 }}>
        <Glass theme={T} radius={18} style={{ padding: "14px 8px", display: "flex" }}>
          {stats.map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", padding: "4px 6px",
              borderRight: i < stats.length - 1 ? `1px solid ${T.line}` : "none" }}>
              <div style={{ color: T.accent, fontWeight: 800, fontSize: 19, fontFamily: FX_NUM, lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: T.inkMute, fontSize: 11.5, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </Glass>
      </div>

      {/* scrollable detail */}
      <div style={{ position: "absolute", top: "52%", left: 0, right: 0, bottom: 0, overflowY: "auto", padding: "0 15px", scrollbarWidth: "none" }}>
        {/* trip title */}
        <div style={{ padding: "6px 2px 14px" }}>
          <div style={{ color: T.ink, fontWeight: 800, fontSize: 20, lineHeight: 1.2 }}>Santa Monica → Downtown LA</div>
          <div style={{ color: T.inkMute, fontSize: 13, marginTop: 4 }}>via I‑10 E · Wed, May 31 · 5:03 – 5:31 PM</div>
        </div>

        {/* traffic breakdown */}
        <Glass theme={T} radius={16} style={{ padding: "14px 16px", marginBottom: 10 }}>
          <div style={{ color: T.ink, fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Traffic on your route</div>
          <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
            {trafficBreakdown.map((t, i) => (
              <div key={i} style={{ flex: t.pct, background: t.color }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {trafficBreakdown.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                <span style={{ color: T.inkMute, fontSize: 12 }}>{t.label} <b style={{ color: T.ink }}>{Math.round(t.pct * 100)}%</b></span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.line2}` }}>
            <Icon name="bolt" size={14} color={T.good} fill={T.good} />
            <span style={{ color: T.inkMute, fontSize: 12.5 }}>Saved <b style={{ color: T.ink }}>11 min</b> vs peak traffic</span>
          </div>
        </Glass>

        {/* incidents */}
        <Glass theme={T} radius={16} style={{ padding: "14px 16px", marginBottom: 10 }}>
          <div style={{ color: T.ink, fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Incidents encountered</div>
          {[
            { c: T.blue, l: "Police reported near La Brea Ave" },
            { c: T.danger, l: "Crash in right lane · cleared by 5:18 PM" },
          ].map((inc, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
              borderTop: i > 0 ? `1px solid ${T.line2}` : "none" }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `${inc.c}1c`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Icon name="warn" size={16} color={inc.c} />
              </div>
              <span style={{ color: T.inkMute, fontSize: 13 }}>{inc.l}</span>
            </div>
          ))}
        </Glass>

        {/* rate your trip */}
        <Glass theme={T} radius={16} style={{ padding: "14px 16px", marginBottom: 10 }}>
          <div style={{ color: T.ink, fontWeight: 700, fontSize: 14, marginBottom: 12, textAlign: "center" }}>How was your trip?</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 4 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setRating(s)} style={{
                width: 44, height: 44, borderRadius: 14, border: `1px solid ${s <= rating ? "rgba(255,193,75,0.4)" : T.line}`,
                cursor: "pointer", background: s <= rating ? "rgba(255,193,75,0.14)" : "rgba(255,255,255,0.04)",
                fontSize: 22, display: "grid", placeItems: "center",
                transform: s <= rating ? "scale(1.12)" : "scale(1)",
                transition: "all 0.15s",
              }}>⭐</button>
            ))}
          </div>
          {rating > 0 && (
            <div style={{ color: T.inkMute, fontSize: 12.5, textAlign: "center", marginTop: 8, color: T.good }}>
              Thanks for rating! Your feedback helps.
            </div>
          )}
        </Glass>

        {/* action buttons */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <button onClick={() => { setShared(true); setTimeout(() => setShared(false), 2400); }} style={{
            flex: 1, height: 52, border: shared ? `1px solid ${T.accent}55` : "none",
            borderRadius: 16, cursor: "pointer", fontWeight: 700, fontSize: 15, fontFamily: FX_UI,
            background: shared ? `${T.accent}18` : T.accent,
            color: shared ? T.accent : T.accentInk,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: shared ? "none" : `0 8px 24px ${T.accent}44`,
            transition: "all 0.25s",
          }}>
            <Icon name="share" size={19} color={shared ? T.accent : T.accentInk} />
            {shared ? "Link copied!" : "Share trip"}
          </button>
          <button onClick={() => setSaved((s) => !s)} style={{
            width: 52, height: 52, borderRadius: 16, cursor: "pointer",
            border: `1px solid ${saved ? T.accent + "55" : T.line}`,
            background: saved ? `${T.accent}18` : "rgba(255,255,255,0.04)",
            color: saved ? T.accent : T.ink, display: "grid", placeItems: "center",
            transition: "all 0.15s",
          }}>
            <Icon name="star" size={21} color={saved ? T.accent : T.ink}
              fill={saved ? T.accent : "none"} />
          </button>
        </div>

        <div style={{ height: insetBottom + 10 }} />
      </div>
    </div>
  );
}

Object.assign(window, { ArrivalScreen, SavedPlacesScreen, SettingsScreen, TripOverviewScreen });
