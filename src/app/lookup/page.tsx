import Link from 'next/link';
import { listWorkshops } from '@/lib/data';
import LookupForm from './lookup-form';

export default async function LookupPage() {
  const workshops = await listWorkshops();

  return (
    <main>
      <div className="header">
        <div>
          <p className="muted">낮병원 심포지엄</p>
          <h1>등록 내역 확인·변경</h1>
        </div>
        <div className="actions compact">
          <Link className="button secondary-link" href="/">일정표</Link>
          <Link className="button" href="/workshops">워크숍 등록</Link>
        </div>
      </div>
      <LookupForm workshops={workshops} />
    </main>
  );
}
