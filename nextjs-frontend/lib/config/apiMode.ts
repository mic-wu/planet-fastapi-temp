export type ApiMode = "mock" | "live";

const DEFAULT_API_MODE: ApiMode = "mock";

/**
 * Resolve which API mode the frontend should use.
 */
export function getApiMode(): ApiMode {
  const mode = process.env.NEXT_PUBLIC_API_MODE?.toLowerCase();

  if (mode === "mock" || mode === "live") {
    return mode;
  }

  return DEFAULT_API_MODE;
}

export function isMockMode(): boolean {
  return getApiMode() === "mock";
}
