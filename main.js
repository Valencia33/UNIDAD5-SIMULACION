/* ============================================================================
   Fórum UPB · "Relevo generacional"
   CONTROL DE LA PRESENTACIÓN Y SISTEMA DE COMPOSICIÓN

   Atajos de operación:
     Espacio / → / PageDown   avanzar
     ← / PageUp               volver
     Home / R                 volver al inicio
     End                      ir al cierre
     F                        pantalla completa
     H                        ayuda
     D                        panel de datos del sistema (para sustentar)
============================================================================ */

const canvas = document.querySelector("#visual-canvas");
const stage = document.querySelector("#stage");
const titleEl = document.querySelector("#moment-title");
const chapterIndexEl = document.querySelector("#chapter-index");
const chapterNameEl = document.querySelector("#chapter-name");
const subtitleEl = document.querySelector("#moment-subtitle");
const numberEl = document.querySelector("#moment-number");
const totalEl = document.querySelector("#moment-total");
const mobileNumberEl = document.querySelector("#mobile-moment-number");
const mobileTotalEl = document.querySelector("#mobile-moment-total");
const copyLayer = document.querySelector(".copy-layer");
const progressRail = document.querySelector("#progress-rail");
const helpPanel = document.querySelector("#help-panel");
const debugPanel = document.querySelector("#debug-panel");
const qrLayer = document.querySelector("#qr-layer");
const qrMemory = document.querySelector("#qr-memory");
const qrSocial = document.querySelector("#qr-social");
const qrMemoryLink = document.querySelector("#qr-memory-link");
const qrSocialLink = document.querySelector("#qr-social-link");
const qrMemoryLabel = document.querySelector("#qr-memory-label");
const qrSocialLabel = document.querySelector("#qr-social-label");
const assetFrame = document.querySelector("#moment-asset");
const assetImage = document.querySelector("#moment-image");
const languageButtons = [...document.querySelectorAll("[data-language]")];
const helpButton = document.querySelector("#help-button");
const resetButton = document.querySelector("#reset-button");
const endButton = document.querySelector("#end-button");
const mobileFullscreenButton = document.querySelector("#mobile-fullscreen-button");

/* ---------------------------------------------------------------------------
   COMPOSICIONES
--------------------------------------------------------------------------- */
const LAYOUTS = {
  opening: { x: 0.07, y: 0.46, w: 0.54, h: 0.40, anchor: "end", align: "left" },
  counterpoint: { x: 0.07, y: 0.16, w: 0.50, h: 0.34, anchor: "start", align: "left" },
  wide: { x: 0.07, y: 0.28, w: 0.54, h: 0.44, anchor: "center", align: "left" },
  anchor: { x: 0.07, y: 0.52, w: 0.50, h: 0.36, anchor: "end", align: "left" },
  beat: { x: 0.19, y: 0.32, w: 0.62, h: 0.36, anchor: "center", align: "center" },
  closing: { x: 0.07, y: 0.34, w: 0.40, h: 0.32, anchor: "center", align: "left" },
};

const LAYOUTS_PORTRAIT = {
  opening: { x: 0.07, y: 0.48, w: 0.86, h: 0.38, anchor: "end", align: "left" },
  counterpoint: { x: 0.07, y: 0.15, w: 0.86, h: 0.32, anchor: "start", align: "left" },
  wide: { x: 0.07, y: 0.46, w: 0.86, h: 0.38, anchor: "center", align: "left" },
  anchor: { x: 0.07, y: 0.50, w: 0.86, h: 0.34, anchor: "end", align: "left" },
  beat: { x: 0.07, y: 0.34, w: 0.86, h: 0.32, anchor: "center", align: "center" },
  closing: { x: 0.07, y: 0.42, w: 0.86, h: 0.30, anchor: "center", align: "left" },
};

function titleSizeFor(text, layout) {
  const n = text.length;
  if (layout === "closing") return "brand";
  if (n <= 32) return "xl";
  if (n <= 60) return "l";
  if (n <= 92) return "m";
  return "s";
}

const compactViewport = window.matchMedia("(max-aspect-ratio: 1 / 1)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const storage = {
  get(key) { try { return window.localStorage.getItem(key); } catch (err) { return null; } },
  set(key, value) { try { window.localStorage.setItem(key, value); } catch (err) {} },
};

let activeIndex = 0;
let showHelp = false;
let showDebug = false;
let activeLanguage = storage.get("forum-language") || CONFIG.defaultLanguage;
let transitionTimer = 0;
let assetClearTimer = 0;
let debugFrame = 0;
let fps = 0;
let lastTickTime = performance.now();
let isInitialized = false;

// Variables de Parallax
let targetPx = 0;
let targetPy = 0;
let currentPx = 0;
let currentPy = 0;

const visualSystem = new VisualSystem(canvas);

const TITLE_HIGHLIGHTS = {
  "relevo-generacional": { es: [{ text: "RELEVO GENERACIONAL", tone: "cyan" }], pt: [{ text: "RELEVO GERACIONAL", tone: "cyan" }] },
  "universidad-mundo": { es: [{ text: "La Universidad decidió encontrarse con el mundo.", tone: "cyan" }], pt: [{ text: "A Universidade decidiu se encontrar com o mundo.", tone: "cyan" }] },
  impacto: { es: [{ text: "El impacto sí.", tone: "red" }], pt: [{ text: "O impacto, sim.", tone: "red" }] },
  comunidad: {
    es: [{ text: "comunidad", tone: "cyan" }, { text: "transformación", tone: "magenta" }],
    pt: [{ text: "comunidade", tone: "cyan" }, { text: "transformação", tone: "magenta" }]
  },
  confianza: { es: [{ text: "confianza", tone: "magenta" }], pt: [{ text: "confiança", tone: "magenta" }] },
  "nuevas-rutas": {
    es: [{ text: "experiencia", tone: "cyan" }, { text: "camino", tone: "magenta" }, { text: "nuevas rutas", tone: "red" }],
    pt: [{ text: "experiência", tone: "cyan" }, { text: "caminho", tone: "magenta" }, { text: "novas rotas", tone: "red" }]
  },
  "vision-generaciones": { es: [{ text: "Dos generaciones", tone: "cyan" }], pt: [{ text: "Duas gerações", tone: "cyan" }] },
  "trabajan-juntas": {
    es: [{ text: "crecimiento", tone: "cyan" }, { text: "trabajan juntas", tone: "magenta" }],
    pt: [{ text: "crescimento", tone: "cyan" }, { text: "trabalham juntas", tone: "magenta" }]
  },
  "presente-joven": { es: [{ text: "presente", tone: "red" }], pt: [{ text: "presente", tone: "red" }] },
  "futuro-construido": {
    es: [{ text: "futuro", tone: "cyan" }, { text: "Se construye", tone: "red" }],
    pt: [{ text: "futuro", tone: "cyan" }, { text: "constrói", tone: "red" }]
  },
};

function pad(value) { return String(value).padStart(2, "0"); }

function accentFor(moment) { return moment.colors.find((c) => c.toLowerCase() !== "#f7f7f4") || moment.colors[0]; }

function applyQrCode(element, url, imageUrl) {
  element.title = url;
  if (!imageUrl) { element.classList.add("is-missing"); return; }
  const probe = new Image();
  probe.onload = () => {
    element.classList.remove("is-missing");
    element.style.backgroundColor = "#f6f1e8";
    element.style.backgroundImage = `url("${imageUrl}")`;
    element.style.backgroundPosition = "center";
    element.style.backgroundSize = "cover";
    element.style.backgroundRepeat = "no-repeat";
  };
  probe.onerror = () => { element.classList.add("is-missing"); };
  probe.src = imageUrl;
}

function copyFor(moment) {
  return moment.copy?.[activeLanguage] || moment.copy?.[CONFIG.defaultLanguage] || moment.copy?.es || moment;
}

function highlightsFor(moment) {
  return TITLE_HIGHLIGHTS[moment.id]?.[activeLanguage] || TITLE_HIGHLIGHTS[moment.id]?.[CONFIG.defaultLanguage] || [];
}

function appendHighlightedText(parent, text, highlights) {
  if (!highlights.length) { parent.append(document.createTextNode(text)); return; }
  const normalizedText = text.toLocaleLowerCase(activeLanguage);
  const ordered = [...highlights].sort((a, b) => b.text.length - a.text.length);
  let cursor = 0;

  while (cursor < text.length) {
    let next = null;
    for (const highlight of ordered) {
      const index = normalizedText.indexOf(highlight.text.toLocaleLowerCase(activeLanguage), cursor);
      if (index === -1) continue;
      if (!next || index < next.index || (index === next.index && highlight.text.length > next.text.length)) {
        next = { ...highlight, index };
      }
    }
    if (!next) { parent.append(document.createTextNode(text.slice(cursor))); break; }
    if (next.index > cursor) { parent.append(document.createTextNode(text.slice(cursor, next.index))); }
    
    const span = document.createElement("span");
    span.className = `title-highlight title-highlight--${next.tone}`;
    span.textContent = text.slice(next.index, next.index + next.text.length);
    parent.append(span);
    cursor = next.index + next.text.length;
  }
}

function renderTitle(moment, copy) {
  titleEl.replaceChildren();
  const parent = moment.state === "qr"
      ? Object.assign(document.createElement("a"), { href: CONFIG.qr.socialUrl, target: "_blank", rel: "noopener noreferrer" })
      : titleEl;
  appendHighlightedText(parent, copy.title, highlightsFor(moment));
  if (moment.state === "qr") { titleEl.append(parent); }
}

function buildProgressRail() {
  progressRail.replaceChildren();
  for (let i = 0; i < moments.length; i += 1) {
    const tick = document.createElement("span");
    tick.className = "rail-tick";
    progressRail.append(tick);
  }
}

function updateProgressRail() {
  const ticks = [...progressRail.children];
  ticks.forEach((tick, i) => {
    tick.classList.toggle("is-past", i < activeIndex);
    tick.classList.toggle("is-active", i === activeIndex);
  });
}

function applyComposition(moment) {
  const name = moment.layout || "wide";
  const table = compactViewport.matches ? LAYOUTS_PORTRAIT : LAYOUTS;
  const zone = table[name] || table.wide;

  stage.style.setProperty("--read-x", zone.x);
  stage.style.setProperty("--read-y", zone.y);
  stage.style.setProperty("--read-w", zone.w);
  stage.style.setProperty("--read-h", zone.h);
  stage.style.setProperty("--read-cx", `${(zone.x + zone.w / 2) * 100}%`);
  stage.style.setProperty("--read-cy", `${(zone.y + zone.h / 2) * 100}%`);
  stage.dataset.layout = name;
  stage.dataset.anchor = zone.anchor;
  stage.dataset.align = zone.align;

  visualSystem.setReadingZone(zone);
}

function assetFor(moment) {
  const configuredAsset = CONFIG.assets.byMoment?.[moment.id];
  return configuredAsset === false ? null : configuredAsset || moment.asset;
}

function preloadAssets() {
  for (const moment of moments) {
    const asset = assetFor(moment);
    if (asset?.type === "image" && asset.src) {
      const img = new Image();
      img.src = asset.src;
    }
  }
}

// Configuración de la fotografía de fondo con un fade más lento
function setAsset(moment) {
  window.clearTimeout(assetClearTimer);
  const asset = assetFor(moment);

  if (asset?.type === "image" && asset.src) {
    const isBackground = asset.placement === "background";
    const changeImage = assetImage.getAttribute("src") !== asset.src;

    if (changeImage) {
      assetFrame.classList.remove("is-visible");
      assetClearTimer = window.setTimeout(() => {
        assetFrame.classList.toggle("is-background", isBackground);
        stage.classList.toggle("has-background-asset", isBackground);
        assetImage.src = asset.src;
        assetImage.alt = asset.alt || "";

        // Pausa breve para asegurar que el navegador repinte
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                assetFrame.classList.add("is-visible");
            });
        });
      }, 450); // Sincronizado con el tiempo de salida del texto
    } else {
      assetFrame.classList.toggle("is-background", isBackground);
      stage.classList.toggle("has-background-asset", isBackground);
      assetFrame.classList.add("is-visible");
    }
    return;
  }

  assetFrame.classList.remove("is-visible");
  assetClearTimer = window.setTimeout(() => {
    if (!assetFrame.classList.contains("is-visible")) {
      assetFrame.classList.remove("is-background");
      stage.classList.remove("has-background-asset");
      assetImage.removeAttribute("src");
      assetImage.alt = "";
    }
  }, 450);
}

function setMoment(index) {
  const newIndex = Math.max(0, Math.min(moments.length - 1, index));
  
  // Bloquear doble click en medio de la transición
  if (isInitialized && newIndex === activeIndex) return;
  isInitialized = true;

  const isForward = newIndex >= activeIndex;
  activeIndex = newIndex;

  const moment = moments[activeIndex];
  const copy = copyFor(moment);

  window.clearTimeout(transitionTimer);

  // 1. Establecer la dirección de la animación
  stage.dataset.direction = isForward ? "forward" : "backward";

  // 2. Disparar clase de salida
  copyLayer.classList.remove("is-entering");
  copyLayer.classList.add("is-exiting");
  qrLayer.classList.remove("is-visible");

  // El organismo visual migra instantáneamente, él gestiona su propia inercia
  applyComposition(moment);
  setAsset(moment);
  visualSystem.setMoment(moment);
  stage.style.setProperty("--moment-accent", accentFor(moment));
  updateProgressRail();

  const delay = reducedMotion.matches ? 0 : 450; // Espera a que termine la salida CSS

  // 3. Cuando termina la salida, cambiamos el texto y lo metemos
  transitionTimer = window.setTimeout(() => {
    stage.dataset.moment = moment.id;
    stage.dataset.size = titleSizeFor(copy.title, moment.layout);

    chapterIndexEl.textContent = pad(activeIndex + 1);
    chapterNameEl.textContent = copy.kicker || CONFIG.brandLine;
    renderTitle(moment, copy);
    subtitleEl.textContent = copy.subtitle || "";
    numberEl.textContent = pad(activeIndex + 1);
    mobileNumberEl.textContent = pad(activeIndex + 1);

    if (moment.state === "qr") {
        qrLayer.classList.add("is-visible");
        copyLayer.classList.add("is-qr");
    } else {
        copyLayer.classList.remove("is-qr");
    }

    // Preparar posición de entrada (snap sin animación)
    copyLayer.classList.remove("is-exiting");
    copyLayer.classList.add("is-entering");

    // Forzar reflow del navegador para que reconozca la nueva posición de partida
    void copyLayer.offsetWidth;

    // Disparar animación de entrada eliminando la clase
    copyLayer.classList.remove("is-entering");
  }, delay);
}

function nextMoment() { setMoment(activeIndex + 1); }
function previousMoment() { setMoment(activeIndex - 1); }

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) { await stage.requestFullscreen(); } 
    else { await document.exitFullscreen(); }
  } catch (err) { console.warn("Fullscreen error:", err); }
}

function toggleHelp() { showHelp = !showHelp; updateHelpUi(); }
function updateHelpUi() {
  helpPanel.classList.toggle("is-hidden", !showHelp);
  helpButton.setAttribute("aria-pressed", String(showHelp));
  helpButton.setAttribute("aria-label", showHelp ? "Ocultar ayuda" : "Mostrar ayuda");
}

function updateLanguageUi() {
  document.documentElement.lang = activeLanguage;
  for (const button of languageButtons) {
    const isActive = button.dataset.language === activeLanguage;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
    button.textContent = languageLabels[button.dataset.language] || button.dataset.language.toUpperCase();
  }
  const qrLabels = CONFIG.qr.labels?.[activeLanguage] || CONFIG.qr.labels?.[CONFIG.defaultLanguage] || {};
  qrMemoryLabel.textContent = qrLabels.memory || "Memorias";
  qrSocialLabel.textContent = qrLabels.social || "@centrodeeventosupb";
}

function toggleDebug() { showDebug = !showDebug; debugPanel.classList.toggle("is-visible", showDebug); }

function updateDebugPanel() {
  const s = visualSystem.getStats();
  const bar = (v) => "█".repeat(Math.round(v * 10)).padEnd(10, "·");
  const crossRatio = s.links ? Math.round((s.crossLinks / s.links) * 100) : 0;

  debugPanel.textContent = [
    `${pad(activeIndex + 1)}/${moments.length}  ${s.moment}`,
    `estado ${s.state}  composición ${s.layout}${s.orbit > 0.5 ? " (halo)" : ""}`,
    ``,
    `convocatoria  ${bar(s.gravity)}  ${s.gravity.toFixed(2)}`,
    `aislamiento   ${bar(s.clumping)}  ${s.clumping.toFixed(2)}`,
    `confianza     ${bar(s.elasticity)}  ${s.elasticity.toFixed(2)}`,
    `exploración   ${bar(s.exploration)}  ${s.exploration.toFixed(2)}`,
    `energía       ${bar(s.intensity)}  ${s.intensity.toFixed(2)}`,
    ``,
    `agentes ${s.agents}  enlaces ${s.links}`,
    `entre generaciones ${s.crossLinks} (${crossRatio}%)`,
    `${fps} fps  filtros de canvas: ${s.filter ? "sí" : "NO"}`,
  ].join("\n");
}

// Parallax Tracker: Registra hacia donde va el mouse
window.addEventListener("mousemove", (event) => {
  if (reducedMotion.matches) return;
  targetPx = (event.clientX / window.innerWidth - 0.5) * 2;
  targetPy = (event.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

function tick(now) {
  visualSystem.render();

  // Bucle de inercia del Parallax (Interpolación súper suave)
  if (!reducedMotion.matches) {
    currentPx += (targetPx - currentPx) * 0.06;
    currentPy += (targetPy - currentPy) * 0.06;
    
    // Inyectamos las coordenadas en milésimas
    document.documentElement.style.setProperty("--px", currentPx.toFixed(4));
    document.documentElement.style.setProperty("--py", currentPy.toFixed(4));
  }

  debugFrame += 1;
  if (debugFrame % 12 === 0) {
    const elapsed = now - lastTickTime;
    lastTickTime = now;
    fps = Math.round(12000 / Math.max(1, elapsed));
    if (showDebug) updateDebugPanel();
  }

  requestAnimationFrame(tick);
}

document.querySelector("#next-button").addEventListener("click", nextMoment);
document.querySelector("#prev-button").addEventListener("click", previousMoment);
document.querySelector("#fullscreen-button").addEventListener("click", toggleFullscreen);
helpButton.addEventListener("click", toggleHelp);
resetButton.addEventListener("click", () => setMoment(0));
endButton.addEventListener("click", () => setMoment(moments.length - 1));
mobileFullscreenButton.addEventListener("click", toggleFullscreen);

for (const button of languageButtons) {
  button.addEventListener("click", () => {
    activeLanguage = button.dataset.language;
    storage.set("forum-language", activeLanguage);
    updateLanguageUi();
    setMoment(activeIndex);
  });
}

const recomposeOnViewportChange = () => applyComposition(moments[activeIndex]);
window.addEventListener("resize", recomposeOnViewportChange);
if (compactViewport.addEventListener) {
  compactViewport.addEventListener("change", recomposeOnViewportChange);
}

window.addEventListener("keydown", (event) => {
  if (!event.key) return;
  const key = event.key.toLowerCase();

  if (key === "arrowright" || key === " " || key === "pagedown") { event.preventDefault(); nextMoment(); return; }
  if (key === "arrowleft" || key === "pageup") { event.preventDefault(); previousMoment(); return; }
  if (key === "home" || key === "r") { event.preventDefault(); setMoment(0); return; }
  if (key === "end") { event.preventDefault(); setMoment(moments.length - 1); return; }
  if (key === "f") { event.preventDefault(); toggleFullscreen(); return; }
  if (key === "h") { event.preventDefault(); toggleHelp(); return; }
  if (key === "d") { event.preventDefault(); toggleDebug(); }
});

let touchStartX = 0; let touchStartY = 0;
stage.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
    touchStartY = event.changedTouches[0].clientY;
  }, { passive: true }
);

stage.addEventListener("touchend", (event) => {
    const deltaX = event.changedTouches[0].clientX - touchStartX;
    const deltaY = event.changedTouches[0].clientY - touchStartY;
    if (Math.abs(deltaX) < 42) return;
    if (Math.abs(deltaX) < Math.abs(deltaY) * 1.4) return;
    if (deltaX < 0) nextMoment();
    else previousMoment();
  }, { passive: true }
);

totalEl.textContent = String(moments.length);
mobileTotalEl.textContent = String(moments.length);
qrMemoryLink.href = CONFIG.qr.memoryUrl;
qrSocialLink.href = CONFIG.qr.socialUrl;
applyQrCode(qrMemory, CONFIG.qr.memoryUrl, CONFIG.qr.memoryImage);
applyQrCode(qrSocial, CONFIG.qr.socialUrl, CONFIG.qr.socialImage);
buildProgressRail();
updateLanguageUi();
updateHelpUi();
preloadAssets();
setMoment(0);
requestAnimationFrame(tick);