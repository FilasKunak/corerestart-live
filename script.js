/* ═══════════════════════════════════════════════════════
   KONFIGURACE – upravte před nasazením
═════════════════════════════════════════════════════ */
const CONFIG = {
  STREAM_START_TIME:     "2026-04-04T06:05:00Z",
  VIDEO_URL:             "", // TODO: Add video URL before next broadcast
  CTA_URL:               "https://corerestart.cz/",
  CTA_TEXT:              "🎁 Získat speciální nabídku",
  CTA_APPEARS_AT_SECONDS: 1800,
  STREAM_TITLE:          "CoreRestart Live",
  REPLAY_URL:            "https://mamacore.cz/",
  REPLAY_BUTTON_TEXT:    "▶ Přehrát záznam vysílání",
};

/* ═══════════════════════════════════════════════════════
   FÁZE aplikace
═════════════════════════════════════════════════════ */
const phases = ["loading", "countdown", "live", "ended"];

function showPhase(name) {
  phases.forEach(p => {
    const el = document.getElementById("phase-" + p);
    if (el) el.classList.toggle("hidden", p !== name);
  });
}

/* ═══════════════════════════════════════════════════════
   SERVEROVÝ ČAS – přibližná synchronizace
═════════════════════════════════════════════════════ */
async function getServerTimeOffset() {
  // Pokus o synchronizaci s /api/time (pokud existuje server)
  // V případě selhání vrátí 0 (použije lokální čas)
  try {
    const before = Date.now();
    const res = await fetch("/api/time", { signal: AbortSignal.timeout(3000) });
    const after = Date.now();
    const { serverTime } = await res.json();
    return serverTime + (after - before) / 2 - after;
  } catch {
    return 0;
  }
}

/* ═══════════════════════════════════════════════════════
   ODPOČET
═════════════════════════════════════════════════════ */
function pad(n) { return String(Math.floor(n)).padStart(2, "0"); }

function startCountdown(offset, onEnd) {
  // Statické texty
  document.getElementById("stream-title-cd").textContent = CONFIG.STREAM_TITLE;
  document.getElementById("cd-date").innerHTML =
    "Začátek: <strong>" +
    new Date(CONFIG.STREAM_START_TIME).toLocaleString("cs-CZ", {
      timeZone: "Europe/Prague",
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    }) +
    " (CEST)</strong>";

  const streamStart = new Date(CONFIG.STREAM_START_TIME).getTime();

  function tick() {
    const diff = Math.max(0, streamStart - (Date.now() + offset));

    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff / 3600000) % 24);
    const minutes = Math.floor((diff / 60000) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    document.getElementById("cd-days").textContent    = pad(days);
    document.getElementById("cd-hours").textContent   = pad(hours);
    document.getElementById("cd-minutes").textContent = pad(minutes);
    document.getElementById("cd-seconds").textContent = pad(seconds);

    // Upozornění pod hodinu
    const warning = document.getElementById("cd-warning");
    if (days === 0 && hours === 0) {
      warning.classList.remove("hidden");
    }

    if (diff <= 0) {
      clearInterval(intervalId);
      onEnd();
      return;
    }
  }

  tick();
  const intervalId = setInterval(tick, 1000);
}

/* ═══════════════════════════════════════════════════════
   VLASTNÍ OVLÁDACÍ PRVKY PŘEHRÁVAČE
═════════════════════════════════════════════════════ */
function initCustomControls(video) {
  const container = document.getElementById("player-container");
  const controls  = document.getElementById("custom-controls");
  const btnPlay   = document.getElementById("ctrl-play");
  const btnMute   = document.getElementById("ctrl-mute");
  const volSlider = document.getElementById("ctrl-vol");
  const btnFs     = document.getElementById("ctrl-fs");

  // ── SVG ikony ─────────────────────────────────────────
  const I_PLAY  = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>`;
  const I_PAUSE = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="4" height="18"/><rect x="15" y="3" width="4" height="18"/></svg>`;
  const I_VOL   = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="0"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M19 5a10 10 0 0 1 0 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  const I_MUTE  = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  const I_FS    = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15,3 21,3 21,9"/><polyline points="9,21 3,21 3,15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`;
  const I_EXITFS= `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="4,14 10,14 10,20"/><polyline points="20,10 14,10 14,4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="14" y1="10" x2="21" y2="3"/></svg>`;

  // ── Play / Pause ───────────────────────────────────────
  function updatePlayBtn() {
    btnPlay.innerHTML = video.paused ? I_PLAY : I_PAUSE;
  }

  btnPlay.addEventListener("click", () => {
    video.paused ? video.play().catch(() => {}) : video.pause();
  });

  video.addEventListener("click", () => {
    video.paused ? video.play().catch(() => {}) : video.pause();
  });

  video.addEventListener("play",  updatePlayBtn);
  video.addEventListener("pause", updatePlayBtn);
  updatePlayBtn();

  // ── Hlasitost ─────────────────────────────────────────
  function updateMuteBtn() {
    btnMute.innerHTML = (video.muted || video.volume === 0) ? I_MUTE : I_VOL;
    volSlider.value   = video.muted ? 0 : video.volume;
  }

  btnMute.addEventListener("click", () => {
    video.muted = !video.muted;
    updateMuteBtn();
  });

  volSlider.addEventListener("input", () => {
    video.volume = parseFloat(volSlider.value);
    video.muted  = video.volume === 0;
    updateMuteBtn();
  });

  video.addEventListener("volumechange", updateMuteBtn);
  updateMuteBtn();

  // ── Fullscreen ─────────────────────────────────────────
  function updateFsBtn() {
    btnFs.innerHTML = document.fullscreenElement ? I_EXITFS : I_FS;
  }

  btnFs.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  document.addEventListener("fullscreenchange", updateFsBtn);
  updateFsBtn();

  // ── Auto-hide controls ─────────────────────────────────
  let hideTimer;

  function showControls() {
    controls.classList.add("visible");
    clearTimeout(hideTimer);
    if (!video.paused) {
      hideTimer = setTimeout(() => controls.classList.remove("visible"), 3000);
    }
  }

  container.addEventListener("mousemove",  showControls);
  container.addEventListener("mouseenter", showControls);
  container.addEventListener("mouseleave", () => {
    if (!video.paused) {
      clearTimeout(hideTimer);
      controls.classList.remove("visible");
    }
  });

  // Při pauze vždy zobraz ovládání
  video.addEventListener("pause", () => {
    clearTimeout(hideTimer);
    controls.classList.add("visible");
  });

  video.addEventListener("play", showControls);
}

/* ═══════════════════════════════════════════════════════
   VIDEO PŘEHRÁVAČ
═════════════════════════════════════════════════════ */
function startLivePlayer(videoUrl, startPosition) {
  document.getElementById("stream-title-live").textContent = CONFIG.STREAM_TITLE;

  const video        = document.getElementById("video");
  const noVideo      = document.getElementById("no-video");
  const playOverlay  = document.getElementById("play-overlay");
  const playBtn      = document.getElementById("play-btn");
  const ctaWrap      = document.getElementById("cta-wrap");
  const ctaBtn       = document.getElementById("cta-btn");

  // CTA tlačítko
  ctaBtn.href        = CONFIG.CTA_URL;
  ctaBtn.textContent = CONFIG.CTA_TEXT;

  // Živá pozice – roste každou sekundu
  let livePosition = startPosition;
  setInterval(() => livePosition++, 1000);

  if (!videoUrl) {
    return;
  }

  noVideo.style.display = "none";
  video.src = videoUrl;
  video.currentTime = startPosition;

  // Inicializace vlastních ovládacích prvků
  initCustomControls(video);

  // ── Overlay pro spuštění se zvukem ───────────────────
  // Prohlížeče blokují autoplay se zvukem – jeden klik uživatele
  // tuto ochranu obejde. Zobrazíme výrazné tlačítko.
  playOverlay.classList.remove("hidden");
  playBtn.addEventListener("click", () => {
    video.currentTime = livePosition;
    video.play().catch(() => {});
    playOverlay.classList.add("hidden");
  }, { once: true });

  // ── Anti-seek ────────────────────────────────────────
  // Pokud se uživatel pokusí seekovat, vrátíme ho na živou pozici.
  let isSeeking = false;
  video.addEventListener("seeking", () => {
    if (isSeeking) return;
    isSeeking = true;
    video.currentTime = livePosition;
    setTimeout(() => { isSeeking = false; }, 200);
  });

  // ── CTA zobrazení ─────────────────────────────────────
  let ctaShown = false;
  video.addEventListener("timeupdate", () => {
    if (!ctaShown && video.currentTime >= CONFIG.CTA_APPEARS_AT_SECONDS) {
      ctaShown = true;
      ctaWrap.classList.remove("hidden");
    }
  });

  // ── Konec videa ────────────────────────────────────────
  video.addEventListener("ended", () => showPhase("ended"));
}

/* ═══════════════════════════════════════════════════════
   INIT
═════════════════════════════════════════════════════ */
async function init() {
  // Statické texty pro ended fázi
  const replayBtn = document.getElementById("replay-btn");
  replayBtn.href        = CONFIG.REPLAY_URL;
  replayBtn.textContent = CONFIG.REPLAY_BUTTON_TEXT;

  const offset     = await getServerTimeOffset();
  const now        = Date.now() + offset;
  const streamStart = new Date(CONFIG.STREAM_START_TIME).getTime();

  if (now >= streamStart) {
    // Jsme za startem → přímé spuštění přehrávače
    const elapsed = Math.floor((now - streamStart) / 1000);
    showPhase("live");
    startLivePlayer(CONFIG.VIDEO_URL, elapsed);
  } else {
    // Odpočet
    showPhase("countdown");
    startCountdown(offset, () => {
      showPhase("live");
      startLivePlayer(CONFIG.VIDEO_URL, 0);
    });
  }
}

init();
