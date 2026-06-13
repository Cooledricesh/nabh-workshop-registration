export const dynamic = 'force-dynamic';

import { listWorkshops } from '@/lib/data';
import RegistrationForm from './registration-form';

export default async function HomePage() {
  const workshops = await listWorkshops();
  const morning = workshops.filter((workshop) => workshop.slot === 'morning');
  const afternoon = workshops.filter((workshop) => workshop.slot === 'afternoon');

  return (
    <main>
      <div className="header">
        <div>
          <p className="muted">2026-06-26</p>
          <h1>나병원 심포지엄 워크숍 등록</h1>
          <p>참가자 여러 명을 한 번에 등록할 수 있습니다. 워크숍은 선택하지 않아도 됩니다.</p>
        </div>
        <a className="button" href="/admin">관리자</a>
      </div>
      <RegistrationForm morning={morning} afternoon={afternoon} />
    </main>
  );
}
