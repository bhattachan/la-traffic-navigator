// app.jsx — LA Traffic Navigator: single-screen mobile app with full navigation.
// Screens: home → search → route → nav → arrival → trip-overview
//          home → saved, home → settings, home → report-home

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "platform": "ios",
  "accent": "#00e5a0",
  "trafficOn": true,
  "mapMode": "night",
  "contrast": 1
}/*EDITMODE-END*/;

const ACCENTS = ["#00e5a0", "#3da5ff", "#a855f7", "#ff7a00", "#22d3ee"];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const platform = t.platform;
  const ins = INSETS[platform] || INSETS.ios;
  const T = makeTheme({ accent: t.accent, isDay: t.mapMode === "day", contrast: t.contrast });
  const tweaks = { trafficOn: t.trafficOn };

  const [screen, setScreen] = React.useState("home");
  const [choice, setChoice] = React.useState(0);
  const [progress, setProgress] = React.useState(0.1);
  const [navReport, setNavReport] = React.useState(false);

  const go = React.useCallback((s) => setScreen(s), []);

  // Live drive animation — only while on nav screen and report sheet is closed
  React.useEffect(() => {
    if (screen !== "nav" || navReport) return;
    const id = setInterval(() => {
      setProgress((p) => { const n = p + 0.0035; return n >= 0.985 ? 0.04 : n; });
    }, 90);
    return () => clearInterval(id);
  }, [screen, navReport]);

  // Scale phone to fit viewport (handles small laptop screens)
  const [vp, setVp] = React.useState({ w: window.innerWidth, h: window.innerHeight });
  React.useEffect(() => {
    const r = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);
  const scale = Math.min(1, (vp.w - 24) / SCREEN_W, (vp.h - 24) / SCREEN_H);

  const SP = { T, tweaks, insetTop: ins.top, insetBottom: ins.bottom };

  // Floating back button — overlaid on screens that don't have their own back nav
  const BackBtn = ({ to = "home" }) => (
    <button onClick={() => go(to)} style={{
      position: "absolute", zIndex: 20,
      top: ins.top + 12, left: 14,
      width: 44, height: 44, borderRadius: 14,
      background: "rgba(10,14,20,0.80)",
      backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      border: "1px solid rgba(255,255,255,0.1)",
      color: "#eef3f9", cursor: "pointer",
      display: "grid", placeItems: "center",
      boxShadow: "0 4px 14px rgba(0,0,0,0.45)",
    }}>
      <Icon name="back" size={22} />
    </button>
  );

  const renderScreen = () => {
    switch (screen) {
      case "home":
        return (
          <HomeScreen {...SP}
            onSearch={() => go("search")}
            onReport={() => go("report-home")}
            onSaved={() => go("saved")}
            onSettings={() => go("settings")} />
        );

      case "search":
        return (
          <SearchScreen {...SP}
            onBack={() => go("home")}
            onPick={() => go("route")} />
        );

      case "route":
        return (
          <RoutePreviewScreen {...SP}
            choice={choice} setChoice={setChoice}
            onStart={() => go("nav")}
            onBack={() => go("search")} />
        );

      case "nav":
        return (
          <>
            <NavigationScreen {...SP}
              progress={progress}
              onEnd={() => { go("arrival"); setProgress(0.04); }}
              onReport={() => setNavReport(true)} />
            {navReport && (
              <ReportScreen {...SP} progress={progress} onClose={() => setNavReport(false)} />
            )}
          </>
        );

      case "arrival":
        return (
          <>
            <ArrivalScreen {...SP} onDone={() => go("trip-overview")} />
          </>
        );

      case "saved":
        return <><SavedPlacesScreen {...SP} /><BackBtn to="home" /></>;

      case "settings":
        return <><SettingsScreen T={T} insetTop={ins.top} insetBottom={ins.bottom} /><BackBtn to="home" /></>;

      case "trip-overview":
        return <><TripOverviewScreen {...SP} /><BackBtn to="home" /></>;

      case "report-home":
        return <ReportScreen {...SP} progress={0.46} onClose={() => go("home")} />;

      default:
        return (
          <HomeScreen {...SP}
            onSearch={() => go("search")}
            onReport={() => go("report-home")}
            onSaved={() => go("saved")}
            onSettings={() => go("settings")} />
        );
    }
  };

  return (
    <>
      {/* Dark background, phone centered */}
      <div style={{
        width: "100vw", height: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "radial-gradient(ellipse 80% 80% at 30% 20%, #0e1b2e, #060810)",
        overflow: "hidden",
      }}>
        {/* Phone shell — rounded on desktop, edge-to-edge on real mobile */}
        <div style={{
          position: "relative",
          width: SCREEN_W,
          height: SCREEN_H,
          borderRadius: scale < 0.99 ? 0 : 44,
          overflow: "hidden",
          background: T.bg,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          boxShadow: scale < 0.99 ? "none"
            : "0 0 0 1px rgba(255,255,255,0.07), 0 50px 120px rgba(0,0,0,0.8)",
          flexShrink: 0,
        }}>
          {renderScreen()}
          <StatusChrome platform={platform} T={T} />
        </div>
      </div>

      <TweaksPanel>
        <TweakSection label="Device" />
        <TweakRadio label="Platform" value={platform} options={["ios", "android"]}
          onChange={(v) => setTweak("platform", v)} />
        <TweakSection label="Map & theme" />
        <TweakColor label="Accent" value={t.accent} options={ACCENTS}
          onChange={(v) => setTweak("accent", v)} />
        <TweakRadio label="Map theme" value={t.mapMode} options={["night", "day"]}
          onChange={(v) => setTweak("mapMode", v)} />
        <TweakToggle label="Traffic layer" value={t.trafficOn}
          onChange={(v) => setTweak("trafficOn", v)} />
        <TweakSlider label="Map contrast" value={t.contrast} min={0.5} max={1.15} step={0.05}
          onChange={(v) => setTweak("contrast", v)} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
