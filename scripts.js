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
  const animateCount = (element) => {
    const target = parseFloat(element.dataset.target);
    if (Number.isNaN(target)) {
      return;
    }
    const start = parseFloat(element.dataset.start || "0");
    const suffix = element.dataset.suffix || "";
    const prefix = element.dataset.prefix || "";
    const decimals = parseInt(element.dataset.decimals || "0", 10);
    const duration = parseInt(element.dataset.duration || "1600", 10);
    const startTime = performance.now();

    const formatValue = (value) =>
      value.toLocaleString("it-IT", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = start + (target - start) * easedProgress;
      element.textContent = `${prefix}${formatValue(currentValue)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = `${prefix}${formatValue(target)}${suffix}`;
      }
    };

    requestAnimationFrame(step);
  };

  const counterObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.5,
      rootMargin: "0px 0px -20%",
    }
  );

  counters.forEach((counter) => {
    counter.textContent = `${counter.dataset.prefix || ""}${(
      parseFloat(counter.dataset.start || "0") || 0
    ).toLocaleString("it-IT", {
      minimumFractionDigits: parseInt(counter.dataset.decimals || "0", 10),
      maximumFractionDigits: parseInt(counter.dataset.decimals || "0", 10),
    })}${counter.dataset.suffix || ""}`;
    counterObserver.observe(counter);
  });
}
