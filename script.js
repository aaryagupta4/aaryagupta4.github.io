/* ============================================================
   1. Home page: star-field canvas + scroll-to-reveal
============================================================ */
(function () {
  const canvas = document.getElementById("star-bg");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width = 0, height = 0, stars = [];
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(220, Math.floor((width * height) / 8000));
    stars = new Array(count).fill(0).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.4 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.15 + Math.random() * 0.4,
      hue: Math.random() < 0.15 ? "amber" : (Math.random() < 0.1 ? "red" : "white"),
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, width, height);
    const time = t / 1000;
    for (const s of stars) {
      const alpha = 0.25 + 0.5 * Math.sin(s.phase + time * s.speed);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      if (s.hue === "amber")      ctx.fillStyle = "#e8b45f";
      else if (s.hue === "red")   ctx.fillStyle = "#d97070";
      else                        ctx.fillStyle = "#f4ead1";
      ctx.globalAlpha = alpha;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!reduce) requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();
  requestAnimationFrame(draw);

  // Scroll unlock — cosmos home starts as overflow-hidden
  const body = document.body;
  if (body.classList.contains("cosmos")) {
    const unlock = () => body.classList.add("scrolled");
    // Any wheel/touch/keypress → unlock
    window.addEventListener("wheel", unlock, { once: true, passive: true });
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
    window.addEventListener("keydown", (e) => {
      if (["ArrowDown", "PageDown", "Space", " ", "End"].includes(e.key)) unlock();
    }, { once: true });
    // Also unlock if user clicks the scroll hint or any nav star that has a hash link
    document.querySelectorAll('.scroll-hint, .below-picks a').forEach(el => {
      el.addEventListener("click", unlock);
    });
  }
})();

/* ============================================================
   2. Constellation of works — hover to reveal, filter tabs.
============================================================ */
(function () {
  const nodes = document.querySelectorAll(".star-node");
  const readout = document.getElementById("star-readout");
  if (!nodes.length || !readout) return;

  const titleEl = readout.querySelector(".readout-title");
  const metaEl  = readout.querySelector(".readout-meta");
  const legendEl = readout.querySelector(".readout-legend");
  let linkEl = null;

  function show(node) {
    titleEl.textContent = node.dataset.title;
    metaEl.textContent  = node.dataset.meta;
    if (linkEl) { linkEl.remove(); linkEl = null; }
    if (node.dataset.href) {
      linkEl = document.createElement("a");
      linkEl.className = "readout-link";
      linkEl.href = node.dataset.href;
      linkEl.target = "_blank";
      linkEl.rel = "noopener";
      linkEl.textContent = "read →";
      readout.insertBefore(linkEl, legendEl);
    }
  }

  nodes.forEach((n) => {
    n.addEventListener("mouseenter", () => show(n));
    n.addEventListener("focus",      () => show(n));
    n.addEventListener("click", () => {
      if (n.dataset.href) window.open(n.dataset.href, "_blank", "noopener");
    });
    n.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && n.dataset.href) {
        window.open(n.dataset.href, "_blank", "noopener");
      }
    });
  });

  const filters = document.querySelectorAll("[data-filter]");
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const tag = btn.dataset.filter;
      nodes.forEach((n) => {
        const match = tag === "all" || n.dataset.tag === tag;
        n.classList.toggle("filtered-out", !match);
      });
    });
  });
})();

/* ============================================================
   3. Projects filter
============================================================ */
(function () {
  const projFilters = document.querySelectorAll("[data-proj-filter]");
  const projects = document.querySelectorAll(".proj[data-kind]");
  if (!projFilters.length || !projects.length) return;

  projFilters.forEach((btn) => {
    btn.addEventListener("click", () => {
      projFilters.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const tag = btn.dataset.projFilter;
      projects.forEach((p) => {
        p.classList.toggle("hidden", tag !== "all" && p.dataset.kind !== tag);
      });
    });
  });
})();

/* ============================================================
   4. About-page tabs
============================================================ */
(function () {
  const tabs = document.querySelectorAll(".tab[data-tab]");
  const panels = document.querySelectorAll(".panel-card[data-panel]");
  if (!tabs.length || !panels.length) return;

  tabs.forEach((t) => {
    t.addEventListener("click", () => {
      tabs.forEach((x) => {
        x.classList.remove("is-active");
        x.setAttribute("aria-selected", "false");
      });
      t.classList.add("is-active");
      t.setAttribute("aria-selected", "true");
      const which = t.dataset.tab;
      panels.forEach((p) => {
        p.classList.toggle("is-active", p.dataset.panel === which);
      });
    });
  });
})();

/* ============================================================
   5. Smooth-scroll for anchor links
============================================================ */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href").slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    document.body.classList.add("scrolled");
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", "#" + id);
  });
});
