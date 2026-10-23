// Regra da escala justa — extraída de dist/escalas/index.html (B45BBAC)
// Documentada aqui para testes e evolução futura.
// Fonte: escala justa compartilhada pelo navegador (localStorage), sem repetição até fechar ciclo.

export const DISPLAY_ORDER = ['louvor','dinamica','palavra','oferta','lanche','oracao','foto'];

export function getActiveTasks(enabledTasks) {
  const TASKS = [
    { id:'louvor' }, { id:'dinamica' }, { id:'palavra' },
    { id:'oferta' }, { id:'lanche' }, { id:'oracao' }, { id:'foto' },
  ];
  return TASKS.filter(t => enabledTasks[t.id]).sort((a,b) => DISPLAY_ORDER.indexOf(a.id)-DISPLAY_ORDER.indexOf(b.id));
}

export function maxPerPerson(activeCount, memberCount){
  if(memberCount===0) return 1;
  return Math.ceil(activeCount / memberCount);
}

export function getCounts(members, history){
  const counts={};
  members.forEach(m=> counts[m.id]={ total:0, byTask:{} });
  history.forEach(h=>{
    Object.entries(h.assignments||{}).forEach(([tid,mid])=>{
      if(counts[mid]){ counts[mid].total++; counts[mid].byTask[tid]=(counts[mid].byTask[tid]||0)+1; }
    });
  });
  return counts;
}

// Retorna true se é célula pequena (mais funções que pessoas)
export function isSmallCell(membersLen, activeLen){
  return membersLen>0 && activeLen>membersLen;
}

// Verifica se a palavra deve alternar corretamente vs histórico
export function checkPalavraAlternancia(history, novoAssigneeIsLeader){
  if(!history.length) return { ok: true, reason: 'primeiro sorteio' };
  const lastMid = history[history.length-1]?.assignments?.['palavra'];
  // Precisa saber se último foi líder — para teste puro, recebe lastWasLeader
  // Esta função é chamada com lastWasLeader derivado do histórico + members
  return null; // placeholder — teste com lastWasLeader direto
}
