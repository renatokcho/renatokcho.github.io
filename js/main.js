gsap.registerPlugin(ScrollTrigger, TextPlugin);

const pageShell = document.querySelector("[data-page-shell]");
const modal = document.querySelector("[data-warning-modal]");
const dismissButton = document.querySelector("[data-dismiss-warning]");
const projectTitle = document.querySelector("[data-project-title]");
const langToggle = document.querySelector("[data-lang-toggle]");
const langOptions = document.querySelectorAll("[data-lang-option]");
const i18nNodes = document.querySelectorAll("[data-i18n]");
//const brandMark = document.querySelector("[data-brand-mark]");
const nextSectionTriggers = document.querySelectorAll("[data-next-section-trigger]");
const titleDockBar = document.querySelector("[data-title-dock-bar]");
const dockProjectTitle = document.querySelector("[data-dock-project-title]");
const introScene = document.querySelector('[data-scene="intro"]');
const explanationScene = document.querySelector('[data-scene="explanation"]');
const storyDetailScene = document.querySelector('[data-scene="story-detail"]');
const creditsScene = document.querySelector('[data-scene="credits"]');
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isCoarse = window.matchMedia("(pointer: coarse)").matches;
const isNoHover = window.matchMedia("(hover: none)").matches;
const isLandscape = window.matchMedia("(orientation: landscape)").matches;
const isSmall = window.matchMedia("(max-width: 900px)").matches;
const isLikelyMobile = isCoarse || isNoHover || window.navigator.userAgentData?.mobile;

const useLiteMode = isLikelyMobile && (isSmall || isLandscape);

const liteModeConfig = {
    enabled: useLiteMode,
    hideGlyphs: false,
    hideOrbs: true,
    hideWavePanel: false,
    hideScanLayer: false,
};

function goFullScreen() {
    document.documentElement.requestFullscreen()
        .catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message}`);
        });
}

function applyLiteModeToggles() {
    document.body.classList.toggle("lite-mode", liteModeConfig.enabled);
    document.body.classList.toggle("lite-hide-glyphs", liteModeConfig.enabled && liteModeConfig.hideGlyphs);
    document.body.classList.toggle("lite-hide-orbs", liteModeConfig.enabled && liteModeConfig.hideOrbs);
    document.body.classList.toggle("lite-hide-wave", liteModeConfig.enabled && liteModeConfig.hideWavePanel);
    document.body.classList.toggle("lite-hide-scan", liteModeConfig.enabled && liteModeConfig.hideScanLayer);
    // document.body.classList.toggle("prefers-reduced-motion", useLiteMode);
}

let currentLanguage = "es";
let introActivated = false;

const copyByLanguage = {
    en: {
        project: "Neurotrip_2026",
    },
    es: {
        project: "Neurotrip_2026",
    },
};

function setProjectTitles(text) {
    projectTitle.textContent = text;

    if (dockProjectTitle) {
        dockProjectTitle.textContent = text;
    }
}

function setLanguage(language) {
    currentLanguage = language;

    i18nNodes.forEach((node) => {
        const nextValue = node.dataset[language];

        if (!nextValue) {
            return;
        }

        // replace each block %[highlighted]Neuroaesthetics% with <span class="highlighted">Neuroaesthetics</span> (or the equivalent in the target language)
        const highlightedPattern = /%(.*?)\[(.*?)\](.*?)%/g;
        const formattedNextValue = nextValue.replace(highlightedPattern, '<$1 $2>$3</$1>');

        // replace chars with accent with their html entity equivalent to prevent issues with gsap text plugin
        const accentPattern = /[áéíóúÁÉÍÓÚñÑ]/g;
        const formattedNextValueWithAccents = formattedNextValue.replace(accentPattern, (match) => {
            const accentMap = {
                "á": "&aacute;",
                "é": "&eacute;",
                "í": "&iacute;",
                "ó": "&oacute;",
                "ú": "&uacute;",
                "Á": "&Aacute;",
                "É": "&Eacute;",
                "Í": "&Iacute;",
                "Ó": "&Oacute;",
                "Ú": "&Uacute;",
                "ñ": "&ntilde;",
                "Ñ": "&Ntilde;",
            };
            return accentMap[match] || match;
        });

        gsap.to(node, {
            opacity: 0,
            duration: prefersReducedMotion ? 0 : 0.16,
            onComplete: () => {
                node.innerHTML = formattedNextValue;
                gsap.to(node, {
                    opacity: 1,
                    duration: prefersReducedMotion ? 0 : 0.24,
                });
            },
        });
    });

    langOptions.forEach((option) => {
        option.classList.toggle("is-active", option.dataset.langOption === language);
    });


    setProjectTitles(copyByLanguage[language].project);

}

function revealProjectTitle() {

    projectTitle.classList.add("is-glitching");
    const nextTitle = copyByLanguage[currentLanguage].project;

    if (prefersReducedMotion) {
        setProjectTitles(nextTitle);
        projectTitle.classList.remove("is-glitching");
        return;
    }

    gsap.to(projectTitle, {
        duration: 1.4,
        text: nextTitle,
        ease: "none",
        onUpdate: () => {
            if (dockProjectTitle) {
                dockProjectTitle.textContent = projectTitle.textContent;
            }
        },
        onComplete: () => {
            setProjectTitles(nextTitle);
            window.setTimeout(() => {
                projectTitle.classList.remove("is-glitching");
            }, 700);
        },
    });
}

function dismissWarning() {
    modal.classList.remove("is-visible");
    document.body.classList.remove("modal-open");
    window.sessionStorage.setItem("neurotrip-warning-dismissed", "true");

    if (prefersReducedMotion) {
        revealProjectTitle();
        return;
    }

    gsap.delayedCall(2.4, revealProjectTitle);
}

function initializeModal() {
    const alreadyDismissed = window.sessionStorage.getItem("neurotrip-warning-dismissed") === "true";

    if (alreadyDismissed) {
        modal.classList.remove("is-visible");
        document.body.classList.remove("modal-open");
        revealProjectTitle();
        return;
    }

    document.body.classList.add("modal-open");

    if (!prefersReducedMotion) {
        gsap.fromTo(
            ".warning-panel",
            { y: 32, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }
        );
    }
}

function setupAmbientMotion() {

    gsap.utils.toArray(".glyph").forEach((glyph, index) => {
        gsap.to(glyph, {
            y: index % 2 === 0 ? -24 : 24,
            x: index % 3 === 0 ? 14 : -14,
            rotation: index % 2 === 0 ? -6 : 6,
            duration: 4 + index * 0.45,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
        });
    });

    gsap.utils.toArray(".orb").forEach((orb, index) => {
        gsap.to(orb, {
            x: index % 2 === 0 ? 36 : -28,
            y: index % 2 === 0 ? -22 : 26,
            scale: index % 2 === 0 ? 1.08 : 0.92,
            duration: 7 + index,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
        });
    });

    gsap.to(".wave-back", {
        attr: {
            d: "M0,250 C160,290 300,110 440,150 C580,190 660,290 780,282 C900,274 1020,108 1160,126 C1300,144 1380,230 1440,210",
        },
        duration: 7,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
    });

    gsap.to(".wave-front", {
        attr: {
            d: "M0,284 C170,350 290,138 460,160 C630,182 730,314 910,286 C1090,258 1210,126 1440,202",
        },
        duration: 5.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
    });
}

function setupScrollExperience() {

    const media = gsap.matchMedia();

    // if neurotrip-session-img is visible call strobeSimulator for each 3 pixels of scroll, otherwise do nothing
    media.add("(min-width: 300px)", () => {
        ScrollTrigger.create({
            trigger: '#neurotrip-session-img',
            //endTrigger: storyDetailScene,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => {
                console.log(`Scroll progress: ${self.progress.toFixed(2)}`);
                strobeSimulator();
            },
        });
    });
}

// console.log scroll position value on scroll
window.addEventListener("scroll", () => {


    strobeSimulator();

});

function setupBrandDockVisibility() {
    if (!titleDockBar || !introScene) {
        return;
    }

    const introExitOffset = 400;

    const setIntroOffscreenState = () => {
        const introBottom = introScene.getBoundingClientRect().bottom;
        document.body.classList.toggle("is-intro-offscreen", introBottom <= introExitOffset);
    };

    setIntroOffscreenState();
    window.addEventListener("scroll", setIntroOffscreenState, { passive: true });
    window.addEventListener("resize", setIntroOffscreenState);
}

function setupBrandMarkSceneJump() {

    // for every element of nextSectionTriggers, add a click event that scrolls to the section specified in its data-jump-to-section attribute
    nextSectionTriggers.forEach(trigger => {
        const targetSection = trigger.dataset.jumpToSection;
        const targetElement = document.querySelector(`[data-scene="${targetSection}"]`);
        const substractOffset = trigger.dataset.substractOffset ? parseInt(trigger.dataset.substractOffset) : 0; // adjust for some spacing from the top
        const addOffset = trigger.dataset.addOffset ? parseInt(trigger.dataset.addOffset) : 0; // adjust for some spacing from the top

        if (targetElement) {
            trigger.style.cursor = "pointer";

            trigger.addEventListener("click", () => {
                const targetY = targetElement.getBoundingClientRect().top + window.pageYOffset - substractOffset + addOffset;
                window.scrollTo(0, targetY);
            });
        }
    });
}


function strobeSimulator() {
    const neurotripSession = document.getElementById('neurotrip-session-img');

    // is neurotrip-session-img visible in the viewport?
    const rect = neurotripSession.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

    if (!isVisible) {
        return;
    }

    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;


    let brightness = getRandomInt(50, 200);
    let contrast = getRandomInt(50, 200);

    neurotripSession.style.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

}

langToggle.addEventListener("click", () => {
    console.log("Toggling language");
    setLanguage(currentLanguage === "en" ? "es" : "en");
});

dismissButton.addEventListener("click", dismissWarning);

applyLiteModeToggles();
setLanguage(currentLanguage);
initializeModal();
setupAmbientMotion();
setupBrandDockVisibility();
setupBrandMarkSceneJump();
//setupScrollExperience();