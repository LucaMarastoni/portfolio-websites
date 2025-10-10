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

  const targets = document.querySelectorAll("[data-depth]");
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
