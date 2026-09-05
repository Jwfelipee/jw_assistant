import {
  AssignmentRole,
  PartTopic,
  Privilege,
  Sex,
  SlotMode,
  type PartType,
} from '@jw/database';
import { ScheduleService } from './schedule.service';
import { isStudyPartType } from './assign-rules';

function fakePartType(partial: Partial<PartType> & Pick<PartType, 'code' | 'topic' | 'defaultSortOrder' | 'roles'>): PartType {
  const now = new Date();
  return {
    id: partial.id ?? partial.code,
    label: partial.label ?? partial.code,
    allowedSexes: partial.allowedSexes ?? [Sex.MALE],
    slotMode: partial.slotMode ?? SlotMode.ONE,
    privileges: partial.privileges ?? [Privilege.ELDER],
    isSystem: partial.isSystem ?? false,
    countsAsMinistryPractice: partial.countsAsMinistryPractice ?? false,
    deletable: partial.deletable ?? true,
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

describe('selectTemplatePartTypes (S-140 week template)', () => {
  const service = new ScheduleService();

  const catalog: PartType[] = [
    fakePartType({
      code: 'PRESIDENTE',
      topic: PartTopic.OUT_OF_TOPIC,
      defaultSortOrder: 0,
      roles: [AssignmentRole.TITULAR],
      isSystem: true,
    }),
    fakePartType({
      code: 'ORACAO_INICIAL',
      topic: PartTopic.OUT_OF_TOPIC,
      defaultSortOrder: 1,
      roles: [AssignmentRole.TITULAR],
      isSystem: true,
    }),
    fakePartType({
      code: 'ORACAO_FINAL',
      topic: PartTopic.OUT_OF_TOPIC,
      defaultSortOrder: 99,
      roles: [AssignmentRole.TITULAR],
      isSystem: true,
    }),
    fakePartType({
      code: 'TESOUROS',
      topic: PartTopic.TREASURES,
      defaultSortOrder: 10,
      roles: [AssignmentRole.TITULAR],
      isSystem: true,
    }),
    fakePartType({
      code: 'JOIAS',
      topic: PartTopic.TREASURES,
      defaultSortOrder: 11,
      roles: [AssignmentRole.TITULAR],
      isSystem: true,
    }),
    fakePartType({
      code: 'LEITURA_BIBLIA',
      topic: PartTopic.TREASURES,
      defaultSortOrder: 12,
      roles: [AssignmentRole.TITULAR],
      isSystem: true,
      countsAsMinistryPractice: true,
    }),
    fakePartType({
      code: 'FSM_A',
      topic: PartTopic.MINISTRY,
      defaultSortOrder: 20,
      roles: [AssignmentRole.TITULAR, AssignmentRole.AJUDANTE],
      slotMode: SlotMode.TWO,
    }),
    fakePartType({
      code: 'FSM_B',
      topic: PartTopic.MINISTRY,
      defaultSortOrder: 21,
      roles: [AssignmentRole.TITULAR, AssignmentRole.AJUDANTE],
      slotMode: SlotMode.TWO,
    }),
    fakePartType({
      code: 'FSM_C',
      topic: PartTopic.MINISTRY,
      defaultSortOrder: 22,
      roles: [AssignmentRole.TITULAR],
    }),
    fakePartType({
      code: 'FSM_EXTRA',
      topic: PartTopic.MINISTRY,
      defaultSortOrder: 23,
      roles: [AssignmentRole.TITULAR],
    }),
    fakePartType({
      code: 'NVC_A',
      topic: PartTopic.CHRISTIAN_LIFE,
      defaultSortOrder: 30,
      roles: [AssignmentRole.TITULAR],
    }),
    fakePartType({
      code: 'NVC_B',
      topic: PartTopic.CHRISTIAN_LIFE,
      defaultSortOrder: 31,
      roles: [AssignmentRole.TITULAR],
    }),
    fakePartType({
      code: 'NVC_EXTRA',
      topic: PartTopic.CHRISTIAN_LIFE,
      defaultSortOrder: 32,
      roles: [AssignmentRole.TITULAR],
    }),
    fakePartType({
      code: 'ESTUDO_BIBLICO',
      topic: PartTopic.CHRISTIAN_LIFE,
      defaultSortOrder: 90,
      roles: [AssignmentRole.DIRIGENTE, AssignmentRole.LEITOR],
      isSystem: true,
      slotMode: SlotMode.TWO,
    }),
  ];

  it('includes fixed treasures, 3 FSM, 2 NVC, study last before final prayer', () => {
    const selected = service.selectTemplatePartTypes(catalog);
    const codes = selected.map((p) => p.code);

    expect(codes).toContain('PRESIDENTE');
    expect(codes).toContain('ORACAO_INICIAL');
    expect(codes).toContain('ORACAO_FINAL');
    expect(codes.filter((c) => c.startsWith('TESOUROS') || c === 'JOIAS' || c === 'LEITURA_BIBLIA')).toHaveLength(3);
    expect(codes.filter((c) => c.startsWith('FSM_'))).toEqual(['FSM_A', 'FSM_B', 'FSM_C']);
    expect(codes).not.toContain('FSM_EXTRA');
    expect(codes.filter((c) => c.startsWith('NVC_'))).toEqual(['NVC_A', 'NVC_B']);
    expect(codes).not.toContain('NVC_EXTRA');
    expect(codes).toContain('ESTUDO_BIBLICO');

    const studyIdx = codes.indexOf('ESTUDO_BIBLICO');
    const finalIdx = codes.indexOf('ORACAO_FINAL');
    expect(studyIdx).toBeGreaterThan(-1);
    expect(finalIdx).toBeGreaterThan(studyIdx);
    expect(isStudyPartType('ESTUDO_BIBLICO')).toBe(true);
  });
});
