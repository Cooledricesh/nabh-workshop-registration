'use client';

import { useActionState } from 'react';
import type { ActionState } from '../../actions';

const initialState: ActionState = { ok: false, message: '' };

export default function LoginForm({ action }: { action: (prev: ActionState, formData: FormData) => Promise<ActionState> }) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      <label>비밀번호</label>
      <input name="password" type="password" required />
      <p><button disabled={pending}>{pending ? '확인 중...' : '로그인'}</button></p>
      {state.message ? <p className="error">{state.message}</p> : null}
    </form>
  );
}
