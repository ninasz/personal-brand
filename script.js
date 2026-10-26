// Dark / Light mode toggle
const temaknapp = document.querySelector("#tema");
if (temaknapp) {
  temaknapp.hidden = false;
  // Initialize button text with emoji immediately on page load
  temaknapp.textContent = document.body.classList.contains("morkt")
    ? "Light mode ☀️"
    : "Dark mode 🌙";

  function bytTema() {
    document.body.classList.toggle("morkt");
    if (document.body.classList.contains("morkt")) {
      temaknapp.textContent = "Light mode ☀️";
    } else {
      temaknapp.textContent = "Dark mode 🌙";
    }
  }

  temaknapp.addEventListener("click", bytTema);
}

// Scroll fade-in animation
const fadeEls = document.querySelectorAll(".fade-in");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

fadeEls.forEach((el) => observer.observe(el));

// Customer Reviews Slider (Swipe + Arrows + Dots)
const reviewSlider = document.querySelector("#reviews-slider");
const reviewPrevBtn = document.querySelector("#review-prev");
const reviewNextBtn = document.querySelector("#review-next");
const reviewDots = document.querySelectorAll("#reviews-dots .dot");

if (reviewSlider && reviewPrevBtn && reviewNextBtn && reviewDots.length) {
  let currentReviewIndex = 0;
  let isScrollingProgrammatically = false;
  let scrollTimeout = null;

  function updateActiveDot(index) {
    reviewDots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });
  }

  function getDotScrollLeft(index) {
    const maxScroll = Math.max(0, reviewSlider.scrollWidth - reviewSlider.clientWidth);
    if (index <= 0) return 0;
    if (index >= reviewDots.length - 1) return maxScroll;

    const cards = reviewSlider.querySelectorAll(".review-card");
    if (cards[index]) {
      const cardLeft = cards[index].offsetLeft - reviewSlider.offsetLeft;
      return Math.min(Math.max(0, cardLeft), maxScroll);
    }
    return (maxScroll / (reviewDots.length - 1)) * index;
  }

  function goToReview(index) {
    currentReviewIndex = (index + reviewDots.length) % reviewDots.length;
    updateActiveDot(currentReviewIndex);

    const targetLeft = getDotScrollLeft(currentReviewIndex);
    isScrollingProgrammatically = true;
    reviewSlider.scrollTo({ left: targetLeft, behavior: "smooth" });

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      isScrollingProgrammatically = false;
    }, 450);
  }

  reviewPrevBtn.addEventListener("click", () => {
    goToReview(currentReviewIndex - 1);
  });

  reviewNextBtn.addEventListener("click", () => {
    goToReview(currentReviewIndex + 1);
  });

  reviewDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      goToReview(index);
    });
  });

  // Sync active dot with manual scroll / swipe
  reviewSlider.addEventListener(
    "scroll",
    () => {
      if (isScrollingProgrammatically) return;

      const currentScroll = reviewSlider.scrollLeft;
      let closestIndex = 0;
      let minDiff = Infinity;

      for (let i = 0; i < reviewDots.length; i++) {
        const target = getDotScrollLeft(i);
        const diff = Math.abs(currentScroll - target);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = i;
        }
      }

      if (closestIndex !== currentReviewIndex) {
        currentReviewIndex = closestIndex;
        updateActiveDot(closestIndex);
      }
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    const targetLeft = getDotScrollLeft(currentReviewIndex);
    reviewSlider.scrollTo({ left: targetLeft, behavior: "auto" });
  });
}

// ─── COOKIE CONSENT & GOOGLE ANALYTICS INTEGRATION ───
(function () {
  const banner = document.querySelector("#cookie-banner");
  if (!banner) return;

  const acceptAllBtn = document.querySelector("#cookie-accept-all");
  const acceptEssentialBtn = document.querySelector("#cookie-accept-essential");
  const closeBtn = document.querySelector("#cookie-close-btn");
  const toggleDetailsBtn = document.querySelector("#cookie-toggle-details");
  const detailsPanel = document.querySelector("#cookie-details-panel");
  const analyticsToggle = document.querySelector("#cookie-analytics-toggle");
  const openSettingsBtn = document.querySelector("#open-cookie-settings");

  const CONSENT_KEY = "ines_cookie_consent";

  function updateGtagConsent(analyticsGranted) {
    if (typeof gtag === "function") {
      gtag("consent", "update", {
        analytics_storage: analyticsGranted ? "granted" : "denied",
        ad_storage: analyticsGranted ? "granted" : "denied",
        ad_user_data: analyticsGranted ? "granted" : "denied",
        ad_personalization: analyticsGranted ? "granted" : "denied"
      });
    }
    if (window.dataLayer) {
      window.dataLayer.push({
        event: "consent_status_updated",
        analytics_status: analyticsGranted ? "granted" : "denied"
      });
    }
  }

  function showBanner() {
    banner.hidden = false;
    requestAnimationFrame(() => {
      banner.classList.add("show");
    });
  }

  function hideBanner() {
    banner.classList.remove("show");
    setTimeout(() => {
      banner.hidden = true;
    }, 360);
  }

  function saveConsent(type) {
    try {
      localStorage.setItem(CONSENT_KEY, type);
    } catch (e) { }

    const isAnalyticsAllowed = type === "all" || (type === "custom" && analyticsToggle && analyticsToggle.checked);
    updateGtagConsent(isAnalyticsAllowed);
    hideBanner();
  }

  // Check saved state on load
  let savedConsent = null;
  try {
    savedConsent = localStorage.getItem(CONSENT_KEY);
  } catch (e) { }

  if (!savedConsent) {
    setTimeout(showBanner, 600);
  } else {
    updateGtagConsent(savedConsent === "all");
    if (analyticsToggle) {
      analyticsToggle.checked = savedConsent === "all";
    }
  }

  if (acceptAllBtn) {
    acceptAllBtn.addEventListener("click", () => saveConsent("all"));
  }

  if (acceptEssentialBtn) {
    acceptEssentialBtn.addEventListener("click", () => saveConsent("essential"));
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      if (!savedConsent) {
        saveConsent("essential");
      } else {
        hideBanner();
      }
    });
  }

  if (toggleDetailsBtn && detailsPanel) {
    toggleDetailsBtn.addEventListener("click", () => {
      const isHidden = detailsPanel.hidden;
      detailsPanel.hidden = !isHidden;
      toggleDetailsBtn.textContent = isHidden ? "Hide details ▴" : "Customize settings ▾";
    });
  }

  if (openSettingsBtn) {
    openSettingsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showBanner();
      if (detailsPanel) {
        detailsPanel.hidden = false;
        if (toggleDetailsBtn) toggleDetailsBtn.textContent = "Hide details ▴";
      }
    });
  }
})();
