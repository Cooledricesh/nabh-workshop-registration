import Link from 'next/link';

const morningWorkshops = [
  { title: 'Quality Rights(아주대)', time: '10:00–12:00', note: '2시간 진행' },
  { title: 'Personal Medicine(대동병원)', time: '10:00–11:30', note: '90분 진행 · 이후 자유시간' },
  { title: '미술치료의 이해(이음병원)', time: '10:00–11:30', note: '90분 진행 · 이후 자유시간' },
];

const afternoonWorkshops = [
  'V-cat(대동병원)',
  '음악치료의 이해(이음병원)',
  '행복한 미술(다움병원)',
  '숲길(참사랑병원)',
];

const schedule = [
  { time: '09:30', title: '집결', detail: '6층 강당' },
  { time: '09:40', title: '은하수 합창단', detail: '6층 강당' },
  { time: '09:50', title: '개회', detail: '낮병원 심포지엄 개회' },
  { time: '10:00–12:00', title: '오전 워크숍 3개 세션 동시 진행', detail: 'Quality Rights는 12시까지, 나머지 두 세션은 11시 30분 종료 후 자유시간' },
  { time: '12:00–13:00', title: '점심', detail: '8층 식당' },
  { time: '13:00–14:00', title: '병원 라운딩', detail: '낮병원 현장 라운딩' },
  { time: '14:00–15:00', title: '특강', detail: '대동병원 박상운 병원장 · 6층 강당' },
  { time: '15:00–16:30', title: '오후 워크숍 4개 세션 동시 진행', detail: '대동병원, 이음병원, 다움병원, 참사랑병원 세션' },
  { time: '16:30–17:00', title: '폐회', detail: '6층 강당' },
  { time: '17:00–17:30', title: '식당 이동', detail: '동촌유원지-대돈가' },
];

export default function SymposiumPage() {
  return (
    <main>
      <section className="hero card">
        <p className="eyebrow">2026-06-26 · 낮병원 심포지엄</p>
        <h1>낮병원 심포지엄 일정표</h1>
        <p className="lead">
          09:30 집결로 시작해 오전에는 3개 워크숍 세션이 동시에 진행되고, 오후에는 특강 후 4개 워크숍 세션이 동시에 진행됩니다.
          참가자는 등록 페이지에서 오전 1개, 오후 1개까지 선택할 수 있습니다.
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
              <article key={`${item.time}-${item.title}`} className="timeline-item">
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
            <p className="muted">Morning Workshops</p>
            <h2>10:00 시작 · 오전 3개 세션</h2>
          </div>
          <div className="workshop-list">
            {morningWorkshops.map((workshop, index) => (
              <article key={workshop.title} className="workshop-summary">
                <span>{index + 1}</span>
                <div>
                  <strong>{workshop.title}</strong>
                  <p className="muted">{workshop.time} · {workshop.note}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title">
            <p className="muted">Afternoon Workshops</p>
            <h2>15:00–16:30 · 오후 4개 세션</h2>
          </div>
          <div className="workshop-list">
            {afternoonWorkshops.map((title, index) => (
              <article key={title} className="workshop-summary">
                <span>{index + 1}</span>
                <strong>{title}</strong>
              </article>
            ))}
          </div>
          <p className="muted">오전과 동일하게 주제(기관) 형식으로 표기했습니다.</p>
        </div>
      </section>
    </main>
  );
}
