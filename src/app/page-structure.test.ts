import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const appDir = join(process.cwd(), 'src', 'app');

function read(relativePath: string) {
  return readFileSync(join(process.cwd(), relativePath), 'utf8');
}

describe('public page structure and copy', () => {
  it('uses 낮병원 copy and does not leave the old hospital spelling in user-facing app files', () => {
    const files = [
      'src/app/layout.tsx',
      'src/app/page.tsx',
      'src/app/workshops/page.tsx',
    ].filter((path) => existsSync(join(process.cwd(), path)));

    const combined = files.map(read).join('\n');

    expect(combined).toContain('낮병원');
    expect(combined).not.toContain('나병원');
  });

  it('keeps the root page as symposium schedule and moves registration to /workshops', () => {
    const rootPage = read('src/app/page.tsx');
    const workshopPagePath = join(appDir, 'workshops', 'page.tsx');

    expect(existsSync(workshopPagePath)).toBe(true);
    expect(rootPage).toContain('일정표');
    expect(rootPage).toContain('/workshops');
    expect(rootPage).not.toContain('RegistrationForm');
  });
});
