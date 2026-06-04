// app.jsx — wires the LA Traffic Navigator storyboard: DesignCanvas of
// device screens + platform toggle + Tweaks panel + the live nav animation.
// Globals used: DesignCanvas, DCSection, DCArtboard, useTweaks, TweaksPanel,
// Tweak*, makeTheme, StatusChrome, HomeScreen, SearchScreen,
// RoutePreviewScreen, NavigationScreen, ReportScreen, SCREEN_W, SCREEN_H, INSETS

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

  const [choice, setChoice] = React.useState(0);
  const [progress, setProgress] = React.useState(0.1);
  const [navReport, setNavReport] = React.useState(false);

  // live drive animation (pauses while the in-nav report sheet is open)
  React.useEffect(() => {
    if (navReport) return;
    const id = setInterval(() => {
      setProgress((p) => { let n = p + 0.0035; return n >= 0.985 ? 0.04 : n; });
    }, 90);
    return () => clearInterval(id);
  }, [navReport]);

  const Frame = ({ children }) => (
    <div style={{ position: "relative", width: SCREEN_W, height: SCREEN_H, background: T.bg, overflow: "hidden" }}>
      {children}
      <StatusChrome platform={platform} T={T} />
    </div>
  );
  const abStyle = {
    borderRadius: 38, overflow: "hidden", background: T.bg,
    boxShadow: "0 34px 80px rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.07)",
  };
  const SP = { T, tweaks, insetTop: ins.top, insetBottom: ins.bottom };

  return (
    <React.Fragment>
      <DesignCanvas>
        <DCSection id="flow" title="LA Traffic Navigator"
          subtitle="Santa Monica → Downtown LA · I‑10 corridor · dark GIS navigation">

          <DCArtboard id="home" label="Live map" width={SCREEN_W} height={SCREEN_H} style={abStyle}>
            <Frame><HomeScreen {...SP} onSearch={() => {}} onReport={() => {}} /></Frame>
          </DCArtboard>

          <DCArtboard id="search" label="Search" width={SCREEN_W} height={SCREEN_H} style={abStyle}>
            <Frame><SearchScreen {...SP} onBack={() => {}} onPick={() => {}} /></Frame>
          </DCArtboard>

          <DCArtboard id="route" label="Route options · tap to compare" width={SCREEN_W} height={SCREEN_H} style={abStyle}>
            <Frame><RoutePreviewScreen {...SP} choice={choice} setChoice={setChoice} onStart={() => {}} onBack={() => {}} /></Frame>
          </DCArtboard>

          <DCArtboard id="nav" label="Navigation · live 3D" width={SCREEN_W} height={SCREEN_H} style={abStyle}>
            <Frame>
              <NavigationScreen {...SP} progress={progress}
                onEnd={() => setProgress(0.04)} onReport={() => setNavReport(true)} />
              {navReport && (
                <ReportScreen {...SP} progress={progress} onClose={() => setNavReport(false)} />
              )}
            </Frame>
          </DCArtboard>

          <DCArtboard id="report" label="Report · Waze-style" width={SCREEN_W} height={SCREEN_H} style={abStyle}>
            <Frame><ReportScreen {...SP} progress={0.46} onClose={() => {}} /></Frame>
          </DCArtboard>

        </DCSection>
      </DesignCanvas>

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
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
