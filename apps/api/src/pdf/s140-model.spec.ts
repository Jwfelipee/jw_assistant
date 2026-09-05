import { AssignmentRole, PartTopic } from '@jw/shared';
import {
  EMPTY_SLOT_PLACEHOLDER,
  buildS140DocumentData,
  formatAssignees,
  formatPairNames,
  formatSlotName,
  s140Filename,
} from './s140-model';
import type { S140MonthInput } from './s140.types';

describe('s140-model name formatting', () => {
  it('uses placeholder for empty slots', () => {
    expect(formatSlotName(null)).toBe(EMPTY_SLOT_PLACEHOLDER);
    expect(formatSlotName('')).toBe(EMPTY_SLOT_PLACEHOLDER);
    expect(formatSlotName('  Ana  ')).toBe('Ana');
  });

  it('renders pairs as Nome/Nome', () => {
    expect(formatPairNames('João', 'Maria')).toBe('João/Maria');
    expect(formatPairNames(null, null)).toBe(
      `${EMPTY_SLOT_PLACEHOLDER}/${EMPTY_SLOT_PLACEHOLDER}`,
    );
  });

  it('formats study as Dirigente/Leitor pair', () => {
    expect(
      formatAssignees(
        [
          { role: AssignmentRole.DIRIGENTE, participantName: 'Carlos' },
          { role: AssignmentRole.LEITOR, participantName: 'Pedro' },
        ],
        { study: true },
      ),
    ).toBe('Carlos/Pedro');
  });

  it('formats titular/ajudante as pair', () => {
    expect(
      formatAssignees([
        { role: AssignmentRole.TITULAR, participantName: 'Ana' },
        { role: AssignmentRole.AJUDANTE, participantName: 'Bia' },
      ]),
    ).toBe('Ana/Bia');
  });
});

describe('buildS140DocumentData', () => {
  const month: S140MonthInput = {
    yearMonth: '2026-09',
    weeks: [
      {
        weekStartDate: '2026-09-07',
        meetingDate: '2026-09-10',
        parts: [
          {
            partTypeCode: 'PRESIDENTE',
            partTypeLabel: 'Presidente',
            title: 'Presidente',
            sortOrder: 0,
            topic: PartTopic.OUT_OF_TOPIC,
            slots: [
              {
                role: AssignmentRole.TITULAR,
                participantName: 'Pres. Silva',
              },
            ],
          },
          {
            partTypeCode: 'ORACAO_INICIAL',
            partTypeLabel: 'Oração inicial',
            title: 'Oração inicial',
            sortOrder: 1,
            topic: PartTopic.OUT_OF_TOPIC,
            slots: [{ role: AssignmentRole.TITULAR, participantName: null }],
          },
          {
            partTypeCode: 'ORACAO_FINAL',
            partTypeLabel: 'Oração final',
            title: 'Oração final',
            sortOrder: 99,
            topic: PartTopic.OUT_OF_TOPIC,
            slots: [
              { role: AssignmentRole.TITULAR, participantName: 'Final' },
            ],
          },
          {
            partTypeCode: 'TESOUROS',
            partTypeLabel: 'Tesouros',
            title: 'Tema tesouros',
            sortOrder: 10,
            topic: PartTopic.TREASURES,
            slots: [
              { role: AssignmentRole.TITULAR, participantName: 'Tesor' },
            ],
          },
          {
            partTypeCode: 'FSM_A',
            partTypeLabel: 'Iniciando',
            title: 'Iniciando conversas',
            sortOrder: 20,
            topic: PartTopic.MINISTRY,
            slots: [
              { role: AssignmentRole.TITULAR, participantName: 'A' },
              { role: AssignmentRole.AJUDANTE, participantName: 'B' },
            ],
          },
          {
            partTypeCode: 'NVC_A',
            partTypeLabel: 'NVC',
            title: 'Necessidades',
            sortOrder: 30,
            topic: PartTopic.CHRISTIAN_LIFE,
            slots: [
              { role: AssignmentRole.TITULAR, participantName: 'Nvc' },
            ],
          },
          {
            partTypeCode: 'ESTUDO_BIBLICO',
            partTypeLabel: 'Estudo',
            title: 'Estudo bíblico de congregação',
            sortOrder: 90,
            topic: PartTopic.CHRISTIAN_LIFE,
            slots: [
              {
                role: AssignmentRole.DIRIGENTE,
                participantName: 'Dir',
              },
              { role: AssignmentRole.LEITOR, participantName: 'Leit' },
            ],
          },
        ],
      },
      {
        weekStartDate: '2026-09-14',
        meetingDate: '2026-09-17',
        parts: [],
      },
    ],
  };

  it('includes every week ordered by meetingDate', () => {
    const doc = buildS140DocumentData(month, 'Congregação Exemplo');
    expect(doc.congregationName).toBe('Congregação Exemplo');
    expect(doc.weeks).toHaveLength(2);
    expect(doc.weeks[0].meetingDateLabel).toMatch(/10/);
    expect(doc.weeks[0].president).toBe('Pres. Silva');
    expect(doc.weeks[0].openingPrayer).toBe(EMPTY_SLOT_PLACEHOLDER);
    expect(doc.weeks[0].ministry[0].assignee).toBe('A/B');
    expect(doc.weeks[0].study?.assignee).toBe('Dir/Leit');
    expect(doc.weeks[0].study?.studyPair).toBe(true);
  });

  it('builds suggested filename', () => {
    expect(s140Filename('2026-09')).toBe('S-140-2026-09.pdf');
  });
});
