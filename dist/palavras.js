(() => {
  const PAGE_SIZE = 12;
  let page = 1;
  let query = "";
  let expanded = new Set();
  const pool = (window.dailyCellVerses || []).slice();
  const todayId = (() => {
    if (!pool.length) return null;
    const t = new Date(), start = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    const anchor = new Date(2026, 0, 1);
    const idx = Math.floor((start - anchor) / 86400000);
    return ((idx % pool.length) + pool.length) % pool.length;
  })();

  // Load long texts map
  let longMap = {};
  fetch("./palavras-full.json").then(r => r.json()).then(j => { longMap = j || {}; render(); }).catch(() => render());

  function norm(s){ return (s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,""); }

  function filtered(){
    const q = norm(query.trim());
    if (!q) return pool.map((v,i) => ({v,i}));
    return pool.map((v,i) => ({v,i})).filter(({v}) => norm(v.theme+" "+v.ref+" "+v.text).includes(q));
  }

  function copyText(text){
    navigator.clipboard?.writeText(text).then(() => toast("Copiado ✓")).catch(() => toast(text));
  }
  function toast(msg){
    let el = document.getElementById("_toast");
    if (!el){ el = document.createElement("div"); el.id="_toast"; el.style.cssText="position:fixed;left:50%;bottom:18px;transform:translateX(-50%);background:var(--ink);color:var(--void);font-weight:700;font-size:13px;padding:10px 16px;border-radius:999px;box-shadow:0 10px 30px rgba(0,0,0,.4);z-index:30"; document.body.appendChild(el); }
    el.textContent = msg; el.style.opacity="1";
    setTimeout(()=> el.style.opacity="0", 1800);
  }

  function shareWhats(v){
    const long = longMap[ (v.ref||"").toLowerCase().replace(/\s+/g,"")] || "";
    const parts = [`*${v.theme}* — ${v.ref}`, "", v.text];
    if (long) parts.push("", long);
    parts.push("", `_${v.prompt}_`, "", "_via appdacelula.com.br/palavras.html_");
    const text = parts.join("\n");
    const url = "https://wa.me/?text=" + encodeURIComponent(text);
    window.open(url, "_blank");
  }

  function render(){
    const list = filtered();
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (page > totalPages) page = totalPages;
    const slice = list.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

    const grid = document.getElementById("palavrasGrid");
    const count = document.getElementById("palavrasCount");
    if (count) count.textContent = `${list.length} ${list.length===1?"Palavra":"Palavras"}`;
    if (!grid) return;

    const params = new URLSearchParams(location.search);
    const focusIdx = params.get("v")!=null ? parseInt(params.get("v"),10) : todayId;

    if (!slice.length){
      grid.innerHTML = '<p style="color:#706f6c;grid-column:1/-1">Nenhuma Palavra encontrada.</p>';
    } else {
      grid.innerHTML = slice.map(({v,i}) => {
        const isToday = i === todayId;
        const isExpanded = expanded.has(i);
        const key = (v.ref||"").toLowerCase().replace(/\s+/g,"");
        const long = longMap[key] || "";
        const canExpand = !!long;
        return `<article class="palavra-card ${isToday?"is-today":""}">
          <div class="palavra-top">
            <span class="palavra-ref">${v.ref}</span>
            ${isToday?'<span class="palavra-badge">Hoje</span>':""}
            <span style="margin-left:auto;color:#706f6c;font-size:10px">#${i+1}</span>
          </div>
          <h3>${v.theme}</h3>
          <p class="palavra-text">${v.text}</p>
          ${canExpand && isExpanded ? `<p class="palavra-long">${long}</p>` : ""}
          <p class="palavra-prompt">${v.prompt}</p>
          <div class="palavra-actions">
            ${canExpand ? `<button class="btn-secondary" data-expand="${i}">${isExpanded?"Recolher":"Ler texto completo"}</button>` : ""}
            <button class="btn-secondary" data-copy="${i}">Copiar</button>
            <button class="btn-secondary" style="background:var(--ink);color:var(--void);border-color:var(--ink)" data-wa="${i}">WhatsApp</button>
            ${isToday && i!==focusIdx ? "" : ""}
          </div>
        </article>`;
      }).join("");
    }

    const pager = document.getElementById("palavrasPages");
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

    if (focusIdx!=null && query==="" && page===1){
      // Scroll to today card if on first page
      setTimeout(() => {
        const card = grid.querySelector(".is-today");
        if (card && !expanded.has(focusIdx)) card.scrollIntoView({behavior:"smooth", block:"center"});
      }, 100);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const search = document.getElementById("palavrasSearch");
    if (search){
      const p = new URLSearchParams(location.search);
      if (p.get("q")){ search.value = p.get("q"); query = p.get("q"); }
      search.addEventListener("input", () => { query = search.value; page=1; render(); });
    }
    document.getElementById("palavrasGrid")?.addEventListener("click", (e) => {
      const ex = e.target.closest("[data-expand]");
      if (ex){ const i=parseInt(ex.dataset.expand,10); if(expanded.has(i)) expanded.delete(i); else expanded.add(i); render(); return; }
      const cp = e.target.closest("[data-copy]");
      if (cp){
        const i=parseInt(cp.dataset.copy,10); const v=pool[i];
        const key=(v.ref||"").toLowerCase().replace(/\s+/g,"");
        const long = expanded.has(i) ? (longMap[key]||"") : "";
        const t=[`*${v.theme}* — ${v.ref}`,"",v.text, long? ("")+long:"", "",`_${v.prompt}_`].filter(Boolean).join("\n");
        copyText(t); return;
      }
      const wa = e.target.closest("[data-wa]");
      if (wa){ const v=pool[parseInt(wa.dataset.wa,10)]; shareWhats(v); }
    });
    document.getElementById("palavrasPages")?.addEventListener("click", (e) => {
      const b=e.target.closest("[data-page]"); if(!b||b.disabled) return;
      const p=parseInt(b.dataset.page,10); if(p>=1){ page=p; render(); window.scrollTo({top:0, behavior:"smooth"}); }
    });
    render();
  });
})();
