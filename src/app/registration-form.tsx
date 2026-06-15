'use client';

import { useActionState, useMemo, useState } from 'react';
import { submitRegistration, type ActionState } from './actions';
import { getRemainingSeats, isWorkshopSelectable } from '@/lib/registration';
import type { ParticipantDraft, WorkshopAvailability } from '@/lib/types';

type ParticipantFormRow = ParticipantDraft & { id: string };

const initialRow = (): ParticipantFormRow => ({
  id: crypto.randomUUID(),
  name: '',
  affiliation: '',
  position: '',
  password: '',
  workshopIds: [],
});

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
  const [rows, setRows] = useState<ParticipantFormRow[]>([initialRow()]);
  const morning = useMemo(() => workshops.filter((workshop) => workshop.slot === 'morning'), [workshops]);
  const afternoon = useMemo(() => workshops.filter((workshop) => workshop.slot === 'afternoon'), [workshops]);
  const participants = rows.map((row) => ({
    name: row.name,
    affiliation: row.affiliation,
    position: row.position,
    password: row.password,
    workshopIds: row.workshopIds,
  }));

  return (
    <form action={formAction} className="card">
      <input type="hidden" name="participants" value={JSON.stringify(participants)} />
      <input type="hidden" name="workshops" value={JSON.stringify(workshops)} />

      <h2>참가자 정보</h2>
      {rows.map((row, index) => (
        <div key={row.id} className="card participant-card">
          <div className="participant-heading">
            <h3>참가자 {index + 1}</h3>
            <p className="muted">기본 정보 입력 후 오전/오후 워크숍을 각각 선택해주세요.</p>
          </div>
          <div className="row">
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
            <div>
              <label>조회용 비밀번호</label>
              <input
                type="password"
                value={row.password}
                onChange={(event) => setRows((current) => current.map((item) => item.id === row.id ? { ...item, password: event.target.value } : item))}
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
