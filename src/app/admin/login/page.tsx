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
        <p className="muted">관리자에게 전달받은 비밀번호를 입력해주세요.</p>
        <LoginForm action={loginAdmin} />
      </div>
    </main>
  );
}
