// 수월봉 스크롤리텔링 — Tweaks 패널
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "seaColor": "#2D6F8F",
  "bodySize": 14,
  "motionLevel": 1,
  "showNav": true
}/*EDITMODE-END*/;

function TweaksApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--sea', t.seaColor);
    root.style.setProperty('--body-size', t.bodySize + 'px');
    document.body.dataset.motion = String(t.motionLevel);
    document.body.dataset.shownav = String(t.showNav);
  }, [t]);

  return (
    <TweaksPanel>
      <TweakSection label="색" />
      <TweakColor
        label="바다 색조"
        value={t.seaColor}
        options={['#2D6F8F', '#2F7D6B', '#41639E']}
        onChange={(v) => setTweak('seaColor', v)}
      />
      <TweakSection label="타이포그래피" />
      <TweakSlider
        label="본문 크기"
        value={t.bodySize}
        min={12}
        max={20}
        step={0.5}
        unit="px"
        onChange={(v) => setTweak('bodySize', v)}
      />
      <TweakSection label="모션" />
      <TweakSlider
        label="모션 강도"
        value={t.motionLevel}
        min={0}
        max={1.6}
        step={0.1}
        onChange={(v) => setTweak('motionLevel', v)}
      />
      <TweakSection label="내비게이션" />
      <TweakToggle
        label="챕터 도트 표시"
        value={t.showNav}
        onChange={(v) => setTweak('showNav', v)}
      />
    </TweaksPanel>
  );
}

const tweaksRoot = document.createElement('div');
document.body.appendChild(tweaksRoot);
ReactDOM.createRoot(tweaksRoot).render(<TweaksApp></TweaksApp>);
