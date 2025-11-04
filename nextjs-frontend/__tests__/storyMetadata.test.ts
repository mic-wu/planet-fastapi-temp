import {
  normalizeStoryMetadata,
  type NormalizedStoryMetadata,
} from "@/components/gallery/story-metadata";

describe("normalizeStoryMetadata", () => {
  it("extracts known fields and arrays", () => {
    const metadata = {
      resolution: "30 cm",
      captured_at: "2024-05-10T15:00:00Z",
      sensor: "Pléiades Neo 4",
      satellite: "Pléiades Neo",
      mission: "Wildfire assessment",
      revisit_hours: 6,
      incident_type: "Wildfire",
      impact_summary: "Significant burn scar across forest perimeter.",
      highlights: ["Thermal hotspots detected", "Rapid-response tasking"],
      insights: [
        {
          title: "Hotspot density",
          description: "Peak thermal return observed along northern ridge.",
        },
      ],
      download_url: "https://example.com/download",
      contact_email: "briefings@example.com",
      data_license: "© Planet Story Explorer",
      tags: ["wildfire", "response"],
    } satisfies Record<string, unknown>;

    const result = normalizeStoryMetadata(metadata);

    expect(result).toMatchObject<Partial<NormalizedStoryMetadata>>({
      resolution: "30 cm",
      capturedAt: "2024-05-10T15:00:00Z",
      sensor: "Pléiades Neo 4",
      satellite: "Pléiades Neo",
      mission: "Wildfire assessment",
      revisit: "6 hrs",
      incidentType: "Wildfire",
      impactSummary: "Significant burn scar across forest perimeter.",
      downloadUrl: "https://example.com/download",
      contactEmail: "briefings@example.com",
      license: "© Planet Story Explorer",
      tags: ["wildfire", "response"],
    });

    expect(result.highlights).toEqual([
      "Thermal hotspots detected",
      "Rapid-response tasking",
    ]);
    expect(result.insights).toEqual([
      {
        title: "Hotspot density",
        description: "Peak thermal return observed along northern ridge.",
      },
    ]);
  });

  it("falls back gracefully when metadata is missing", () => {
    const result = normalizeStoryMetadata(undefined);

    expect(result).toEqual({
      highlights: [],
      insights: [],
      tags: [],
    });
  });
});
