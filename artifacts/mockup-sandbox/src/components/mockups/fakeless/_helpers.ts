export function apiError(e: unknown): { status: number | null; message: string } {
  const err = e as { status?: number; data?: { error?: string } | null; message?: string } | null;
  return {
    status: typeof err?.status === "number" ? err.status : null,
    message: err?.data?.error || err?.message || "Something went wrong. Try again.",
  };
}

export const money = (n: number, c = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: c || "USD" }).format(n);
