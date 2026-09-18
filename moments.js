/* ============================================================================
   Fórum UPB · "Relevo generacional"
   GUION, PARTITURA Y COMPOSICIÓN

   La secuencia narrativa del cliente NO se modifica. Lo que cambia en cada
   momento son las reglas de relación del organismo y el encuadre del texto:

     gravity      convocatoria de Fórum (0 = nadie convoca, 1 = todo gravita)
     clumping     aislamiento generacional (1 = dos masas separadas)
     elasticity   CONFIANZA: umbral, rigidez y número de vínculos
     exploration  búsqueda de rutas nuevas
     intensity    energía / velocidad del momento

   · layout       Dónde vive el texto. No es decoración: la zona de lectura
                  es una fuerza del sistema y el organismo se reorganiza
                  alrededor de ella. Las composiciones disponibles están en
                  main.js (LAYOUTS). El ritmo de la charla se construye
                  alternándolas:

                  opening       apertura, texto grande abajo a la izquierda
                  counterpoint  texto arriba: para preguntas y giros
                  wide          bloque medio-izquierda para frases largas
                  anchor        pie de imagen, texto abajo sobre la foto
                  beat          TESIS: texto centrado, el organismo lo rodea
                  closing       cierre, texto a la izquierda y QR a la derecha

                  Los cuatro "beat" caen exactamente en las cuatro frases que
                  sostienen el argumento. Son las únicas veces que la
                  audiencia mira al centro de la pantalla: por eso pesan.

   El campo "note" explica la decisión estructural. No se usa en pantalla:
   está para la bitácora y para sustentar el proyecto.

   Nota de color: el verde de marca (#1d7e3a, de la web de FLF) es muy oscuro
   y en proyector, compuesto en "lighten" sobre negro y con luz de sala, se
   lee como barro. Se usa #2aa85c, la misma tonalidad elevada en luminosidad.
   El hex original se conserva en CONFIG.palette como referencia de marca.
============================================================================ */

window.languageLabels = {
  es: "ES",
  pt: "PT",
};

const FLF_CYAN = "#00a2e0";
const FLF_RED = "#f04b3a";
const FLF_PINK = "#ec779c";
const FLF_GREEN = "#2aa85c"; // verde de marca elevado para proyección
const FORUM_INK = "#f7f7f4";

window.moments = [
  {
    id: "relevo-generacional",
    layout: "opening",
    copy: {
      es: {
        kicker: "Future Leaders Forum · Fórum UPB",
        title: "RELEVO GENERACIONAL: LA VENTAJA QUE NADIE ESTÁ APROVECHANDO",
        subtitle: "@centrodeeventosupb",
      },
      pt: {
        kicker: "Future Leaders Forum · Fórum UPB",
        title: "RELEVO GERACIONAL: A VANTAGEM QUE NINGUÉM ESTÁ APROVEITANDO",
        subtitle: "@centrodeeventosupb",
      },
    },
    state: "latent",
    intensity: 0.2,
    colors: [FLF_CYAN, FLF_RED, FLF_PINK],
    behavior: {
      gravity: 0.1,
      clumping: 1.0,
      elasticity: 0.1,
      exploration: 0.1,
    },
    note:
      "Punto de partida: dos masas generacionales separadas y sin red. Con " +
      "elasticity 0.1 solo pueden existir enlaces cruzados, y son escasos y " +
      "flojos. La ventaja que nadie aprovecha se ve como una ausencia.",
  },
  {
    id: "auditorio-grados",
    layout: "counterpoint",
    copy: {
      es: {
        kicker: "Espacio",
        title: "¿Un gran auditorio solo para hacer grados?",
        subtitle: "",
      },
      pt: {
        kicker: "Espaço",
        title: "Um grande auditório apenas para formaturas?",
        subtitle: "",
      },
    },
    asset: {
      type: "image",
      src: "./assets/slide-02-grados.webp",
      alt: "Ceremonia de grados en un auditorio universitario",
      placement: "background",
    },
    state: "isolation",
    intensity: 0.3,
    colors: [FORUM_INK, FLF_CYAN, FLF_PINK],
    behavior: {
      gravity: 0.15,
      clumping: 0.9,
      elasticity: 0.0,
      exploration: 0.1,
    },
    note:
      "Confianza en cero: la estructura desaparece por completo, quedan " +
      "cuerpos sueltos. Un espacio de un solo uso no teje relaciones. El " +
      "texto sube: la pregunta encabeza, la fotografía responde debajo.",
  },
  {
    id: "universidad-mundo",
    layout: "wide",
    copy: {
      es: {
        kicker: "Encuentro",
        title: "Los eventos no llegaron a la Universidad. La Universidad decidió encontrarse con el mundo.",
        subtitle: "",
      },
      pt: {
        kicker: "Encontro",
        title: "Os eventos não chegaram à Universidade. A Universidade decidiu se encontrar com o mundo.",
        subtitle: "",
      },
    },
    state: "attraction",
    intensity: 0.5,
    colors: [FLF_CYAN, FORUM_INK, FLF_RED],
    behavior: {
      gravity: 0.6,
      clumping: 0.6,
      elasticity: 0.2,
      exploration: 0.3,
    },
    note:
      "La decisión institucional entra como gravedad: aparece un foco que " +
      "convoca. Los primeros vínculos que se forman son cruzados, no entre " +
      "iguales.",
  },
  {
    id: "academia-industria-ciudad",
    layout: "beat",
    copy: {
      es: {
        kicker: "Tres fuerzas",
        title: "Academia + Industria + Ciudad",
        subtitle: "",
      },
      pt: {
        kicker: "Três forças",
        title: "Academia + Indústria + Cidade",
        subtitle: "",
      },
    },
    state: "mixing",
    intensity: 0.6,
    colors: [FLF_CYAN, FLF_RED, FLF_GREEN],
    behavior: {
      gravity: 0.7,
      clumping: 0.3,
      elasticity: 0.4,
      exploration: 0.4,
    },
    note:
      "Único momento con tres polos en vez de uno. Con el texto al centro, " +
      "los tres núcleos se reparten a su alrededor y la frase queda " +
      "literalmente sostenida por las tres fuerzas que nombra.",
  },
  {
    id: "impacto",
    layout: "anchor",
    copy: {
      es: {
        kicker: "Impacto",
        title: "Los eventos nunca fueron el objetivo. El impacto sí.",
        subtitle: "",
      },
      pt: {
        kicker: "Impacto",
        title: "Os eventos nunca foram o objetivo. O impacto, sim.",
        subtitle: "",
      },
    },
    asset: {
      type: "image",
      src: "./assets/slide-05-impacto.webp",
      alt: "Evento con actores institucionales y empresariales reunidos",
      placement: "background",
    },
    state: "impact",
    intensity: 0.8,
    colors: [FLF_RED, FLF_PINK, FORUM_INK],
    behavior: {
      gravity: 0.8,
      clumping: 0.1,
      elasticity: 0.6,
      exploration: 0.5,
    },
    note:
      "Máxima convocatoria y red ya densa: el impacto no es la reunión, es " +
      "lo que la red transmite cuando alguien se mueve.",
  },
  {
    id: "comunidad",
    layout: "wide",
    copy: {
      es: {
        kicker: "Comunidad",
        title: "Un evento trae personas. Una comunidad trae transformación.",
        subtitle: "",
      },
      pt: {
        kicker: "Comunidade",
        title: "Um evento traz pessoas. Uma comunidade traz transformação.",
        subtitle: "",
      },
    },
    state: "community",
    intensity: 0.7,
    colors: [FLF_GREEN, FLF_PINK, FLF_CYAN],
    behavior: {
      gravity: 0.5,
      clumping: 0.0,
      elasticity: 0.8,
      exploration: 0.6,
    },
    note:
      "La gravedad baja y la cohesión no se pierde: ya no los sostiene el " +
      "foco, los sostienen sus vínculos. Esa es la diferencia entre un " +
      "evento y una comunidad.",
  },
  {
    id: "confianza",
    layout: "beat",
    copy: {
      es: {
        kicker: "Confianza",
        title: "El talento crece a la velocidad de la confianza.",
        subtitle: "",
      },
      pt: {
        kicker: "Confiança",
        title: "O talento cresce na velocidade da confiança.",
        subtitle: "",
      },
    },
    state: "trust",
    intensity: 0.9,
    colors: [FLF_CYAN, FLF_PINK, FLF_RED],
    behavior: {
      gravity: 0.4,
      clumping: 0.0,
      elasticity: 1.0,
      exploration: 0.7,
    },
    note:
      "Confianza total: se superan los dos umbrales, aparecen también los " +
      "vínculos entre iguales y la red alcanza su densidad máxima. Texto " +
      "centrado dentro de la red más densa de toda la charla: la frase y el " +
      "parámetro son literalmente lo mismo.",
  },
  {
    id: "nuevas-rutas",
    layout: "wide",
    copy: {
      es: {
        kicker: "Rutas",
        title: "La experiencia construye el camino. Las nuevas generaciones descubren nuevas rutas.",
        subtitle: "",
      },
      pt: {
        kicker: "Rotas",
        title: "A experiência constrói o caminho. As novas gerações descobrem novas rotas.",
        subtitle: "",
      },
    },
    asset: {
      type: "image",
      src: "./assets/slide-08-rutas.webp",
      alt: "Mesas de trabajo y conversaciones en comunidad",
      placement: "background",
    },
    state: "routes",
    intensity: 0.75,
    colors: [FLF_CYAN, FLF_RED, FLF_PINK],
    behavior: {
      gravity: 0.3,
      clumping: 0.0,
      elasticity: 0.7,
      exploration: 1.0,
    },
    note:
      "Exploración al máximo, pero no para todos: la experiencia la recibe " +
      "al 45% y mantiene el trazo grueso; las nuevas generaciones aceleran y " +
      "se disparan. Los enlaces impiden que se desprendan: descubren sin " +
      "romperse.",
  },
  {
    id: "vision-generaciones",
    layout: "beat",
    copy: {
      es: {
        kicker: "Relevo",
        title: "Una visión. Dos generaciones.",
        subtitle: "",
      },
      pt: {
        kicker: "Revezamento",
        title: "Uma visão. Duas gerações.",
        subtitle: "",
      },
    },
    state: "duality",
    intensity: 0.6,
    colors: [FORUM_INK, FLF_CYAN, FLF_RED],
    behavior: {
      gravity: 0.5,
      clumping: 0.4,
      elasticity: 0.8,
      exploration: 0.5,
    },
    note:
      "Con el texto al centro, el eje de aislamiento gira a vertical: las " +
      "dos generaciones se acomodan arriba y abajo de la frase, unidas por " +
      "vínculos cruzados que la atraviesan. Dos masas, una sola estructura.",
  },
  {
    id: "trabajan-juntas",
    layout: "wide",
    copy: {
      es: {
        kicker: "Composición",
        title: "El crecimiento no ocurre cuando una generación reemplaza a otra. Ocurre cuando trabajan juntas.",
        subtitle: "",
      },
      pt: {
        kicker: "Composição",
        title: "O crescimento não acontece quando uma geração substitui a outra. Acontece quando trabalham juntas.",
        subtitle: "",
      },
    },
    state: "convergence",
    intensity: 0.85,
    colors: [FLF_CYAN, FLF_RED, FLF_PINK],
    behavior: {
      gravity: 0.6,
      clumping: 0.0,
      elasticity: 0.9,
      exploration: 0.8,
    },
    note:
      "Ninguna partícula murió en toda la presentación: eso es la tesis. No " +
      "hay reemplazo posible porque el sistema no tiene ciclo de vida, solo " +
      "readaptación.",
  },
  {
    id: "presente-joven",
    layout: "counterpoint",
    copy: {
      es: {
        kicker: "Presente",
        title: "Los jóvenes no son el futuro. Son el presente que muchas organizaciones aún no ven.",
        subtitle: "",
      },
      pt: {
        kicker: "Presente",
        title: "Os jovens não são o futuro. São o presente que muitas organizações ainda não veem.",
        subtitle: "",
      },
    },
    state: "present",
    intensity: 0.9,
    colors: [FLF_RED, FLF_CYAN, FORUM_INK],
    behavior: {
      gravity: 0.4,
      clumping: 0.0,
      elasticity: 0.7,
      exploration: 0.9,
    },
    note:
      "El estado 'present' invierte el brillo: la experiencia se atenúa y " +
      "las nuevas generaciones toman el primer plano. El texto vuelve arriba " +
      "para que el organismo joven ocupe todo el cuerpo de la pantalla.",
  },
  {
    id: "futuro-construido",
    layout: "beat",
    copy: {
      es: {
        kicker: "Futuro construido",
        title: "El futuro no se hereda. Se construye.",
        subtitle: "",
      },
      pt: {
        kicker: "Futuro construído",
        title: "O futuro não se herda. Ele se constrói.",
        subtitle: "",
      },
    },
    asset: {
      type: "image",
      src: "./assets/slide-12-futuro.webp",
      alt: "Auditorio Forum UPB preparado para un evento",
      placement: "background",
    },
    state: "future",
    intensity: 1.0,
    colors: [FLF_GREEN, FLF_CYAN, FLF_PINK],
    behavior: {
      gravity: 0.5,
      clumping: 0.0,
      elasticity: 1.0,
      exploration: 1.0,
    },
    note:
      "Red cristalina: enlaces más marcados y energía máxima, rodeando la " +
      "frase final. No se hereda una forma, se sostiene una estructura en " +
      "movimiento.",
  },
  {
    id: "qr-cierre",
    layout: "closing",
    copy: {
      es: {
        kicker: "Continuidad",
        title: "@centrodeeventosupb",
        subtitle: "",
      },
      pt: {
        kicker: "Continuidade",
        title: "@centrodeeventosupb",
        subtitle: "",
      },
    },
    asset: {
      type: "image",
      src: "./assets/slide-13-cierre.webp",
      alt: "Campus UPB al atardecer",
      placement: "background",
    },
    state: "qr",
    intensity: 0.5,
    colors: [FORUM_INK, FLF_CYAN, FLF_RED],
    behavior: {
      gravity: 0.8,
      clumping: 0.0,
      elasticity: 0.9,
      exploration: 0.2,
    },
    note:
      "Reposo con estructura: baja la exploración, se mantienen los vínculos. " +
      "La red queda quieta pero entera, disponible para quien quiera entrar.",
  },
];