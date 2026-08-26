import { describe, it, expect } from 'vitest';
import { validateEnv } from './env';

describe('Environment Validation', () => {
  it('validates correct environment variables', () => {
    const validEnv = {
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    };
    
    const result = validateEnv(validEnv);
    expect(result.success).toBe(true);
  });

  it('fails on missing required variables', () => {
    const invalidEnv = {
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      // Missing ANON_KEY
    };
    
    const result = validateEnv(invalidEnv);
    expect(result.success).toBe(false);
  });

  it('fails on invalid URLs', () => {
    const invalidEnv = {
      NEXT_PUBLIC_SUPABASE_URL: 'not-a-url',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'key',
    };
    
    const result = validateEnv(invalidEnv);
    expect(result.success).toBe(false);
  });
});
