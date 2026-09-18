import { PublicScheduleContent } from "@/components/public-schedule-content";
import {
  fetchPublicSchedule,
  type PublicScheduleFetchResult,
  type PublicScheduleSlug,
} from "@/lib/public-schedule";
import { pageMainClass } from "@/lib/ui";

type PublicScheduleRouteProps = {
  slug: PublicScheduleSlug;
};

function PublicScheduleStateMessage({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="flex min-h-[12rem] flex-col items-center justify-center gap-[var(--space-3)] text-center">
      <h1 className="font-heading text-[var(--text-xl)]">{title}</h1>
      <p className="max-w-[20rem] text-[var(--text-sm)] text-[var(--muted)]">
        {message}
      </p>
    </div>
  );
}

function renderResult(result: PublicScheduleFetchResult) {
  if ("disabled" in result) {
    return (
      <PublicScheduleStateMessage
        title="Link desativado"
        message="Este link está desativado."
      />
    );
  }

  if ("error" in result) {
    return (
      <PublicScheduleStateMessage title="Erro" message={result.error} />
    );
  }

  if (result.weeks.length === 0) {
    return (
      <PublicScheduleStateMessage
        title={result.title}
        message="Programação ainda não disponível."
      />
    );
  }

  return <PublicScheduleContent view={result} />;
}

export async function PublicScheduleRoute({ slug }: PublicScheduleRouteProps) {
  const result = await fetchPublicSchedule(slug);

  return <main className={pageMainClass}>{renderResult(result)}</main>;
}
