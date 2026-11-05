import test from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { applyFilters } from '../backend/core.js';
import { formatReport } from '../backend/telegram.js';

test('combined admin and export filter includes old complaints and aspirations', async () => {
  let request;
  const db = createClient('https://example.supabase.co', 'test-key', {
    global: { fetch: async (input) => {
      request = new URL(String(input));
      return new Response('[]', { headers: { 'Content-Type': 'application/json' } });
    } }
  });
  const { error } = await applyFilters(db.from('reports').select('*'), { type: 'aspirasi', status: 'baru' });
  assert.equal(error, null);
  assert.equal(request.searchParams.get('type'), 'in.(keluhan,aspirasi)');
  assert.equal(request.searchParams.get('status'), 'eq.baru');
  await applyFilters(db.from('reports').select('*'), { type: 'mental_health' });
  assert.equal(request.searchParams.get('type'), 'eq.mental_health');
});

test('old complaints and new aspirations use the same Telegram service label', () => {
  for (const type of ['keluhan', 'aspirasi']) {
    const output = formatReport({type, title:'Pesan mahasiswa', description:'Perlu perbaikan', status:'baru', created_at:'2026-11-05T00:00:00Z'});
    assert.match(output, /Suara & Aspirasi/);
  }
});
