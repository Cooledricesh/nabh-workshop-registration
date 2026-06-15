'use client';

import { useActionState, useMemo, useState } from 'react';
import { submitRegistration, type ActionState } from './actions';
import { getRemainingSeats, isWorkshopSelectable } from '@/lib/registration';
import type { ParticipantDraft, RepresentativeCredentials, WorkshopAvailability } from '@/lib/types';

type ParticipantFormRow = ParticipantDraft & { id: string };

const initialRow = (): ParticipantFormRow => ({
  id: crypto.randomUUID(),
  name: '',
  affiliation: '',
  position: '',
  workshopIds: [],
});

const initialRepresentative = (): RepresentativeCredentials => ({ name: '', password: '' });
const initialState: ActionState = { ok: false, message: '' };

function setSlotSelection(row: ParticipantFormRow, slotWorkshops: WorkshopAvailability[], workshopId: string) {
  const slotIds = new Set(slotWorkshops.map((workshop) => workshop.id));
  return {
    ...row,
    workshopIds: [...row.workshopIds.filter((id) => !slotIds.has(id)), ...(workshopId ? [workshopId] : [])],
  };
}

function WorkshopRadioGroup({
  label,
  row,
  workshops,
  onChange,
}: {
  label: string;
  row: ParticipantFormRow;
  workshops: WorkshopAvailability[];
  onChange: (workshopId: string) => void;
}) {
  const selected = row.workshopIds.find((id) => workshops.some((workshop) => workshop.id === id)) ?? '';
  return (
    <fieldset className="workshop-section">
      <legend>{label}</legend>
      <div className="workshop-grid">
        <label className="workshop-option">
          <input type="radio" checked={selected === ''} onChange={() => onChange('')} />
          <strong>선택 안 함</strong>
        </label>
        {workshops.map((workshop) => {
          const selectable = isWorkshopSelectable(workshop);
          return (
            <label key={workshop.id} className={`workshop-option ${selectable ? '' : 'disabled'}`}>
              <input
                type="radio"
                checked={selected === workshop.id}
                disabled={!selectable}
                onChange={() => onChange(workshop.id)}
              />
              <strong>{workshop.title}</strong>
              <span className="muted">
                {selectable ? `잔여 ${getRemainingSeats(workshop)} / 정원 ${workshop.capacity}` : '마감'}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function RegistrationForm({ workshops }: { workshops: WorkshopAvailability[] }) {
  const [state, formAction, pending] = useActionState(submitRegistration, initialState);
  const [representative, setRepresentative] = useState<RepresentativeCredentials>(initialRepresentative);
  const [isRepresentativeReady, setIsRepresentativeReady] = useState(false);
  const [rows, setRows] = useState<ParticipantFormRow[]>([initialRow()]);
  const morning = useMemo(() => workshops.filter((workshop) => workshop.slot === 'morning'), [workshops]);
  const afternoon = useMemo(() => workshops.filter((workshop) => workshop.slot === 'afternoon'), [workshops]);
  const participants = rows.map((row) => ({
    name: row.name,
    affiliation: row.affiliation,
    position: row.position,
    workshopIds: row.workshopIds,
  }));

  if (!isRepresentativeReady) {
    return (
      <section className="card representative-card">
        <h2>대표자 정보</h2>
        <p className="muted">대표자 한 명의 이름과 조회용 비밀번호로 여러 참가자를 등록하고, 나중에 전체 신청 내역을 한 번에 확인·변경할 수 있습니다.</p>
        <div className="lookup-form">
          <div>
            <label>대표자 이름</label>
            <input
              value={representative.name}
              onChange={(event) => setRepresentative((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </div>
          <div>
            <label>조회용 비밀번호</label>
            <input
              type="password"
              value={representative.password}
              onChange={(event) => setRepresentative((current) => ({ ...current, password: event.target.value }))}
              required
            />
          </div>
          <button
            type="button"
            onClick={() => {
              if (representative.name.trim() && representative.password.trim()) {
                setIsRepresentativeReady(true);
              }
            }}
            disabled={!representative.name.trim() || !representative.password.trim()}
          >
            대표자 확인 후 워크숍 선택하기
          </button>
        </div>
      </section>
    );
  }

  return (
    <form action={formAction} className="card">
      <input type="hidden" name="representativeName" value={representative.name.trim()} />
      <input type="hidden" name="representativePassword" value={representative.password.trim()} />
      <input type="hidden" name="participants" value={JSON.stringify(participants)} />
      <input type="hidden" name="workshops" value={JSON.stringify(workshops)} />

      <div className="participant-heading">
        <div>
          <p className="muted">대표자: {representative.name}</p>
          <h2>참가자 정보와 워크숍 선택</h2>
        </div>
        <button type="button" className="secondary" onClick={() => setIsRepresentativeReady(false)}>대표자 정보 수정</button>
      </div>

      {rows.map((row, index) => (
        <div key={row.id} className="card participant-card">
          <div className="participant-heading">
            <h3>참가자 {index + 1}</h3>
            <p className="muted">참가자별로 오전/오후 워크숍을 각각 선택할 수 있습니다.</p>
          </div>
          <div className="row participant-info-row">
            <div>
              <label>이름</label>
              <input
                value={row.name}
                onChange={(event) => setRows((current) => current.map((item) => item.id === row.id ? { ...item, name: event.target.value } : item))}
                required
              />
            </div>
            <div>
              <label>소속</label>
              <input
                value={row.affiliation}
                onChange={(event) => setRows((current) => current.map((item) => item.id === row.id ? { ...item, affiliation: event.target.value } : item))}
                required
              />
            </div>
            <div>
              <label>직책</label>
              <input
                value={row.position}
                onChange={(event) => setRows((current) => current.map((item) => item.id === row.id ? { ...item, position: event.target.value } : item))}
                required
              />
            </div>
            <button type="button" className="danger" disabled={rows.length === 1} onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))}>
              삭제
            </button>
          </div>

          <WorkshopRadioGroup
            label="오전 워크숍"
            row={row}
            workshops={morning}
            onChange={(workshopId) => setRows((current) => current.map((item) => item.id === row.id ? setSlotSelection(item, morning, workshopId) : item))}
          />
          <WorkshopRadioGroup
            label="오후 워크숍"
            row={row}
            workshops={afternoon}
            onChange={(workshopId) => setRows((current) => current.map((item) => item.id === row.id ? setSlotSelection(item, afternoon, workshopId) : item))}
          />
        </div>
      ))}

      <div className="header">
        <button type="button" className="secondary" onClick={() => setRows((current) => [...current, initialRow()])}>참가자 추가</button>
        <button disabled={pending} type="submit">{pending ? '등록 중...' : '일괄 등록'}</button>
      </div>
      {state.message ? <p className={state.ok ? 'success' : 'error'}>{state.message}</p> : null}
      <p className="muted">각 참가자는 오전 1개, 오후 1개까지 선택할 수 있습니다. 선택하지 않아도 등록할 수 있습니다.</p>
    </form>
  );
}
