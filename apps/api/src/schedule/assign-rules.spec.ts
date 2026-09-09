import {
  AssignmentRole,
  PartTopic,
  Privilege,
  RolePreference,
  Sex,
} from '@jw/shared';
import {
  buildFemaleRepeatMonthAlert,
  buildMixedSexAlert,
  buildRepeatMonthAlert,
  counterFieldForCategory,
  resolveCountCategories,
  resolveCountCategory,
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
    qualified: false,
    titularCount: 0,
    ajudanteCount: 0,
    dirigenteCount: 0,
    leitorCount: 0,
    presidenteCount: 0,
    oracaoCount: 0,
    ministerioCount: 0,
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
    qualified: false,
    titularCount: 1,
    ajudanteCount: 2,
    dirigenteCount: 0,
    leitorCount: 0,
    presidenteCount: 0,
    oracaoCount: 0,
    ministerioCount: 0,
  };

  const oracao: PartTypeRules = {
    code: 'ORACAO_INICIAL',
    allowedSexes: [Sex.MALE],
    privileges: [
      Privilege.ELDER,
      Privilege.MINISTERIAL_SERVANT,
      Privilege.BAPTIZED,
    ],
    roles: [AssignmentRole.TITULAR],
    countsAsMinistryPractice: false,
  };

  const estudo: PartTypeRules = {
    code: 'ESTUDO_BIBLICO',
    allowedSexes: [Sex.MALE],
    privileges: [
      Privilege.ELDER,
      Privilege.MINISTERIAL_SERVANT,
      Privilege.BAPTIZED,
    ],
    roles: [AssignmentRole.DIRIGENTE, AssignmentRole.LEITOR],
    countsAsMinistryPractice: false,
  };

  const baptizedMale: ParticipantRules = {
    id: '4',
    name: 'Batizado',
    sex: Sex.MALE,
    privilege: Privilege.BAPTIZED,
    rolePreference: RolePreference.ANY,
    qualified: false,
    titularCount: 0,
    ajudanteCount: 0,
    dirigenteCount: 0,
    leitorCount: 0,
    presidenteCount: 0,
    oracaoCount: 0,
    ministerioCount: 0,
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

  it('rejects unqualified baptized on prayer', () => {
    expect(
      validateHardAssignRules({
        partType: oracao,
        participant: baptizedMale,
        role: AssignmentRole.TITULAR,
        femaleAssignmentCountInWeek: 0,
      }),
    ).toBe('PRIVILEGE_NOT_ALLOWED');
  });

  it('allows qualified baptized on prayer', () => {
    expect(
      validateHardAssignRules({
        partType: oracao,
        participant: { ...baptizedMale, qualified: true },
        role: AssignmentRole.TITULAR,
        femaleAssignmentCountInWeek: 0,
      }),
    ).toBeNull();
  });

  it('allows elder on prayer', () => {
    expect(
      validateHardAssignRules({
        partType: oracao,
        participant: elder,
        role: AssignmentRole.TITULAR,
        femaleAssignmentCountInWeek: 0,
      }),
    ).toBeNull();
  });

  it('rejects qualified baptized as study conductor', () => {
    expect(
      validateHardAssignRules({
        partType: estudo,
        participant: { ...baptizedMale, qualified: true },
        role: AssignmentRole.DIRIGENTE,
        femaleAssignmentCountInWeek: 0,
      }),
    ).toBe('PRIVILEGE_NOT_ALLOWED');
  });

  it('allows qualified baptized as study reader', () => {
    expect(
      validateHardAssignRules({
        partType: estudo,
        participant: { ...baptizedMale, qualified: true },
        role: AssignmentRole.LEITOR,
        femaleAssignmentCountInWeek: 0,
      }),
    ).toBeNull();
  });
});

describe('soft alerts', () => {
  it('emits repeat-month when privilege config enabled', () => {
    expect(buildRepeatMonthAlert(true, true)?.code).toBe('REPEAT_MONTH');
    expect(buildRepeatMonthAlert(false, true)).toBeNull();
    expect(buildRepeatMonthAlert(true, false)).toBeNull();
  });

  it('emits FEMALE_REPEAT_MONTH for female on 2nd+ assignment in month', () => {
    expect(
      buildFemaleRepeatMonthAlert(Sex.FEMALE, true)?.code,
    ).toBe('FEMALE_REPEAT_MONTH');
    expect(buildFemaleRepeatMonthAlert(Sex.FEMALE, false)).toBeNull();
    expect(buildFemaleRepeatMonthAlert(Sex.MALE, true)).toBeNull();
  });

  it('emits FEMALE_REPEAT_MONTH for elder female (pioneira) on repeat', () => {
    expect(
      buildFemaleRepeatMonthAlert(Sex.FEMALE, true)?.message,
    ).toContain('participante já possui designação');
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

describe('resolveCountCategories', () => {
  const male = Sex.MALE;
  const female = Sex.FEMALE;
  const fsmInput = {
    partTypeCode: 'FSM_INICIANDO',
    partTopic: PartTopic.MINISTRY,
  };

  it('maps presidente and oracao parts', () => {
    expect(
      resolveCountCategories({
        partTypeCode: 'PRESIDENTE',
        partTopic: PartTopic.OUT_OF_TOPIC,
        role: AssignmentRole.TITULAR,
        participantSex: male,
      }),
    ).toEqual(['presidente']);

    expect(
      resolveCountCategories({
        partTypeCode: 'ORACAO_INICIAL',
        partTopic: PartTopic.OUT_OF_TOPIC,
        role: AssignmentRole.TITULAR,
        participantSex: male,
      }),
    ).toEqual(['oracao']);
  });

  it('maps estudo bíblico leitor to titular (not leitorCount)', () => {
    expect(
      resolveCountCategories({
        partTypeCode: 'ESTUDO_BIBLICO',
        partTopic: PartTopic.CHRISTIAN_LIFE,
        role: AssignmentRole.LEITOR,
        participantSex: male,
      }),
    ).toEqual(['titular']);
    expect(counterFieldForCategory('titular')).toBe('titularCount');
  });

  it('maps estudo bíblico dirigente to dirigente', () => {
    expect(
      resolveCountCategories({
        partTypeCode: 'ESTUDO_BIBLICO',
        partTopic: PartTopic.CHRISTIAN_LIFE,
        role: AssignmentRole.DIRIGENTE,
        participantSex: male,
      }),
    ).toEqual(['dirigente']);
  });

  it('maps leitura da bíblia male to ministerio', () => {
    expect(
      resolveCountCategories({
        partTypeCode: 'LEITURA_BIBLIA',
        partTopic: PartTopic.TREASURES,
        role: AssignmentRole.TITULAR,
        participantSex: male,
      }),
    ).toEqual(['ministerio']);
  });

  it('maps FSM male titular to ministerio only', () => {
    expect(
      resolveCountCategories({
        ...fsmInput,
        role: AssignmentRole.TITULAR,
        participantSex: male,
      }),
    ).toEqual(['ministerio']);
  });

  it('maps FSM female titular to titular and ministerio', () => {
    expect(
      resolveCountCategories({
        ...fsmInput,
        role: AssignmentRole.TITULAR,
        participantSex: female,
      }),
    ).toEqual(['titular', 'ministerio']);
  });

  it('maps FSM ajudante to ajudante and ministerio', () => {
    expect(
      resolveCountCategories({
        ...fsmInput,
        role: AssignmentRole.AJUDANTE,
        participantSex: female,
      }),
    ).toEqual(['ajudante', 'ministerio']);

    expect(
      resolveCountCategories({
        ...fsmInput,
        role: AssignmentRole.AJUDANTE,
        participantSex: male,
      }),
    ).toEqual(['ajudante', 'ministerio']);
  });

  it('maps custom NVC titular to titular', () => {
    expect(
      resolveCountCategories({
        partTypeCode: 'NVC_CUSTOM',
        partTopic: PartTopic.CHRISTIAN_LIFE,
        role: AssignmentRole.TITULAR,
        participantSex: male,
      }),
    ).toEqual(['titular']);
  });
});

describe('resolveCountCategory', () => {
  it('returns ministerio as primary sort category for FSM', () => {
    expect(
      resolveCountCategory({
        partTypeCode: 'FSM_INICIANDO',
        partTopic: PartTopic.MINISTRY,
        role: AssignmentRole.TITULAR,
        participantSex: Sex.FEMALE,
      }),
    ).toBe('ministerio');
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
      qualified: false,
      titularCount: 5,
      ajudanteCount: 0,
      dirigenteCount: 0,
      leitorCount: 0,
      presidenteCount: 0,
      oracaoCount: 0,
      ministerioCount: 5,
    };
    const b: ParticipantRules = {
      ...a,
      id: 'b',
      name: 'Ana',
      ministerioCount: 1,
    };
    const sorted = sortSuggestionCandidates([a, b], 'ministerio');
    expect(sorted[0].id).toBe('b');
  });
});
