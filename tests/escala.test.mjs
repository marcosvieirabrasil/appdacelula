import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getActiveTasks, maxPerPerson, getCounts, isSmallCell } from '../src/logic/escala.js';

describe('escala justa', () => {
  it('sem repetir: conta por tarefa incrementa', () => {
    const members=[{id:'a'},{id:'b'},{id:'c'}];
    const history=[{assignments:{louvor:'a', dinamica:'b', palavra:'a'}}];
    const counts=getCounts(members, history);
    assert.equal(counts.a.byTask.louvor, 1);
    assert.equal(counts.b.byTask.dinamica, 1);
    assert.equal(counts.c.byTask.louvor, undefined);
  });

  it('Foto por último na ordem', () => {
    const enabled={ louvor:true, dinamica:true, palavra:true, oferta:true, lanche:true, foto:true, oracao:false };
    const active=getActiveTasks(enabled);
    assert.equal(active.map(t=>t.id).at(-1), 'foto');
  });

  it('Oferta fica no rodízio antes da Foto', () => {
    const enabled={ louvor:true, dinamica:true, palavra:true, oferta:true, lanche:true, foto:true, oracao:false };
    const active=getActiveTasks(enabled).map(task=>task.id);
    assert.ok(active.includes('oferta'));
    assert.ok(active.indexOf('oferta') < active.indexOf('foto'));
  });

  it('maxPerPerson com célula pequena', () => {
    assert.equal(maxPerPerson(6,4), 2);
    assert.equal(maxPerPerson(5,3), 2);
    assert.equal(maxPerPerson(4,4), 1);
  });

  it('isSmallCell', () => {
    assert.equal(isSmallCell(4,6), true);
    assert.equal(isSmallCell(4,4), false);
    assert.equal(isSmallCell(0,5), false);
  });
});
