"use strict";

/* ============================================================
   Novena de Natal 2026 — app
   Navegação por hash:
     #/                     -> índice
     #/encontro/N/S         -> encontro N, seção S (0-based)
     #/oracao-inicial       -> oração inicial (avulsa)
     #/oracao-final         -> oração final (avulsa)
     #/cantos               -> lista de cantos
     #/canto/N              -> canto N (1-based)
   ============================================================ */

let DADOS = null;

const $app = document.getElementById("app");
const $topbarTitle = document.getElementById("topbarTitle");
const $btnBack = document.getElementById("btnBack");
const $btnHome = document.getElementById("btnHome");
const $pager = document.getElementById("pager");
const $btnPrev = document.getElementById("btnPrev");
const $btnNext = document.getElementById("btnNext");
const $pagerStatus = document.getElementById("pagerStatus");

/* ---------- utils ---------- */

// Escapa HTML e depois aplica **negrito** -> <b>
function fmt(text) {
  const esc = String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const bolded = esc.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  return bolded.replace(/\n/g, "<br>");
}

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstChild;
}

function roleLabel(papel) {
  switch (papel) {
    case "D": return "D.";
    case "L1": return "L1.";
    case "L2": return "L2.";
    case "L3": return "L3.";
    case "T": return "T.";
    case "R": return "R.";
    default: return "";
  }
}

function scrollTop() {
  window.scrollTo(0, 0);
  if ($app && typeof $app.focus === "function") $app.focus({ preventScroll: true });
}

/* ---------- render: falas ---------- */

function renderFala(f) {
  if (f.papel === "obs") return `<p class="obs">${fmt(f.texto)}</p>`;
  if (f.papel === "nota") return `<p class="nota">${fmt(f.texto)}</p>`;
  if (f.papel === "subtitulo") return `<h3 class="subtitulo">${fmt(f.texto)}</h3>`;
  if (f.papel === "destaque") return `<p class="destaque-linha">${fmt(f.texto)}</p>`;
  if (f.papel === "pergunta") {
    return `<p class="pergunta"><span>${fmt(f.texto)}</span></p>`;
  }
  if (f.papel === "lista") {
    const itens = String(f.texto).split("\n").map((l) => `<li>${fmt(l)}</li>`).join("");
    return `<ul class="oracoes-list">${itens}</ul>`;
  }
  const cls =
    f.papel === "T" ? "fala fala--todos" :
    f.papel === "R" ? "fala fala--resposta" : "fala";
  return `<div class="${cls}"><span class="fala__role">${roleLabel(f.papel)}</span><p class="fala__text">${fmt(f.texto)}</p></div>`;
}

/* ---------- render: oração fixa ---------- */

function oracaoHTML(oracao) {
  const falas = oracao.falas.map(renderFala).join("");
  return `
    <p class="screen__note">(${oracao.nota})</p>
    <hr class="screen__divider" />
    ${falas}
  `;
}

/* ---------- render: seções de encontro ---------- */

function secaoHTML(secao, dados) {
  switch (secao.tipo) {
    case "oracaoInicial":
      return oracaoHTML(dados.oracaoInicial);
    case "oracaoFinal":
      return oracaoHTML(dados.oracaoFinal);
    case "falas":
      return secao.falas.map(renderFala).join("");
    case "perguntas": {
      const itens = secao.perguntas.map((q) => `<li>${fmt(q)}</li>`).join("");
      return `<ul class="perguntas">${itens}</ul>`;
    }
    case "iluminacao": {
      let h = "";
      if (secao.introducao) h += renderFala(secao.introducao);
      if (secao.canto) h += `<p class="canto-indicacao">${fmt(secao.canto)}</p>`;
      if (secao.proclamacao) h += `<div class="proclamacao">${fmt(secao.proclamacao)}</div>`;
      if (secao.nota) h += `<p class="nota">${fmt(secao.nota)}</p>`;
      return h;
    }
    case "rezar": {
      let h = "";
      if (secao.introducao) h += renderFala(secao.introducao);
      h += `<div class="resposta-bloco"><div class="fala"><span class="fala__role">R.</span><p class="resposta-texto">${fmt(secao.resposta)}</p></div></div>`;
      const itens = secao.intencoes.map((i) => `<li>${fmt(i)}</li>`).join("");
      h += `<ul class="intencoes">${itens}</ul>`;
      if (secao.nota) h += `<p class="nota">${fmt(secao.nota)}</p>`;
      return h;
    }
    default:
      return "";
  }
}

/* ---------- screens ---------- */

function showPager(show) {
  $pager.hidden = !show;
  $app.classList.toggle("no-pager", !show);
}

function setTopbar({ title, back, home }) {
  $topbarTitle.textContent = title;
  $btnBack.hidden = !back;
  $btnHome.hidden = !home;
}

function renderHome() {
  setTopbar({ title: "Novena 2026", back: false, home: false });
  showPager(false);

  const encontros = DADOS.encontros.map((e) => `
    <button class="card card--encontro" data-nav="#/encontro/${e.numero}/0">
      <div class="card__num">${e.numero}º Encontro</div>
      <div class="card__title">${fmt(e.titulo)}</div>
    </button>
  `).join("");

  const siglas = DADOS.siglas.map((s) =>
    `<div class="legend__row"><dt>${s.sigla}</dt> <dd>${s.significado}</dd></div>`
  ).join("");

  $app.innerHTML = `
    <section class="hero">
      <div class="hero__star">✦</div>
      <h1 class="hero__title">Novena de Natal</h1>
      <p class="hero__subtitle">2026 — ${fmt(DADOS.subtitulo)}</p>
    </section>

    <div class="section-label">Encontros</div>
    <div class="index-grid">${encontros}</div>

    <div class="section-label">Orações (todos os dias)</div>
    <div class="list">
      <button class="card" data-nav="#/oracao-inicial"><div class="card__title">Oração Inicial</div></button>
      <button class="card" data-nav="#/oracao-final"><div class="card__title">Oração Final</div></button>
    </div>

    <div class="section-label">Cantos</div>
    <div class="list">
      <button class="card" data-nav="#/cantos"><div class="card__title">Cantos</div><div class="card__sub">${DADOS.cantos.length} cantos</div></button>
    </div>

    <div class="section-label">Legenda</div>
    <dl class="legend">${siglas}</dl>

    <div class="home-foot">
      ${fmt(DADOS.fonte)}<br>Autoria: ${fmt(DADOS.autoria)}
    </div>
  `;
  scrollTop();
}

function renderEncontro(numero, secaoIdx) {
  const enc = DADOS.encontros.find((e) => e.numero === numero);
  if (!enc) { location.hash = "#/"; return; }
  const total = enc.secoes.length;
  let idx = Math.max(0, Math.min(secaoIdx, total - 1));
  const secao = enc.secoes[idx];

  setTopbar({ title: `${enc.numero}º Encontro`, back: true, home: true });
  showPager(true);

  $app.innerHTML = `
    <div class="fade-in">
      <p class="screen__kicker">${enc.numero}º Encontro · ${fmt(enc.titulo)}</p>
      <h2 class="screen__title">${fmt(secao.titulo)}</h2>
      <hr class="screen__divider" />
      ${secaoHTML(secao, DADOS)}
    </div>
  `;

  $pagerStatus.textContent = `${idx + 1} / ${total}`;
  $btnPrev.disabled = false;
  $btnNext.disabled = false;
  $btnPrev.textContent = idx === 0 ? "‹ Índice" : "‹ Anterior";
  $btnNext.textContent = idx === total - 1 ? "Concluir ›" : "Próximo ›";

  $btnPrev.onclick = () => {
    if (idx === 0) location.hash = "#/";
    else location.hash = `#/encontro/${numero}/${idx - 1}`;
  };
  $btnNext.onclick = () => {
    if (idx === total - 1) location.hash = "#/";
    else location.hash = `#/encontro/${numero}/${idx + 1}`;
  };

  scrollTop();
}

function renderOracaoAvulsa(qual) {
  const oracao = qual === "inicial" ? DADOS.oracaoInicial : DADOS.oracaoFinal;
  setTopbar({ title: oracao.titulo, back: true, home: true });
  showPager(false);
  $app.innerHTML = `
    <div class="fade-in">
      <p class="screen__kicker">Para todos os dias</p>
      <h2 class="screen__title">${fmt(oracao.titulo)}</h2>
      ${oracaoHTML(oracao)}
    </div>
  `;
  scrollTop();
}

function renderCantosLista() {
  setTopbar({ title: "Cantos", back: true, home: true });
  showPager(false);
  const itens = DADOS.cantos.map((c) => `
    <button class="card" data-nav="#/canto/${c.numero}">
      <div class="card__title">${c.numero}. ${fmt(c.titulo)}</div>
      <div class="card__sub">${fmt(c.autoria)}</div>
    </button>
  `).join("");
  $app.innerHTML = `
    <div class="fade-in">
      <p class="screen__kicker">Usados em todos os encontros</p>
      <h2 class="screen__title">Cantos</h2>
      <hr class="screen__divider" />
      <div class="list">${itens}</div>
    </div>
  `;
  scrollTop();
}

function renderCanto(numero) {
  const idx = DADOS.cantos.findIndex((c) => c.numero === numero);
  if (idx === -1) { location.hash = "#/cantos"; return; }
  const c = DADOS.cantos[idx];
  const total = DADOS.cantos.length;

  setTopbar({ title: "Cantos", back: true, home: true });
  showPager(true);

  const estrofes = c.estrofes.map((e) => {
    const cls = e.tipo === "refrao" ? "estrofe estrofe--refrao" : "estrofe";
    return `<div class="${cls}"><span class="estrofe__marca">${e.marca}</span><p class="estrofe__texto">${fmt(e.texto)}</p></div>`;
  }).join("");

  $app.innerHTML = `
    <div class="fade-in">
      <p class="screen__kicker">Canto ${c.numero}</p>
      <h2 class="screen__title">${fmt(c.titulo)}</h2>
      <p class="canto-autoria">${fmt(c.autoria)}</p>
      <hr class="screen__divider" />
      ${estrofes}
    </div>
  `;

  $pagerStatus.textContent = `${idx + 1} / ${total}`;
  $btnPrev.disabled = false;
  $btnNext.disabled = false;
  $btnPrev.textContent = idx === 0 ? "‹ Lista" : "‹ Anterior";
  $btnNext.textContent = idx === total - 1 ? "Lista ›" : "Próximo ›";
  $btnPrev.onclick = () => {
    if (idx === 0) location.hash = "#/cantos";
    else location.hash = `#/canto/${DADOS.cantos[idx - 1].numero}`;
  };
  $btnNext.onclick = () => {
    if (idx === total - 1) location.hash = "#/cantos";
    else location.hash = `#/canto/${DADOS.cantos[idx + 1].numero}`;
  };

  scrollTop();
}

/* ---------- router ---------- */

function router() {
  const hash = location.hash || "#/";
  const parts = hash.replace(/^#\//, "").split("/").filter(Boolean);

  if (parts.length === 0) { renderHome(); return; }

  switch (parts[0]) {
    case "encontro": {
      const n = parseInt(parts[1], 10);
      const s = parseInt(parts[2] || "0", 10);
      if (Number.isFinite(n)) renderEncontro(n, Number.isFinite(s) ? s : 0);
      else renderHome();
      break;
    }
    case "oracao-inicial": renderOracaoAvulsa("inicial"); break;
    case "oracao-final": renderOracaoAvulsa("final"); break;
    case "cantos": renderCantosLista(); break;
    case "canto": {
      const n = parseInt(parts[1], 10);
      if (Number.isFinite(n)) renderCanto(n);
      else renderCantosLista();
      break;
    }
    default: renderHome();
  }
}

/* ---------- global events ---------- */

document.addEventListener("click", (ev) => {
  const btn = ev.target.closest("[data-nav]");
  if (btn) {
    ev.preventDefault();
    location.hash = btn.getAttribute("data-nav");
  }
});

$btnHome.addEventListener("click", () => { location.hash = "#/"; });
$btnBack.addEventListener("click", () => {
  // volta ao índice, exceto cantos que volta à lista
  if (location.hash.startsWith("#/canto/")) location.hash = "#/cantos";
  else location.hash = "#/";
});

window.addEventListener("hashchange", router);

/* ---------- boot ---------- */

fetch("dados.json")
  .then((r) => {
    if (!r.ok) throw new Error("Falha ao carregar dados.json (" + r.status + ")");
    return r.json();
  })
  .then((d) => {
    DADOS = d;
    router();
  })
  .catch((err) => {
    $app.innerHTML = `<div class="fade-in"><h2 class="screen__title">Erro ao carregar</h2><p class="nota">${fmt(err.message)}</p></div>`;
  });

/* ---------- service worker (PWA) ---------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
