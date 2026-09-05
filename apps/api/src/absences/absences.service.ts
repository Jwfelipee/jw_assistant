import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  prisma,
  type Absence,
  type AbsenceStatus,
} from '@jw/database';
import { AbsenceStatus as SharedAbsenceStatus } from '@jw/shared';
import type { CreateAbsenceDto } from './dto/create-absence.dto';
import {
  isEligibleGivenAbsences,
  toDateOnly,
} from './eligibility';

export type AbsenceView = {
  id: string;
  participantId: string;
  startsOn: string;
  endsOn: string | null;
  status: AbsenceStatus;
  acknowledgedAt: string | null;
  hasJustification: boolean;
  createdAt: string;
  updatedAt: string;
  justification?: string | null;
};

export type AbsenceAlertView = AbsenceView & {
  participantName: string;
};

@Injectable()
export class AbsencesService {
  async create(
    participantId: string,
    dto: CreateAbsenceDto,
  ): Promise<AbsenceView> {
    await this.assertParticipant(participantId);

    const startsOn = this.parseDateOnly(dto.startsOn, 'Data de início');
    const endsOn =
      dto.endsOn === undefined || dto.endsOn === null || dto.endsOn === ''
        ? null
        : this.parseDateOnly(dto.endsOn, 'Data de fim');

    if (endsOn && toDateOnly(endsOn) < toDateOnly(startsOn)) {
      throw new BadRequestException(
        'Data de fim deve ser igual ou posterior à data de início',
      );
    }

    const justification =
      dto.justification === undefined || dto.justification === null
        ? null
        : dto.justification.trim() || null;

    // Creating a new period dismisses pending end-of-absence alerts.
    await prisma.absence.updateMany({
      where: {
        participantId,
        acknowledgedAt: null,
        endsOn: { not: null, lt: this.todayUtcDate() },
      },
      data: {
        acknowledgedAt: new Date(),
        status: SharedAbsenceStatus.ENDED,
      },
    });

    const row = await prisma.absence.create({
      data: {
        participantId,
        startsOn,
        endsOn,
        justification,
        status: SharedAbsenceStatus.ACTIVE,
      },
    });

    return this.toView(row, false);
  }

  async listByParticipant(
    participantId: string,
    revealJustification = false,
  ): Promise<AbsenceView[]> {
    await this.assertParticipant(participantId);

    const rows = await prisma.absence.findMany({
      where: { participantId },
      orderBy: [{ startsOn: 'desc' }, { createdAt: 'desc' }],
    });

    return rows.map((row) => this.toView(row, revealJustification));
  }

  async reveal(id: string): Promise<AbsenceView> {
    const row = await this.findOrThrow(id);
    return this.toView(row, true);
  }

  async acknowledge(id: string): Promise<AbsenceView> {
    const row = await this.findOrThrow(id);

    if (row.endsOn == null) {
      throw new BadRequestException(
        'Somente ausências com data de fim podem ser reconhecidas assim',
      );
    }

    const updated = await prisma.absence.update({
      where: { id },
      data: {
        acknowledgedAt: row.acknowledgedAt ?? new Date(),
        status:
          toDateOnly(row.endsOn) < toDateOnly(this.todayUtcDate())
            ? SharedAbsenceStatus.ENDED
            : row.status,
      },
    });

    return this.toView(updated, false);
  }

  /**
   * Ends an absence and marks the participant available again.
   * Open-ended absences receive endsOn = today.
   */
  async reactivate(id: string): Promise<AbsenceView> {
    const row = await this.findOrThrow(id);

    if (row.status === SharedAbsenceStatus.CANCELLED) {
      throw new BadRequestException('Ausência cancelada não pode ser reativada');
    }

    const today = this.todayUtcDate();
    const endsOn =
      row.endsOn == null
        ? today
        : toDateOnly(row.endsOn) > toDateOnly(today)
          ? today
          : row.endsOn;

    const updated = await prisma.absence.update({
      where: { id },
      data: {
        endsOn,
        status: SharedAbsenceStatus.ENDED,
        acknowledgedAt: row.acknowledgedAt ?? new Date(),
      },
    });

    return this.toView(updated, false);
  }

  /** Dated absences past endsOn that the user has not yet acknowledged. */
  async listEndAlerts(asOf: Date = this.todayUtcDate()): Promise<AbsenceAlertView[]> {
    const asOfDate = this.parseDateOnly(toDateOnly(asOf), 'Data de referência');

    const rows = await prisma.absence.findMany({
      where: {
        acknowledgedAt: null,
        endsOn: { not: null, lt: asOfDate },
        status: { in: [SharedAbsenceStatus.ACTIVE, SharedAbsenceStatus.ENDED] },
      },
      include: {
        participant: { select: { name: true } },
      },
      orderBy: [{ endsOn: 'asc' }, { startsOn: 'asc' }],
    });

    return rows.map((row) => ({
      ...this.toView(row, false),
      participantName: row.participant.name,
    }));
  }

  async isEligibleForMeetingDate(
    participantId: string,
    meetingDate: Date | string,
  ): Promise<boolean> {
    await this.assertParticipant(participantId);

    const rows = await prisma.absence.findMany({
      where: { participantId },
      select: {
        startsOn: true,
        endsOn: true,
        status: true,
      },
    });

    return isEligibleGivenAbsences(rows, meetingDate);
  }

  private async assertParticipant(id: string): Promise<void> {
    const exists = await prisma.participant.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException('Participante não encontrado');
    }
  }

  private async findOrThrow(id: string): Promise<Absence> {
    const row = await prisma.absence.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('Ausência não encontrada');
    }
    return row;
  }

  private toView(row: Absence, revealJustification: boolean): AbsenceView {
    const view: AbsenceView = {
      id: row.id,
      participantId: row.participantId,
      startsOn: toDateOnly(row.startsOn),
      endsOn: row.endsOn ? toDateOnly(row.endsOn) : null,
      status: row.status,
      acknowledgedAt: row.acknowledgedAt
        ? row.acknowledgedAt.toISOString()
        : null,
      hasJustification: Boolean(row.justification),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };

    if (revealJustification) {
      view.justification = row.justification ?? null;
    }

    return view;
  }

  private parseDateOnly(value: string, label: string): Date {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value.slice(0, 10))) {
      throw new BadRequestException(`${label} inválida`);
    }
    const iso = `${value.slice(0, 10)}T00:00:00.000Z`;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${label} inválida`);
    }
    return date;
  }

  private todayUtcDate(): Date {
    return this.parseDateOnly(toDateOnly(new Date()), 'Hoje');
  }
}
