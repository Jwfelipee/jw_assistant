/** Domain enums aligned with Prisma schema (`@jw/database`). */

export enum Sex {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export enum Privilege {
  ELDER = "ELDER",
  MINISTERIAL_SERVANT = "MINISTERIAL_SERVANT",
  REGULAR_PIONEER = "REGULAR_PIONEER",
  REGULAR_PIONEER_SISTER = "REGULAR_PIONEER_SISTER",
  BAPTIZED = "BAPTIZED",
  PUBLISHER = "PUBLISHER",
}

export enum RolePreference {
  ANY = "ANY",
  PRINCIPAL_ONLY = "PRINCIPAL_ONLY",
  ASSISTANT_ONLY = "ASSISTANT_ONLY",
}

export enum AssignmentRole {
  TITULAR = "TITULAR",
  AJUDANTE = "AJUDANTE",
  DIRIGENTE = "DIRIGENTE",
  LEITOR = "LEITOR",
}

export enum PartTopic {
  OUT_OF_TOPIC = "OUT_OF_TOPIC",
  TREASURES = "TREASURES",
  MINISTRY = "MINISTRY",
  CHRISTIAN_LIFE = "CHRISTIAN_LIFE",
}

export enum SlotMode {
  ONE = "ONE",
  TWO = "TWO",
}

export enum Weekday {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

export enum AbsenceStatus {
  ACTIVE = "ACTIVE",
  ENDED = "ENDED",
  CANCELLED = "CANCELLED",
}

/** Privileges valid for male participants. */
export const MALE_PRIVILEGES: readonly Privilege[] = [
  Privilege.ELDER,
  Privilege.MINISTERIAL_SERVANT,
  Privilege.REGULAR_PIONEER,
  Privilege.BAPTIZED,
  Privilege.PUBLISHER,
] as const;

/** Privileges valid for female participants. */
export const FEMALE_PRIVILEGES: readonly Privilege[] = [
  Privilege.REGULAR_PIONEER_SISTER,
  Privilege.BAPTIZED,
  Privilege.PUBLISHER,
] as const;

/** Privileges typically allowed for elder/servant-only parts. */
export const ELDER_OR_SERVANT: readonly Privilege[] = [
  Privilege.ELDER,
  Privilege.MINISTERIAL_SERVANT,
] as const;

/** Returns privileges allowed for the given sex. */
export function privilegesForSex(sex: Sex): readonly Privilege[] {
  return sex === Sex.MALE ? MALE_PRIVILEGES : FEMALE_PRIVILEGES;
}

/** Whether the privilege is valid for the given sex. */
export function isPrivilegeAllowedForSex(
  sex: Sex,
  privilege: Privilege,
): boolean {
  return privilegesForSex(sex).includes(privilege);
}
