"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  ExternalLink,
  Share2,
  X,
} from "lucide-react";

import type { StoryRead } from "@/app/openapi-client/types.gen";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  NormalizedStoryMetadata,
  StoryInsight,
  formatMetadataKey,
  formatMetadataValue,
  normalizeStoryMetadata,
} from "@/components/gallery/story-metadata";

interface StoryPreviewModalProps {
  stories: StoryRead[];
  open: boolean;
  activeStoryId: string | null;
  onClose: () => void;
  onChangeStory: (storyId: string) => void;
}

export const StoryPreviewModal = memo(function StoryPreviewModal({
  stories,
  open,
  activeStoryId,
  onClose,
  onChangeStory,
}: StoryPreviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [imageError, setImageError] = useState(false);

  const activeIndex = useMemo(
    () => stories.findIndex((story) => story.id === activeStoryId),
    [stories, activeStoryId],
  );

  const activeStory = activeIndex >= 0 ? stories[activeIndex] : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleStory = useCallback(
    (direction: -1 | 1) => {
      if (stories.length === 0 || activeIndex < 0) {
        return;
      }
      const nextIndex =
        (activeIndex + direction + stories.length) % stories.length;
      onChangeStory(stories[nextIndex].id);
    },
    [stories, activeIndex, onChangeStory],
  );

  useEffect(() => {
    if (!open) {
      setImageError(false);
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        cycleStory(-1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        cycleStory(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, cycleStory, onClose]);

  useEffect(() => {
    setImageError(false);
  }, [activeStoryId]);

  const handleOverlayClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const imageSource = useMemo(() => {
    if (!activeStory || imageError) {
      return null;
    }

    return activeStory.image_url ?? activeStory.thumbnail_url ?? null;
  }, [activeStory, imageError]);

  if (!mounted || !open || !activeStory) {
    return null;
  }

  const normalizedMetadata = normalizeStoryMetadata(
    activeStory.story_metadata,
  );
  const metadataEntries = Object.entries(activeStory.story_metadata ?? {});

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="story-preview-title"
      onClick={handleOverlayClick}
    >
      <div className="relative flex h-full max-h-[720px] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-background shadow-2xl transition-transform duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <button
          type="button"
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onClick={onClose}
          aria-label="Close preview"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-1 flex-col gap-4 p-4 lg:flex-row lg:p-6">
          <button
            type="button"
            className="group absolute left-6 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/70 text-foreground shadow-lg transition hover:bg-background/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:flex"
            onClick={() => cycleStory(-1)}
            aria-label="View previous story"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            className="group absolute right-6 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/70 text-foreground shadow-lg transition hover:bg-background/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:flex"
            onClick={() => cycleStory(1)}
            aria-label="View next story"
          >
            <ArrowRight className="h-5 w-5" />
          </button>

          <div className="relative flex-1 overflow-hidden rounded-xl border border-border/60 bg-muted/40">
            {imageSource ? (
              <Image
                src={imageSource}
                alt={activeStory.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 70vw"
                onError={() => setImageError(true)}
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                Image unavailable
              </div>
            )}
          </div>

          <aside className="flex w-full flex-col justify-between gap-6 rounded-xl border border-border/60 bg-background/80 p-4 lg:w-[28%]">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge className="uppercase">{activeStory.category}</Badge>
                {normalizedMetadata.resolution && (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {normalizedMetadata.resolution}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <h2
                  id="story-preview-title"
                  className="text-xl font-semibold leading-tight"
                >
                  {activeStory.title}
                </h2>
                {activeStory.location && (
                  <p className="text-sm text-muted-foreground">
                    {activeStory.location}
                  </p>
                )}
              </div>

              <p className="line-clamp-4 text-sm text-muted-foreground leading-relaxed">
                {activeStory.description ||
                  normalizedMetadata.impactSummary ||
                  "High-resolution capture available for mission analysis."}
              </p>

              <div className="space-y-2">
                {(normalizedMetadata.capturedAt ||
                  normalizedMetadata.sensor ||
                  normalizedMetadata.satellite) && (
                  <dl className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    {normalizedMetadata.capturedAt && (
                      <div>
                        <dt className="uppercase tracking-wide">Captured</dt>
                        <dd className="font-medium text-foreground">
                          {formatDate(normalizedMetadata.capturedAt)}
                        </dd>
                      </div>
                    )}
                    {normalizedMetadata.sensor && (
                      <div>
                        <dt className="uppercase tracking-wide">Sensor</dt>
                        <dd className="font-medium text-foreground">
                          {normalizedMetadata.sensor}
                        </dd>
                      </div>
                    )}
                    {!normalizedMetadata.sensor &&
                      normalizedMetadata.satellite && (
                        <div>
                          <dt className="uppercase tracking-wide">Satellite</dt>
                          <dd className="font-medium text-foreground">
                            {normalizedMetadata.satellite}
                          </dd>
                        </div>
                      )}
                    {normalizedMetadata.revisit && (
                      <div>
                        <dt className="uppercase tracking-wide">Revisit</dt>
                        <dd className="font-medium text-foreground">
                          {normalizedMetadata.revisit}
                        </dd>
                      </div>
                    )}
                  </dl>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button asChild className="w-full gap-2">
                <Link href={`/gallery/${activeStory.id}`}>
                  <ExternalLink className="h-4 w-4" /> View full story
                </Link>
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  asChild={Boolean(normalizedMetadata.downloadUrl)}
                  disabled={!normalizedMetadata.downloadUrl}
                >
                  {normalizedMetadata.downloadUrl ? (
                    <a
                      href={normalizedMetadata.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Download className="h-4 w-4" /> Download
                    </a>
                  ) : (
                    <span className="flex items-center justify-center gap-2 text-xs">
                      <Download className="h-4 w-4" /> Coming soon
                    </span>
                  )}
                </Button>

                <Button variant="outline" className="gap-2" asChild>
                  <a
                    href={buildShareLink(activeStory.id, activeStory.title)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Share2 className="h-4 w-4" /> Share
                  </a>
                </Button>
              </div>

              {metadataEntries.length > 0 && (
                <details className="rounded-lg border border-border/60 bg-muted/10 p-4 text-xs text-muted-foreground">
                  <summary className="cursor-pointer font-semibold text-foreground">
                    Metadata summary
                  </summary>
                  <div className="mt-3 grid gap-2">
                    {metadataEntries.slice(0, 4).map(([key, value]) => (
                      <div key={key}>
                        <div className="font-semibold text-foreground">
                          {formatMetadataKey(key)}
                        </div>
                        <div>{formatMetadataValue(value)}</div>
                      </div>
                    ))}
                    {metadataEntries.length > 4 && (
                      <Link
                        className="text-primary underline"
                        href={`/gallery/${activeStory.id}`}
                        onClick={onClose}
                      >
                        View full metadata on detail page
                      </Link>
                    )}
                  </div>
                </details>
              )}

              <p className="text-[11px] text-muted-foreground">
                Tip: use ← / → to browse previews, Esc to close
              </p>
            </div>
          </aside>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 bg-background px-4 py-3 text-xs text-muted-foreground">
          <span>
            {activeIndex + 1} of {stories.length} stories
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-full bg-muted px-3 py-1 font-medium text-foreground transition hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => cycleStory(-1)}
            >
              Prev
            </button>
            <button
              type="button"
              className="rounded-full bg-muted px-3 py-1 font-medium text-foreground transition hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => cycleStory(1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
});

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
