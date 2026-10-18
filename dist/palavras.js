(() => {
  const PAGE_SIZE = 8;
  let page = 1;
  let query = "";
  let openIdx = null;
  const pool = (window.dailyCellVerses || []).slice();
  const todayIdPool = (() => {
    if (!pool.length) return null;
    const t = new Date(), start = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    const anchor = new Date(2026, 0, 1);
    const idx = Math.floor((start - anchor) / 86400000);
    return ((idx % pool.length) + pool.length) % pool.length;
  })();
  let todayRefNorm = null;
  if (todayIdPool!=null && pool[todayIdPool]) {
    todayRefNorm = pool[todayIdPool].ref.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/\s+/g,"");
  }
  let devocs = [];
  let longByRef = {};
  fetch("./palavras-devocionais.json").then(r => r.json()).then(j => {
    devocs = Array.isArray(j) ? j : [];
    for (const d of devocs){
      const k = (d.ref||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/\s+/g,"");
      if (!longByRef[k]) longByRef[k] = d;
    }
    render();
  }).catch(() => render());
  function norm(s){ return (s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,""); }
  function normRef(s){ return norm(s).replace(/\s+/g,""); }
  function escapeHtml(s){ return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function filtered(){
    const q = norm(query.trim());
    let list = devocs.map((d,i) => ({d,i}));
    if (q){
      list = list.filter(({d}) => norm(d.theme+" "+d.ref+" "+d.full+" "+d.verses.join(" ")).includes(q));
    } else {
      if (todayRefNorm){
        list.sort((a,b) => {
          const at = normRef(a.d.ref) === todayRefNorm ? -1 : 0;
          const bt = normRef(b.d.ref) === todayRefNorm ? -1 : 0;
          return at - bt;
        });
      }
    }
    return list;
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
    if (openIdx===null && !query) {
      const params = new URLSearchParams(location.search);
      if (params.get("v")!=null) {
        if (todayRefNorm){
          const idx = devocs.findIndex(d => normRef(d.ref)===todayRefNorm);
          if (idx>=0) openIdx = idx;
        }
      } else if (todayRefNorm){
        const idx = devocs.findIndex(d => normRef(d.ref)===todayRefNorm);
        if (idx>=0 && page===1) openIdx = idx;
      }
    }
    if (!slice.length){
      grid.innerHTML = '<p class="pal-empty">Nenhuma Palavra encontrada.</p>';
    } else {
      grid.innerHTML = slice.map(({d,i}) => {
        const isToday = todayRefNorm && normRef(d.ref)===todayRefNorm;
        const isOpen = openIdx === i;
        const verses = d.verses||[];
        const prayer = d.prayer||"";
        let body = "";
        if (isOpen){
          const versesHtml = verses.length ? `<div class="pal-verses"><small>VERSÍCULO-CHAVE</small>${verses.map(vt => `<p>${escapeHtml(vt)}</p>`).join("")}</div>` : `<div class="pal-verses"><small>VERSÍCULO-CHAVE</small><p>${escapeHtml(d.ref)}</p></div>`;
          const textHtml = `<p class="pal-text">${escapeHtml(d.full || "")}</p>`;
          const prayerHtml = prayer ? `<div class="pal-question" style="border-left-color:#a78bfa;background:rgba(167,139,250,.08)"><small>ORAÇÃO</small><p>${escapeHtml(prayer)}</p></div>` : "";
          let prompt = "";
          const poolMatch = pool.find(v => normRef(v.ref)===normRef(d.ref));
          if (poolMatch) prompt = poolMatch.prompt;
          const questionHtml = prompt ? `<div class="pal-question"><small>PERGUNTA PARA A CÉLULA</small><p>${escapeHtml(prompt)}</p></div>` : "";
          body = `${versesHtml}${textHtml}${questionHtml}${prayerHtml}`;
        }
        const toggleLabel = isOpen ? "Fechar" : "Abrir Palavra completa";
        const toggleClass = isOpen ? "quiet-button" : "primary-button";
        return `<article class="pal-card ${isToday?"is-today":""}">
          <div class="pal-card-head">
            <span class="pal-ref">${escapeHtml(d.ref)}</span>
            ${isToday?'<span class="pal-badge">Hoje</span>':""}
            <span style="margin-left:auto;color:#706f6c;font-size:10px">#${i+1}</span>
          </div>
          <h3>${escapeHtml(d.theme)}</h3>
          <p class="pal-preview">${escapeHtml((d.full||"").slice(0,160))}${(d.full||"").length>160?"…":""}</p>
          ${isOpen ? `<div class="pal-divider" style="margin-top:12px"></div><div class="pal-body open" style="padding-top:12px">${body}</div>` : ""}
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
        const d=devocs[i];
        let t;
        const vv=(d.verses||[]).join("\n");
        t=`*${d.theme}* — ${d.ref}\n\n${vv}\n\n${d.full}`;
        const poolMatch = pool.find(v => normRef(v.ref)===normRef(d.ref));
        if (poolMatch) t+=`\n\n_${poolMatch.prompt}_`;
        if (d.prayer) t+=`\n\n${d.prayer}`;
        navigator.clipboard?.writeText(t).then(()=> toast("Copiado ✓")).catch(()=> {});
        return;
      }
    });
    document.getElementById("palPages")?.addEventListener("click", (e) => {
      const b=e.target.closest("[data-page]"); if(!b||b.disabled) return;
      const p=parseInt(b.dataset.page,10); if(p>=1){ page=p; openIdx=null; render(); window.scrollTo({top:0, behavior:"smooth"}); }
    });
    render();
  });
  function toast(msg){
    let el=document.getElementById("_toast");
    if(!el){ el=document.createElement("div"); el.id="_toast"; el.style.cssText="position:fixed;left:50%;bottom:18px;transform:translateX(-50%);background:var(--ink);color:var(--void);padding:10px 16px;border-radius:999px;font-weight:700;font-size:13px;z-index:30;box-shadow:0 10px 30px rgba(0,0,0,.4)"; document.body.appendChild(el); }
    el.textContent=msg; el.style.opacity="1"; setTimeout(()=> el.style.opacity="0", 1800);
  }
})();
