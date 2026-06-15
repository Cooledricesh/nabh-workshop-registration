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
  workshopIds: [],
});

const initialState: ActionState = { ok: false, message: '' };

function setWorkshopSelection(row: ParticipantFormRow, workshopId: string) {
  return {
    ...row,
    workshopIds: workshopId ? [workshopId] : [],
  };
}

function WorkshopRadioGroup({
  row,
  workshops,
  onChange,
}: {
  row: ParticipantFormRow;
  workshops: WorkshopAvailability[];
  onChange: (workshopId: string) => void;
}) {
  const selected = row.workshopIds[0] ?? '';
  return (
    <div>
      <label>참가 워크숍</label>
      <div className="workshop-grid">
        <label className="workshop-option">
          <input type="radio" checked={selected === ''} onChange={() => onChange('')} />
          선택 안 함
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
    </div>
  );
}

export default function RegistrationForm({ workshops }: { workshops: WorkshopAvailability[] }) {
  const [state, formAction, pending] = useActionState(submitRegistration, initialState);
  const [rows, setRows] = useState<ParticipantFormRow[]>([initialRow()]);
  const allWorkshops = useMemo(() => workshops, [workshops]);
  const participants = rows.map((row) => ({
    name: row.name,
    affiliation: row.affiliation,
    position: row.position,
    workshopIds: row.workshopIds,
  }));

  return (
    <form action={formAction} className="card">
      <input type="hidden" name="participants" value={JSON.stringify(participants)} />
      <input type="hidden" name="workshops" value={JSON.stringify(allWorkshops)} />

      <h2>참가자 정보</h2>
      {rows.map((row) => (
        <div key={row.id} className="card">
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
            <button type="button" className="danger" disabled={rows.length === 1} onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))}>
              삭제
            </button>
          </div>

          <WorkshopRadioGroup
            row={row}
            workshops={workshops}
            onChange={(workshopId) => setRows((current) => current.map((item) => item.id === row.id ? setWorkshopSelection(item, workshopId) : item))}
          />
        </div>
      ))}

      <div className="header">
        <button type="button" className="secondary" onClick={() => setRows((current) => [...current, initialRow()])}>참가자 추가</button>
        <button disabled={pending} type="submit">{pending ? '등록 중...' : '일괄 등록'}</button>
      </div>
      {state.message ? <p className={state.ok ? 'success' : 'error'}>{state.message}</p> : null}
      <p className="muted">각 참가자는 워크숍을 선택하지 않거나 1개만 선택할 수 있습니다. 전체 배치 단위로 정원을 검사합니다.</p>
    </form>
  );
}
