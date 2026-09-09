import {
  AssignmentRole,
  PartTopic,
  Privilege,
  RolePreference,
  Sex,
} from '@jw/shared';

export const STUDY_PART_CODE = 'ESTUDO_BIBLICO';

const ORACAO_PART_CODES = new Set(['ORACAO_INICIAL', 'ORACAO_FINAL']);

const PRAYER_CODES = ['ORACAO_INICIAL', 'ORACAO_FINAL'] as const;

export type AssignmentCountCategory =
  | 'presidente'
  | 'oracao'
  | 'titular'
  | 'dirigente'
  | 'ajudante'
  | 'ministerio';

export type CountCategoryField =
  | 'presidenteCount'
  | 'oracaoCount'
  | 'titularCount'
  | 'dirigenteCount'
  | 'ajudanteCount'
  | 'ministerioCount';

export const DEFAULT_FSM_PART_COUNT = 3;
export const DEFAULT_NVC_PART_COUNT = 2;

export type SoftAlertCode =
  | 'REPEAT_MONTH'
  | 'MIXED_SEX_PAIR'
  | 'FEMALE_REPEAT_MONTH';

export type SoftAlert = {
  code: SoftAlertCode;
  message: string;
};

export type PartTypeRules = {
  code: string;
  allowedSexes: Sex[];
  privileges: Privilege[];
  roles: AssignmentRole[];
  countsAsMinistryPractice: boolean;
};

export type ParticipantRules = {
  id: string;
  name: string;
  sex: Sex;
  privilege: Privilege;
  rolePreference: RolePreference;
  qualified: boolean;
  titularCount: number;
  ajudanteCount: number;
  dirigenteCount: number;
  leitorCount: number;
  presidenteCount: number;
  oracaoCount: number;
  ministerioCount: number;
};

function usesQualifiedPrivilegeRule(
  partTypeCode: string,
  role: AssignmentRole,
): boolean {
  if (ORACAO_PART_CODES.has(partTypeCode)) {
    return true;
  }
  return (
    partTypeCode === STUDY_PART_CODE &&
    (role === AssignmentRole.LEITOR || role === AssignmentRole.DIRIGENTE)
  );
}

export function isPrivilegeEligibleForPart(input: {
  partTypeCode: string;
  role: AssignmentRole;
  privilege: Privilege;
  qualified: boolean;
}): boolean {
  const { partTypeCode, role, privilege, qualified } = input;

  if (PRAYER_CODES.includes(partTypeCode as (typeof PRAYER_CODES)[number])) {
    return (
      privilege === Privilege.ELDER ||
      privilege === Privilege.MINISTERIAL_SERVANT ||
      (privilege === Privilege.BAPTIZED && qualified)
    );
  }

  if (partTypeCode === STUDY_PART_CODE && role === AssignmentRole.LEITOR) {
    return (
      privilege === Privilege.ELDER ||
      privilege === Privilege.MINISTERIAL_SERVANT ||
      (privilege === Privilege.BAPTIZED && qualified)
    );
  }

  if (partTypeCode === STUDY_PART_CODE && role === AssignmentRole.DIRIGENTE) {
    return (
      privilege === Privilege.ELDER ||
      privilege === Privilege.MINISTERIAL_SERVANT
    );
  }

  return true;
}

/** Hard validation error codes for assign. */
export type AssignHardRejectReason =
  | 'SEX_NOT_ALLOWED'
  | 'PRIVILEGE_NOT_ALLOWED'
  | 'ROLE_PREFERENCE'
  | 'ABSENCE'
  | 'FEMALE_WEEK_LIMIT'
  | 'ROLE_NOT_ON_PART';

export function roleMatchesPreference(
  role: AssignmentRole,
  preference: RolePreference,
): boolean {
  if (preference === RolePreference.ANY) {
    return true;
  }
  const principal =
    role === AssignmentRole.TITULAR || role === AssignmentRole.DIRIGENTE;
  const assistant =
    role === AssignmentRole.AJUDANTE || role === AssignmentRole.LEITOR;

  if (preference === RolePreference.PRINCIPAL_ONLY) {
    return principal;
  }
  if (preference === RolePreference.ASSISTANT_ONLY) {
    return assistant;
  }
  return true;
}

export function counterKeyForRole(
  role: AssignmentRole,
):
  | 'titularCount'
  | 'ajudanteCount'
  | 'dirigenteCount'
  | 'leitorCount' {
  switch (role) {
    case AssignmentRole.TITULAR:
      return 'titularCount';
    case AssignmentRole.AJUDANTE:
      return 'ajudanteCount';
    case AssignmentRole.DIRIGENTE:
      return 'dirigenteCount';
    case AssignmentRole.LEITOR:
      return 'leitorCount';
    default: {
      const _exhaustive: never = role;
      return _exhaustive;
    }
  }
}

/** Maps part type + role + sex to the assignment count category (design D1). */
export function resolveCountCategory(input: {
  partTypeCode: string;
  partTopic: PartTopic;
  role: AssignmentRole;
  participantSex: Sex;
}): AssignmentCountCategory | null {
  const { partTypeCode, partTopic, role, participantSex } = input;

  if (partTypeCode === 'PRESIDENTE') {
    return 'presidente';
  }

  if (ORACAO_PART_CODES.has(partTypeCode)) {
    return 'oracao';
  }

  if (partTypeCode === STUDY_PART_CODE) {
    if (role === AssignmentRole.LEITOR) {
      return 'titular';
    }
    if (role === AssignmentRole.DIRIGENTE) {
      return 'dirigente';
    }
    return null;
  }

  if (role === AssignmentRole.AJUDANTE) {
    return 'ajudante';
  }

  if (partTypeCode === 'LEITURA_BIBLIA') {
    return participantSex === Sex.MALE ? 'ministerio' : null;
  }

  if (partTopic === PartTopic.MINISTRY) {
    if (participantSex === Sex.MALE && role === AssignmentRole.TITULAR) {
      return 'ministerio';
    }
    return null;
  }

  if (partTopic === PartTopic.CHRISTIAN_LIFE) {
    if (role === AssignmentRole.TITULAR) {
      return 'titular';
    }
    return null;
  }

  if (role === AssignmentRole.TITULAR) {
    return 'titular';
  }

  if (role === AssignmentRole.DIRIGENTE) {
    return 'dirigente';
  }

  return null;
}

export function counterFieldForCategory(
  category: AssignmentCountCategory,
): CountCategoryField {
  switch (category) {
    case 'presidente':
      return 'presidenteCount';
    case 'oracao':
      return 'oracaoCount';
    case 'titular':
      return 'titularCount';
    case 'dirigente':
      return 'dirigenteCount';
    case 'ajudante':
      return 'ajudanteCount';
    case 'ministerio':
      return 'ministerioCount';
    default: {
      const _exhaustive: never = category;
      return _exhaustive;
    }
  }
}

export function getRoleCounter(
  participant: ParticipantRules,
  role: AssignmentRole,
): number {
  return participant[counterKeyForRole(role)];
}

export function getCategoryCounter(
  participant: ParticipantRules,
  category: AssignmentCountCategory,
): number {
  return participant[counterFieldForCategory(category)];
}

/**
 * Validate hard assign rules (except absences — checked separately).
 * Returns null when OK, or a reject reason.
 */
export function validateHardAssignRules(input: {
  partType: PartTypeRules;
  participant: ParticipantRules;
  role: AssignmentRole;
  femaleAssignmentCountInWeek: number;
  /** True when this assign is replacing the same participant on this slot. */
  isSameParticipantReassign?: boolean;
}): AssignHardRejectReason | null {
  const {
    partType,
    participant,
    role,
    femaleAssignmentCountInWeek,
    isSameParticipantReassign,
  } = input;

  if (!partType.roles.includes(role)) {
    return 'ROLE_NOT_ON_PART';
  }

  if (!partType.allowedSexes.includes(participant.sex)) {
    return 'SEX_NOT_ALLOWED';
  }

  if (usesQualifiedPrivilegeRule(partType.code, role)) {
    if (
      !isPrivilegeEligibleForPart({
        partTypeCode: partType.code,
        role,
        privilege: participant.privilege,
        qualified: participant.qualified,
      })
    ) {
      return 'PRIVILEGE_NOT_ALLOWED';
    }
  } else if (!partType.privileges.includes(participant.privilege)) {
    return 'PRIVILEGE_NOT_ALLOWED';
  }

  if (!roleMatchesPreference(role, participant.rolePreference)) {
    return 'ROLE_PREFERENCE';
  }

  if (
    participant.sex === Sex.FEMALE &&
    !isSameParticipantReassign &&
    femaleAssignmentCountInWeek >= 1
  ) {
    return 'FEMALE_WEEK_LIMIT';
  }

  return null;
}

export function hardRejectMessage(reason: AssignHardRejectReason): string {
  switch (reason) {
    case 'SEX_NOT_ALLOWED':
      return 'Participante não atende ao sexo permitido para esta parte';
    case 'PRIVILEGE_NOT_ALLOWED':
      return 'Participante não possui privilégio apto para esta parte';
    case 'ROLE_PREFERENCE':
      return 'Preferência de papel do participante não permite este papel';
    case 'ABSENCE':
      return 'Participante ausente na data da reunião';
    case 'FEMALE_WEEK_LIMIT':
      return 'Participante feminina já possui uma designação nesta semana';
    case 'ROLE_NOT_ON_PART':
      return 'Papel inválido para esta parte';
    default: {
      const _exhaustive: never = reason;
      return _exhaustive;
    }
  }
}

/** Soft alert: month repeat when AlertConfig enables it for the privilege. */
export function buildRepeatMonthAlert(
  enabled: boolean,
  alreadyAssignedInMonth: boolean,
): SoftAlert | null {
  if (!enabled || !alreadyAssignedInMonth) {
    return null;
  }
  return {
    code: 'REPEAT_MONTH',
    message:
      'Participante já possui designação neste mês (alerta configurado para o privilégio)',
  };
}

/** Soft alert: female participant assigned again in the same month (always). */
export function buildFemaleRepeatMonthAlert(
  sex: Sex,
  alreadyAssignedInMonth: boolean,
): SoftAlert | null {
  if (sex !== Sex.FEMALE || !alreadyAssignedInMonth) return null;
  return {
    code: 'FEMALE_REPEAT_MONTH',
    message:
      'Esta participante já possui designação neste mês. Confirme se deseja designá-la novamente.',
  };
}

/**
 * Soft alert: mixed-sex pair on a two-person part, unless associated.
 */
export function buildMixedSexAlert(input: {
  assigningSex: Sex;
  otherSlotSex: Sex | null;
  hasAssociation: boolean;
}): SoftAlert | null {
  const { assigningSex, otherSlotSex, hasAssociation } = input;
  if (otherSlotSex == null) {
    return null;
  }
  if (assigningSex === otherSlotSex) {
    return null;
  }
  if (hasAssociation) {
    return null;
  }
  return {
    code: 'MIXED_SEX_PAIR',
    message:
      'Par misto de sexo na mesma parte sem associação registrada',
  };
}

/** Sort eligible candidates: lowest category counter, then name. */
export function sortSuggestionCandidates<T extends ParticipantRules>(
  candidates: T[],
  sortCategory: AssignmentCountCategory,
): T[] {
  return [...candidates].sort((a, b) => {
    const ca = getCategoryCounter(a, sortCategory);
    const cb = getCategoryCounter(b, sortCategory);
    if (ca !== cb) {
      return ca - cb;
    }
    return a.name.localeCompare(b.name, 'pt-BR');
  });
}

export type EligibleParticipantSortView = {
  name: string;
  assignedThisWeek: boolean;
  countsThisMonth: Partial<Record<AssignmentCountCategory, number>>;
  countsTotal: Partial<Record<AssignmentCountCategory, number>>;
};

/** Sort eligible participants for picker: week-assigned last, then month/total asc, then name. */
export function sortEligibleParticipants<T extends EligibleParticipantSortView>(
  eligible: T[],
  sortCategory: AssignmentCountCategory,
): T[] {
  return [...eligible].sort((a, b) => {
    if (a.assignedThisWeek !== b.assignedThisWeek) {
      return a.assignedThisWeek ? 1 : -1;
    }
    const am = a.countsThisMonth[sortCategory] ?? 0;
    const bm = b.countsThisMonth[sortCategory] ?? 0;
    if (am !== bm) return am - bm;
    const at = a.countsTotal[sortCategory] ?? 0;
    const bt = b.countsTotal[sortCategory] ?? 0;
    if (at !== bt) return at - bt;
    return a.name.localeCompare(b.name, 'pt-BR');
  });
}

export function isStudyPartType(code: string): boolean {
  return code === STUDY_PART_CODE;
}
