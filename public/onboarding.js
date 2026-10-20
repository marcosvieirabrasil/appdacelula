(() => {
  const STORAGE_KEY = "adc:profile";
  const WEEKDAY_LABEL = ["DOMINGO","SEGUNDA-FEIRA","TERÇA-FEIRA","QUARTA-FEIRA","QUINTA-FEIRA","SEXTA-FEIRA","SÁBADO"];
  const WEEKDAYS = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
  const DEFAULT_TASKS = { louvor:true, dinamica:true, palavra:true, lanche:true, foto:true, oracao:false };
  const TASK_LIST = [
    { id:"louvor", label:"Louvor", sub:"2–3 músicas", icon:"🎶" },
    { id:"dinamica", label:"Dinâmica", sub:"Quebra-gelo", icon:"🎲" },
    { id:"palavra", label:"Palavra", sub:"Leitura + diálogo", icon:"📖" },
    { id:"lanche", label:"Lanche", sub:"Levar o lanche", icon:"🍞" },
    { id:"foto", label:"Foto", sub:"Sempre por último", icon:"📸" },
    { id:"oracao", label:"Oração", sub:"Intercessão", icon:"🙏" },
  ];
  const $ = (s, r=document) => r.querySelector(s);
  function uid(){ return Math.random().toString(36).slice(2,9); }
  function loadProfile(){
    try{ const v=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null"); return v&&typeof v==="object"?v:null; }catch{ return null; }
  }
  function saveProfile(p){ localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }
  function applyProfile(p){
    if(!p) return;
    const h1=$(".topbar h1");
    if(p.name && h1) h1.textContent=`Olá, ${p.name}.`;
    else if(h1 && !p.name) h1.textContent="Olá.";
    // date-line: if no profile or skipped, keep default QUINTA 20H already in HTML

    if(p.cellName){
      const ws=$(".workspace-switcher span:nth-child(2)"); if(ws) ws.textContent=p.cellName;
    } else if(p.cellName===null){
      const ws=$(".workspace-switcher span:nth-child(2)"); if(ws) ws.textContent="Sua célula";
    }
    if(p.weekday!=null && p.time){
      const dl=$(".date-line"); if(dl){
        const label=WEEKDAY_LABEL[p.weekday]||"";
        const t=(p.time||"20:00").replace(":","H");
        dl.textContent=`PRÓXIMO ENCONTRO: ${label} · ${t}`;
      }
    }
  }
  // State
  let step=1;
  let state={
    name:"",
    cellHasName:null,
    cellName:"",
    weekday:4,
    time:"20:00",
    hasDistribution:null,
    members:[],
    enabledTasks:{...DEFAULT_TASKS},
  };
  let editing=false;

  function openModal(prefill){
    const overlay=$("#onboardingOverlay");
    if(!overlay) return;
    // prefill
    const prof=loadProfile();
    if(prefill && prof && prof.completed){
      editing=true;
      state.name=prof.name||"";
      state.cellHasName=prof.cellName?true:(prof.cellName===null?false:null);
      state.cellName=prof.cellName||"";
      state.weekday=prof.weekday!=null?prof.weekday:4;
      state.time=prof.time||"20:00";
      state.hasDistribution=prof.hasDistribution;
      state.members=(prof.members||[]).map(m=>({...m}));
      state.enabledTasks={...DEFAULT_TASKS, ...(prof.enabledTasks||{})};
      const firstHasDist=prof.hasDistribution;
      if(firstHasDist===false) step=4; else step=1;
    } else {
      editing=false;
      state={ name:"", cellHasName:null, cellName:"", weekday:4, time:"20:00", hasDistribution:null, members:[], enabledTasks:{...DEFAULT_TASKS} };
      step=1;
    }
    overlay.classList.add("open");
    document.body.style.overflow="hidden";
    render();
    setTimeout(()=>{ const first=overlay.querySelector("input,select,button"); if(first) try{first.focus()}catch{} }, 80);
  }
  function closeModal(skip){
    const overlay=$("#onboardingOverlay");
    if(!overlay) return;
    overlay.classList.remove("open");
    document.body.style.overflow="";
    if(skip){
      const now=new Date().toISOString();
      const existing=loadProfile();
      if(!existing || !existing.completed){
        saveProfile({ completed:false, skippedAt:now });
      }
    }
  }
  function render(){
    const total = state.hasDistribution===false ? 4 : 6;
    // step may be 5/6 skipped
    if(state.hasDistribution===false && step>4) step=4;
    const overlay=$("#onboardingOverlay");
    if(!overlay) return;
    const progress=overlay.querySelector("#obProgress");
    if(progress){
      progress.textContent=`${Math.min(step,total)} / ${total}`;
      const dots=progress.nextElementSibling;
      if(dots){
        dots.innerHTML=Array.from({length:total},(_,i)=>`<span class="ob-dot ${i+1===step?"active":i+1<step?"done":""}"></span>`).join("");
      }
    }
    overlay.querySelectorAll("[data-step]").forEach(el=>{
      const s=parseInt(el.dataset.step,10);
      el.style.display=s===step?"":"none";
    });
    // step contents
    const nameInput=$("#ob-name");
    if(nameInput && step===1) nameInput.value=state.name;
    const cellYes=$("#ob-cell-yes"), cellNo=$("#ob-cell-no");
    if(cellYes) cellYes.checked=state.cellHasName===true;
    if(cellNo) cellNo.checked=state.cellHasName===false;
    const cellNameWrap=$("#ob-cellName-wrap");
    if(cellNameWrap) cellNameWrap.style.display=state.cellHasName===true?"":"none";
    const cellNameInput=$("#ob-cellName");
    if(cellNameInput) cellNameInput.value=state.cellName;
    const wd=$("#ob-weekday");
    if(wd) wd.value=String(state.weekday);
    const tm=$("#ob-time");
    if(tm) tm.value=state.time;
    const distYes=$("#ob-dist-yes"), distNo=$("#ob-dist-no");
    if(distYes) distYes.classList.toggle("is-selected", state.hasDistribution===true);
    if(distNo) distNo.classList.toggle("is-selected", state.hasDistribution===false);
    renderMembers();
    renderTasks();
    // primary button label
    const primary=$("#ob-primary");
    if(primary){
      if(step===4 && state.hasDistribution===false) primary.textContent="Concluir";
      else if(step===total) primary.textContent="Concluir e começar";
      else primary.textContent="Continuar";
      primary.disabled=!canProceed();
    }
    const back=$("#ob-back");
    if(back) back.style.visibility=step===1?"hidden":"visible";
    // error
    const err=$("#ob-error");
    if(err) err.textContent="";
  }
  function canProceed(){
    if(step===1) return state.name.trim().length>=2;
    if(step===2) return state.cellHasName!==null && (state.cellHasName===false || state.cellName.trim().length>=2);
    if(step===3) return state.weekday!=null && !!state.time;
    if(step===4) return state.hasDistribution!==null;
    if(step===5) return state.members.length>=1;
    if(step===6) return Object.values(state.enabledTasks).some(Boolean);
    return true;
  }
  function renderMembers(){
    const list=$("#ob-membersList");
    if(!list) return;
    const count=$("#ob-memberCount");
    if(count) count.textContent= state.members.length ? `${state.members.length} ${state.members.length===1?"pessoa":"pessoas"}` : "0";
    if(state.members.length===0){
      list.innerHTML='<p style="color:#706f6c;font-size:12px;text-align:center;padding:10px;border:1px dashed var(--hairline);border-radius:12px">Nenhum integrante ainda. Adicione acima.</p>';
      return;
    }
    list.innerHTML=state.members.map(m=>`
      <div class="ob-member">
        <span class="avatar ${m.isLeader?"is-leader":""}" style="width:28px;height:28px;font-size:9px">${(m.name.trim().split(/\s+/).slice(0,2).map(s=>s[0]?.toUpperCase()).join("")||"?")}</span>
        <span style="flex:1;font-weight:600;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${m.name}</span>
        ${m.isLeader?'<span class="badge-leader">Líder</span>':""}
        <button type="button" class="btn-star ${m.isLeader?"is-leader":""}" data-leader="${m.id}" title="Alternar líder">★</button>
        <button type="button" class="btn-icon btn-icon--light" data-remove="${m.id}" title="Remover">✕</button>
      </div>
    `).join("");
  }
  function renderTasks(){
    const wrap=$("#ob-tasks");
    if(!wrap) return;
    const selected=Object.values(state.enabledTasks).filter(Boolean).length;
    const count=$("#ob-task-count"); if(count) count.textContent=`${selected} ${selected===1?"função ativa":"funções ativas"}`;
    wrap.innerHTML=TASK_LIST.map(t=>`
      <label class="ob-task-choice ${state.enabledTasks[t.id]?"is-on":""}">
        <input type="checkbox" ${state.enabledTasks[t.id]?"checked":""} data-task="${t.id}">
        <span class="ob-task-icon" aria-hidden="true">${t.icon}</span>
        <span class="ob-task-copy"><b>${t.label}</b><small>${t.sub}</small></span>
        <span class="ob-task-check" aria-hidden="true">✓</span>
        ${t.id==="palavra"?'<span class="ob-task-badge">alterna</span>':""}
      </label>
    `).join("");
  }
  function finish(){
    // validate final
    if(state.hasDistribution===true){
      if(state.members.length===0){ $("#ob-error").textContent="Adicione ao menos um integrante."; return; }
      if(!Object.values(state.enabledTasks).some(Boolean)){ $("#ob-error").textContent="Selecione ao menos uma função."; return; }
    }
    const profile={
      name: state.name.trim(),
      cellName: state.cellHasName===true ? state.cellName.trim() : (state.cellHasName===false ? null : null),
      weekday: state.weekday,
      time: state.time,
      hasDistribution: state.hasDistribution,
      members: state.hasDistribution===true ? state.members : [],
      enabledTasks: state.enabledTasks,
      completed:true,
      skippedAt:null,
      updatedAt:new Date().toISOString()
    };
    saveProfile(profile);
    // Keep the scale page aligned with the meeting day selected in onboarding.
    try{
      const existing=JSON.parse(localStorage.getItem("adc:escala:current")||"null")||{};
      const next=new Date();
      const weekday=Number.isInteger(profile.weekday)?profile.weekday:4;
      let daysAhead=(weekday-next.getDay()+7)%7;
      if(daysAhead===0) daysAhead=7;
      next.setDate(next.getDate()+daysAhead);
      const dateStr=[next.getFullYear(),String(next.getMonth()+1).padStart(2,"0"),String(next.getDate()).padStart(2,"0")].join("-");
      localStorage.setItem("adc:escala:current", JSON.stringify({ assignments:existing.assignments||null, dateStr }));
    }catch{}
    if(profile.hasDistribution===true){
      try{
        localStorage.setItem("adc:escala:members", JSON.stringify(profile.members));
        localStorage.setItem("adc:escala:enabled", JSON.stringify(profile.enabledTasks));
      }catch{}
    } else if(profile.hasDistribution===false){
      // keep escala as is but ensure flag is stored; if no members, clear escala members
      try{
        const existing=JSON.parse(localStorage.getItem("adc:escala:members")||"null");
        if(!existing || !Array.isArray(existing) || existing.length===0){
          localStorage.setItem("adc:escala:members", JSON.stringify([]));
        }
      }catch{}
    }
    applyProfile(profile);
    closeModal(false);
    // toast
    const toast=document.createElement("div");
    toast.textContent="Célula configurada ✓";
    toast.style.cssText="position:fixed;left:50%;bottom:18px;transform:translateX(-50%);background:var(--ink);color:var(--void);font-weight:700;font-size:13px;padding:10px 16px;border-radius:999px;box-shadow:0 10px 30px rgba(0,0,0,.4);z-index:30";
    document.body.appendChild(toast);
    setTimeout(()=> toast.remove(), 2200);
  }

  // Wire events once DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    applyProfile(loadProfile());
    const prof=loadProfile();
    const params=new URLSearchParams(location.search);
    const wantsOpen=params.get("onboarding")==="1" || location.hash==="#onboarding";
    const shouldAutoOpen = !prof || (!prof.completed && !prof.skippedAt);
    if(wantsOpen){
      setTimeout(()=> openModal(true), 300);
    } else if(shouldAutoOpen){
      setTimeout(()=> openModal(false), 600);
    }
    const overlay=$("#onboardingOverlay");
    if(!overlay) return;
    // X and backdrop = skip
    overlay.addEventListener("click", (e)=>{
      if(e.target===overlay) closeModal(true);
    });
    $("#ob-close")?.addEventListener("click", ()=> closeModal(true));
    $("#ob-skip")?.addEventListener("click", ()=> closeModal(true));
    $("#ob-back")?.addEventListener("click", ()=>{
      if(step>1){ step--; if(state.hasDistribution===false && step>4) step=4; render(); }
    });
    $("#ob-primary")?.addEventListener("click", ()=>{
      if(!canProceed()){
        const err=$("#ob-error");
        if(err){
          if(step===1) err.textContent="Digite seu nome (ao menos 2 letras).";
          else if(step===2) err.textContent= state.cellHasName===null ? "Escolha Sim ou Não." : "Digite o nome da célula.";
          else if(step===4) err.textContent="Escolha uma opção.";
          else err.textContent="Preencha o campo para continuar.";
        }
        return;
      }
      // special: step 4 with "Não distribui" -> finish immediately
      if(step===4 && state.hasDistribution===false){
        finish(); return;
      }
      const total = state.hasDistribution===false ? 4 : 6;
      if(step<total){ step++; render(); }
      else { finish(); }
    });
    // step 1
    $("#ob-name")?.addEventListener("input", (e)=>{ state.name=e.target.value; const p=$("#ob-primary"); if(p) p.disabled=!canProceed(); });
    // step 2
    $("#ob-cell-yes")?.addEventListener("change", ()=>{ state.cellHasName=true; render(); });
    $("#ob-cell-no")?.addEventListener("change", ()=>{ state.cellHasName=false; state.cellName=""; render(); });
    $("#ob-cellName")?.addEventListener("input", (e)=>{ state.cellName=e.target.value; const p=$("#ob-primary"); if(p) p.disabled=!canProceed(); });
    // step 3
    $("#ob-weekday")?.addEventListener("change", (e)=>{ state.weekday=parseInt(e.target.value,10); render(); });
    $("#ob-time")?.addEventListener("change", (e)=>{ state.time=e.target.value; render(); });
    // step 4
    $("#ob-dist-yes")?.addEventListener("click", ()=>{ state.hasDistribution=true; render(); });
    $("#ob-dist-no")?.addEventListener("click", ()=>{ state.hasDistribution=false; render(); });
    // step 5
    $("#ob-addMember")?.addEventListener("click", ()=>{
      const inp=$("#ob-memberName");
      const name=(inp.value||"").trim();
      if(!name) return;
      if(state.members.some(m=> m.name.toLowerCase()===name.toLowerCase())){
        $("#ob-error").textContent="Esse nome já existe.";
        return;
      }
      state.members.push({ id:uid(), name, isLeader: state.members.length===0 });
      inp.value="";
      $("#ob-error").textContent="";
      render();
    });
    $("#ob-memberName")?.addEventListener("keydown", (e)=>{ if(e.key==="Enter"){ e.preventDefault(); $("#ob-addMember").click(); } });
    $("#ob-membersList")?.addEventListener("click", (e)=>{
      const rm=e.target.closest("[data-remove]");
      if(rm){ state.members=state.members.filter(m=> m.id!==rm.dataset.remove); render(); return; }
      const ld=e.target.closest("[data-leader]");
      if(ld){
        const m=state.members.find(x=> x.id===ld.dataset.leader);
        if(m){ m.isLeader=!m.isLeader; if(!state.members.some(x=> x.isLeader)) m.isLeader=true; render(); }
      }
    });
    // step 6
    $("#ob-tasks")?.addEventListener("change", (e)=>{
      const cb=e.target.closest("[data-task]");
      if(!cb) return;
      const id=cb.dataset.task;
      state.enabledTasks[id]=cb.checked;
      const count=Object.values(state.enabledTasks).filter(Boolean).length;
      if(count===0){ state.enabledTasks[id]=true; cb.checked=true; $("#ob-error").textContent="Deixe ao menos uma função."; return; }
      $("#ob-error").textContent="";
      renderTasks();
      const p=$("#ob-primary"); if(p) p.disabled=!canProceed();
    });
    // Configurar button
    $("#openOnboarding")?.addEventListener("click", ()=> openModal(true));
    // Esc closes as skip
    document.addEventListener("keydown", (e)=>{
      if(e.key==="Escape" && $("#onboardingOverlay")?.classList.contains("open")){
        closeModal(true);
      }
    });
  });

  // expose for escala.html to trigger
  window.AdcOnboarding={ open: openModal };
})();
