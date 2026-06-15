import Link from 'next/link';

const workshops = [
  '회복지향 낮병원 운영 워크숍',
  '가족·지역사회 연계 워크숍',
  '위기대응 및 사례관리 워크숍',
];

const schedule = [
  { time: '09:30–09:40', title: '개회', detail: '낮병원 심포지엄 시작 및 안내' },
  { time: '09:40–10:00', title: '병원 합창', detail: '참가자와 함께 여는 오프닝 프로그램' },
  { time: '10:00–12:00', title: '워크숍 세션', detail: '3개의 워크숍이 동시 진행됩니다.' },
  { time: '12:00–13:00', title: '마무리 및 네트워킹', detail: '워크숍 정리, 질의응답, 참가자 교류' },
];

export default function SymposiumPage() {
  return (
    <main>
      <section className="hero card">
        <p className="eyebrow">2026-06-26 · 낮병원 심포지엄</p>
        <h1>낮병원 심포지엄 일정표</h1>
        <p className="lead">
          이번 MVP는 고정 일정으로 운영합니다. 10시부터 12시까지 세 개의 워크숍이 동시에 열리며,
          참가자는 등록 페이지에서 원하는 워크숍 하나를 선택할 수 있습니다.
        </p>
        <div className="actions">
          <Link className="button" href="/workshops">워크숍 등록하기</Link>
        </div>
      </section>

      <section className="grid">
        <div className="card">
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
        </div>

        <div className="card">
          <div className="section-title">
            <p className="muted">Workshops</p>
            <h2>10:00–12:00 동시 진행 워크숍</h2>
          </div>
          <div className="workshop-list">
            {workshops.map((title, index) => (
              <article key={title} className="workshop-summary">
                <span>{index + 1}</span>
                <strong>{title}</strong>
              </article>
            ))}
          </div>
          <p className="muted">정원은 워크숍별 30명 기준으로 운영합니다.</p>
        </div>
      </section>
    </main>
  );
}
