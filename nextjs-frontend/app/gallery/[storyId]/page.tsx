import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  getStories,
  getStoryById,
} from "@/components/actions/stories-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StoryCard } from "@/components/gallery/story-card";
import {
  NormalizedStoryMetadata,
  StoryInsight,
  formatMetadataKey,
  formatMetadataValue,
  normalizeStoryMetadata,
} from "@/components/gallery/story-metadata";
import { ArrowDownToLine, Mail, Share2 } from "lucide-react";
import type { StoryRead } from "@/app/openapi-client/types.gen";

type StoryPageParams = {
  params: {
    storyId: string;
  };
};

async function fetchStory(storyId: string) {
  try {
    const story = await getStoryById(storyId);
    return story ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: StoryPageParams): Promise<Metadata> {
  const story = await fetchStory(params.storyId);

  if (!story) {
    return {
      title: "Story not found | Planet Story Explorer",
    };
  }

  return {
    title: `${story.title} | Planet Story Explorer`,
    description: story.description ?? undefined,
  };
}

export default async function StoryDetailPage({ params }: StoryPageParams) {
  const story = await fetchStory(params.storyId);

  if (!story) {
    notFound();
  }

  const normalizedMetadata = normalizeStoryMetadata(story.story_metadata);
  const imageSource = story.image_url ?? story.thumbnail_url ?? null;

  const relatedStories = await fetchRelatedStories(story);

  const heroStats = buildHeroStats(story, normalizedMetadata);
  const highlightBullets = buildHighlightBullets(story, normalizedMetadata);
  const insights = buildInsights(story, normalizedMetadata);

  const metadataEntries = Object.entries(story.story_metadata ?? {});

  return (
    <div className="bg-background">
      <div className="border-b bg-muted/40">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="transition-colors hover:text-primary">
                Gallery
              </Link>
              <span>/</span>
              <span className="font-medium text-foreground">
                {story.title}
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {story.title}
            </h1>
            {story.location && (
              <p className="text-sm text-muted-foreground">{story.location}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className="uppercase">{story.category}</Badge>
            <Button
              disabled={!normalizedMetadata.downloadUrl}
              asChild={Boolean(normalizedMetadata.downloadUrl)}
              className="gap-2"
            >
              {normalizedMetadata.downloadUrl ? (
                <a
                  href={normalizedMetadata.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ArrowDownToLine className="h-4 w-4" /> Download imagery
                </a>
              ) : (
                <span className="flex items-center gap-2">
                  <ArrowDownToLine className="h-4 w-4" /> Download coming soon
                </span>
              )}
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <a
                href={`mailto:${normalizedMetadata.contactEmail ?? "hello@planetstoryexplorer.com"}`}
              >
                <Mail className="h-4 w-4" /> Request briefing
              </a>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/">Back to gallery</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-10">
            <div className="overflow-hidden rounded-lg border">
              <div className="relative aspect-[4/3] bg-muted">
                {imageSource ? (
                  <Image
                    src={imageSource}
                    alt={story.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 60vw"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                    Image unavailable
                  </div>
                )}
              </div>
            </div>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-border/60 bg-muted/10 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-base font-medium text-foreground">
                    {stat.value}
                  </p>
                </div>
              ))}
            </section>

            <section className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Story overview</h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {story.description ||
                    normalizedMetadata.impactSummary ||
                    "This story does not include a description yet."}
                </p>
              </div>

              <div className="rounded-lg border border-border/60 bg-background p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Mission highlights
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {highlightBullets.map((highlight, index) => (
                    <li key={`${highlight}-${index}`} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">Imagery insights</h2>
                <span className="text-sm text-muted-foreground">
                  Derived from mission and incident context
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {insights.map((insight) => (
                  <div
                    key={insight.title}
                    className="flex h-full flex-col gap-3 rounded-lg border border-border/60 bg-muted/10 p-5"
                  >
                    <h3 className="text-base font-semibold text-foreground">
                      {insight.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-lg border border-border/60 bg-muted/20 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Capture details
              </h2>
              <dl className="mt-4 space-y-3 text-sm text-foreground">
                {story.location && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Location</dt>
                    <dd className="text-right">{story.location}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Created</dt>
                  <dd className="text-right">{formatDate(story.created_at)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Last updated</dt>
                  <dd className="text-right">{formatDate(story.updated_at)}</dd>
                </div>
                {normalizedMetadata.capturedAt && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Captured</dt>
                    <dd className="text-right">
                      {formatDate(normalizedMetadata.capturedAt)}
                    </dd>
                  </div>
                )}
                {normalizedMetadata.satellite && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Satellite</dt>
                    <dd className="text-right">{normalizedMetadata.satellite}</dd>
                  </div>
                )}
                {normalizedMetadata.sensor && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Sensor</dt>
                    <dd className="text-right">{normalizedMetadata.sensor}</dd>
                  </div>
                )}
                {normalizedMetadata.resolution && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Resolution</dt>
                    <dd className="text-right">{normalizedMetadata.resolution}</dd>
                  </div>
                )}
                {normalizedMetadata.revisit && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Revisit</dt>
                    <dd className="text-right">{normalizedMetadata.revisit}</dd>
                  </div>
                )}
                {normalizedMetadata.incidentType && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Incident</dt>
                    <dd className="text-right">{normalizedMetadata.incidentType}</dd>
                  </div>
                )}
              </dl>
            </section>

            <section className="space-y-4 rounded-lg border border-border/60 bg-muted/10 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Data & access
              </h2>
              <div className="flex flex-col gap-3">
                <Button
                  asChild={Boolean(normalizedMetadata.downloadUrl)}
                  disabled={!normalizedMetadata.downloadUrl}
                  className="w-full gap-2"
                >
                  {normalizedMetadata.downloadUrl ? (
                    <a
                      href={normalizedMetadata.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ArrowDownToLine className="h-4 w-4" /> Download full
                      resolution imagery
                    </a>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <ArrowDownToLine className="h-4 w-4" /> Download coming
                      soon
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="w-full gap-2"
                >
                  <a
                    href={`mailto:${normalizedMetadata.contactEmail ?? "hello@planetstoryexplorer.com"}`}
                  >
                    <Mail className="h-4 w-4" /> Request mission briefing
                  </a>
                </Button>
                <Button variant="ghost" className="w-full gap-2" asChild>
                  <a
                    href={buildShareLink(story.id, story.title)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Share2 className="h-4 w-4" /> Share externally
                  </a>
                </Button>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  {normalizedMetadata.license
                    ? `License: ${normalizedMetadata.license}`
                    : "Usage subject to Planet Story Explorer preview terms."}
                </p>
                {normalizedMetadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {normalizedMetadata.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {normalizedMetadata.mission && (
              <section className="rounded-lg border border-border/60 bg-muted/10 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Mission context
                </h2>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {normalizedMetadata.mission}
                </p>
              </section>
            )}

            {metadataEntries.length > 0 && (
              <section className="space-y-3 rounded-lg border border-border/60 bg-muted/10 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Raw metadata
                </h2>
                <div className="grid gap-3">
                  {metadataEntries.map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-md border border-border/60 bg-background/80 p-3 text-sm"
                    >
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {formatMetadataKey(key)}
                      </div>
                      <div className="whitespace-pre-wrap text-sm text-foreground">
                        {formatMetadataValue(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>

        {relatedStories.length > 0 && (
          <section className="mt-16 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Related imagery</h2>
              <Button variant="ghost" asChild>
                <Link href="/">Browse more stories</Link>
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {relatedStories.map((relatedStory) => (
                <StoryCard key={relatedStory.id} story={relatedStory} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

async function fetchRelatedStories(currentStory: StoryRead): Promise<StoryRead[]> {
  try {
    const related = await getStories({
      category: currentStory.category,
      limit: 6,
      page: 1,
    });

    return related.data
      .filter((story) => story.id !== currentStory.id)
      .slice(0, 4);
  } catch {
    return [];
  }
}

function buildHeroStats(
  story: StoryRead,
  metadata: NormalizedStoryMetadata,
) {
  return [
    {
      label: "Resolution",
      value: metadata.resolution ?? "—",
    },
    {
      label: "Captured",
      value: metadata.capturedAt ? formatDate(metadata.capturedAt) : "—",
    },
    {
      label: "Sensor",
      value: metadata.sensor ?? metadata.satellite ?? "—",
    },
    {
      label: "Revisit",
      value: metadata.revisit ?? "On request",
    },
  ];
}

function buildHighlightBullets(
  story: StoryRead,
  metadata: NormalizedStoryMetadata,
) {
  if (metadata.highlights.length > 0) {
    return metadata.highlights;
  }

  const defaults = [
    story.location ? `Observed near ${story.location}` : null,
    metadata.resolution
      ? `Imagery captured at ${metadata.resolution} resolution`
      : null,
    metadata.sensor
      ? `Sensor: ${metadata.sensor}`
      : metadata.satellite
      ? `Satellite: ${metadata.satellite}`
      : null,
    metadata.revisit ? `Revisit cadence ~ ${metadata.revisit}` : null,
  ].filter((entry): entry is string => Boolean(entry));

  if (story.description && defaults.length < 3) {
    defaults.push(story.description);
  }

  return defaults.slice(0, 4);
}

function buildInsights(
  story: StoryRead,
  metadata: NormalizedStoryMetadata,
): StoryInsight[] {
  if (metadata.insights.length > 0) {
    return metadata.insights;
  }

  const insights: StoryInsight[] = [];

  insights.push({
    title: "Incident overview",
    description:
      metadata.impactSummary ||
      story.description ||
      "High-resolution capture available for mission analysis.",
  });

  insights.push({
    title: "Mission data",
    description: [
      metadata.sensor ? `Sensor: ${metadata.sensor}` : null,
      metadata.resolution ? `Resolution: ${metadata.resolution}` : null,
      metadata.capturedAt
        ? `Captured: ${formatDate(metadata.capturedAt)}`
        : null,
    ]
      .filter(Boolean)
      .join(" · ") ||
      "Sensor and capture details will be published soon.",
  });

  insights.push({
    title: "Recommended next steps",
    description:
      metadata.contactEmail
        ? `Coordinate follow-up requests via ${metadata.contactEmail}.`
        : "Contact the Planet Story Explorer team to request follow-up tasking or analytics.",
  });

  return insights;
}

function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function buildShareLink(storyId: string, title: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://planetstoryexplorer.com";
  const encodedUrl = encodeURIComponent(`${baseUrl}/gallery/${storyId}`);
  const encodedTitle = encodeURIComponent(title);
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}`;
}
