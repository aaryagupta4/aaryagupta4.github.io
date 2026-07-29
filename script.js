// A small star field. Restrained on purpose: static positions,
// only a very slow twinkle. No mouse-follow, no parallax.
(function () {
  const canvas = document.getElementById("stars");
  if (!canvas) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let stars = [];

  function readInk() {
    // Sample the current --star colour so the field flips with the theme.
    const cs = getComputedStyle(document.documentElement);
    return cs.getPropertyValue("--star").trim() || "#a89ee8";
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    // Density scaled to viewport, with a soft cap so it never gets busy.
    const count = Math.min(140, Math.floor((width * height) / 14000));
    stars = new Array(count).fill(0).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.1 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.15 + Math.random() * 0.25, // slow
    }));
  }

  let colour = readInk();
  function draw(t) {
    ctx.clearRect(0, 0, width, height);
    const time = t / 1000;
    for (const s of stars) {
      const alpha = 0.35 + 0.35 * Math.sin(s.phase + time * s.speed);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = colour;
      ctx.globalAlpha = alpha;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize, { passive: true });
  // Re-sample colour when the OS theme flips.
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener?.("change", () => {
    colour = readInk();
  });

  resize();
  requestAnimationFrame(draw);
})();

// Gentle reveal-on-scroll.
(function () {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
  );

  const targets = document.querySelectorAll("section, .hero, .tiles, footer");
  for (const t of targets) {
    t.classList.add("reveal");
    io.observe(t);
  }
})();
