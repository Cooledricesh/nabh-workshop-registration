import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { loginAdmin } from '../../actions';
import LoginForm from './login-form';

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect('/admin');
  }

  return (
    <main>
      <div className="card">
        <h1>관리자 로그인</h1>
        <p className="muted">기본 비밀번호는 54321입니다. 배포 시 ADMIN_PASSWORD 환경변수로 변경할 수 있습니다.</p>
        <LoginForm action={loginAdmin} />
      </div>
    </main>
  );
}
