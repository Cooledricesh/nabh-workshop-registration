import Link from 'next/link';

const schedule = [
  { time: '09:00–09:30', title: '등록 및 안내', detail: '참가 확인, 자료집 수령' },
  { time: '09:30–09:45', title: '개회 및 인사말', detail: '낮병원 심포지엄 오프닝' },
  { time: '09:45–10:30', title: '기조강연', detail: '낮병원 운영과 환자 중심 치료 흐름' },
  { time: '10:40–12:00', title: '오전 워크숍', detail: '선택형 실습 세션' },
  { time: '12:00–13:20', title: '점심 및 네트워킹', detail: '참가자 교류' },
  { time: '13:20–14:10', title: '사례 발표', detail: '현장 적용 사례 공유' },
  { time: '14:20–15:40', title: '오후 워크숍', detail: '선택형 심화 세션' },
  { time: '15:50–16:30', title: '종합 토론', detail: '질의응답 및 마무리' },
];

export default function SymposiumPage() {
  return (
    <main>
      <section className="hero card">
        <p className="eyebrow">2026-06-26 · 낮병원 심포지엄</p>
        <h1>낮병원 심포지엄 일정표</h1>
        <p className="lead">
          낮병원 운영, 환자안전, 질 향상 사례를 함께 나누는 하루입니다. 워크숍은 별도 등록 페이지에서
          참가자별로 오전 1개, 오후 1개까지 선택할 수 있습니다.
        </p>
        <div className="actions">
          <Link className="button" href="/workshops">워크숍 등록하기</Link>
          <Link className="button secondary-link" href="/admin">관리자 페이지</Link>
        </div>
      </section>

      <section className="card">
        <div className="section-title">
          <p className="muted">Program</p>
          <h2>전체 일정표</h2>
        </div>
        <div className="timeline">
          {schedule.map((item) => (
            <article key={item.time} className="timeline-item">
              <time>{item.time}</time>
              <div>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
