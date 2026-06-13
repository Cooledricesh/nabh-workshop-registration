export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { listRegistrations, listWorkshops } from '@/lib/data';
import { createWorkshopAction, deleteWorkshopAction, logoutAdmin, updateWorkshopAction } from '../actions';

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  const [workshops, registrations] = await Promise.all([listWorkshops(), listRegistrations()]);

  return (
    <main>
      <div className="header">
        <div>
          <p className="muted">관리자</p>
          <h1>워크숍/등록 관리</h1>
        </div>
        <form action={logoutAdmin}><button className="secondary">로그아웃</button></form>
      </div>

      <section className="card">
        <h2>워크숍 추가</h2>
        <form action={createWorkshopAction} className="admin-workshop">
          <input name="title" placeholder="워크숍 제목" required />
          <select name="slot" defaultValue="morning">
            <option value="morning">오전</option>
            <option value="afternoon">오후</option>
          </select>
          <input name="capacity" type="number" min="0" defaultValue="30" required />
          <label><input name="isOpen" type="checkbox" defaultChecked /> 공개</label>
          <button type="submit">추가</button>
        </form>
      </section>

      <section className="card">
        <h2>워크숍 목록</h2>
        {workshops.map((workshop) => (
          <form key={workshop.id} action={updateWorkshopAction} className="admin-workshop">
            <input type="hidden" name="id" value={workshop.id} />
            <input name="title" defaultValue={workshop.title} required />
            <select name="slot" defaultValue={workshop.slot}>
              <option value="morning">오전</option>
              <option value="afternoon">오후</option>
            </select>
            <input name="capacity" type="number" min="0" defaultValue={workshop.capacity} required />
            <label><input name="isOpen" type="checkbox" defaultChecked={workshop.isOpen} /> 공개</label>
            <button type="submit">저장</button>
            <button formAction={deleteWorkshopAction} className="danger">삭제</button>
            <p className="muted">등록 {workshop.registeredCount}명 / 정원 {workshop.capacity}명</p>
          </form>
        ))}
      </section>

      <section className="card">
        <h2>등록자 목록</h2>
        <table>
          <thead>
            <tr>
              <th>등록시각</th>
              <th>이름</th>
              <th>소속</th>
              <th>직책</th>
              <th>워크숍</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((registration) => (
              <tr key={registration.id}>
                <td>{new Date(registration.createdAt).toLocaleString('ko-KR')}</td>
                <td>{registration.name}</td>
                <td>{registration.affiliation}</td>
                <td>{registration.position}</td>
                <td>{registration.workshops.length ? registration.workshops.map((workshop) => `${workshop.slot === 'morning' ? '오전' : '오후'} ${workshop.title}`).join(', ') : '선택 없음'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
