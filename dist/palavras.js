(() => {
  const PAGE_SIZE = 6;
  let page = 1;
  let query = "";
  let openIdx = null;
  const pool = (window.dailyCellVerses || []).slice();
  const todayId = (() => {
    if (!pool.length) return null;
    const t = new Date(), start = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    const anchor = new Date(2026, 0, 1);
    const idx = Math.floor((start - anchor) / 86400000);
    return ((idx % pool.length) + pool.length) % pool.length;
  })();

  let devocs = [];
  let longByRef = {};
  fetch("./palavras-devocionais.json").then(r => r.json()).then(j => {
    devocs = Array.isArray(j) ? j : [];
    // Build map ref -> entry for quick lookup
    longByRef = {};
    for (const d of devocs){
      const k = (d.ref||"").toLowerCase().replace(/\s+/g,"");
      longByRef[k] = d;
    }
    render();
  }).catch(() => render());

  function norm(s){ return (s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,""); }

  function filtered(){
    // Merge: devocs (full) first, then remaining pool that have no devocional file
    // For now list = pool with devocional priority: index by ref
    const q = norm(query.trim());
    let list = pool.map((v,i) => ({v,i, full: longByRef[(v.ref||"").toLowerCase().replace(/\s+/g,"")] || null }));
    if (q){
      list = list.filter(({v, full}) => norm(v.theme+" "+v.ref+" "+v.text+" "+(full?.full||"")).includes(q));
    } else {
      // No query: show full devocionais first (the 60 deep ones), then short ones after
      list.sort((a,b) => {
        if (a.i === todayId) return -1;
        if (b.i === todayId) return 1;
        const ah = a.full ? 0 : 1;
        const bh = b.full ? 0 : 1;
        if (ah!==bh) return ah-bh;
        return a.i - b.i;
      });
    }
    return list;
  }

  function toast(msg){
    let el = document.getElementById("_toast");
    if (!el){ el = document.createElement("div"); el.id="_toast"; el.style.cssText="position:fixed;left:50%;bottom:18px;transform:translateX(-50%);background:var(--ink);color:var(--void);font-weight:700;font-size:13px;padding:10px 16px;border-radius:999px;box-shadow:0 10px 30px rgba(0,0,0,.4);z-index:30"; document.body.appendChild(el); }
    el.textContent = msg; el.style.opacity="1";
    setTimeout(()=> el.style.opacity="0", 1800);
  }

  function copyText(text){
    navigator.clipboard?.writeText(text).then(() => toast("Copiado ✓")).catch(() => toast("Copiado"));
    // fallback
    try { navigator.clipboard.writeText(text); } catch {}
  }

  function escapeHtml(s){
    return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  function render(){
    const list = filtered();
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (page > totalPages) page = totalPages;
    const slice = list.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
    const grid = document.getElementById("palGrid");
    const count = document.getElementById("palCount");
    if (count) count.textContent = `${list.length} ${list.length===1?"Palavra":"Palavras"}`;
    if (!grid) return;
    const params = new URLSearchParams(location.search);
    const focusIdx = params.get("v")!=null ? parseInt(params.get("v"),10) : todayId;
    if (focusIdx!=null && query==="" && page===1) openIdx = focusIdx;

    if (!slice.length){
      grid.innerHTML = '<p class="pal-empty">Nenhuma Palavra encontrada.</p>';
    } else {
      grid.innerHTML = slice.map(({v,i, full}) => {
        const isToday = i === todayId;
        const isOpen = openIdx === i;
        const hasFull = !!full;
        const preview = v.text;
        let body = "";
        if (isOpen){
          if (hasFull){
            const verses = (full.verses||[]).map(vt => `<p>${escapeHtml(vt)}</p>`).join("");
            body = `<div class="pal-body open">
              <div class="pal-verses"><small>VERSÍCULO-CHAVE</small>${verses || `<p>${escapeHtml(v.ref)}</p>`}</div>
              <p class="pal-text">${escapeHtml(full.full)}</p>
              <div class="pal-question"><small>PERGUNTA PARA A CÉLULA</small><p>${escapeHtml(v.prompt)}</p></div>
            </div>`;
          } else {
            body = `<div class="pal-body open">
              <p class="pal-text">${escapeHtml(preview)}</p>
              <div class="pal-question"><small>PERGUNTA PARA A CÉLULA</small><p>${escapeHtml(v.prompt)}</p></div>
            </div>`;
          }
        } else {
          // collapsed: show prompt preview only
          body = `<div class="pal-question" style="margin:0 18px 0"><small>PERGUNTA</small><p>${escapeHtml(v.prompt)}</p></div>`;
          if (!isOpen) body = `<div style="display:none"></div>`;
        }
        // For collapsed we still show prompt inside actions? Simpler: always show prompt below, full only when open
        let innerBody = "";
        if (isOpen){
          if (hasFull){
            const verses = (full.verses||[]).map(vt => `<p>${escapeHtml(vt)}</p>`).join("");
            innerBody = `<div class="pal-verses"><small>VERSÍCULO-CHAVE</small>${verses || `<p>${escapeHtml(v.ref)}</p>`}</div>
              <p class="pal-text">${escapeHtml(full.full)}</p>
              <div class="pal-question"><small>PERGUNTA PARA A CÉLULA</small><p>${escapeHtml(v.prompt)}</p></div>`;
          } else {
            innerBody = `<p class="pal-text">${escapeHtml(preview)}</p>
              <div class="pal-question"><small>PERGUNTA PARA A CÉLULA</small><p>${escapeHtml(v.prompt)}</p></div>`;
          }
        }
        // Toggle button uses design system: primary-button for open, text-button closed
        const toggleLabel = isOpen ? "Fechar" : "Abrir Palavra completa";
        const toggleClass = isOpen ? "quiet-button" : "primary-button";
        return `<article class="pal-card ${isToday?"is-today":""}">
          <div class="pal-card-head">
            <span class="pal-ref">${escapeHtml(v.ref)}</span>
            ${isToday?'<span class="pal-badge">Hoje</span>':""}
            <span style="margin-left:auto;color:#706f6c;font-size:10px">#${i+1}</span>
          </div>
          <h3>${escapeHtml(v.theme)}</h3>
          <p class="pal-preview">${escapeHtml(preview)}</p>
          ${isOpen ? `<div class="pal-divider" style="margin-top:12px"></div><div class="pal-body open" style="padding-top:12px">${innerBody}</div>` : ""}
          <div class="pal-actions" style="border-top:${isOpen?"1px solid var(--hairline)":"none"}">
            <button class="${toggleClass}" data-toggle="${i}">${toggleLabel}</button>
            <button class="quiet-button" data-copy="${i}">Copiar</button>
          </div>
        </article>`;
      }).join("");
    }

    const pager = document.getElementById("palPages");
    if (pager){
      if (totalPages <= 1){ pager.innerHTML=""; }
      else {
        let h="";
        const win=5;
        let s=Math.max(1, page-Math.floor(win/2)), e=Math.min(totalPages, s+win-1);
        if (e-s+1<win) s=Math.max(1, e-win+1);
        h+=`<button class="page-btn" data-page="${page-1}" ${page===1?"disabled":""}>‹</button>`;
        for(let i=s;i<=e;i++) h+=`<button class="page-btn ${i===page?"active":""}" data-page="${i}" ${i===page?'aria-current="page"':""}>${i}</button>`;
        h+=`<button class="page-btn" data-page="${page+1}" ${page===totalPages?"disabled":""}>›</button>`;
        pager.innerHTML=h;
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const search = document.getElementById("palSearch");
    if (search){
      const p = new URLSearchParams(location.search);
      if (p.get("q")){ search.value = p.get("q"); query = p.get("q"); }
      search.addEventListener("input", () => { query = search.value; page=1; openIdx=null; render(); });
    }
    document.getElementById("palGrid")?.addEventListener("click", (e) => {
      const tg = e.target.closest("[data-toggle]");
      if (tg){ const i=parseInt(tg.dataset.toggle,10); openIdx = openIdx===i ? null : i; render(); if(openIdx===i) setTimeout(()=> tg.closest(".pal-card")?.scrollIntoView({behavior:"smooth", block:"center"}), 80); return; }
      const cp = e.target.closest("[data-copy]");
      if (cp){
        const i=parseInt(cp.dataset.copy,10);
        const v=pool[i]; const k=(v.ref||"").toLowerCase().replace(/\s+/g,""); const full=longByRef[k];
        let t;
        if (full) t=`*${v.theme}* — ${v.ref}\n\n${full.full}\n\n_${v.prompt}_`;
        else t=`*${v.theme}* — ${v.ref}\n\n${v.text}\n\n_${v.prompt}_`;
        navigator.clipboard?.writeText(t).then(()=> toast("Copiado ✓")).catch(()=> toast(t.slice(0,60)));
        return;
      }
    });
    document.getElementById("palPages")?.addEventListener("click", (e) => {
      const b=e.target.closest("[data-page]"); if(!b||b.disabled) return;
      const p=parseInt(b.dataset.page,10); if(p>=1){ page=p; openIdx=null; render(); window.scrollTo({top:0, behavior:"smooth"}); }
    });
    render();
  });
})();
