const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
    rootMargin: "0px 0px -80px 0px",
  }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// Reactive particle background tuning.
const BG_CONFIG = {
  PARTICLE_COUNT: 110,
  SPEED: 0.28,
  RADIUS_MIN: 0.9,
  RADIUS_MAX: 2.6,
  ATTRACT_RADIUS: 220,
  ATTRACT_STRENGTH: 0.018,
  OVERLAY_OPACITY: 0.16,
  DPR_CAP: 1.75,
  SCROLL_PARALLAX: 26,
  PALETTE: {
    bgTop: "#0B0F14",
    bgBottom: "#121826",
    particleA: "46,230,198",
    particleB: "141,125,202",
  },
};

const setupReactiveBackground = () => {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) {
    return;
  }

  const root = document.documentElement;
  const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
  const supportsFinePointer =
    window.matchMedia("(pointer: fine)").matches && window.matchMedia("(hover: hover)").matches;

  const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
  if (!ctx) {
    root.classList.add("bg-fallback");
    canvas.style.display = "none";
    return;
  }

  root.classList.remove("bg-fallback");
  root.style.setProperty("--bg-overlay-opacity", String(BG_CONFIG.OVERLAY_OPACITY));

  let width = window.innerWidth;
  let height = window.innerHeight;
  let dpr = 1;
  let rafId = null;
  let resizeRafId = null;
  let running = false;
  let lastTime = 0;
  let scrollTarget = 0;
  let scrollCurrent = 0;
  let pointerActive = false;
  let lastTickBucket = -1;

  const pointer = {
    x: width * 0.5,
    y: height * 0.5,
    tx: width * 0.5,
    ty: height * 0.5,
  };

  const rand = (min, max) => min + Math.random() * (max - min);

  const particles = Array.from({ length: BG_CONFIG.PARTICLE_COUNT }, () => {
    const radius = rand(BG_CONFIG.RADIUS_MIN, BG_CONFIG.RADIUS_MAX);
    const depth = rand(0.2, 1);
    const drift = rand(0.85, 1.2);
    const angle = rand(0, Math.PI * 2);
    const speed = BG_CONFIG.SPEED * drift;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius,
      depth,
      alpha: rand(0.22, 0.72),
      tint: Math.random() < 0.5 ? BG_CONFIG.PALETTE.particleA : BG_CONFIG.PALETTE.particleB,
      twinkle: rand(0.4, 1.6),
      phase: rand(0, Math.PI * 2),
    };
  });

  const resizeCanvas = () => {
    dpr = Math.min(window.devicePixelRatio || 1, BG_CONFIG.DPR_CAP);
    width = window.innerWidth;
    height = window.innerHeight;

    const nextWidth = Math.max(1, Math.round(width * dpr));
    const nextHeight = Math.max(1, Math.round(height * dpr));

    if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
      canvas.width = nextWidth;
      canvas.height = nextHeight;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pointer.x = Math.min(pointer.x, width);
    pointer.y = Math.min(pointer.y, height);
    pointer.tx = pointer.x;
    pointer.ty = pointer.y;
  };

  const drawBackdrop = () => {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, BG_CONFIG.PALETTE.bgTop);
    gradient.addColorStop(1, BG_CONFIG.PALETTE.bgBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  };

  const drawVignette = () => {
    const vignette = ctx.createRadialGradient(
      width * 0.5,
      height * 0.5,
      Math.min(width, height) * 0.24,
      width * 0.5,
      height * 0.5,
      Math.max(width, height) * 0.78
    );
    vignette.addColorStop(0, "rgba(3, 8, 18, 0)");
    vignette.addColorStop(1, "rgba(2, 4, 10, 0.52)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
  };

  const updatePointer = () => {
    pointer.x += (pointer.tx - pointer.x) * 0.14;
    pointer.y += (pointer.ty - pointer.y) * 0.14;
  };

  const updateParticles = (dt, t) => {
    const influenceRadiusSq = BG_CONFIG.ATTRACT_RADIUS * BG_CONFIG.ATTRACT_RADIUS;
    scrollCurrent += (scrollTarget - scrollCurrent) * 0.08;

    particles.forEach((p) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.x < -28) {
        p.x = width + 28;
      } else if (p.x > width + 28) {
        p.x = -28;
      }

      if (p.y < -28) {
        p.y = height + 28;
      } else if (p.y > height + 28) {
        p.y = -28;
      }

      if (supportsFinePointer && pointerActive) {
        const dx = pointer.x - p.x;
        const dy = pointer.y - p.y;
        const distSq = dx * dx + dy * dy;

        if (distSq > 1 && distSq < influenceRadiusSq) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / BG_CONFIG.ATTRACT_RADIUS) * BG_CONFIG.ATTRACT_STRENGTH;
          const nx = dx / dist;
          const ny = dy / dist;
          p.vx += nx * force * 12;
          p.vy += ny * force * 12;
        }
      }

      p.vx *= 0.994;
      p.vy *= 0.994;

      const speedLimit = BG_CONFIG.SPEED * 2.8;
      const speedSq = p.vx * p.vx + p.vy * p.vy;
      if (speedSq > speedLimit * speedLimit) {
        const speed = Math.sqrt(speedSq);
        p.vx = (p.vx / speed) * speedLimit;
        p.vy = (p.vy / speed) * speedLimit;
      }

      const twinkle = 0.6 + 0.4 * Math.sin(t * p.twinkle + p.phase);
      const py = p.y + scrollCurrent * p.depth * BG_CONFIG.SCROLL_PARALLAX;
      const alpha = p.alpha * twinkle;
      const glowRadius = p.radius * (2.6 + p.depth * 1.3);

      const glow = ctx.createRadialGradient(p.x, py, 0, p.x, py, glowRadius);
      glow.addColorStop(0, `rgba(${p.tint}, ${alpha * 0.22})`);
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, py, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(${p.tint}, ${Math.min(alpha * 0.9, 0.88)})`;
      ctx.beginPath();
      ctx.arc(p.x, py, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawFrame = (timeMs) => {
    const t = timeMs * 0.001;
    if (!lastTime) {
      lastTime = timeMs;
    }

    const dt = Math.min((timeMs - lastTime) / 16.6667, 2.1);
    lastTime = timeMs;

    updatePointer();
    drawBackdrop();
    updateParticles(dt, t);
    drawVignette();
  };

  const render = (timeMs) => {
    if (!running) {
      return;
    }

    const bucket = Math.floor(timeMs / 2000);
    if (bucket !== lastTickBucket) {
      lastTickBucket = bucket;
      console.log("BG tick", (timeMs * 0.001).toFixed(2));
    }

    drawFrame(timeMs);
    rafId = requestAnimationFrame(render);
  };

  const stop = () => {
    running = false;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const start = () => {
    if (running || reducedMotionMedia.matches || document.visibilityState === "hidden") {
      return;
    }
    running = true;
    rafId = requestAnimationFrame(render);
  };

  const drawStatic = () => {
    stop();
    drawFrame(performance.now());
  };

  const handleResize = () => {
    if (resizeRafId !== null) {
      return;
    }

    resizeRafId = requestAnimationFrame(() => {
      resizeRafId = null;
      resizeCanvas();
      drawStatic();
      if (!reducedMotionMedia.matches && document.visibilityState === "visible") {
        start();
      }
    });
  };

  const handleVisibility = () => {
    if (document.visibilityState === "hidden") {
      stop();
      return;
    }

    if (reducedMotionMedia.matches) {
      drawStatic();
      return;
    }

    start();
  };

  const handleMotionChange = () => {
    if (reducedMotionMedia.matches) {
      drawStatic();
    } else if (document.visibilityState === "visible") {
      start();
    }
  };

  const handlePointerMove = (event) => {
    if (!supportsFinePointer) {
      return;
    }

    pointerActive = true;
    pointer.tx = event.clientX;
    pointer.ty = event.clientY;
  };

  const handlePointerLeave = () => {
    pointerActive = false;
    pointer.tx = width * 0.5;
    pointer.ty = height * 0.5;
  };

  const handleScroll = () => {
    const scrollable = document.body.scrollHeight - window.innerHeight;
    if (scrollable <= 0) {
      scrollTarget = 0;
      return;
    }
    scrollTarget = window.scrollY / scrollable - 0.5;
  };

  resizeCanvas();
  drawStatic();
  handleScroll();

  window.addEventListener("resize", handleResize, { passive: true });
  document.addEventListener("visibilitychange", handleVisibility);
  window.addEventListener("scroll", handleScroll, { passive: true });

  if (supportsFinePointer) {
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("blur", handlePointerLeave);
  }

  if (typeof reducedMotionMedia.addEventListener === "function") {
    reducedMotionMedia.addEventListener("change", handleMotionChange);
  } else if (typeof reducedMotionMedia.addListener === "function") {
    reducedMotionMedia.addListener(handleMotionChange);
  }

  if (!reducedMotionMedia.matches && document.visibilityState === "visible") {
    start();
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupReactiveBackground, { once: true });
} else {
  setupReactiveBackground();
}

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Header scroll state.
const header = document.querySelector(".header");
if (header) {
  let headerTicking = false;
  const setHeaderState = () => {
    headerTicking = false;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  const onHeaderScroll = () => {
    if (headerTicking) {
      return;
    }
    headerTicking = true;
    requestAnimationFrame(setHeaderState);
  };

  setHeaderState();
  window.addEventListener("scroll", onHeaderScroll, { passive: true });
  window.addEventListener("resize", setHeaderState);
}

const rotatingWord = document.querySelector("[data-rotate]");

if (rotatingWord) {
  const parseWords = (value) => {
    if (!value) {
      return [];
    }

    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((word) => String(word).trim()).filter(Boolean);
      }
    } catch (error) {
      return value
        .split(",")
        .map((word) => word.trim())
        .filter(Boolean);
    }

    return [];
  };

  const words = parseWords(rotatingWord.dataset.rotate);

  if (words.length) {
    const uniqueWords = Array.from(new Set(words));
    const initialWord = uniqueWords[0];

    rotatingWord.textContent = initialWord;

    const interval = parseInt(rotatingWord.dataset.interval || "1500", 10);
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!prefersReducedMotion && uniqueWords.length > 1 && interval > 0) {
      const fadeDuration = 320;
      let index = 0;

      window.setInterval(() => {
        rotatingWord.classList.add("is-fading");

        window.setTimeout(() => {
          index = (index + 1) % uniqueWords.length;
          rotatingWord.textContent = uniqueWords[index];
          rotatingWord.classList.remove("is-fading");
        }, fadeDuration);
      }, interval);
    }
  }
}

const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

const counters = document.querySelectorAll(".metric-value[data-target]");

if (counters.length) {
  const formatNumber = (value, decimals) =>
    value.toLocaleString("it-IT", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

  const setInitialValue = (element) => {
    const decimals = parseInt(element.dataset.decimals || "0", 10);
    const prefix = element.dataset.prefix || "";
    const suffix = element.dataset.suffix || "";
    const startValue = parseFloat(element.dataset.start || "0") || 0;
    element.textContent = `${prefix}${formatNumber(startValue, decimals)}${suffix}`;
  };

  const animateCount = (element) => {
    const target = parseFloat(element.dataset.target);
    if (Number.isNaN(target)) {
      return;
    }

    const startValue = parseFloat(element.dataset.start || "0") || 0;
    const suffix = element.dataset.suffix || "";
    const prefix = element.dataset.prefix || "";
    const decimals = parseInt(element.dataset.decimals || "0", 10);
    const duration = parseInt(element.dataset.duration || "3600", 10);
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (target - startValue) * easedProgress;
      element.textContent = `${prefix}${formatNumber(currentValue, decimals)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = `${prefix}${formatNumber(target, decimals)}${suffix}`;
      }
    };

    requestAnimationFrame(step);
  };

  counters.forEach((counter) => {
    setInitialValue(counter);
  });

  const startCounters = () => {
    counters.forEach((counter) => {
      if (counter.dataset.animated === "true") {
        return;
      }

      counter.dataset.animated = "true";
      animateCount(counter);
    });
  };

  const triggerCounts = () => {
    requestAnimationFrame(startCounters);
  };

  if (document.readyState === "complete" || document.readyState === "interactive") {
    triggerCounts();
  } else {
    document.addEventListener("DOMContentLoaded", triggerCounts, { once: true });
  }
}

// Metrics inline (mobile).
const metricsInline = document.querySelector(".metrics-inline");
if (metricsInline) {
  const items = Array.from(document.querySelectorAll(".metrics li"));

  const formatInlineNumber = (value, decimals) =>
    value.toLocaleString("it-IT", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

  metricsInline.textContent = "";

  items.forEach((item) => {
    const value = item.querySelector(".metric-value");
    const label =
      item.querySelector(".metric-label-short") || item.querySelector(".metric-label");

    if (!value || !label) {
      return;
    }

    const decimals = parseInt(value.dataset.decimals || "0", 10);
    const prefix = value.dataset.prefix || "";
    const suffix = value.dataset.suffix || "";
    const targetValue = parseFloat(value.dataset.target || value.textContent || "0");
    const formatted = Number.isFinite(targetValue)
      ? formatInlineNumber(targetValue, decimals)
      : value.textContent.trim();

    const itemSpan = document.createElement("span");
    itemSpan.className = "metrics-inline-item";

    const valueSpan = document.createElement("span");
    valueSpan.className = "metrics-inline-value";
    valueSpan.textContent = `${prefix}${formatted}${suffix}`;

    const labelSpan = document.createElement("span");
    labelSpan.className = "metrics-inline-label";
    labelSpan.textContent = label.textContent.trim();

    itemSpan.append(valueSpan, " ", labelSpan);
    metricsInline.appendChild(itemSpan);
  });
}

const modalTriggers = document.querySelectorAll("[data-modal-target]");
const modals = document.querySelectorAll(".modal-backdrop");
let activeModal = null;
let lastFocusedElement = null;
const focusableSelectors =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

const getFocusableElements = (modal) =>
  Array.from(modal.querySelectorAll(focusableSelectors));

const openModal = (modal) => {
  if (!modal) {
    return;
  }

  activeModal = modal;
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  const focusable = getFocusableElements(modal);
  if (focusable.length) {
    focusable[0].focus();
  } else {
    const dialog = modal.querySelector(".modal-dialog");
    if (dialog) {
      dialog.focus();
    }
  }
};

const closeModal = (modal) => {
  if (!modal) {
    return;
  }

  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");

  if (modal === activeModal) {
    activeModal = null;
    document.body.classList.remove("modal-open");

    if (lastFocusedElement) {
      lastFocusedElement.focus();
      lastFocusedElement = null;
    }
  }
};

modalTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const targetSelector = trigger.dataset.modalTarget;
    const targetModal = document.querySelector(targetSelector);
    if (!targetModal) {
      return;
    }
    lastFocusedElement = trigger;
    openModal(targetModal);
  });
});

document.querySelectorAll("[data-dismiss-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    const modal = button.closest(".modal-backdrop");
    closeModal(modal);
  });
});

modals.forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal(modal);
    }
  });
});

const handleKeydown = (event) => {
  if (!activeModal) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    closeModal(activeModal);
    return;
  }

  if (event.key === "Tab") {
    const focusable = getFocusableElements(activeModal);

    if (!focusable.length) {
      event.preventDefault();
      const dialog = activeModal.querySelector(".modal-dialog");
      if (dialog) {
        dialog.focus();
      }
      return;
    }

    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
};

document.addEventListener("keydown", handleKeydown);

// Interactive parallax for background cubes.
const createParallaxController = (elements) => {
  const items = Array.from(elements);

  if (!items.length) {
    return () => {};
  }

  let pointerX = 0;
  let pointerY = 0;
  let scrollProgress = 0;
  let frameId = null;

  const applyTransforms = () => {
    frameId = null;
    const pointerStrength = 1.2;
    const scrollStrength = 0.8;
    const tiltStrength = 0.28;

    const pointerOffsetX = pointerX * pointerStrength;
    const pointerOffsetY = pointerY * pointerStrength;
    const combinedYOffset = pointerOffsetY + scrollProgress * scrollStrength;

    items.forEach((item) => {
      const depth = parseFloat(item.dataset.depth || "0");
      if (!Number.isFinite(depth)) {
        return;
      }

      const moveX = pointerOffsetX * depth;
      const moveY = combinedYOffset * depth;

      item.style.setProperty("--parallax-x", `${moveX}px`);
      item.style.setProperty("--parallax-y", `${moveY}px`);

      if (item.dataset.tilt !== "false") {
        const rotateX = -(pointerOffsetY * depth) * tiltStrength;
        const rotateY = (pointerOffsetX * depth) * tiltStrength;
        item.style.setProperty("--parallax-rotate-x", `${rotateX}deg`);
        item.style.setProperty("--parallax-rotate-y", `${rotateY}deg`);
      } else {
        item.style.setProperty("--parallax-rotate-x", "0deg");
        item.style.setProperty("--parallax-rotate-y", "0deg");
      }
    });
  };

  const scheduleUpdate = () => {
    if (frameId !== null) {
      return;
    }
    frameId = requestAnimationFrame(applyTransforms);
  };

  const handlePointerMove = (event) => {
    pointerX = event.clientX / window.innerWidth - 0.5;
    pointerY = event.clientY / window.innerHeight - 0.5;
    scheduleUpdate();
  };

  const resetPointer = () => {
    pointerX = 0;
    pointerY = 0;
    scheduleUpdate();
  };

  const handlePointerLeave = () => {
    resetPointer();
  };

  const updateScrollProgress = () => {
    const scrollHeight = document.body.scrollHeight - window.innerHeight;
    scrollProgress = scrollHeight > 0 ? window.scrollY / scrollHeight - 0.5 : 0;
    scheduleUpdate();
  };

  const pointerLeaveTarget = document.body;

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", resetPointer);
  window.addEventListener("pointercancel", resetPointer);
  window.addEventListener("blur", resetPointer);
  window.addEventListener("scroll", updateScrollProgress, { passive: true });

  if (pointerLeaveTarget) {
    pointerLeaveTarget.addEventListener("pointerleave", handlePointerLeave);
  }

  updateScrollProgress();
  scheduleUpdate();

  return () => {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", resetPointer);
    window.removeEventListener("pointercancel", resetPointer);
    window.removeEventListener("blur", resetPointer);
    window.removeEventListener("scroll", updateScrollProgress);
    if (pointerLeaveTarget) {
      pointerLeaveTarget.removeEventListener("pointerleave", handlePointerLeave);
    }
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
    }
    items.forEach((item) => {
      item.style.removeProperty("--parallax-x");
      item.style.removeProperty("--parallax-y");
      item.style.removeProperty("--parallax-rotate-x");
      item.style.removeProperty("--parallax-rotate-y");
    });
  };
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let teardownParallax = null;

const hydrateParallax = () => {
  if (teardownParallax) {
    teardownParallax();
    teardownParallax = null;
  }

  if (prefersReducedMotion.matches) {
    return;
  }

  const targets = Array.from(document.querySelectorAll("[data-depth]")).filter((target) => {
    const styles = window.getComputedStyle(target);
    return styles.display !== "none" && styles.visibility !== "hidden";
  });
  if (!targets.length) {
    return;
  }

  teardownParallax = createParallaxController(targets);
};

hydrateParallax();

const handleMotionPreferenceChange = () => {
  hydrateParallax();
};

if (typeof prefersReducedMotion.addEventListener === "function") {
  prefersReducedMotion.addEventListener("change", handleMotionPreferenceChange);
} else if (typeof prefersReducedMotion.addListener === "function") {
  prefersReducedMotion.addListener(handleMotionPreferenceChange);
}

// Timeline progress rail + step highlights.
let teardownTimelineProgress = null;

const setupTimelineProgress = () => {
  const section = document.querySelector("#process");
  if (!section) {
    return () => {};
  }

  const timeline = section.querySelector(".timeline");
  const rail = section.querySelector(".timeline-rail");
  const activeRail = section.querySelector(".timeline-rail-active");
  const steps = Array.from(section.querySelectorAll(".timeline-item"));
  if (!timeline || !rail || !activeRail) {
    return () => {};
  }

  if (prefersReducedMotion.matches) {
    activeRail.style.transform = "scaleY(1)";
    steps.forEach((step) => step.classList.add("is-complete"));
    return () => {};
  }

  let rafId = null;
  let railHeight = 0;
  let railOffset = 0;
  let dotCenter = 0;
  let dotSize = 0;
  let stepOffsets = [];

  const updateMeasurements = () => {
    const timelineRect = timeline.getBoundingClientRect();
    const railRect = rail.getBoundingClientRect();
    railHeight = railRect.height || rail.offsetHeight;
    railOffset = railRect.top - timelineRect.top;

    const styles = window.getComputedStyle(timeline);
    const dotTop = parseFloat(styles.getPropertyValue("--dot-top")) || 24;
    dotSize = parseFloat(styles.getPropertyValue("--dot-size")) || 10;
    dotCenter = dotTop + dotSize / 2;

    stepOffsets = steps.map((step) => step.offsetTop + dotCenter - railOffset);
  };

  const updateProgress = () => {
    rafId = null;
    const rect = timeline.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    if (rect.height <= 0) {
      return;
    }

    if (!railHeight || stepOffsets.length !== steps.length) {
      updateMeasurements();
    }

    const start = viewportHeight * 0.85;
    const end = viewportHeight * 0.2;
    const total = rect.height + start - end;
    if (total <= 0) {
      activeRail.style.transform = "scaleY(0)";
      return;
    }

    const progress = (start - rect.top) / total;
    const clamped = Math.min(Math.max(progress, 0), 1);
    activeRail.style.transform = `scaleY(${clamped.toFixed(3)})`;

    const filled = railHeight * clamped;
    steps.forEach((step, index) => {
      const offset = stepOffsets[index] || 0;
      const isComplete = filled >= offset - dotSize * 0.2;
      step.classList.toggle("is-complete", isComplete);
    });
  };

  const requestUpdate = () => {
    if (rafId !== null) {
      return;
    }
    rafId = requestAnimationFrame(updateProgress);
  };

  const handleResize = () => {
    updateMeasurements();
    requestUpdate();
  };

  updateMeasurements();
  requestUpdate();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("scroll", requestUpdate);
    window.removeEventListener("resize", handleResize);
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
  };
};

const hydrateTimelineProgress = () => {
  if (teardownTimelineProgress) {
    teardownTimelineProgress();
    teardownTimelineProgress = null;
  }

  teardownTimelineProgress = setupTimelineProgress();
};

hydrateTimelineProgress();

const handleTimelineMotionPreferenceChange = () => {
  hydrateTimelineProgress();
};

if (typeof prefersReducedMotion.addEventListener === "function") {
  prefersReducedMotion.addEventListener("change", handleTimelineMotionPreferenceChange);
} else if (typeof prefersReducedMotion.addListener === "function") {
  prefersReducedMotion.addListener(handleTimelineMotionPreferenceChange);
}

const setupTimelineStepObserver = () => {
  const items = Array.from(document.querySelectorAll("#process .timeline-item"));
  if (!items.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-active"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-active", entry.isIntersecting);
      });
    },
    {
      threshold: 0.45,
    }
  );

  items.forEach((item) => observer.observe(item));
};

setupTimelineStepObserver();

const ensureProjectVideoAutoplay = () => {
  const shouldReduceMotion = typeof prefersReducedMotion !== "undefined" && prefersReducedMotion.matches;

  document.querySelectorAll(".card-thumb video").forEach((video) => {
    const forceAutoplay =
      video.dataset.forceAutoplay === "true" || video.hasAttribute("data-force-autoplay");

    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;

    if (!video.hasAttribute("muted")) {
      video.setAttribute("muted", "");
    }
    if (!video.hasAttribute("autoplay")) {
      video.setAttribute("autoplay", "");
    }
    if (!video.hasAttribute("loop")) {
      video.setAttribute("loop", "");
    }
    if (!video.hasAttribute("playsinline")) {
      video.setAttribute("playsinline", "");
    }

    if (shouldReduceMotion && !forceAutoplay) {
      if (typeof video._loopPauseTimeoutId === "number") {
        clearTimeout(video._loopPauseTimeoutId);
        video._loopPauseTimeoutId = undefined;
      }
      video.pause();
      return;
    }

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  });
};

const setupLoopWithPause = () => {
  document.querySelectorAll("video[data-loop-pause]").forEach((video) => {
    const pauseDuration = parseInt(video.dataset.loopPause || "0", 10);
    if (!Number.isFinite(pauseDuration) || pauseDuration < 0) {
      return;
    }

    const scheduleReplay = () => {
      if (typeof video._loopPauseTimeoutId === "number") {
        clearTimeout(video._loopPauseTimeoutId);
        video._loopPauseTimeoutId = undefined;
      }

      video.currentTime = 0;
      video._loopPauseTimeoutId = window.setTimeout(() => {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      }, pauseDuration);
    };

    video.addEventListener("ended", scheduleReplay);

    const clearPendingReplay = () => {
      if (typeof video._loopPauseTimeoutId === "number") {
        clearTimeout(video._loopPauseTimeoutId);
        video._loopPauseTimeoutId = undefined;
      }
    };

    video.addEventListener("play", clearPendingReplay);

    video.addEventListener("pause", () => {
      if (!video.ended) {
        clearPendingReplay();
      }
    });
  });
};

const initializeProjectVideos = () => {
  ensureProjectVideoAutoplay();
  setupLoopWithPause();
};

if (document.readyState === "complete" || document.readyState === "interactive") {
  initializeProjectVideos();
} else {
  document.addEventListener("DOMContentLoaded", initializeProjectVideos, { once: true });
}

const handleVideoMotionPreferenceChange = () => {
  ensureProjectVideoAutoplay();
};

if (typeof prefersReducedMotion.addEventListener === "function") {
  prefersReducedMotion.addEventListener("change", handleVideoMotionPreferenceChange);
} else if (typeof prefersReducedMotion.addListener === "function") {
  prefersReducedMotion.addListener(handleVideoMotionPreferenceChange);
}

let teardownCursorFollower = null;

const setupCursorFollower = () => {
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;

  if (!finePointer || !canHover || prefersReducedMotion.matches) {
    return () => {};
  }

  const DOT_SMOOTHNESS = 0.2;
  const BORDER_DOT_SMOOTHNESS = 0.1;
  const INTERACTIVE_SELECTOR = "a, button, img, input, textarea, select";

  const layer = document.createElement("div");
  layer.className = "cursor-layer";
  layer.setAttribute("aria-hidden", "true");

  const dot = document.createElement("div");
  dot.className = "cursor-dot";

  const borderDot = document.createElement("div");
  borderDot.className = "cursor-ring";

  layer.appendChild(dot);
  layer.appendChild(borderDot);
  document.body.appendChild(layer);

  const centerX = window.innerWidth * 0.5;
  const centerY = window.innerHeight * 0.5;
  const mousePosition = { x: centerX, y: centerY };
  const dotPosition = { x: centerX, y: centerY };
  const borderDotPosition = { x: centerX, y: centerY };

  let isVisible = false;
  let isHovering = false;
  let animationId = null;

  const lerp = (start, end, factor) => start + (end - start) * factor;

  const setHoverState = (nextState) => {
    if (isHovering === nextState) {
      return;
    }
    isHovering = nextState;
    layer.classList.toggle("is-hovering", isHovering);
  };

  const syncPositions = () => {
    dot.style.transform = `translate3d(${dotPosition.x}px, ${dotPosition.y}px, 0) translate(-50%, -50%)`;
    borderDot.style.transform = `translate3d(${borderDotPosition.x}px, ${borderDotPosition.y}px, 0) translate(-50%, -50%)`;
  };

  const animate = () => {
    dotPosition.x = lerp(dotPosition.x, mousePosition.x, DOT_SMOOTHNESS);
    dotPosition.y = lerp(dotPosition.y, mousePosition.y, DOT_SMOOTHNESS);
    borderDotPosition.x = lerp(borderDotPosition.x, mousePosition.x, BORDER_DOT_SMOOTHNESS);
    borderDotPosition.y = lerp(borderDotPosition.y, mousePosition.y, BORDER_DOT_SMOOTHNESS);
    syncPositions();
    animationId = requestAnimationFrame(animate);
  };

  const onMouseMove = (event) => {
    mousePosition.x = event.clientX;
    mousePosition.y = event.clientY;
    if (!isVisible) {
      isVisible = true;
      layer.classList.add("is-visible");
    }
  };

  const onPointerOver = (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    if (event.target.closest(INTERACTIVE_SELECTOR)) {
      setHoverState(true);
    }
  };

  const onPointerOut = (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    if (!event.target.closest(INTERACTIVE_SELECTOR)) {
      return;
    }
    if (event.relatedTarget instanceof Element && event.relatedTarget.closest(INTERACTIVE_SELECTOR)) {
      return;
    }
    setHoverState(false);
  };

  const onPointerLeaveViewport = () => {
    layer.classList.remove("is-visible");
    isVisible = false;
    setHoverState(false);
  };

  syncPositions();
  animationId = requestAnimationFrame(animate);

  const pointerLeaveTarget = document.body;
  window.addEventListener("mousemove", onMouseMove, { passive: true });
  document.addEventListener("mouseover", onPointerOver);
  document.addEventListener("mouseout", onPointerOut);
  window.addEventListener("blur", onPointerLeaveViewport);
  if (pointerLeaveTarget) {
    pointerLeaveTarget.addEventListener("mouseleave", onPointerLeaveViewport);
  }

  return () => {
    window.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseover", onPointerOver);
    document.removeEventListener("mouseout", onPointerOut);
    window.removeEventListener("blur", onPointerLeaveViewport);
    if (pointerLeaveTarget) {
      pointerLeaveTarget.removeEventListener("mouseleave", onPointerLeaveViewport);
    }
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    layer.remove();
  };
};

const hydrateCursorFollower = () => {
  if (teardownCursorFollower) {
    teardownCursorFollower();
    teardownCursorFollower = null;
  }

  teardownCursorFollower = setupCursorFollower();
};

hydrateCursorFollower();

const handleCursorMotionPreferenceChange = () => {
  hydrateCursorFollower();
};

if (typeof prefersReducedMotion.addEventListener === "function") {
  prefersReducedMotion.addEventListener("change", handleCursorMotionPreferenceChange);
} else if (typeof prefersReducedMotion.addListener === "function") {
  prefersReducedMotion.addListener(handleCursorMotionPreferenceChange);
}

// Services accordion (mobile-first).
let teardownServiceAccordions = null;
const serviceAccordionMedia = window.matchMedia("(max-width: 720px)");
const coarsePointerMedia = window.matchMedia("(hover: none), (pointer: coarse)");

const setupServiceAccordions = () => {
  const cards = Array.from(document.querySelectorAll(".service-card"));
  if (!cards.length) {
    return () => {};
  }

  const shouldCollapse = serviceAccordionMedia.matches || coarsePointerMedia.matches;
  const cleanups = [];

  cards.forEach((card) => {
    const toggle = card.querySelector(".service-toggle");
    const details = card.querySelector(".service-details");

    if (!toggle || !details) {
      return;
    }

    if (!shouldCollapse) {
      card.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      details.removeAttribute("aria-hidden");
      return;
    }

    details.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "Dettagli";

    const handleToggle = () => {
      const isOpen = card.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      details.setAttribute("aria-hidden", isOpen ? "false" : "true");
      toggle.textContent = isOpen ? "Chiudi" : "Dettagli";
    };

    toggle.addEventListener("click", handleToggle);
    cleanups.push(() => toggle.removeEventListener("click", handleToggle));
  });

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
};

const hydrateServiceAccordions = () => {
  if (teardownServiceAccordions) {
    teardownServiceAccordions();
    teardownServiceAccordions = null;
  }

  teardownServiceAccordions = setupServiceAccordions();
};

hydrateServiceAccordions();

const handleServiceAccordionChange = () => {
  hydrateServiceAccordions();
};

if (typeof serviceAccordionMedia.addEventListener === "function") {
  serviceAccordionMedia.addEventListener("change", handleServiceAccordionChange);
  coarsePointerMedia.addEventListener("change", handleServiceAccordionChange);
} else if (typeof serviceAccordionMedia.addListener === "function") {
  serviceAccordionMedia.addListener(handleServiceAccordionChange);
  coarsePointerMedia.addListener(handleServiceAccordionChange);
}

// Service cards spotlight + tilt interaction on fine pointers.
let teardownServiceCardFx = null;
const serviceCardFxMedia = window.matchMedia("(hover: hover) and (pointer: fine)");

const setupServiceCardFx = () => {
  const cards = Array.from(document.querySelectorAll(".service-card"));
  if (!cards.length || prefersReducedMotion.matches || !serviceCardFxMedia.matches) {
    cards.forEach((card) => {
      card.style.removeProperty("--service-spot-x");
      card.style.removeProperty("--service-spot-y");
      card.style.removeProperty("--service-tilt-x");
      card.style.removeProperty("--service-tilt-y");
    });
    return () => {};
  }

  const cleanups = [];

  cards.forEach((card) => {
    const resetCard = () => {
      card.style.setProperty("--service-spot-x", "50%");
      card.style.setProperty("--service-spot-y", "14%");
      card.style.setProperty("--service-tilt-x", "0deg");
      card.style.setProperty("--service-tilt-y", "0deg");
    };

    const handlePointerMove = (event) => {
      const rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }

      const pointerX = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
      const pointerY = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);
      const tiltX = (0.5 - pointerY) * 4;
      const tiltY = (pointerX - 0.5) * 7;

      card.style.setProperty("--service-spot-x", `${(pointerX * 100).toFixed(1)}%`);
      card.style.setProperty("--service-spot-y", `${(pointerY * 100).toFixed(1)}%`);
      card.style.setProperty("--service-tilt-x", `${tiltX.toFixed(2)}deg`);
      card.style.setProperty("--service-tilt-y", `${tiltY.toFixed(2)}deg`);
    };

    resetCard();
    card.addEventListener("pointermove", handlePointerMove);
    card.addEventListener("pointerleave", resetCard);
    card.addEventListener("pointercancel", resetCard);
    card.addEventListener("pointerup", resetCard);

    cleanups.push(() => {
      card.removeEventListener("pointermove", handlePointerMove);
      card.removeEventListener("pointerleave", resetCard);
      card.removeEventListener("pointercancel", resetCard);
      card.removeEventListener("pointerup", resetCard);
      card.style.removeProperty("--service-spot-x");
      card.style.removeProperty("--service-spot-y");
      card.style.removeProperty("--service-tilt-x");
      card.style.removeProperty("--service-tilt-y");
    });
  });

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
};

const hydrateServiceCardFx = () => {
  if (teardownServiceCardFx) {
    teardownServiceCardFx();
    teardownServiceCardFx = null;
  }

  teardownServiceCardFx = setupServiceCardFx();
};

hydrateServiceCardFx();

const handleServiceCardFxChange = () => {
  hydrateServiceCardFx();
};

if (
  typeof serviceCardFxMedia.addEventListener === "function" &&
  typeof prefersReducedMotion.addEventListener === "function"
) {
  serviceCardFxMedia.addEventListener("change", handleServiceCardFxChange);
  prefersReducedMotion.addEventListener("change", handleServiceCardFxChange);
} else if (
  typeof serviceCardFxMedia.addListener === "function" &&
  typeof prefersReducedMotion.addListener === "function"
) {
  serviceCardFxMedia.addListener(handleServiceCardFxChange);
  prefersReducedMotion.addListener(handleServiceCardFxChange);
}
