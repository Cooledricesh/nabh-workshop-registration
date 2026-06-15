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
  '슐렌(참사랑병원)',
];


const institutionLinks = [
  { name: '한국정신사회재활협회', url: 'http://www.kapr.or.kr/', logo: '/institutions/kapr-logo.jpg', note: '주관기관' },
  { name: '이음병원', url: 'http://www.eumhospital.co.kr/', logo: '/institutions/institution-1.png' },
  { name: '대동병원', url: 'http://www.ddhosp.com/', logo: '/institutions/institution-2.png' },
  { name: '다움병원', url: 'http://daumhospital.co.kr/', logo: '/institutions/daum-logo.jpg' },
  { name: '천주의성요한병원', url: 'http://www.yohanhos.or.kr/', logo: '/institutions/yohan-logo.jpg' },
  { name: '참사랑병원', url: 'http://www.clh.co.kr/', logo: '/institutions/chamsarang-logo.jpg' },
  { name: '아주대학교병원 정신건강의학과', url: 'https://hosp.ajoumc.or.kr/dept/deptView.do?deptNo=22&deptCd=PSY', logo: '/institutions/institution-6.png' },
  { name: '국립정신건강센터', url: 'https://www.ncmh.go.kr/', logo: '/institutions/institution-7.jpg' },
];

const schedule = [
  { time: '09:30', title: '집결', detail: '6층 강당', type: 'opening' },
  { time: '09:40', title: '은하수 합창단', detail: '6층 강당', type: 'opening' },
  { time: '09:50', title: '개회', detail: '낮병원 심포지엄 개회', type: 'opening' },
  { time: '10:00–12:00', title: '오전 워크숍 3개 세션 동시 진행', detail: 'Quality Rights는 12시까지, 나머지 두 세션은 11시 30분 종료 후 자유시간', type: 'workshop' },
  { time: '12:00–13:00', title: '점심', detail: '8층 식당', type: 'meal' },
  { time: '13:00–14:00', title: '병원 라운딩', detail: '낮병원 현장 라운딩', type: 'tour' },
  { time: '14:00–15:00', title: '특강', detail: '대동병원 박상운 병원장 · 6층 강당', type: 'lecture' },
  { time: '15:00–16:30', title: '오후 워크숍 4개 세션 동시 진행', detail: '대동병원, 이음병원, 다움병원, 참사랑병원 세션', type: 'workshop' },
  { time: '16:30–17:00', title: '폐회', detail: '6층 강당', type: 'closing' },
  { time: '17:00–17:30', title: '식당 이동', detail: '동촌유원지-대돈가', type: 'meal' },
];

export default function SymposiumPage() {
  return (
    <main>
      <section className="hero compact-hero">
        <div>
          <p className="eyebrow">2026-06-26 · 낮병원 심포지엄</p>
          <h1>낮병원 심포지엄</h1>
          <p className="lead short">오전 3개, 오후 4개 워크숍을 선택 등록할 수 있습니다.</p>
        </div>
        <nav className="actions compact" aria-label="주요 메뉴">
          <Link className="button" href="/workshops">워크숍 등록</Link>
          <Link className="button secondary-link" href="/lookup">내 등록 확인</Link>
          <Link className="button secondary-link" href="/admin">관리자</Link>
        </nav>
      </section>

      <section className="card agenda-card">
        <div className="section-title">
          <p className="muted">Agenda</p>
          <h2>전체 일정표</h2>
        </div>
        <div className="agenda-table">
          {schedule.map((item) => (
            <article key={`${item.time}-${item.title}`} className={`agenda-row ${item.type}`}>
              <time>{item.time}</time>
              <div>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid">
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
        </div>
      </section>

      <section className="card institutions-card">
        <div className="section-title">
          <p className="muted">Participating Institutions</p>
          <h2>참여 기관</h2>
        </div>
        <div className="institution-grid">
          {institutionLinks.map((institution) => (
            <a
              key={institution.name}
              className="institution-card"
              href={institution.url}
              target="_blank"
              rel="noreferrer"
            >
              <div className="institution-logo-box" aria-hidden="true">
                {institution.logo ? (
                  <img src={institution.logo} alt="" />
                ) : (
                  <span>{institution.name.slice(0, 1)}</span>
                )}
              </div>
              <div>
                <strong>{institution.name}</strong>
                <p className="muted">{institution.note ?? '기관 홈페이지 바로가기'}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
