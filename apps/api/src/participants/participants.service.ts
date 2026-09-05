import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  prisma,
  type Participant,
  type Privilege,
  type RolePreference,
  type Sex,
} from '@jw/database';
import { isPrivilegeAllowedForSex, Sex as SharedSex, Privilege as SharedPrivilege } from '@jw/shared';
import type { CreateParticipantDto } from './dto/create-participant.dto';
import type { UpdateParticipantDto } from './dto/update-participant.dto';
import type { CreateAssociationDto } from './dto/create-association.dto';

export type ParticipantCounters = {
  titular: number;
  ajudante: number;
  dirigente: number;
  leitor: number;
  ministryPractice: number;
};

export type AssociationView = {
  id: string;
  otherParticipantId: string;
  otherParticipantName: string;
  reason: string;
  createdAt: string;
};

export type ParticipantListItem = {
  id: string;
  name: string;
  phone: string | null;
  sex: Sex;
  privilege: Privilege;
  rolePreference: RolePreference;
  counters: ParticipantCounters;
};

export type ParticipantDetail = ParticipantListItem & {
  associations: AssociationView[];
  createdAt: string;
  updatedAt: string;
};

export type AssignmentHistoryItem = {
  id: string;
  role: string;
  meetingDate: string;
  weekStartDate: string;
  partTitle: string;
  partTopic: string;
  partTypeLabel: string;
};

@Injectable()
export class ParticipantsService {
  async list(): Promise<ParticipantListItem[]> {
    const rows = await prisma.participant.findMany({
      orderBy: { name: 'asc' },
    });
    return rows.map((row) => this.toListItem(row));
  }

  async getById(id: string): Promise<ParticipantDetail> {
    const row = await this.findOrThrow(id);
    const associations = await this.listAssociationsFor(id);
    return {
      ...this.toListItem(row),
      associations,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async create(dto: CreateParticipantDto): Promise<ParticipantDetail> {
    this.assertPrivilegeForSex(dto.sex, dto.privilege);

    const row = await prisma.participant.create({
      data: {
        name: dto.name.trim(),
        phone: this.normalizePhone(dto.phone),
        sex: dto.sex,
        privilege: dto.privilege,
        rolePreference: dto.rolePreference ?? 'ANY',
      },
    });

    return {
      ...this.toListItem(row),
      associations: [],
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async update(
    id: string,
    dto: UpdateParticipantDto,
  ): Promise<ParticipantDetail> {
    const existing = await this.findOrThrow(id);

    const sex = dto.sex ?? existing.sex;
    const privilege = dto.privilege ?? existing.privilege;
    this.assertPrivilegeForSex(sex, privilege);

    const data: {
      name?: string;
      phone?: string | null;
      sex?: Sex;
      privilege?: Privilege;
      rolePreference?: RolePreference;
    } = {};

    if (dto.name !== undefined) {
      data.name = dto.name.trim();
    }
    if (dto.phone !== undefined) {
      data.phone = this.normalizePhone(dto.phone);
    }
    if (dto.sex !== undefined) {
      data.sex = dto.sex;
    }
    if (dto.privilege !== undefined) {
      data.privilege = dto.privilege;
    }
    if (dto.rolePreference !== undefined) {
      data.rolePreference = dto.rolePreference;
    }

    const row = await prisma.participant.update({
      where: { id },
      data,
    });

    const associations = await this.listAssociationsFor(id);
    return {
      ...this.toListItem(row),
      associations,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async remove(id: string): Promise<{ ok: true }> {
    await this.findOrThrow(id);
    await prisma.participant.delete({ where: { id } });
    return { ok: true };
  }

  async createAssociation(
    participantId: string,
    dto: CreateAssociationDto,
  ): Promise<AssociationView> {
    const reason = dto.reason.trim();
    if (!reason) {
      throw new BadRequestException('Motivo é obrigatório');
    }

    const otherId = dto.otherParticipantId.trim();
    if (otherId === participantId) {
      throw new BadRequestException(
        'Não é possível associar um participante a si mesmo',
      );
    }

    await this.findOrThrow(participantId);
    const other = await this.findOrThrow(otherId);

    const [aId, bId] = this.orderedPair(participantId, otherId);

    const existing = await prisma.participantAssociation.findUnique({
      where: { aId_bId: { aId, bId } },
    });
    if (existing) {
      throw new ConflictException('Associação já existe entre estes participantes');
    }

    const created = await prisma.participantAssociation.create({
      data: { aId, bId, reason },
    });

    return {
      id: created.id,
      otherParticipantId: other.id,
      otherParticipantName: other.name,
      reason: created.reason,
      createdAt: created.createdAt.toISOString(),
    };
  }

  async deleteAssociation(
    participantId: string,
    associationId: string,
  ): Promise<{ ok: true }> {
    await this.findOrThrow(participantId);

    const association = await prisma.participantAssociation.findUnique({
      where: { id: associationId },
    });

    if (
      !association ||
      (association.aId !== participantId && association.bId !== participantId)
    ) {
      throw new NotFoundException('Associação não encontrada');
    }

    await prisma.participantAssociation.delete({
      where: { id: associationId },
    });

    return { ok: true };
  }

  async listAssignments(participantId: string): Promise<AssignmentHistoryItem[]> {
    await this.findOrThrow(participantId);

    const slots = await prisma.assignmentSlot.findMany({
      where: { participantId },
      include: {
        weekPart: {
          include: {
            partType: true,
            week: true,
          },
        },
      },
      orderBy: {
        weekPart: {
          week: {
            meetingDate: 'desc',
          },
        },
      },
    });

    return slots.map((slot) => ({
      id: slot.id,
      role: slot.role,
      meetingDate: slot.weekPart.week.meetingDate.toISOString().slice(0, 10),
      weekStartDate: slot.weekPart.week.weekStartDate
        .toISOString()
        .slice(0, 10),
      partTitle: slot.weekPart.title,
      partTopic: slot.weekPart.topic,
      partTypeLabel: slot.weekPart.partType.label,
    }));
  }

  private async listAssociationsFor(
    participantId: string,
  ): Promise<AssociationView[]> {
    const rows = await prisma.participantAssociation.findMany({
      where: {
        OR: [{ aId: participantId }, { bId: participantId }],
      },
      include: {
        a: { select: { id: true, name: true } },
        b: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return rows.map((row) => {
      const other = row.aId === participantId ? row.b : row.a;
      return {
        id: row.id,
        otherParticipantId: other.id,
        otherParticipantName: other.name,
        reason: row.reason,
        createdAt: row.createdAt.toISOString(),
      };
    });
  }

  private async findOrThrow(id: string): Promise<Participant> {
    const row = await prisma.participant.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('Participante não encontrado');
    }
    return row;
  }

  private assertPrivilegeForSex(sex: Sex, privilege: Privilege): void {
    if (
      !isPrivilegeAllowedForSex(
        sex as SharedSex,
        privilege as SharedPrivilege,
      )
    ) {
      throw new BadRequestException(
        'Privilégio inválido para o sexo informado',
      );
    }
  }

  private normalizePhone(phone: string | null | undefined): string | null {
    if (phone === undefined || phone === null) {
      return null;
    }
    const trimmed = phone.trim();
    return trimmed.length === 0 ? null : trimmed;
  }

  private orderedPair(idA: string, idB: string): [string, string] {
    return idA < idB ? [idA, idB] : [idB, idA];
  }

  private toListItem(row: Participant): ParticipantListItem {
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      sex: row.sex,
      privilege: row.privilege,
      rolePreference: row.rolePreference,
      counters: {
        titular: row.titularCount,
        ajudante: row.ajudanteCount,
        dirigente: row.dirigenteCount,
        leitor: row.leitorCount,
        ministryPractice: row.ministryPracticeCount,
      },
    };
  }
}
