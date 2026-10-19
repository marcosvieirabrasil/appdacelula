import { beforeEach, expect, it, vi } from 'vitest';
import script from '../../public/palavras.js?raw';

const word = { ref: 'Salmos 23:1', theme: 'O cuidado de Deus', full: 'O Senhor é o meu pastor.', verses: ['O Senhor é o meu pastor.'] };

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = '<div id="palGrid"></div>';
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => [word] }));
});

it('persists a word favorite independently from dynamics and removes it on a second click', async () => {
  localStorage.setItem('cell-favorites', '["um-objeto"]');
  window.eval(script);
  document.dispatchEvent(new Event('DOMContentLoaded'));
  await vi.waitFor(() => expect(document.querySelector('[data-favorite]')).not.toBeNull());
  const clickFavorite = () => {
    const button = document.querySelector<HTMLButtonElement>('[data-favorite]');
    if (!button) throw new Error('Missing favorite action');
    button.click();
  };
  clickFavorite();
  expect(JSON.parse(localStorage.getItem('cell-word-favorites') || '[]')).toEqual(['Salmos 23:1|O cuidado de Deus']);
  expect(JSON.parse(localStorage.getItem('cell-favorites') || '[]')).toEqual(['um-objeto']);
  clickFavorite();
  expect(JSON.parse(localStorage.getItem('cell-word-favorites') || '[]')).toEqual([]);
});