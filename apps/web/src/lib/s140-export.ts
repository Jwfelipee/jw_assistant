/** Download helpers for S-140 PDF export (month view). */

export function s140PdfPath(yearMonth: string): string {
  return `/api/schedule/months/${encodeURIComponent(yearMonth)}/s140.pdf`;
}

export function s140SuggestedFilename(yearMonth: string): string {
  return `S-140-${yearMonth}.pdf`;
}

/**
 * Fetches the month PDF with session cookies and triggers a browser download.
 * Works on mobile and desktop browsers (blob + object URL).
 */
export async function downloadS140Pdf(
  yearMonth: string,
): Promise<{ ok: true } | { ok: false; message: string; status?: number }> {
  const res = await fetch(s140PdfPath(yearMonth), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 401) {
      return {
        ok: false,
        message: "Sessão necessária para exportar o S-140.",
        status: 401,
      };
    }
    if (res.status === 404) {
      return {
        ok: false,
        message: "Mês ainda não gerado. Gere a programação antes de exportar.",
        status: 404,
      };
    }
    return {
      ok: false,
      message: "Não foi possível gerar o PDF. Tente de novo.",
      status: res.status,
    };
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = s140SuggestedFilename(yearMonth);
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);

  return { ok: true };
}
