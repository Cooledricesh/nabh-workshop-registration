import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Supabase environment configuration', () => {
  it('documents the publishable-key variable used by Vercel', () => {
    const supabaseClient = readFileSync(join(process.cwd(), 'src/lib/supabase.ts'), 'utf8');
    const envExample = readFileSync(join(process.cwd(), '.env.example'), 'utf8');

    expect(supabaseClient).toContain('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
    expect(envExample).toContain('NEXT_PUBLIC_SUPABASE_URL=');
    expect(envExample).toContain('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=');
  });
});
