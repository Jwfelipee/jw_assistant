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
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 28,
    fontSize: 8.5,
    fontFamily: 'Helvetica',
    color: colors.ink,
  },
  congregation: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 10,
    color: colors.muted,
  },
  weekHeader: {
    textAlign: 'center',
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.line,
  },
  weekDate: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 2.5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dddddd',
  },
  rowLeft: {
    width: '70%',
    paddingRight: 6,
  },
  rowRight: {
    width: '30%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  assignee: {
    textAlign: 'right',
    marginRight: 8,
    maxWidth: '65%',
  },
  time: {
    width: 28,
    textAlign: 'right',
    color: colors.muted,
    fontSize: 8,
  },
  labelBold: {
    fontFamily: 'Helvetica-Bold',
  },
  sectionHeader: {
    paddingVertical: 3,
    paddingHorizontal: 4,
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    letterSpacing: 0.3,
    color: '#ffffff',
    marginTop: 2,
  },
  sectionSublabel: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    fontSize: 7.5,
    color: colors.muted,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dddddd',
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
  studyLabel: {
    fontSize: 7.5,
    color: colors.muted,
    marginTop: 1,
  },
  fixedLine: {
    color: colors.ink,
  },
});

function TabularRow({
  left,
  assignee,
  showTime = true,
}: {
  left: React.ReactNode;
  assignee?: string;
  showTime?: boolean;
}) {
  return (
    <View style={styles.row} wrap={false}>
      <View style={styles.rowLeft}>{left}</View>
      <View style={styles.rowRight}>
        {assignee !== undefined ? (
          <Text style={styles.assignee}>{assignee}</Text>
        ) : null}
        {showTime ? <Text style={styles.time}>0:00</Text> : null}
      </View>
    </View>
  );
}

function PartRows({ parts }: { parts: S140PartLine[] }) {
  return (
    <>
      {parts.map((part, index) => (
        <TabularRow
          key={`${part.number ?? 'x'}-${part.title}-${index}`}
          left={
            part.showDirectorLabel ? (
              <View>
                <Text>{part.title}</Text>
                <Text style={styles.studyLabel}>Dirigente/leitor:</Text>
              </View>
            ) : (
              <Text>{part.title}</Text>
            )
          }
          assignee={part.assignee}
        />
      ))}
    </>
  );
}

function WeekPage({ week, congregationName }: { week: S140WeekView; congregationName: string }) {
  return (
    <Page size="A4" style={styles.page} wrap={false}>
      <Text style={styles.congregation}>{congregationName}</Text>
      <Text style={styles.subtitle}>Programação da reunião do meio de semana</Text>

      <View style={styles.weekHeader}>
        <Text style={styles.weekDate}>
          {week.meetingDateShort} | LEITURA SEMANAL DA BÍBLIA
        </Text>
      </View>

      <TabularRow
        left={<Text><Text style={styles.labelBold}>Presidente: </Text>{week.president}</Text>}
      />
      <TabularRow left={<Text style={styles.fixedLine}>{week.openingSong}</Text>} />
      <TabularRow
        left={<Text><Text style={styles.labelBold}>Oração: </Text>{week.openingPrayer}</Text>}
      />
      <TabularRow
        left={<Text>Comentários iniciais (1 min)</Text>}
        assignee={week.openingComments}
      />

      <Text style={[styles.sectionHeader, styles.treasuresHeader]}>
        TESOUROS DA PALAVRA DE DEUS
      </Text>
      <Text style={styles.sectionSublabel}>Salão principal</Text>
      <TabularRow left={<Text />} showTime={true} />
      <PartRows parts={week.treasures} />

      <Text style={[styles.sectionHeader, styles.ministryHeader]}>
        FAÇA SEU MELHOR NO MINISTÉRIO
      </Text>
      <Text style={styles.sectionSublabel}>Salão principal</Text>
      <TabularRow left={<Text />} showTime={true} />
      <PartRows parts={week.ministry} />

      <Text style={[styles.sectionHeader, styles.lifeHeader]}>NOSSA VIDA CRISTÃ</Text>
      <TabularRow left={<Text />} showTime={true} />
      <TabularRow left={<Text style={styles.fixedLine}>{week.nvcSong}</Text>} />
      <PartRows parts={week.christianLife} />
      {week.study ? <PartRows parts={[week.study]} /> : null}

      <TabularRow
        left={<Text>Comentários finais (3 min)</Text>}
        assignee={week.closingComments}
      />
      <TabularRow left={<Text style={styles.fixedLine}>{week.closingSong}</Text>} />
      <TabularRow
        left={<Text><Text style={styles.labelBold}>Oração: </Text>{week.closingPrayer}</Text>}
        showTime={false}
      />
    </Page>
  );
}

export function S140Document({ data }: { data: S140DocumentData }) {
  return (
    <Document
      title={`S-140 ${data.yearMonth}`}
      author={data.congregationName}
      subject="Programação da reunião do meio de semana"
    >
      {data.weeks.map((week, index) => (
        <WeekPage
          key={`${week.meetingDateShort}-${index}`}
          week={week}
          congregationName={data.congregationName}
        />
      ))}
    </Document>
  );
}
