/* ============================================================================
   Fórum UPB · "Relevo generacional"
   CONFIGURACIÓN

   Todo lo que hay aquí se usa. Antes, connectionDistance y transitionSpeed
   estaban declarados pero el sistema los ignoraba; ahora gobiernan la red de
   relaciones y la velocidad de transición entre comportamientos.

   PARA CAMBIOS RÁPIDOS EL DÍA DEL EVENTO:
   · Textos y comportamiento por momento .... moments.js
   · Imágenes de fondo ...................... assets.byMoment (abajo)
   · Enlaces y QR ........................... qr (abajo)
   · Idioma de arranque ..................... defaultLanguage (abajo)
   Ninguna de estas ediciones requiere tocar visualSystem.js ni main.js.
============================================================================ */

window.CONFIG = {
  title: "Relevo generacional",
  brandLine: "Future Leaders Forum · Fórum UPB",
  defaultLanguage: "pt",
  aspectRatio: 16 / 9,

  // --- Población y red de relaciones -------------------------------------
  particleCount: 140, // número de agentes del organismo
  connectionDistance: 165, // radio dentro del cual dos agentes pueden vincularse
  linkRestRatio: 0.52, // longitud de reposo del resorte = radio × este valor
  maxDegreeExperience: 8, // un nodo de experiencia sostiene más relaciones
  maxDegreeYouth: 5, // las nuevas generaciones sostienen menos, pero más móviles
  transitionSpeed: 0.055, // suavidad del cambio de comportamiento entre momentos

  assets: {
    byMoment: {
      "auditorio-grados": {
        type: "image",
        src: "./assets/slide-02-grados.webp",
        alt: "Ceremonia de grados en Forum UPB",
        placement: "background",
      },
      "academia-industria-ciudad": {
        type: "image",
        src: "./assets/slide-04-actores.webp",
        alt: "Panel con publico en Forum UPB",
        placement: "background",
      },
      impacto: {
        type: "image",
        src: "./assets/slide-05-impacto.webp",
        alt: "Evento con actores institucionales y empresariales reunidos",
        placement: "background",
      },
      "nuevas-rutas": {
        type: "image",
        src: "./assets/slide-08-rutas.webp",
        alt: "Mesas de trabajo y conversaciones en comunidad",
        placement: "background",
      },
      "futuro-construido": {
        type: "image",
        src: "./assets/slide-12-futuro.webp",
        alt: "Auditorio Forum UPB preparado para un evento",
        placement: "background",
      },
      "qr-cierre": {
        type: "image",
        src: "./assets/slide-13-cierre.webp",
        alt: "Campus UPB al atardecer",
        placement: "background",
      },
    },
  },

  // Los QR deben ser imágenes reales y escaneables. Si el archivo no existe,
  // el bloque se muestra solo con su enlace: nunca un patrón decorativo que
  // parezca un QR y no funcione.
  qr: {
    memoryUrl: "https://juanferfranco.github.io/ForumTEDTALK/",
    socialUrl: "https://www.instagram.com/centrodeeventosupb/",
    memoryImage: "./assets/qr-memory.png",
    socialImage: "./assets/qr-social.png",
    labels: {
      es: {
        memory: "Memorias",
        social: "@centrodeeventosupb",
      },
      pt: {
        memory: "Anais",
        social: "@centrodeeventosupb",
      },
    },
  },

  palette: {
    base: "#070808",
    ink: "#f7f7f4",
    eventCyan: "#00a2e0", // FLF (swirl azul)
    eventRed: "#f04b3a", // FLF (swirl rojo)
    eventMagenta: "#ec779c", // FLF (swirl rosa)
    eventGreen: "#1d7e3a", // FLF web. Referencia de marca.
    eventGreenScreen: "#2aa85c", // El mismo verde elevado para proyección.
    eventBlack: "#222326",
    eventSilver: "#dde2e6",
    forumGold: "#d6a94f",
  },
};