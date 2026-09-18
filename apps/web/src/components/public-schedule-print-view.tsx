"use client";

import type { ReactNode } from "react";
import {
  buildPublicS140Week,
  type S140PartLine,
  type S140PublicWeek,
} from "@/lib/s140-display";
import type { PublicScheduleView } from "@/lib/public-schedule";
import { btnOutline, btnPrimary, btnRowClass } from "@/lib/ui";

type PublicSchedulePrintViewProps = {
  view: PublicScheduleView;
  onBack: () => void;
};

const SECTION_COLORS = {
  treasures: "#5a5a5a",
  ministry: "#b35c1e",
  life: "#6b2d5c",
} as const;

function TabularRow({
  left,
  assignee,
  showTime = true,
}: {
  left: ReactNode;
  assignee?: string;
  showTime?: boolean;
}) {
  return (
    <div className="s140-row">
      <div className="s140-row-left">{left}</div>
      <div className="s140-row-right">
        {assignee !== undefined ? (
          <span className="s140-assignee">{assignee}</span>
        ) : null}
        {showTime ? <span className="s140-time">0:00</span> : null}
      </div>
    </div>
  );
}

function PartRows({ parts }: { parts: S140PartLine[] }) {
  return (
    <>
      {parts.map((part, index) => (
        <TabularRow
          key={`${part.number ?? "x"}-${part.title}-${index}`}
          left={
            part.showDirectorLabel ? (
              <div>
                <div>{part.title}</div>
                <div className="s140-study-label">Dirigente/leitor:</div>
              </div>
            ) : (
              <span>{part.title}</span>
            )
          }
          assignee={part.assignee}
        />
      ))}
    </>
  );
}

function WeekPrintBlock({
  week,
  congregationName,
  pageBreak,
}: {
  week: S140PublicWeek;
  congregationName: string;
  pageBreak?: boolean;
}) {
  return (
    <section className={pageBreak ? "print-page-break" : undefined}>
      <div className="s140-congregation">{congregationName}</div>
      <div className="s140-subtitle">Programação da reunião do meio de semana</div>

      <div className="s140-week-header">
        <div className="s140-week-date">
          {week.meetingDateShort} | LEITURA SEMANAL DA BÍBLIA
        </div>
      </div>

      <TabularRow
        left={
          <span>
            <strong>Presidente: </strong>
            {week.president}
          </span>
        }
      />
      <TabularRow left={<span>{week.openingSong}</span>} />
      <TabularRow
        left={
          <span>
            <strong>Oração: </strong>
            {week.openingPrayer}
          </span>
        }
      />
      <TabularRow left={<span>Comentários iniciais (1 min)</span>} assignee={week.openingComments} />

      <div
        className="s140-section-header"
        style={{ backgroundColor: SECTION_COLORS.treasures }}
      >
        TESOUROS DA PALAVRA DE DEUS
      </div>
      <div className="s140-section-sublabel">Salão principal</div>
      <TabularRow left={<span />} />
      <PartRows parts={week.treasures} />

      <div
        className="s140-section-header"
        style={{ backgroundColor: SECTION_COLORS.ministry }}
      >
        FAÇA SEU MELHOR NO MINISTÉRIO
      </div>
      <div className="s140-section-sublabel">Salão principal</div>
      <TabularRow left={<span />} />
      <PartRows parts={week.ministry} />

      <div
        className="s140-section-header"
        style={{ backgroundColor: SECTION_COLORS.life }}
      >
        NOSSA VIDA CRISTÃ
      </div>
      <TabularRow left={<span />} />
      <TabularRow left={<span>{week.nvcSong}</span>} />
      <PartRows parts={week.christianLife} />
      {week.study ? <PartRows parts={[week.study]} /> : null}

      <TabularRow
        left={<span>Comentários finais (3 min)</span>}
        assignee={week.closingComments}
      />
      <TabularRow left={<span>{week.closingSong}</span>} />
      <TabularRow
        left={
          <span>
            <strong>Oração: </strong>
            {week.closingPrayer}
          </span>
        }
        showTime={false}
      />
    </section>
  );
}

export function PublicSchedulePrintView({
  view,
  onBack,
}: PublicSchedulePrintViewProps) {
  const weeks = view.weeks.map(buildPublicS140Week);

  return (
    <div className="public-s140-print">
      <style jsx global>{`
        .public-s140-print {
          color: var(--ink);
          font-size: 0.875rem;
          line-height: 1.35;
        }

        .public-s140-print .s140-congregation {
          text-align: center;
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .public-s140-print .s140-subtitle {
          text-align: center;
          font-size: 0.8125rem;
          color: var(--muted);
          margin-bottom: 0.75rem;
        }

        .public-s140-print .s140-week-header {
          text-align: center;
          margin-bottom: 0.5rem;
          padding-bottom: 0.375rem;
          border-bottom: 1px solid var(--line);
        }

        .public-s140-print .s140-week-date {
          font-size: 0.8125rem;
          font-weight: 700;
          letter-spacing: 0.03em;
        }

        .public-s140-print .s140-row {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.35rem 0;
          border-bottom: 1px solid #dddddd;
        }

        .public-s140-print .s140-row-left {
          width: 70%;
          padding-right: 0.375rem;
        }

        .public-s140-print .s140-row-right {
          width: 30%;
          display: flex;
          justify-content: flex-end;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .public-s140-print .s140-assignee {
          text-align: right;
          max-width: 65%;
        }

        .public-s140-print .s140-time {
          width: 2rem;
          text-align: right;
          color: var(--muted);
          font-size: 0.75rem;
        }

        .public-s140-print .s140-section-header {
          padding: 0.25rem 0.375rem;
          font-weight: 700;
          font-size: 0.75rem;
          letter-spacing: 0.03em;
          color: #ffffff;
          margin-top: 0.25rem;
        }

        .public-s140-print .s140-section-sublabel {
          padding: 0.2rem 0.375rem;
          font-size: 0.72rem;
          color: var(--muted);
          border-bottom: 1px solid #dddddd;
        }

        .public-s140-print .s140-study-label {
          font-size: 0.72rem;
          color: var(--muted);
          margin-top: 0.125rem;
        }

        @media print {
          .no-print {
            display: none !important;
          }

          .print-page-break {
            page-break-after: always;
          }
        }
      `}</style>

      <div className={`${btnRowClass} no-print`}>
        <button type="button" className={btnOutline} onClick={onBack}>
          Voltar à lista
        </button>
        <button
          type="button"
          className={btnPrimary}
          onClick={() => window.print()}
        >
          Imprimir
        </button>
      </div>

      {weeks.map((week, index) => (
        <WeekPrintBlock
          key={`${week.meetingDateShort}-${index}`}
          week={week}
          congregationName={view.congregationName}
          pageBreak={index < weeks.length - 1}
        />
      ))}
    </div>
  );
}
