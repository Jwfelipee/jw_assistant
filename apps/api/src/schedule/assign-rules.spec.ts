import {
  AssignmentRole,
  Privilege,
  RolePreference,
  Sex,
} from '@jw/shared';
import {
  buildMixedSexAlert,
  buildRepeatMonthAlert,
  sortSuggestionCandidates,
  validateHardAssignRules,
  type ParticipantRules,
  type PartTypeRules,
} from './assign-rules';

describe('validateHardAssignRules', () => {
  const treasures: PartTypeRules = {
    code: 'TESOUROS',
    allowedSexes: [Sex.MALE],
    privileges: [Privilege.ELDER, Privilege.MINISTERIAL_SERVANT],
    roles: [AssignmentRole.TITULAR],
    countsAsMinistryPractice: false,
  };

  const fsm: PartTypeRules = {
    code: 'FSM_INICIANDO',
    allowedSexes: [Sex.MALE, Sex.FEMALE],
    privileges: Object.values(Privilege),
    roles: [AssignmentRole.TITULAR, AssignmentRole.AJUDANTE],
    countsAsMinistryPractice: true,
  };

  const elder: ParticipantRules = {
    id: '1',
    name: 'Ancião',
    sex: Sex.MALE,
    privilege: Privilege.ELDER,
    rolePreference: RolePreference.ANY,
    titularCount: 0,
    ajudanteCount: 0,
    dirigenteCount: 0,
    leitorCount: 0,
  };

  const publisherMale: ParticipantRules = {
    ...elder,
    id: '2',
    name: 'Publicador',
    privilege: Privilege.PUBLISHER,
  };

  const sister: ParticipantRules = {
    id: '3',
    name: 'Irmã',
    sex: Sex.FEMALE,
    privilege: Privilege.BAPTIZED,
    rolePreference: RolePreference.ANY,
    titularCount: 1,
    ajudanteCount: 2,
    dirigenteCount: 0,
    leitorCount: 0,
  };

  it('rejects publicador on Tesouros (privilege)', () => {
    expect(
      validateHardAssignRules({
        partType: treasures,
        participant: publisherMale,
        role: AssignmentRole.TITULAR,
        femaleAssignmentCountInWeek: 0,
      }),
    ).toBe('PRIVILEGE_NOT_ALLOWED');
  });

  it('rejects second female assignment in the same week', () => {
    expect(
      validateHardAssignRules({
        partType: fsm,
        participant: sister,
        role: AssignmentRole.TITULAR,
        femaleAssignmentCountInWeek: 1,
      }),
    ).toBe('FEMALE_WEEK_LIMIT');
  });

  it('allows first female assignment in the week', () => {
    expect(
      validateHardAssignRules({
        partType: fsm,
        participant: sister,
        role: AssignmentRole.TITULAR,
        femaleAssignmentCountInWeek: 0,
      }),
    ).toBeNull();
  });

  it('rejects ASSISTANT_ONLY preference for TITULAR', () => {
    expect(
      validateHardAssignRules({
        partType: fsm,
        participant: {
          ...sister,
          rolePreference: RolePreference.ASSISTANT_ONLY,
        },
        role: AssignmentRole.TITULAR,
        femaleAssignmentCountInWeek: 0,
      }),
    ).toBe('ROLE_PREFERENCE');
  });
});

describe('soft alerts', () => {
  it('emits repeat-month when privilege config enabled', () => {
    expect(buildRepeatMonthAlert(true, true)?.code).toBe('REPEAT_MONTH');
    expect(buildRepeatMonthAlert(false, true)).toBeNull();
    expect(buildRepeatMonthAlert(true, false)).toBeNull();
  });

  it('emits mixed-sex without association and silences with association', () => {
    expect(
      buildMixedSexAlert({
        assigningSex: Sex.MALE,
        otherSlotSex: Sex.FEMALE,
        hasAssociation: false,
      })?.code,
    ).toBe('MIXED_SEX_PAIR');

    expect(
      buildMixedSexAlert({
        assigningSex: Sex.MALE,
        otherSlotSex: Sex.FEMALE,
        hasAssociation: true,
      }),
    ).toBeNull();
  });
});

describe('sortSuggestionCandidates', () => {
  it('returns least TITULAR count first', () => {
    const a: ParticipantRules = {
      id: 'a',
      name: 'Zé',
      sex: Sex.MALE,
      privilege: Privilege.PUBLISHER,
      rolePreference: RolePreference.ANY,
      titularCount: 5,
      ajudanteCount: 0,
      dirigenteCount: 0,
      leitorCount: 0,
    };
    const b: ParticipantRules = {
      ...a,
      id: 'b',
      name: 'Ana',
      titularCount: 1,
    };
    const sorted = sortSuggestionCandidates([a, b], AssignmentRole.TITULAR);
    expect(sorted[0].id).toBe('b');
  });
});
