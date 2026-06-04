// chrome.jsx — lightweight iOS / Android status chrome drawn inside a
// full-bleed screen. Exports (to window): StatusChrome, SCREEN_W, SCREEN_H, INSETS

const SCREEN_W = 384, SCREEN_H = 830;
const INSETS = {
  ios: { top: 56, bottom: 26 },
  android: { top: 40, bottom: 22 },
};

function StatusChrome({ platform = "ios", T, time = "5:08" }) {
  const c = "#fff";
  const Signal = () => (
    <svg width="18" height="11" viewBox="0 0 18 11"><rect x="0" y="7" width="3" height="4" rx="0.6" fill={c}/><rect x="4.5" y="5" width="3" height="6" rx="0.6" fill={c}/><rect x="9" y="2.5" width="3" height="8.5" rx="0.6" fill={c}/><rect x="13.5" y="0" width="3" height="11" rx="0.6" fill={c}/></svg>
  );
  const Wifi = () => (
    <svg width="16" height="11" viewBox="0 0 16 11"><path d="M8 2.4c2.2 0 4.2.9 5.6 2.3l1-1A9 9 0 008 .9 9 9 0 001.4 3.7l1 1A7.7 7.7 0 018 2.4z" fill={c}/><path d="M8 5.8c1.3 0 2.5.5 3.4 1.4l1-1A6 6 0 008 4.3 6 6 0 003.6 6.2l1 1A4.7 4.7 0 018 5.8z" fill={c}/><circle cx="8" cy="9.4" r="1.4" fill={c}/></svg>
  );
  const Batt = () => (
    <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke={c} strokeOpacity="0.4" fill="none"/><rect x="2" y="2" width="16" height="8" rx="1.6" fill={c}/><path d="M23 4v4c.8-.3 1.4-1 1.4-2S23.8 4.3 23 4z" fill={c} fillOpacity="0.5"/></svg>
  );

  if (platform === "android") {
    return (
      <>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: INSETS.android.top, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", zIndex: 40, fontFamily: "'Plus Jakarta Sans',system-ui", pointerEvents: "none" }}>
          <span style={{ color: c, fontSize: 14, fontWeight: 700 }}>{time}</span>
          <div style={{ position: "absolute", left: "50%", top: 13, transform: "translateX(-50%)", width: 11, height: 11, borderRadius: "50%", background: "#000" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Wifi /><Signal /><Batt /></div>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: INSETS.android.bottom, display: "grid", placeItems: "center", zIndex: 40, pointerEvents: "none" }}>
          <div style={{ width: 108, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.5)" }} />
        </div>
      </>
    );
  }
  // iOS
  return (
    <>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: INSETS.ios.top, zIndex: 40, fontFamily: "-apple-system,'Plus Jakarta Sans',system-ui", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: 11, left: "50%", transform: "translateX(-50%)", width: 108, height: 30, borderRadius: 16, background: "#000" }} />
        <div style={{ position: "absolute", top: 18, left: 30, color: c, fontSize: 15.5, fontWeight: 700, letterSpacing: "0.2px" }}>{time}</div>
        <div style={{ position: "absolute", top: 19, right: 28, display: "flex", alignItems: "center", gap: 6 }}><Signal /><Wifi /><Batt /></div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: INSETS.ios.bottom, display: "grid", placeItems: "end center", paddingBottom: 8, zIndex: 40, pointerEvents: "none" }}>
        <div style={{ width: 134, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.8)" }} />
      </div>
    </>
  );
}

Object.assign(window, { StatusChrome, SCREEN_W, SCREEN_H, INSETS });
