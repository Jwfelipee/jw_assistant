import {
  AssignmentRole,
  Privilege,
  RolePreference,
  Sex,
} from '@jw/shared';

export const STUDY_PART_CODE = 'ESTUDO_BIBLICO';

export const DEFAULT_FSM_PART_COUNT = 3;
export const DEFAULT_NVC_PART_COUNT = 2;

export type SoftAlertCode = 'REPEAT_MONTH' | 'MIXED_SEX_PAIR';

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
  titularCount: number;
  ajudanteCount: number;
  dirigenteCount: number;
  leitorCount: number;
};

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

export function getRoleCounter(
  participant: ParticipantRules,
  role: AssignmentRole,
): number {
  return participant[counterKeyForRole(role)];
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

  if (!partType.privileges.includes(participant.privilege)) {
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

/** Sort eligible candidates: lowest role counter, then name. */
export function sortSuggestionCandidates<T extends ParticipantRules>(
  candidates: T[],
  role: AssignmentRole,
): T[] {
  return [...candidates].sort((a, b) => {
    const ca = getRoleCounter(a, role);
    const cb = getRoleCounter(b, role);
    if (ca !== cb) {
      return ca - cb;
    }
    return a.name.localeCompare(b.name, 'pt-BR');
  });
}

export function isStudyPartType(code: string): boolean {
  return code === STUDY_PART_CODE;
}
