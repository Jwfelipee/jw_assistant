import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AssignmentRole,
  PartTopic,
  Privilege,
  Sex,
  SlotMode,
  prisma,
  type PartType,
} from '@jw/database';
import {
  ALL_PRIVILEGES_FOR_SEXES,
  rolesForUserCatalogSlot,
  slugPartTypeCode,
} from './catalog.helpers';
import { CreatePartTypeDto } from './dto/create-part-type.dto';
import { UpdatePartTypeDto } from './dto/update-part-type.dto';

export type PartTypeResponse = {
  id: string;
  code: string;
  topic: PartTopic;
  label: string;
  allowedSexes: Sex[];
  slotMode: SlotMode;
  roles: AssignmentRole[];
  privileges: Privilege[];
  /** Alias for API consumers matching the task field name. */
  allowedPrivileges: Privilege[];
  isSystem: boolean;
  deletable: boolean;
  countsAsMinistryPractice: boolean;
  defaultSortOrder: number;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class CatalogService {
  toResponse(row: PartType): PartTypeResponse {
    return {
      id: row.id,
      code: row.code,
      topic: row.topic,
      label: row.label,
      allowedSexes: row.allowedSexes,
      slotMode: row.slotMode,
      roles: row.roles,
      privileges: row.privileges,
      allowedPrivileges: row.privileges,
      isSystem: row.isSystem,
      deletable: row.deletable,
      countsAsMinistryPractice: row.countsAsMinistryPractice,
      defaultSortOrder: row.defaultSortOrder,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async list(topic?: PartTopic): Promise<PartTypeResponse[]> {
    const rows = await prisma.partType.findMany({
      where: topic ? { topic } : undefined,
      orderBy: [{ topic: 'asc' }, { defaultSortOrder: 'asc' }, { label: 'asc' }],
    });
    return rows.map((r) => this.toResponse(r));
  }

  async getById(id: string): Promise<PartTypeResponse> {
    const row = await prisma.partType.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('Tipo de parte não encontrado');
    }
    return this.toResponse(row);
  }

  async create(dto: CreatePartTypeDto): Promise<PartTypeResponse> {
    const topic = dto.topic as PartTopic;
    this.assertMutableTopic(topic);

    const allowedSexes = this.normalizeSexesForTopic(
      topic,
      dto.allowedSexes as Sex[],
    );
    const privileges =
      dto.privileges && dto.privileges.length > 0
        ? (dto.privileges as Privilege[])
        : ALL_PRIVILEGES_FOR_SEXES(allowedSexes);

    this.assertPrivilegesMatchSexes(privileges, allowedSexes);

    const slotMode = dto.slotMode as SlotMode;
    const roles = rolesForUserCatalogSlot(slotMode);
    const countsAsMinistryPractice =
      dto.countsAsMinistryPractice ?? topic === PartTopic.MINISTRY;

    const code = await this.allocateUniqueCode(topic, dto.label);
    const defaultSortOrder =
      dto.defaultSortOrder ?? (await this.nextSortOrder(topic));

    const row = await prisma.partType.create({
      data: {
        topic,
        code,
        label: dto.label.trim(),
        allowedSexes,
        slotMode,
        roles,
        privileges,
        isSystem: false,
        deletable: true,
        countsAsMinistryPractice,
        defaultSortOrder,
      },
    });

    return this.toResponse(row);
  }

  async update(id: string, dto: UpdatePartTypeDto): Promise<PartTypeResponse> {
    const existing = await prisma.partType.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Tipo de parte não encontrado');
    }

    if (existing.isSystem) {
      throw new ForbiddenException(
        'Tipos de sistema não podem ser alterados',
      );
    }

    if (
      existing.topic !== PartTopic.MINISTRY &&
      existing.topic !== PartTopic.CHRISTIAN_LIFE
    ) {
      throw new ForbiddenException(
        'Este tipo de parte não é editável pelo catálogo',
      );
    }

    const allowedSexes = dto.allowedSexes
      ? this.normalizeSexesForTopic(existing.topic, dto.allowedSexes as Sex[])
      : existing.allowedSexes;

    const privileges =
      dto.privileges !== undefined
        ? (dto.privileges as Privilege[])
        : existing.privileges;

    if (privileges.length === 0) {
      throw new BadRequestException('Informe ao menos um privilégio');
    }

    this.assertPrivilegesMatchSexes(privileges, allowedSexes);

    const slotMode = (dto.slotMode as SlotMode | undefined) ?? existing.slotMode;
    const roles = rolesForUserCatalogSlot(slotMode);

    const row = await prisma.partType.update({
      where: { id },
      data: {
        label: dto.label?.trim() ?? existing.label,
        allowedSexes,
        slotMode,
        roles,
        privileges,
        countsAsMinistryPractice:
          dto.countsAsMinistryPractice ?? existing.countsAsMinistryPractice,
        defaultSortOrder:
          dto.defaultSortOrder ?? existing.defaultSortOrder,
      },
    });

    return this.toResponse(row);
  }

  async remove(id: string): Promise<{ ok: true }> {
    const existing = await prisma.partType.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Tipo de parte não encontrado');
    }

    if (existing.isSystem || !existing.deletable) {
      throw new ForbiddenException(
        'Tipos de sistema não podem ser excluídos',
      );
    }

    if (
      existing.topic !== PartTopic.MINISTRY &&
      existing.topic !== PartTopic.CHRISTIAN_LIFE
    ) {
      throw new ForbiddenException(
        'Este tipo de parte não pode ser excluído pelo catálogo',
      );
    }

    const inUse = await prisma.weekPart.count({
      where: { partTypeId: id },
    });
    if (inUse > 0) {
      throw new BadRequestException(
        'Tipo em uso em semanas programadas; remova as partes antes de excluir',
      );
    }

    await prisma.partType.delete({ where: { id } });
    return { ok: true };
  }

  private assertMutableTopic(topic: PartTopic): void {
    if (
      topic !== PartTopic.MINISTRY &&
      topic !== PartTopic.CHRISTIAN_LIFE
    ) {
      throw new BadRequestException(
        'Só é possível criar tipos FSM (MINISTRY) ou NVC (CHRISTIAN_LIFE)',
      );
    }
  }

  private normalizeSexesForTopic(
    topic: PartTopic,
    sexes: Sex[],
  ): Sex[] {
    if (sexes.length === 0) {
      throw new BadRequestException('Informe ao menos um sexo permitido');
    }

    const unique = [...new Set(sexes)];

    if (topic === PartTopic.CHRISTIAN_LIFE) {
      if (unique.length !== 1 || unique[0] !== Sex.MALE) {
        throw new BadRequestException(
          'Partes de Nossa Vida Cristã devem ser apenas para homens',
        );
      }
      return [Sex.MALE];
    }

    return unique;
  }

  private assertPrivilegesMatchSexes(
    privileges: Privilege[],
    sexes: Sex[],
  ): void {
    const allowed = new Set(ALL_PRIVILEGES_FOR_SEXES(sexes));
    const invalid = privileges.filter((p) => !allowed.has(p));
    if (invalid.length > 0) {
      throw new BadRequestException(
        `Privilégios incompatíveis com o sexo permitido: ${invalid.join(', ')}`,
      );
    }
  }

  private async allocateUniqueCode(
    topic: PartTopic,
    label: string,
  ): Promise<string> {
    const prefix =
      topic === PartTopic.MINISTRY ? 'FSM' : 'NVC';
    const base = slugPartTypeCode(prefix, label);

    const existing = await prisma.partType.findUnique({
      where: { code: base },
    });
    if (!existing) {
      return base;
    }

    for (let i = 2; i < 100; i++) {
      const candidate = `${base}_${i}`;
      const clash = await prisma.partType.findUnique({
        where: { code: candidate },
      });
      if (!clash) {
        return candidate;
      }
    }

    return `${base}_${Date.now().toString(36).toUpperCase()}`;
  }

  private async nextSortOrder(topic: PartTopic): Promise<number> {
    const last = await prisma.partType.findFirst({
      where: { topic, isSystem: false },
      orderBy: { defaultSortOrder: 'desc' },
      select: { defaultSortOrder: true },
    });
    return (last?.defaultSortOrder ?? 0) + 1;
  }
}
