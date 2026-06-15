'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { getRemainingSeats, isWorkshopSelectable } from '@/lib/registration';
import type { RegistrationLookupResult, RepresentativeCredentials, SessionSlot, WorkshopAvailability } from '@/lib/types';
import { lookupRegistrationAction, type LookupState } from '../actions';

function makeInitialState(workshops: WorkshopAvailability[]): LookupState {
  return { ok: false, message: '', results: [], workshops };
}

function selectedWorkshopId(registration: RegistrationLookupResult, slot: SessionSlot) {
  return registration.workshops.find((workshop) => workshop.slot === slot)?.id ?? '';
}

function slotLabel(slot: SessionSlot) {
  return slot === 'morning' ? '오전 워크숍' : '오후 워크숍';
}

function WorkshopSelect({
  slot,
  workshops,
  selectedWorkshopId,
  onChange,
}: {
  slot: SessionSlot;
  workshops: WorkshopAvailability[];
  selectedWorkshopId: string;
  onChange: (workshopId: string) => void;
}) {
  const slotWorkshops = workshops.filter((workshop) => workshop.slot === slot);
  return (
    <div>
      <label>{slotLabel(slot)}</label>
      <select value={selectedWorkshopId} onChange={(event) => onChange(event.target.value)}>
        <option value="">선택 안 함</option>
        {slotWorkshops.map((workshop) => {
          const isCurrent = workshop.id === selectedWorkshopId;
          const selectable = isCurrent || isWorkshopSelectable(workshop);
          return (
            <option key={workshop.id} value={workshop.id} disabled={!selectable}>
              {workshop.title} · {selectable ? `잔여 ${getRemainingSeats(workshop)} / 정원 ${workshop.capacity}` : '마감'}
            </option>
          );
        })}
      </select>
    </div>
  );
}

function RegistrationEditForm({
  registration,
  workshops,
  credentials,
  formAction,
  pending,
}: {
  registration: RegistrationLookupResult;
  workshops: WorkshopAvailability[];
  credentials: RepresentativeCredentials;
  formAction: (payload: FormData) => void;
  pending: boolean;
}) {
  const serverSelectedWorkshopIds = useMemo(
    () => ({
      morning: selectedWorkshopId(registration, 'morning'),
      afternoon: selectedWorkshopId(registration, 'afternoon'),
    }),
    [registration],
  );
  const [selectedWorkshopIds, setSelectedWorkshopIds] = useState(serverSelectedWorkshopIds);

  useEffect(() => {
    setSelectedWorkshopIds(serverSelectedWorkshopIds);
  }, [serverSelectedWorkshopIds]);

  const selectedValues = [selectedWorkshopIds.morning, selectedWorkshopIds.afternoon].filter(Boolean);

  return (
    <article className="lookup-result-card">
      <div>
        <strong>{registration.name}</strong>
        <p className="muted">{registration.affiliation} · {registration.position}</p>
        <p className="muted">등록시각: {new Date(registration.createdAt).toLocaleString('ko-KR')}</p>
      </div>
      <div className="lookup-edit-stack">
        <form action={formAction} className="lookup-edit-form">
          <input type="hidden" name="intent" value="update" />
          <input type="hidden" name="name" value={credentials.name} />
          <input type="hidden" name="password" value={credentials.password} />
          <input type="hidden" name="registrationId" value={registration.id} />
          {selectedValues.map((workshopId) => (
            <input key={workshopId} type="hidden" name="workshopIds" value={workshopId} />
          ))}
          <WorkshopSelect
            slot="morning"
            workshops={workshops}
            selectedWorkshopId={selectedWorkshopIds.morning}
            onChange={(workshopId) => setSelectedWorkshopIds((current) => ({ ...current, morning: workshopId }))}
          />
          <WorkshopSelect
            slot="afternoon"
            workshops={workshops}
            selectedWorkshopId={selectedWorkshopIds.afternoon}
            onChange={(workshopId) => setSelectedWorkshopIds((current) => ({ ...current, afternoon: workshopId }))}
          />
          <button type="submit" disabled={pending}>{pending ? '변경 중...' : '이 참가자 신청 변경'}</button>
        </form>
        <form action={formAction} className="inline-form">
          <input type="hidden" name="intent" value="delete" />
          <input type="hidden" name="name" value={credentials.name} />
          <input type="hidden" name="password" value={credentials.password} />
          <input type="hidden" name="registrationId" value={registration.id} />
          <button type="submit" className="danger" disabled={pending}>{pending ? '삭제 중...' : '삭제하기'}</button>
        </form>
      </div>
    </article>
  );
}

export default function LookupForm({ workshops }: { workshops: WorkshopAvailability[] }) {
  const [state, formAction, pending] = useActionState(lookupRegistrationAction, makeInitialState(workshops));
  const currentWorkshops = state.workshops.length ? state.workshops : workshops;
  const credentials = state.credentials;

  return (
    <section className="card">
      <h2>대표자 기준 등록 확인</h2>
      <p className="muted">대표자 이름과 조회용 비밀번호를 입력하면, 해당 대표자가 등록한 모든 참가자와 워크숍 신청 내역을 한 번에 확인하고 변경할 수 있습니다.</p>
      <form action={formAction} className="lookup-form">
        <input type="hidden" name="intent" value="lookup" />
        <div>
          <label>대표자 이름</label>
          <input name="name" defaultValue={credentials?.name ?? ''} required />
        </div>
        <div>
          <label>조회용 비밀번호</label>
          <input name="password" type="password" defaultValue={credentials?.password ?? ''} required />
        </div>
        <button type="submit" disabled={pending}>{pending ? '조회 중...' : '조회하기'}</button>
      </form>
      {state.message ? <p className={state.ok ? 'success' : 'error'}>{state.message}</p> : null}
      {state.results.length && credentials ? (
        <div className="lookup-results">
          {state.results.map((registration) => (
            <RegistrationEditForm
              key={registration.id}
              registration={registration}
              workshops={currentWorkshops}
              credentials={credentials}
              formAction={formAction}
              pending={pending}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
