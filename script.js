/* ==========================================================
   1. Background star canvas — slow, restrained.
========================================================== */
(function () {
  const canvas = document.getElementById("stars");
  if (!canvas) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  const ctx = canvas.getContext("2d");
  let width = 0, height = 0, stars = [];
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  function colour() {
    return getComputedStyle(document.documentElement).getPropertyValue("--purple-soft").trim() || "#a89ee8";
  }
  let starColour = colour();

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(140, Math.floor((width * height) / 14000));
    stars = new Array(count).fill(0).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.1 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.15 + Math.random() * 0.25,
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, width, height);
    const time = t / 1000;
    for (const s of stars) {
      const alpha = 0.35 + 0.35 * Math.sin(s.phase + time * s.speed);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = starColour;
      ctx.globalAlpha = alpha;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize, { passive: true });
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
    starColour = colour();
  });

  resize();
  requestAnimationFrame(draw);
})();

/* ==========================================================
   2. Reveal-on-scroll
========================================================== */
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
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
  );

  document.querySelectorAll("section, .frontispiece, .colophon-end").forEach((t) => {
    t.classList.add("reveal");
    io.observe(t);
  });
})();

/* ==========================================================
   3. Astrolabe — hand rotates with scroll progress.
========================================================== */
(function () {
  const hand = document.getElementById("astro-hand");
  if (!hand) return;

  function onScroll() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    // 0..360° over the whole page
    hand.style.setProperty("--astro-angle", (p * 360).toFixed(1) + "deg");
    hand.setAttribute("style", `transform: rotate(${(p * 360).toFixed(1)}deg); transform-origin: 50px 50px;`);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/* ==========================================================
   4. Sky chart — a simplified stereographic projection of a
      handful of named bright stars over Blacksburg (37.23°N,
      80.42°W) at the current UTC moment. Not observatory-
      accurate; deliberately schematic. Recomputes on load.
========================================================== */
(function () {
  const svgStars = document.getElementById("sky-stars");
  const svgLines = document.getElementById("sky-lines");
  const caption = document.getElementById("sky-caption");
  if (!svgStars || !caption) return;

  // A small catalogue of bright stars: [name, RA hours, Dec deg]
  // Values are approximate epoch-2000, plenty for a decorative chart.
  const STARS = [
    { n: "Sirius",     ra: 6.752,  dec: -16.716, mag: -1.46 },
    { n: "Canopus",    ra: 6.399,  dec: -52.696, mag: -0.74 },
    { n: "Arcturus",   ra: 14.261, dec:  19.183, mag: -0.05 },
    { n: "Vega",       ra: 18.616, dec:  38.784, mag:  0.03 },
    { n: "Capella",    ra: 5.278,  dec:  45.998, mag:  0.08 },
    { n: "Rigel",      ra: 5.242,  dec:  -8.202, mag:  0.13 },
    { n: "Procyon",    ra: 7.655,  dec:   5.225, mag:  0.34 },
    { n: "Betelgeuse", ra: 5.919,  dec:   7.407, mag:  0.42 },
    { n: "Altair",     ra: 19.846, dec:   8.868, mag:  0.77 },
    { n: "Aldebaran",  ra: 4.598,  dec:  16.509, mag:  0.85 },
    { n: "Antares",    ra: 16.490, dec: -26.432, mag:  1.09 },
    { n: "Spica",      ra: 13.420, dec: -11.161, mag:  0.97 },
    { n: "Pollux",     ra: 7.755,  dec:  28.026, mag:  1.14 },
    { n: "Fomalhaut",  ra: 22.961, dec: -29.622, mag:  1.16 },
    { n: "Deneb",      ra: 20.690, dec:  45.280, mag:  1.25 },
    { n: "Regulus",    ra: 10.139, dec:  11.967, mag:  1.36 },
    { n: "Polaris",    ra: 2.530,  dec:  89.264, mag:  1.98 },
    // Big Dipper (Ursa Major) for a familiar shape:
    { n: "Dubhe",      ra: 11.062, dec:  61.751, mag:  1.79 },
    { n: "Merak",      ra: 11.031, dec:  56.382, mag:  2.37 },
    { n: "Phecda",     ra: 11.897, dec:  53.695, mag:  2.44 },
    { n: "Megrez",     ra: 12.257, dec:  57.033, mag:  3.31 },
    { n: "Alioth",     ra: 12.900, dec:  55.960, mag:  1.77 },
    { n: "Mizar",      ra: 13.399, dec:  54.926, mag:  2.27 },
    { n: "Alkaid",     ra: 13.792, dec:  49.313, mag:  1.86 },
  ];

  // A few constellation lines by name pairs (drawn if both above horizon):
  const LINES = [
    ["Dubhe", "Merak"], ["Merak", "Phecda"], ["Phecda", "Megrez"],
    ["Megrez", "Dubhe"], ["Megrez", "Alioth"], ["Alioth", "Mizar"], ["Mizar", "Alkaid"],
    ["Betelgeuse", "Rigel"], ["Betelgeuse", "Aldebaran"],
  ];

  const LAT = 37.23;      // Blacksburg
  const LON = -80.42;
  const RAD = 100;        // horizon radius in SVG units

  const now = new Date();

  // Local sidereal time — Meeus low-accuracy formula.
  function jd(d) {
    return d.getTime() / 86400000 + 2440587.5;
  }
  function gmst(d) {
    // Greenwich mean sidereal time in hours.
    const J = jd(d);
    const T = (J - 2451545.0) / 36525;
    let g = 6.697374558 + 0.06570982441908 * (J - 2451545.0)
          + 1.00273790935 * ((d.getUTCHours() + d.getUTCMinutes()/60 + d.getUTCSeconds()/3600))
          + 0.000026 * T * T;
    g = ((g % 24) + 24) % 24;
    return g;
  }

  function altAz(raHours, decDeg, lstHours, latDeg) {
    // Hour angle in radians:
    const H = ((lstHours - raHours) * 15) * Math.PI / 180;
    const dec = decDeg * Math.PI / 180;
    const lat = latDeg * Math.PI / 180;
    const sinAlt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(H);
    const alt = Math.asin(sinAlt);
    const cosAz = (Math.sin(dec) - Math.sin(alt) * Math.sin(lat)) / (Math.cos(alt) * Math.cos(lat));
    let az = Math.acos(Math.min(1, Math.max(-1, cosAz)));
    if (Math.sin(H) > 0) az = 2 * Math.PI - az;
    return { alt, az };
  }

  function project(alt, az) {
    // Stereographic-ish: r shrinks with altitude, 90° at centre.
    if (alt < 0) return null;
    const r = RAD * (1 - alt / (Math.PI / 2));
    // SVG y is down; north up → az 0 at top.
    const x = r * Math.sin(az);
    const y = -r * Math.cos(az);
    return { x, y };
  }

  const lst = ((gmst(now) + LON / 15) % 24 + 24) % 24;

  const positions = {};
  const NS = "http://www.w3.org/2000/svg";

  for (const s of STARS) {
    const aa = altAz(s.ra, s.dec, lst, LAT);
    const p = project(aa.alt, aa.az);
    positions[s.n] = p; // may be null (below horizon)
    if (!p) continue;
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", p.x.toFixed(2));
    c.setAttribute("cy", p.y.toFixed(2));
    // Radius from magnitude: brighter → bigger.
    const r = Math.max(0.9, 2.4 - s.mag * 0.6);
    c.setAttribute("r", r.toFixed(2));
    c.setAttribute("data-name", s.n);
    svgStars.appendChild(c);
  }

  for (const [a, b] of LINES) {
    const pa = positions[a], pb = positions[b];
    if (!pa || !pb) continue;
    const l = document.createElementNS(NS, "line");
    l.setAttribute("x1", pa.x.toFixed(2));
    l.setAttribute("y1", pa.y.toFixed(2));
    l.setAttribute("x2", pb.x.toFixed(2));
    l.setAttribute("y2", pb.y.toFixed(2));
    svgLines.appendChild(l);
  }

  const nStars = svgStars.childElementCount;
  const fmt = now.toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
  caption.textContent = `sky over Blacksburg · ${fmt} · ${nStars} stars visible`;
})();

/* ==========================================================
   5. Constellation of works — hover to reveal, filter tabs.
========================================================== */
(function () {
  const nodes = document.querySelectorAll(".star-node");
  const readout = document.getElementById("star-readout");
  if (!nodes.length || !readout) return;

  const titleEl = readout.querySelector(".readout-title");
  const metaEl = readout.querySelector(".readout-meta");
  let linkEl = readout.querySelector(".readout-link");

  function show(node) {
    titleEl.textContent = node.dataset.title;
    metaEl.textContent = node.dataset.meta;
    if (linkEl) linkEl.remove();
    if (node.dataset.href) {
      linkEl = document.createElement("a");
      linkEl.className = "readout-link";
      linkEl.href = node.dataset.href;
      linkEl.target = "_blank";
      linkEl.rel = "noopener";
      linkEl.textContent = "read →";
      readout.appendChild(linkEl);
    }
  }

  nodes.forEach((n) => {
    n.addEventListener("mouseenter", () => show(n));
    n.addEventListener("focus", () => show(n));
    n.addEventListener("click", () => {
      if (n.dataset.href) window.open(n.dataset.href, "_blank", "noopener");
    });
    n.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && n.dataset.href) {
        window.open(n.dataset.href, "_blank", "noopener");
      }
    });
  });

  // Filter tabs
  const filters = document.querySelectorAll(".filter");
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
