import React from 'react';
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import type { S140DocumentData, S140PartLine, S140WeekView } from './s140.types';

const colors = {
  ink: '#1a1a1a',
  muted: '#444444',
  line: '#222222',
  treasures: '#5a5a5a',
  ministry: '#b35c1e',
  life: '#6b2d5c',
  headerBg: '#f0f0f0',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 32,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: colors.ink,
  },
  congregation: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 14,
    color: colors.muted,
  },
  weekBlock: {
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  weekHeader: {
    backgroundColor: colors.headerBg,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  weekDate: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'capitalize',
  },
  weekBible: {
    fontSize: 8,
    color: colors.muted,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#cccccc',
  },
  metaLabel: {
    fontFamily: 'Helvetica-Bold',
  },
  sectionHeader: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    letterSpacing: 0.4,
    color: '#ffffff',
  },
  treasuresHeader: {
    backgroundColor: colors.treasures,
  },
  ministryHeader: {
    backgroundColor: colors.ministry,
  },
  lifeHeader: {
    backgroundColor: colors.life,
  },
  partRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dddddd',
  },
  partTitle: {
    flexGrow: 1,
    flexShrink: 1,
    paddingRight: 8,
  },
  partAssignee: {
    flexShrink: 0,
    maxWidth: '42%',
    textAlign: 'right',
    fontFamily: 'Helvetica',
  },
  studyLabel: {
    fontSize: 8,
    color: colors.muted,
  },
});

function PartRows({
  parts,
  studyPrefix,
}: {
  parts: S140PartLine[];
  studyPrefix?: boolean;
}) {
  return (
    <>
      {parts.map((part, index) => (
        <View key={`${part.title}-${index}`} style={styles.partRow} wrap={false}>
          <Text style={styles.partTitle}>
            {studyPrefix ? (
              <Text>
                {part.title}
                {'\n'}
                <Text style={styles.studyLabel}>Dirigente/leitor:</Text>
              </Text>
            ) : (
              part.title
            )}
          </Text>
          <Text style={styles.partAssignee}>{part.assignee}</Text>
        </View>
      ))}
    </>
  );
}

function WeekBlock({ week }: { week: S140WeekView }) {
  return (
    <View style={styles.weekBlock} wrap={false}>
      <View style={styles.weekHeader}>
        <Text style={styles.weekDate}>{week.meetingDateLabel}</Text>
        <Text style={styles.weekBible}>Leitura semanal da Bíblia</Text>
      </View>

      <View style={styles.metaRow}>
        <Text>
          <Text style={styles.metaLabel}>Presidente: </Text>
          {week.president}
        </Text>
        <Text>
          <Text style={styles.metaLabel}>Oração: </Text>
          {week.openingPrayer}
        </Text>
      </View>

      <Text style={[styles.sectionHeader, styles.treasuresHeader]}>
        TESOUROS DA PALAVRA DE DEUS
      </Text>
      <PartRows parts={week.treasures} />

      <Text style={[styles.sectionHeader, styles.ministryHeader]}>
        FAÇA SEU MELHOR NO MINISTÉRIO
      </Text>
      <PartRows parts={week.ministry} />

      <Text style={[styles.sectionHeader, styles.lifeHeader]}>
        NOSSA VIDA CRISTÃ
      </Text>
      <PartRows parts={week.christianLife} />
      {week.study ? <PartRows parts={[week.study]} studyPrefix /> : null}

      <View style={styles.metaRow}>
        <Text>
          <Text style={styles.metaLabel}>Oração final: </Text>
          {week.closingPrayer}
        </Text>
      </View>
    </View>
  );
}

export function S140Document({ data }: { data: S140DocumentData }) {
  return (
    <Document
      title={`S-140 ${data.yearMonth}`}
      author={data.congregationName}
      subject="Programação da reunião do meio de semana"
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.congregation}>{data.congregationName}</Text>
        <Text style={styles.subtitle}>
          Programação da reunião do meio de semana
        </Text>
        {data.weeks.map((week, index) => (
          <WeekBlock key={`${week.meetingDateLabel}-${index}`} week={week} />
        ))}
      </Page>
    </Document>
  );
}
