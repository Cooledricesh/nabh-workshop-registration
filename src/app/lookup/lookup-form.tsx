'use client';

import { useActionState } from 'react';
import { lookupRegistrationAction, type LookupState } from '../actions';

const initialState: LookupState = { ok: false, message: '', results: [] };

export default function LookupForm() {
  const [state, formAction, pending] = useActionState(lookupRegistrationAction, initialState);

  return (
    <section className="card">
      <h2>내 등록 확인</h2>
      <p className="muted">등록할 때 입력한 이름과 조회용 비밀번호로 신청한 워크숍을 확인할 수 있습니다.</p>
      <form action={formAction} className="lookup-form">
        <div>
          <label>이름</label>
          <input name="name" required />
        </div>
        <div>
          <label>조회용 비밀번호</label>
          <input name="password" type="password" required />
        </div>
        <button type="submit" disabled={pending}>{pending ? '조회 중...' : '조회하기'}</button>
      </form>
      {state.message ? <p className={state.ok ? 'success' : 'error'}>{state.message}</p> : null}
      {state.results.length ? (
        <div className="lookup-results">
          {state.results.map((registration) => (
            <article key={registration.id} className="workshop-option">
              <strong>{registration.name}</strong>
              <span className="muted">{registration.affiliation} · {registration.position}</span>
              <span className="muted">등록시각: {new Date(registration.createdAt).toLocaleString('ko-KR')}</span>
              <div>
                <strong>선택 워크숍</strong>
                <ul>
                  {registration.workshops.length ? registration.workshops.map((workshop) => (
                    <li key={workshop.id}>{workshop.slot === 'morning' ? '오전' : '오후'} · {workshop.title}</li>
                  )) : <li>선택 없음</li>}
                </ul>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
