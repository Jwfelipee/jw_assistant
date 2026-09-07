import { AssignmentRole, PartTopic } from '@jw/shared';
import {
  EMPTY_SLOT_PLACEHOLDER,
  buildS140DocumentData,
  formatAssignees,
  formatMeetingDateShort,
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

describe('formatMeetingDateShort', () => {
  it('formats ISO date as dd/MM/yyyy in UTC', () => {
    expect(formatMeetingDateShort('2026-09-10')).toBe('10/09/2026');
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
            partTypeCode: 'FSM_B',
            partTypeLabel: 'Cultivando',
            title: 'Cultivando o interesse',
            sortOrder: 21,
            topic: PartTopic.MINISTRY,
            slots: [
              { role: AssignmentRole.TITULAR, participantName: 'C' },
              { role: AssignmentRole.AJUDANTE, participantName: 'D' },
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
    expect(doc.weeks[0].meetingDateShort).toBe('10/09/2026');
    expect(doc.weeks[0].president).toBe('Pres. Silva');
    expect(doc.weeks[0].openingPrayer).toBe(EMPTY_SLOT_PLACEHOLDER);
    expect(doc.weeks[0].ministry[0].assignee).toBe('A/B');
    expect(doc.weeks[0].study?.assignee).toBe('Dir/Leit');
    expect(doc.weeks[0].study?.studyPair).toBe(true);
    expect(doc.weeks[0].openingSong).toBe('Cântico [número]');
    expect(doc.weeks[0].nvcSong).toBe('Cântico [número]');
  });

  it('numbers treasures, FSM, NVC sequentially with study always at 10', () => {
    const doc = buildS140DocumentData(month, 'Congregação Exemplo');
    const week = doc.weeks[0];

    expect(week.treasures).toHaveLength(1);
    expect(week.treasures[0].number).toBe(1);
    expect(week.treasures[0].title).toContain('(10 min)');

    expect(week.ministry).toHaveLength(2);
    expect(week.ministry[0].number).toBe(2);
    expect(week.ministry[0].duration).toBe('X min');
    expect(week.ministry[1].number).toBe(3);

    expect(week.christianLife).toHaveLength(1);
    expect(week.christianLife[0].number).toBe(4);
    expect(week.christianLife[0].duration).toBe('XX min');

    expect(week.study?.number).toBe(10);
    expect(week.study?.title).toContain('Estudo bíblico de congregação');
    expect(week.study?.title).toContain('(30 min)');
    expect(week.study?.showDirectorLabel).toBe(true);
  });

  it('numbers extra FSM parts before NVC', () => {
    const extraFsmMonth: S140MonthInput = {
      yearMonth: '2026-09',
      weeks: [
        {
          weekStartDate: '2026-09-07',
          meetingDate: '2026-09-10',
          parts: [
            {
              partTypeCode: 'TESOUROS',
              partTypeLabel: 'Tesouros',
              title: 'Tema',
              sortOrder: 10,
              topic: PartTopic.TREASURES,
              slots: [{ role: AssignmentRole.TITULAR, participantName: 'T' }],
            },
            {
              partTypeCode: 'JOIAS',
              partTypeLabel: 'Joias',
              title: 'Joias',
              sortOrder: 11,
              topic: PartTopic.TREASURES,
              slots: [{ role: AssignmentRole.TITULAR, participantName: 'J' }],
            },
            {
              partTypeCode: 'LEITURA_BIBLIA',
              partTypeLabel: 'Leitura',
              title: 'Leitura',
              sortOrder: 12,
              topic: PartTopic.TREASURES,
              slots: [{ role: AssignmentRole.TITULAR, participantName: 'L' }],
            },
            {
              partTypeCode: 'FSM_A',
              partTypeLabel: 'FSM A',
              title: 'Part A',
              sortOrder: 20,
              topic: PartTopic.MINISTRY,
              slots: [{ role: AssignmentRole.TITULAR, participantName: 'A' }],
            },
            {
              partTypeCode: 'FSM_B',
              partTypeLabel: 'FSM B',
              title: 'Part B',
              sortOrder: 21,
              topic: PartTopic.MINISTRY,
              slots: [{ role: AssignmentRole.TITULAR, participantName: 'B' }],
            },
            {
              partTypeCode: 'FSM_C',
              partTypeLabel: 'FSM C',
              title: 'Part C',
              sortOrder: 22,
              topic: PartTopic.MINISTRY,
              slots: [{ role: AssignmentRole.TITULAR, participantName: 'C' }],
            },
            {
              partTypeCode: 'FSM_EXTRA',
              partTypeLabel: 'FSM Extra',
              title: 'Part Extra',
              sortOrder: 23,
              topic: PartTopic.MINISTRY,
              slots: [{ role: AssignmentRole.TITULAR, participantName: 'E' }],
            },
            {
              partTypeCode: 'NVC_A',
              partTypeLabel: 'NVC A',
              title: 'NVC A',
              sortOrder: 30,
              topic: PartTopic.CHRISTIAN_LIFE,
              slots: [{ role: AssignmentRole.TITULAR, participantName: 'N1' }],
            },
            {
              partTypeCode: 'NVC_B',
              partTypeLabel: 'NVC B',
              title: 'NVC B',
              sortOrder: 31,
              topic: PartTopic.CHRISTIAN_LIFE,
              slots: [{ role: AssignmentRole.TITULAR, participantName: 'N2' }],
            },
            {
              partTypeCode: 'ESTUDO_BIBLICO',
              partTypeLabel: 'Estudo',
              title: 'Estudo',
              sortOrder: 90,
              topic: PartTopic.CHRISTIAN_LIFE,
              slots: [
                { role: AssignmentRole.DIRIGENTE, participantName: 'D' },
                { role: AssignmentRole.LEITOR, participantName: 'L' },
              ],
            },
          ],
        },
      ],
    };

    const doc = buildS140DocumentData(extraFsmMonth, 'Test');
    const week = doc.weeks[0];

    expect(week.treasures.map((p) => p.number)).toEqual([1, 2, 3]);
    expect(week.ministry.map((p) => p.number)).toEqual([4, 5, 6, 7]);
    expect(week.christianLife.map((p) => p.number)).toEqual([8, 9]);
    expect(week.study?.number).toBe(10);
  });

  it('builds suggested filename', () => {
    expect(s140Filename('2026-09')).toBe('S-140-2026-09.pdf');
  });
});
