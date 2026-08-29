(() => {
  const C = window.NETREGENT_CONFIG || {};
  const $ = (s) => document.querySelector(s);
  const E = (x) => String(x ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));

  const DEFAULT_STEPS = [
    "Receive trigger",
    "Validate and normalize input",
    "Apply business rule",
    "Perform requested action",
    "Record result / notify"
  ];

  const S = { data: [], filtered: [], q: "", p: "", d: "" };

  function stepsOf(r) {
    const raw = r && (
      r.steps || r.flow_steps || r.nodes || r.workflow_steps ||
      r.actions || r.sequence || []
    );
    const arr = Array.isArray(raw) ? raw : Object.values(raw || {});
    const out = arr.map((x) => (
      typeof x === "string" ? x : x?.name || x?.label || x?.title || x?.step || ""
    )).map((x) => String(x).trim()).filter(Boolean).slice(0, 10);
    return out.length ? out : DEFAULT_STEPS.slice();
  }

  function niceTitle(r) {
    const t = String(r.title || r.name || "").trim();
    if (t && t.toLowerCase() !== "no title") return t;
    const d = String(r.description || "").replace(/\s+/g, " ").trim();
    return d ? d.slice(0, 90) : "Automation pattern";
  }

  function niceDomain(d) {
    return String(d || "General").replace(/_/g, " ");
  }

  function record(r, platform, steps) {
    return {
      title: niceTitle(r),
      domain: niceDomain(r.domain || r.category || "General"),
      platform: platform || "Multi-platform",
      subdomain: niceDomain(r.sub_domain || r.subdomain || ""),
      description: String(r.description || "").slice(0, 400),
      steps: stepsOf({ steps }),
      alternatives: Object.keys(r.blueprints || {}).filter((k) => k !== platform)
    };
  }

  function flat(json) {
    const rows = Array.isArray(json) ? json : (json?.items || json?.workflows || []);
    const out = [];
    rows.forEach((r) => {
      if (!r || typeof r !== "object") return;
      const prints = r.blueprints && typeof r.blueprints === "object" ? r.blueprints : null;
      if (prints) {
        Object.keys(prints).forEach((name) => {
          const bp = prints[name] || {};
          out.push(record(r, bp.platform || name, bp.flow_steps || bp.steps));
        });
      } else {
        out.push(record(r, r.platform, r.flow_steps || r.steps));
      }
    });
    return out;
  }

  function score(x, q) {
    const w = q.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
    const h = [x.title, x.domain, x.platform, x.description, x.steps.join(" ")].join(" ").toLowerCase();
    return w.reduce((n, t) => n + (h.includes(t) ? 2 : 0), h.includes(q.toLowerCase()) ? 3 : 0);
  }

  function draw(steps) {
    const list = (steps && steps.length ? steps : DEFAULT_STEPS).slice(0, 8);
    const w = Math.max(1100, list.length * 245);
    const g = w / (list.length + 1);
    const lines = list.slice(0, -1).map((_, i) => {
      const x1 = g * (i + 1) - 88;
      const x2 = g * (i + 2) - 88;
      return `<line x1="${x1 + 176}" y1="218" x2="${x2}" y2="218" class="edge" marker-end="url(#a)"/>`;
    }).join("");
    const nodes = list.map((s, i) => {
      const x = g * (i + 1) - 88;
      return `<g>
        <rect x="${x}" y="175" width="176" height="86" rx="14"></rect>
        <text x="${x + 14}" y="200" class="num">STEP ${i + 1}</text>
        <foreignObject x="${x + 12}" y="210" width="152" height="44">
          <div xmlns="http://www.w3.org/1999/xhtml" style="color:#eaf2fb;font:600 13px/1.25 system-ui">${E(s)}</div>
        </foreignObject>
      </g>`;
    }).join("");
    $("#map").innerHTML = `<svg viewBox="0 0 ${w} 430" preserveAspectRatio="xMinYMid meet">
      <defs><marker id="a" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
        <path d="M0,0 L0,6 L9,3z"></path></marker></defs>${lines}${nodes}</svg>`;
  }

  function build(seed) {
    const q = seed ? [seed.title, seed.domain, seed.description].join(" ") : $("#request").value.trim();
    if (!q) { $("#request").focus(); return; }
    const rank = S.data.map((x) => [x, score(x, q)]).sort((a, b) => b[1] - a[1]);
    const b = seed || rank[0]?.[0] || record({ title: q, description: q, domain: "General" }, "Multi-platform", DEFAULT_STEPS);
    const steps = stepsOf(b);
    $("#workspace").classList.remove("hidden");
    $("#title").textContent = b.title;
    $("#summary").textContent = b.description || q;
    $("#info").innerHTML = `<p><b>Request:</b> ${E(q)}</p>
      <p><b>Platform:</b> ${E(b.platform)}</p>
      <p><b>Domain:</b> ${E(b.domain)}${b.subdomain ? " · " + E(b.subdomain) : ""}</p>
      <p><b>Steps:</b> ${E(steps.join(" → "))}</p>
      <p class="muted">Knowledge recommendation only. Review permissions and limits before implementation.</p>`;
    const al = [...(b.alternatives || []), ...rank.slice(1, 5).map((x) => x[0].platform)];
    $("#alts").innerHTML = [...new Set(al)].filter(Boolean).slice(0, 8)
      .map((x) => `<span class="alt">${E(x)}</span>`).join("") || "<span class='muted'>No alternatives</span>";
    draw(steps);
    $("#workspace").scrollIntoView({ behavior: "smooth" });
  }

  function apply() {
    const q = S.q.toLowerCase();
    S.filtered = S.data.filter((x) =>
      (!S.p || x.platform === S.p) &&
      (!S.d || x.domain === S.d) &&
      (!q || [x.title, x.domain, x.platform, x.description, x.steps.join(" ")].join(" ").toLowerCase().includes(q))
    );
    $("#count").textContent = `${S.filtered.length.toLocaleString()} matching patterns`;
    const max = C.maxRecords || 120;
    $("#cards").innerHTML = S.filtered.slice(0, max).map((x, i) =>
      `<article class="card" data-i="${i}">
        <small>${E(x.domain)} · ${E(x.platform)}</small>
        <h3>${E(x.title)}</h3>
        <p>${E(x.description || "Reusable workflow pattern.")}</p>
        <div>${x.steps.slice(0, 4).map((s) => `<span class="alt">${E(s)}</span>`).join("")}</div>
        <button>Use this pattern →</button>
      </article>`
    ).join("") || "<p>No matching patterns. Click All platforms.</p>";
    document.querySelectorAll("#cards .card").forEach((c) => {
      c.onclick = () => build(S.filtered[+c.dataset.i]);
    });
  }

  function filters() {
    const ps = [...new Set(S.data.map((x) => x.platform).filter(Boolean))].sort();
    const ds = [...new Set(S.data.map((x) => x.domain).filter(Boolean))].sort();
    $("#platforms").innerHTML = `<button data-p="">All platforms</button>` +
      ps.map((x) => `<button data-p="${E(x)}">${E(x)}</button>`).join("");
    $("#domains").innerHTML = `<button data-d="">All domains</button>` +
      ds.map((x) => `<button data-d="${E(x)}">${E(x)}</button>`).join("");
    document.querySelectorAll("[data-p]").forEach((b) => b.onclick = () => { S.p = b.dataset.p; apply(); });
    document.querySelectorAll("[data-d]").forEach((b) => b.onclick = () => { S.d = b.dataset.d; apply(); });
  }

  async function load() {
    try {
      const r = await fetch(C.dataUrl, { cache: "no-store" });
      if (!r.ok) throw 0;
      const j = await r.json();
      S.data = flat(j);
      if (!S.data.length) throw 0;
      $("#status").textContent = `${S.data.length.toLocaleString()} records loaded`;
    } catch (e) {
      S.data = [record({ title: "Lead routing", domain: "Sales", description: "Capture and route new leads." }, "Zapier", DEFAULT_STEPS)];
      $("#status").textContent = "Fallback catalog active";
    }
    filters();
    apply();
  }

  $("#build").onclick = () => build();
  $("#search").oninput = (e) => { S.q = e.target.value; apply(); };
  document.querySelectorAll("[data-x]").forEach((b) => b.onclick = () => { $("#request").value = b.dataset.x; build(); });
  $("#save").onclick = () => { $("#save").textContent = "Saved ✓"; };
  $("#accountBtn").onclick = () => $("#account").classList.toggle("hidden");
  load();
})();
