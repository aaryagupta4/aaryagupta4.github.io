/* ============================================================
   Constellation of works — hover to reveal, filter tabs.
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
   Projects filter (on /projects)
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
   About-page tabs
============================================================ */
(function () {
  const tabs = document.querySelectorAll(".tab[data-tab]");
  const panels = document.querySelectorAll(".panel[data-panel]");
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
   Smooth-scroll for anchor links.
============================================================ */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href").slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", "#" + id);
  });
});
