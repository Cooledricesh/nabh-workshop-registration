'use client';

export default function ErrorPage({ error }: { error: Error }) {
  return (
    <main>
      <div className="card">
        <h1>설정 확인 필요</h1>
        <p className="error">{error.message}</p>
        <p className="muted">Supabase 환경변수와 schema.sql 적용 여부를 확인해 주세요.</p>
      </div>
    </main>
  );
}
