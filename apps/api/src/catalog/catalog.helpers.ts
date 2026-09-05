import {
  AssignmentRole,
  Privilege,
  Sex,
  SlotMode,
} from '@jw/database';

const MALE_PRIVILEGES: Privilege[] = [
  Privilege.ELDER,
  Privilege.MINISTERIAL_SERVANT,
  Privilege.REGULAR_PIONEER,
  Privilege.BAPTIZED,
  Privilege.PUBLISHER,
];

const FEMALE_PRIVILEGES: Privilege[] = [
  Privilege.REGULAR_PIONEER_SISTER,
  Privilege.BAPTIZED,
  Privilege.PUBLISHER,
];

/** Privileges compatible with the given allowed sexes. */
export function ALL_PRIVILEGES_FOR_SEXES(sexes: Sex[]): Privilege[] {
  const set = new Set<Privilege>();
  if (sexes.includes(Sex.MALE)) {
    for (const p of MALE_PRIVILEGES) set.add(p);
  }
  if (sexes.includes(Sex.FEMALE)) {
    for (const p of FEMALE_PRIVILEGES) set.add(p);
  }
  return [...set];
}

/** User-created FSM/NVC catalog entries use TITULAR / TITULAR+AJUDANTE. */
export function rolesForUserCatalogSlot(slotMode: SlotMode): AssignmentRole[] {
  if (slotMode === SlotMode.TWO) {
    return [AssignmentRole.TITULAR, AssignmentRole.AJUDANTE];
  }
  return [AssignmentRole.TITULAR];
}

export function slugPartTypeCode(prefix: string, label: string): string {
  const base = label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);

  return `${prefix}_${base || 'TIPO'}`;
}
