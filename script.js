const $ = (s) => document.querySelector(s);
const intro = $("#intro");
const content = $("#contenido");
const enterButton = $("#enterBtn");
const backButton = $("#backBtn");
const menuToggle = $("#menuToggle");
const backgroundAudio = $("#backgroundAudio");
const shop = $("#tienda");
const shopFilters = document.querySelectorAll(".shop-filter");
const productCards = document.querySelectorAll(".product-card");
const templeScene = $("#templeScene");
const templeTrigger = $("#templeTrigger");
const templeArt = templeScene.querySelector(".temple-art");
const templeArchitecture = $("#templeArchitecture");
const templeStructure = $("#templeStructure");
const templeStatus = $("#templeStatus");
const templeKicker = $("#templeKicker");
const templePrompt = $("#templePrompt");
const sharinganLoader = $("#sharinganLoader");
const loaderMessage = $("#loaderMessage");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const scrollFadeSelectors = ".hero-content, .temple-art, .temple-caption, .content-header, .feature, .shop-header, .product-card, footer";
let loadingTimer;
let awakeningTimer;
let templeDoorTimer;
let templeIllusionTimer;
let scrollFadeObserver;
let waitingForAudioGesture = false;
templeScene.after(shop);
const toast = (message) => {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 2400);
};

shopFilters.forEach((filter) => filter.addEventListener("click", () => {
  const selectedCategory = filter.dataset.filter;
  shopFilters.forEach((button) => {
    const isSelected = button === filter;
    button.classList.toggle("active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
  productCards.forEach((card) => {
    card.hidden = selectedCategory !== "all" && card.dataset.category !== selectedCategory;
  });
}));

function resetTemple() {
  window.clearTimeout(templeDoorTimer);
  window.clearTimeout(templeIllusionTimer);
  templeScene.classList.remove("doors-open", "illusion-active", "sequence-running");
  templeTrigger.setAttribute("aria-pressed", "false");
  templeTrigger.setAttribute("aria-label", "Abrir las puertas del templo e iniciar una ilusión del Sharingan");
  templeKicker.textContent = "MÁS ALLÁ DE LA NIEBLA";
  templePrompt.textContent = "Toca para abrir las puertas y entrar.";
  templeStatus.textContent = templePrompt.textContent;
}

function updateTempleViewBox() {
  const aspectRatio = window.innerWidth / window.innerHeight;
  const artworkAspectRatio = 1200 / 675;
  const isPortrait = aspectRatio < 0.8;
  const architectureScale = isPortrait ? 0.58 : 0.7;
  const structureHeightScale = isPortrait ? 1.22 : 1.28;
  templeArchitecture.setAttribute(
    "transform",
    `translate(${600 * (1 - architectureScale)} ${425 * (1 - architectureScale)}) scale(${architectureScale})`
  );
  templeStructure.setAttribute(
    "transform",
    `translate(0 ${425 * (1 - structureHeightScale)}) scale(1 ${structureHeightScale})`
  );

  if (aspectRatio < artworkAspectRatio) {
    const viewBoxWidth = 675 * aspectRatio;
    templeArt.setAttribute("viewBox", `${(1200 - viewBoxWidth) / 2} 0 ${viewBoxWidth} 675`);
    return;
  }

  const viewBoxHeight = 1200 / aspectRatio;
  templeArt.setAttribute("viewBox", `0 ${(675 - viewBoxHeight) / 2} 1200 ${viewBoxHeight}`);
}

window.addEventListener("resize", updateTempleViewBox);
updateTempleViewBox();

function prepareCollectibleModels() {
  productCards.forEach((card) => {
    if (!["accessories", "figures"].includes(card.dataset.category)) return;
    const artwork = card.querySelector(".product-art");
    const illustration = artwork && artwork.querySelector("svg");
    if (!artwork || !illustration) return;

    const title = card.querySelector("h3").textContent.trim();
    const category = card.querySelector(".product-type").textContent.trim();
    const model = document.createElement("div");
    const front = document.createElement("div");
    const back = document.createElement("div");
    const emblem = document.createElement("span");
    const backTitle = document.createElement("strong");
    const backCategory = document.createElement("small");

    model.className = "product-model";
    model.setAttribute("aria-hidden", "true");
    front.className = "product-face product-face-front";
    back.className = "product-face product-face-back";
    emblem.className = "product-back-emblem";
    emblem.textContent = "◉";
    backTitle.textContent = title;
    backCategory.textContent = category;
    front.append(illustration);
    back.append(emblem, backTitle, backCategory);
    model.append(front, back);
    artwork.append(model);
  });
}

prepareCollectibleModels();

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  scrollFadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-in-view", entry.isIntersecting);
      if (!entry.target.querySelector(".product-model")) return;

      entry.target.classList.remove("product-spinning");
      if (entry.isIntersecting) {
        void entry.target.offsetWidth;
        entry.target.classList.add("product-spinning");
      }
    });
  }, { threshold: 0.08, rootMargin: "-8% 0px -8% 0px" });
}

function observeScrollFadeTargets() {
  if (!scrollFadeObserver) return;
  document.querySelectorAll(scrollFadeSelectors).forEach((element) => {
    element.classList.add("scroll-fade");
    scrollFadeObserver.observe(element);
  });
}

observeScrollFadeTargets();

templeTrigger.addEventListener("click", () => {
  if (templeScene.classList.contains("sequence-running")) return;

  const shopWasOpen = content.classList.contains("shop-open");
  window.clearTimeout(templeDoorTimer);
  window.clearTimeout(templeIllusionTimer);
  templeScene.classList.add("sequence-running", "doors-open");
  templeScene.classList.remove("illusion-active");
  templeTrigger.setAttribute("aria-pressed", "true");
  templeKicker.textContent = "EL SANTUARIO DESPIERTA";
  templePrompt.textContent = "Las puertas ceden ante tu mirada...";
  templeStatus.textContent = "Las puertas del templo se abren.";

  const doorDelay = prefersReducedMotion ? 50 : 1100;
  const illusionDuration = prefersReducedMotion ? 300 : 4600;
  templeDoorTimer = window.setTimeout(() => {
    content.classList.add("shop-open");
    observeScrollFadeTargets();
    templeScene.classList.add("illusion-active");
    templePrompt.textContent = "La ilusión del Sharingan altera la realidad.";
    templeStatus.textContent = "Comienza una ilusión original del Sharingan.";

    if (!shopWasOpen) {
      window.setTimeout(() => {
        shop.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      }, prefersReducedMotion ? 0 : 300);
    }

    templeIllusionTimer = window.setTimeout(() => {
      templeScene.classList.remove("illusion-active", "sequence-running");
      templeKicker.textContent = "EL CAMINO ESTÁ ABIERTO";
      templePrompt.textContent = "Las puertas siguen abiertas. Toca para vivir la ilusión otra vez.";
      templeTrigger.setAttribute("aria-pressed", "false");
      templeTrigger.setAttribute("aria-label", "Volver a iniciar la ilusión del Sharingan");
      templeStatus.textContent = "La ilusión termina. El templo permanece abierto.";
    }, illusionDuration);
  }, doorDelay);
});

function removeAudioGestureListeners() {
  window.removeEventListener("pointerdown", resumeAudioAfterGesture);
  window.removeEventListener("keydown", resumeAudioAfterGesture);
  waitingForAudioGesture = false;
}

function listenForAudioGesture() {
  if (waitingForAudioGesture) return;
  waitingForAudioGesture = true;
  window.addEventListener("pointerdown", resumeAudioAfterGesture);
  window.addEventListener("keydown", resumeAudioAfterGesture);
}

function startBackgroundAudio() {
  if (!backgroundAudio.paused) {
    removeAudioGestureListeners();
    return;
  }
  try {
    const playback = backgroundAudio.play();
    playback.then(removeAudioGestureListeners).catch((error) => {
      if (error.name === "NotAllowedError") return;
      console.error("No se pudo reproducir el audio:", error);
      toast(window.location.protocol === "file:"
        ? "Abre iniciar-sitio.bat para que se reproduzca la música."
        : "No se pudo reproducir el audio. Revisa el archivo de música.");
    });
  } catch (error) {
    console.error("No se pudo reproducir el audio:", error);
    toast(window.location.protocol === "file:"
      ? "Abre iniciar-sitio.bat para que se reproduzca la música."
      : "No se pudo iniciar el audio.");
  }
}

backgroundAudio.addEventListener("error", () => {
  console.error("No se pudo cargar el archivo de audio:", backgroundAudio.error);
  toast(window.location.protocol === "file:"
    ? "Abre iniciar-sitio.bat para que se reproduzca la música."
    : "No se pudo cargar la música. Revisa el archivo de audio.");
});

function resumeAudioAfterGesture() {
  startBackgroundAudio();
}

listenForAudioGesture();
startBackgroundAudio();
window.addEventListener("pageshow", startBackgroundAudio);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") startBackgroundAudio();
});

// Crear pétalos rojos que caen sobre el fondo asiático.
const petals = $("#petals");
function createPetal() {
  if (!petals || prefersReducedMotion) return;
  const petal = document.createElement("span");
  petal.className = "petal";
  petal.style.left = Math.random() * 100 + "%";
  petal.style.setProperty("--drift", (Math.random() * 180 - 90) + "px");
  petal.style.animationDuration = (7 + Math.random() * 8) + "s";
  petal.style.animationDelay = (Math.random() * 2) + "s";
  petal.style.opacity = (0.3 + Math.random() * 0.65).toString();
  petal.style.transform = `scale(${0.5 + Math.random()})`;
  petals.appendChild(petal);
  setTimeout(() => petal.remove(), 17000);
}
if (!prefersReducedMotion) {
  for (let i = 0; i < 22; i++) createPetal();
  setInterval(createPetal, 650);
}

// Entrar al contenido con transición.
enterButton.addEventListener("click", () => {
  if (document.body.classList.contains("entered") || enterButton.disabled) return;
  enterButton.disabled = true;
  sharinganLoader.classList.add("active");
  sharinganLoader.setAttribute("aria-hidden", "false");
  loaderMessage.firstChild.textContent = "Despertando el Sharingan";
  sharinganLoader.classList.remove("awakened");
  awakeningTimer = window.setTimeout(() => {
    sharinganLoader.classList.add("awakened");
    loaderMessage.firstChild.textContent = "Mangekyō Sharingan despertado";
  }, prefersReducedMotion ? 0 : 700);
  const finishEntering = () => {
    intro.style.opacity = "";
    intro.style.transform = "";
    document.body.classList.add("entered");
    window.scrollTo({ top: 0, behavior: "auto" });
    content.classList.add("visible");
    observeScrollFadeTargets();
    sharinganLoader.classList.remove("active");
    sharinganLoader.setAttribute("aria-hidden", "true");
  };
  loadingTimer = window.setTimeout(finishEntering, prefersReducedMotion ? 900 : 2600);
});

// Volver a la portada.
backButton.addEventListener("click", () => {
  window.clearTimeout(loadingTimer);
  window.clearTimeout(awakeningTimer);
  resetTemple();
  content.classList.remove("shop-open");
  sharinganLoader.classList.remove("active");
  sharinganLoader.setAttribute("aria-hidden", "true");
  document.body.classList.remove("entered");
  content.classList.remove("visible");
  intro.style.opacity = "";
  intro.style.transform = "";
  enterButton.disabled = false;
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
});

// Menú móvil.
const nav = $("#nav");
menuToggle.setAttribute("aria-expanded", "false");
menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
});
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menú");
}));
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", e => {
  if (!document.body.classList.contains("entered") && a.getAttribute("href") !== "#inicio") {
    e.preventDefault();
    toast("Pulsa «Entrar al mundo shinobi» para explorar esta sección.");
  }
}));
