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
