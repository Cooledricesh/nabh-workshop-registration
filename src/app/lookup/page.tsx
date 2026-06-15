import Link from 'next/link';
import LookupForm from './lookup-form';

export default function LookupPage() {
  return (
    <main>
      <div className="header">
        <div>
          <p className="muted">낮병원 심포지엄</p>
          <h1>등록 내역 확인</h1>
        </div>
        <div className="actions compact">
          <Link className="button secondary-link" href="/">일정표</Link>
          <Link className="button" href="/workshops">워크숍 등록</Link>
        </div>
      </div>
      <LookupForm />
    </main>
  );
}
