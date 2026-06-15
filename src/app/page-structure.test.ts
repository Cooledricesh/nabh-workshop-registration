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

  it('shows the confirmed symposium schedule and fixed workshop seeds', () => {
    const rootPage = read('src/app/page.tsx');
    const schema = read('schema.sql');
    const registrationForm = read('src/app/registration-form.tsx');
    const lookupForm = read('src/app/lookup/lookup-form.tsx');
    const adminPage = read('src/app/admin/page.tsx');
    const dataLayer = read('src/lib/data.ts');
    const lookupPageExists = existsSync(join(appDir, 'lookup', 'page.tsx'));

    for (const text of [
      '09:30',
      '집결',
      '은하수 합창단',
      '개회',
      'Quality Rights(아주대)',
      'Personal Medicine(대동병원)',
      '미술치료의 이해(이음병원)',
      '자유시간',
      '동촌유원지-대돈가',
      '박상운 병원장',
      'V-cat(대동병원)',
      '음악치료의 이해(이음병원)',
      '행복한 미술(다움병원)',
      '슐렌(참사랑병원)',
      '참여 기관',
      '한국정신사회재활협회',
      '주관기관',
      '이음병원',
      '대동병원',
      '다움병원',
      '천주의성요한병원',
      '참사랑병원',
      '아주대학교병원 정신건강의학과',
      '국립정신건강센터',
    ]) {
      expect(rootPage).toContain(text);
    }

    for (const title of [
      'Quality Rights(아주대)',
      'Personal Medicine(대동병원)',
      '미술치료의 이해(이음병원)',
      'V-cat(대동병원)',
      '음악치료의 이해(이음병원)',
      '행복한 미술(다움병원)',
      '슐렌(참사랑병원)',
    ]) {
      expect(schema).toContain(title);
    }

    expect(registrationForm).toContain('오전 워크숍');
    expect(registrationForm).toContain('오후 워크숍');
    expect(registrationForm).not.toContain('번 참가자 오전 워크숍');
    expect(registrationForm).not.toContain('번 참가자 오후 워크숍');
    expect(registrationForm).toContain('대표자 정보');
    expect(registrationForm).toContain('대표자 이름');
    expect(registrationForm).toContain('비밀번호 재확인');
    expect(registrationForm).toContain('/lookup');
    expect(registrationForm).toContain('내 등록 확인');
    expect(registrationForm).toContain('getWorkshopCapacityNotice');
    expect(registrationForm).not.toContain('잔여 ${getRemainingSeats(workshop)} / 정원 ${workshop.capacity}');
    expect(registrationForm).toContain('대표자 확인 후 워크숍 선택하기');
    expect(registrationForm).not.toContain('participant.password');
    expect(registrationForm).toContain('조회용 비밀번호');
    expect(rootPage).toContain('/admin');
    expect(rootPage).toContain('/lookup');
    expect(rootPage).toContain('http://www.eumhospital.co.kr/');
    expect(rootPage).toContain('https://www.ncmh.go.kr/');
    expect(rootPage).toContain('http://www.kapr.or.kr/');
    expect(rootPage).toContain('/institutions/kapr-logo.jpg');
    expect(rootPage).toContain('/institutions/daum-logo.jpg');
    expect(rootPage).toContain('/institutions/yohan-logo.jpg');
    expect(rootPage).toContain('/institutions/chamsarang-logo.jpg');
    expect(lookupForm).toContain('useEffect');
    expect(lookupForm).toContain('selectedWorkshopIds');
    expect(lookupForm).toContain('삭제하기');
    expect(lookupForm).toContain('workshopClosedLabel');
    expect(lookupForm).not.toContain('getWorkshopCapacityNotice');
    expect(lookupForm).not.toContain('마감 임박');
    expect(lookupForm).not.toContain('잔여 ${');
    expect(lookupPageExists).toBe(true);
    expect(schema).toContain('create table if not exists public.registration_groups');
    expect(schema).toContain('group_id uuid');
    expect(schema).toContain('find_registrations_by_name_password');
    expect(schema).toContain('update_registration_workshops');
    expect(schema).toContain('delete_registration');
    expect(adminPage).toContain('워크숍별 신청자');
    expect(adminPage).toContain('registrationsByWorkshop');
    expect(dataLayer).toContain('listRegistrationsByWorkshop');
    expect(dataLayer).toContain("admin_update_workshop");
    expect(dataLayer).toContain("admin_create_workshop");
    expect(dataLayer).toContain("admin_delete_workshop");
    expect(schema).toContain("'Quality Rights(아주대)', 'morning', 25");
    expect(schema).toContain("'V-cat(대동병원)', 'afternoon', 10");
    expect(schema).toContain("'슐렌(참사랑병원)', 'afternoon', 25");
  });
});
