/* 종목 분석 리포트 SPA — manifest.json 기반, 해시 라우팅 */
(function () {
  "use strict";

  const app = document.getElementById("app");
  const titleEl = document.getElementById("title");
  const backBtn = document.getElementById("backBtn");
  const genInfo = document.getElementById("genInfo");

  let manifest = null;

  marked.setOptions({ gfm: true, breaks: false });

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  function setHeader(title, showBack) {
    titleEl.textContent = title;
    document.title = title;
    backBtn.hidden = !showBack;
  }

  function findStock(name) {
    return manifest.stocks.find((s) => s.name === name);
  }

  // ---- 라우팅 ----
  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, "");
    if (!raw) return { view: "home" };
    const parts = raw.split("/").map(decodeURIComponent);
    if (parts.length === 1) return { view: "stock", name: parts[0] };
    return { view: "report", name: parts[0], date: parts[1] };
  }

  function render() {
    const r = parseHash();
    if (r.view === "home") return renderHome();
    if (r.view === "stock") return renderStock(r.name);
    if (r.view === "report") return renderReport(r.name, r.date);
  }

  // ---- 홈: 종목 목록 ----
  function renderHome() {
    setHeader("종목 분석 리포트", false);
    if (!manifest.stocks.length) {
      app.innerHTML = '<div class="empty">아직 생성된 리포트가 없습니다.</div>';
      return;
    }
    const cards = manifest.stocks
      .map(
        (s) => `
        <a class="card" href="#/${encodeURIComponent(s.name)}">
          <div class="meta">
            <div class="name">${esc(s.name)}</div>
            <div class="sub">최신 분석 ${esc(s.latest)}</div>
          </div>
          <span class="badge">${s.count}건</span>
        </a>`
      )
      .join("");
    app.innerHTML = `<div class="section-label">분석 종목 ${manifest.stocks.length}개</div><div class="grid">${cards}</div>`;
    window.scrollTo(0, 0);
  }

  // ---- 종목: 날짜별 리포트 목록 ----
  function renderStock(name) {
    const stock = findStock(name);
    setHeader(name, true);
    if (!stock) {
      app.innerHTML = '<div class="empty">해당 종목을 찾을 수 없습니다.</div>';
      return;
    }
    const cards = stock.reports
      .map(
        (rep) => `
        <a class="card" href="#/${encodeURIComponent(name)}/${encodeURIComponent(rep.date)}">
          <div class="meta">
            <div class="name">${esc(rep.date)}</div>
            <div class="sub">${esc(rep.title)}</div>
          </div>
          <span class="chev">›</span>
        </a>`
      )
      .join("");
    app.innerHTML = `<div class="section-label">${esc(name)} · 리포트 ${stock.reports.length}건</div><div class="grid">${cards}</div>`;
    window.scrollTo(0, 0);
  }

  // ---- 리포트 본문 ----
  async function renderReport(name, date) {
    const stock = findStock(name);
    const rep = stock && stock.reports.find((r) => r.date === date);
    setHeader(`${name} · ${date}`, true);
    if (!rep) {
      app.innerHTML = '<div class="empty">리포트를 찾을 수 없습니다.</div>';
      return;
    }
    app.innerHTML = '<div class="loading">리포트 불러오는 중…</div>';
    try {
      const res = await fetch(rep.path, { cache: "no-cache" });
      if (!res.ok) throw new Error(res.status);
      const md = await res.text();
      const html = marked.parse(md);
      app.innerHTML = `<article class="report">${html}</article>`;
      // 표를 가로 스크롤 컨테이너로 감싸기 (모바일 대응)
      app.querySelectorAll(".report table").forEach((t) => {
        const wrap = document.createElement("div");
        wrap.className = "table-wrap";
        t.parentNode.insertBefore(wrap, t);
        wrap.appendChild(t);
      });
      window.scrollTo(0, 0);
    } catch (e) {
      app.innerHTML = `<div class="empty">리포트를 불러오지 못했습니다.<br>(${esc(e.message)})</div>`;
    }
  }

  backBtn.addEventListener("click", () => {
    const r = parseHash();
    if (r.view === "report") location.hash = `#/${encodeURIComponent(r.name)}`;
    else location.hash = "";
  });

  window.addEventListener("hashchange", render);

  // ---- 부트스트랩 ----
  fetch("manifest.json", { cache: "no-cache" })
    .then((r) => r.json())
    .then((data) => {
      manifest = data;
      genInfo.textContent = `최종 갱신 ${data.generated}`;
      render();
    })
    .catch(() => {
      app.innerHTML = '<div class="empty">manifest.json을 불러오지 못했습니다.<br>build_site.py를 먼저 실행하세요.</div>';
    });
})();
