import { describe, it, expect } from 'vitest';
import { createClient } from './client';

describe('Supabase Client', () => {
  it('should initialize a browser client', () => {
    const client = createClient('https://mock.supabase.co', 'mock-anon-key');
    expect(client).toBeDefined();
    expect(typeof client.from).toBe('function');
  });
});
