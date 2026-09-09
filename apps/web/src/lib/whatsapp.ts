import { AssignmentRole } from "@jw/shared";

const ROLE_WHATSAPP_LABELS: Record<AssignmentRole, string> = {
  [AssignmentRole.TITULAR]: "Titular",
  [AssignmentRole.AJUDANTE]: "Ajudante",
  [AssignmentRole.DIRIGENTE]: "Dirigente",
  [AssignmentRole.LEITOR]: "Leitor",
};

export function normalizePhoneForWaMe(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

function formatRoleName(name: string, isFocus: boolean): string {
  return isFocus ? `*${name}*` : `_${name}_`;
}

export function buildAssignmentWhatsAppMessage(input: {
  meetingDate: string;
  partTitle: string;
  slotRole: AssignmentRole;
  titularName?: string | null;
  ajudanteOrLeitorName?: string | null;
  focusRole: AssignmentRole;
}): string {
  const lines = [
    "Sua designação — Reunião do meio de semana",
    "",
    `📅 *${input.meetingDate}*`,
    `📋 *${input.partTitle}*`,
  ];

  const roleLines: string[] = [];

  if (
    input.focusRole === AssignmentRole.DIRIGENTE &&
    input.titularName &&
    !input.ajudanteOrLeitorName
  ) {
    roleLines.push(
      `👤 ${ROLE_WHATSAPP_LABELS[AssignmentRole.DIRIGENTE]}: ${formatRoleName(input.titularName, true)}`,
    );
  } else {
    if (input.titularName) {
      roleLines.push(
        `👤 ${ROLE_WHATSAPP_LABELS[AssignmentRole.TITULAR]}: ${formatRoleName(
          input.titularName,
          input.focusRole === AssignmentRole.TITULAR,
        )}`,
      );
    }

    if (input.ajudanteOrLeitorName) {
      const secondaryRole =
        input.slotRole === AssignmentRole.LEITOR
          ? AssignmentRole.LEITOR
          : AssignmentRole.AJUDANTE;
      roleLines.push(
        `👤 ${ROLE_WHATSAPP_LABELS[secondaryRole]}: ${formatRoleName(
          input.ajudanteOrLeitorName,
          input.focusRole === secondaryRole,
        )}`,
      );
    }
  }

  return [...lines, ...roleLines].join("\n");
}

export function whatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${normalizePhoneForWaMe(phone)}?text=${encodeURIComponent(message)}`;
}
