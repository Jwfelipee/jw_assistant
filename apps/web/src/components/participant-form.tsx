"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Privilege, RolePreference, Sex } from "@jw/shared";
import {
  PRIVILEGE_LABELS,
  ROLE_PREFERENCE_LABELS,
  SEX_LABELS,
  privilegesForSexLabel,
  type ParticipantInput,
} from "@/lib/participants";

type Props = {
  initial?: Partial<ParticipantInput>;
  submitLabel: string;
  pendingLabel: string;
  onSubmit: (input: ParticipantInput) => Promise<void>;
};

const fieldClass =
  "rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-[var(--space-3)] py-[var(--space-3)] text-[var(--text-base)] text-[var(--ink)] outline-none transition-[border-color,box-shadow] focus:border-[var(--focus-ring)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--focus-ring)_28%,transparent)]";

export function ParticipantForm({
  initial,
  submitLabel,
  pendingLabel,
  onSubmit,
}: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [sex, setSex] = useState<Sex>(initial?.sex ?? Sex.MALE);
  const [privilege, setPrivilege] = useState<Privilege>(
    initial?.privilege ?? Privilege.PUBLISHER,
  );
  const [rolePreference, setRolePreference] = useState<RolePreference>(
    initial?.rolePreference ?? RolePreference.ANY,
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const allowedPrivileges = useMemo(() => privilegesForSexLabel(sex), [sex]);

  useEffect(() => {
    if (!allowedPrivileges.includes(privilege)) {
      setPrivilege(allowedPrivileges[0] ?? Privilege.PUBLISHER);
    }
  }, [allowedPrivileges, privilege]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim() || null,
        sex,
        privilege,
        rolePreference,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível salvar.",
      );
      setPending(false);
      return;
    }
    setPending(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-[var(--space-4)]"
      noValidate
    >
      <div className="flex flex-col gap-[var(--space-2)]">
        <label htmlFor="name" className="text-[var(--text-sm)] text-[var(--muted)]">
          Nome
        </label>
        <input
          id="name"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-[var(--space-2)]">
        <label htmlFor="phone" className="text-[var(--text-sm)] text-[var(--muted)]">
          Telefone <span className="text-[var(--muted)]">(opcional)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={phone ?? ""}
          onChange={(e) => setPhone(e.target.value)}
          className={fieldClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2">
        <div className="flex flex-col gap-[var(--space-2)]">
          <label htmlFor="sex" className="text-[var(--text-sm)] text-[var(--muted)]">
            Sexo
          </label>
          <select
            id="sex"
            name="sex"
            value={sex}
            onChange={(e) => setSex(e.target.value as Sex)}
            className={fieldClass}
          >
            {Object.values(Sex).map((value) => (
              <option key={value} value={value}>
                {SEX_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-[var(--space-2)]">
          <label
            htmlFor="privilege"
            className="text-[var(--text-sm)] text-[var(--muted)]"
          >
            Privilégio
          </label>
          <select
            id="privilege"
            name="privilege"
            value={privilege}
            onChange={(e) => setPrivilege(e.target.value as Privilege)}
            className={fieldClass}
          >
            {allowedPrivileges.map((value) => (
              <option key={value} value={value}>
                {PRIVILEGE_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-[var(--space-2)]">
        <label
          htmlFor="rolePreference"
          className="text-[var(--text-sm)] text-[var(--muted)]"
        >
          Preferência de papel
        </label>
        <select
          id="rolePreference"
          name="rolePreference"
          value={rolePreference}
          onChange={(e) => setRolePreference(e.target.value as RolePreference)}
          className={fieldClass}
        >
          {Object.values(RolePreference).map((value) => (
            <option key={value} value={value}>
              {ROLE_PREFERENCE_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p role="alert" className="text-[var(--text-sm)] text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-[var(--space-2)] rounded-[var(--radius-md)] bg-[var(--accent)] px-[var(--space-4)] py-[var(--space-3)] text-[var(--text-base)] font-medium text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] disabled:opacity-60"
      >
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
