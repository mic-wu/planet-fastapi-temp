export function formatMetadataKey(key: string): string {
  return key
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function formatMetadataValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "N/A";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value, null, 2);
}

export type StoryInsight = {
  title: string;
  description: string;
};

export type NormalizedStoryMetadata = {
  resolution?: string;
  capturedAt?: string;
  sensor?: string;
  satellite?: string;
  mission?: string;
  revisit?: string;
  incidentType?: string;
  impactSummary?: string;
  highlights: string[];
  insights: StoryInsight[];
  downloadUrl?: string;
  contactEmail?: string;
  license?: string;
  tags: string[];
};

const isString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const parseNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((entry) => (isString(entry) ? entry.trim() : null))
    .filter((entry): entry is string => Boolean(entry))
    .filter((entry, index, array) => array.indexOf(entry) === index);
};

const pickString = (
  record: Record<string, unknown>,
  ...keys: string[]
): string | undefined => {
  for (const key of keys) {
    const candidate = record[key];
    if (isString(candidate)) {
      return candidate.trim();
    }
  }
  return undefined;
};

const pickInsights = (value: unknown): StoryInsight[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (isString(entry)) {
        return { title: entry, description: "" };
      }

      if (entry && typeof entry === "object") {
        const record = entry as Record<string, unknown>;
        const title = pickString(record, "title", "heading", "label");
        const description = pickString(record, "description", "text", "body");

        if (title || description) {
          return {
            title: title ?? "Insight",
            description: description ?? "",
          };
        }
      }

      return null;
    })
    .filter((entry): entry is StoryInsight => Boolean(entry));
};

export function normalizeStoryMetadata(
  metadata: Record<string, unknown> | null | undefined,
): NormalizedStoryMetadata {
  if (!metadata || typeof metadata !== "object") {
    return {
      highlights: [],
      insights: [],
      tags: [],
    };
  }

  const record = metadata as Record<string, unknown>;

  const resolution = pickString(record, "resolution", "ground_sample_distance");
  const capturedAt = pickString(
    record,
    "captured_at",
    "acquired_at",
    "capture_time",
    "capturedAt",
  );
  const sensor = pickString(record, "sensor", "instrument");
  const satellite = pickString(
    record,
    "satellite",
    "constellation",
    "platform",
  );
  const mission = pickString(record, "mission", "campaign", "program");
  const incidentType = pickString(
    record,
    "incident_type",
    "event_type",
    "imagery_focus",
  );
  const impactSummary = pickString(
    record,
    "impact_summary",
    "summary",
    "overview",
  );

  let revisit = pickString(record, "revisit", "revisit_rate");
  if (!revisit) {
    const revisitHours = parseNumber(record["revisit_hours"]);
    if (revisitHours !== null) {
      revisit = `${revisitHours} hrs`;
    } else {
      const revisitDays = parseNumber(record["revisit_days"]);
      if (revisitDays !== null) {
        revisit = `${revisitDays} days`;
      }
    }
  }

  const downloadUrl = pickString(record, "download_url", "download_link");
  const contactEmail = pickString(
    record,
    "contact_email",
    "contact",
    "contact_person",
  );
  const license = pickString(record, "license", "data_license");

  const highlights =
    toStringArray(record["highlights"]).length > 0
      ? toStringArray(record["highlights"])
      : toStringArray(record["key_points"]).length > 0
      ? toStringArray(record["key_points"])
      : toStringArray(record["bullet_points"]);

  const insights = pickInsights(record["insights"]);

  const tags = [
    ...toStringArray(record["tags"]),
    ...toStringArray(record["keywords"]),
  ];

  return {
    resolution,
    capturedAt,
    sensor,
    satellite,
    mission,
    revisit,
    incidentType,
    impactSummary,
    highlights,
    insights,
    downloadUrl,
    contactEmail,
    license,
    tags,
  };
}
