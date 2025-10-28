"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
  const [fadeIn, setFadeIn] = useState(true);
  const fadeRafRef = useRef<number | null>(null);

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
      setFadeIn(true);
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

  useEffect(() => {
    if (!mounted || !activeStoryId) {
      return;
    }

    setFadeIn(false);
    if (fadeRafRef.current !== null) {
      cancelAnimationFrame(fadeRafRef.current);
    }

    fadeRafRef.current = requestAnimationFrame(() => {
      setFadeIn(true);
    });
  }, [activeStoryId, mounted]);

  useEffect(() => {
    return () => {
      if (fadeRafRef.current !== null) {
        cancelAnimationFrame(fadeRafRef.current);
      }
    };
  }, []);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="story-preview-title"
      onClick={handleOverlayClick}
    >
      <div className="relative flex h-full max-h-[660px] w-full max-w-5xl items-center justify-center">
        <button
          type="button"
          className="absolute -right-2 -top-2 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-planet-dark-blue shadow-lg transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-planet-teal"
          onClick={onClose}
          aria-label="Close preview"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="group relative flex h-full w-full min-h-0 flex-col rounded-3xl border border-gray-200 bg-white shadow-2xl transition-transform duration-150 ease-out lg:h-[65vh]">
          <button
            type="button"
            className="absolute left-0 top-1/2 z-30 hidden h-12 w-12 -translate-x-[120%] -translate-y-1/2 items-center justify-center rounded-full border border-gray-300 bg-white text-planet-dark-blue shadow-lg transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-planet-teal lg:flex"
            onClick={() => cycleStory(-1)}
            aria-label="View previous story"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            className="absolute right-0 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 translate-x-[120%] items-center justify-center rounded-full border border-gray-300 bg-white text-planet-dark-blue shadow-lg transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-planet-teal lg:flex"
            onClick={() => cycleStory(1)}
            aria-label="View next story"
          >
            <ArrowRight className="h-5 w-5" />
          </button>

          <div
            className={`flex flex-1 min-h-0 flex-col gap-4 p-4 transition-all duration-300 ease-in-out lg:flex-row lg:gap-6 lg:p-8 ${fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
          >
            <div className="flex flex-1 justify-center lg:flex-[0_0_65%]">
              <div className={`relative h-[260px] w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-inner lg:h-full transition-all duration-300 ease-in-out ${fadeIn ? "scale-100" : "scale-[0.98]"}`}>
                {imageSource ? (
                  <Image
                    src={imageSource}
                    alt={activeStory.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    onError={() => setImageError(true)}
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-planet-dark-blue/70 font-sans">
                    Image unavailable
                  </div>
                )}
              </div>
            </div>

            <aside className="flex w-full max-h-full flex-col gap-6 overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-5 backdrop-blur-md lg:flex-[0_0_32%] lg:min-h-0">
              <div className="flex-1 space-y-3 overflow-y-auto pr-1 lg:pr-2">
                <div className="flex items-center gap-3">
                  <Badge className="uppercase bg-planet-teal text-white">{activeStory.category}</Badge>
                  {normalizedMetadata.resolution && (
                    <span className="rounded-full bg-planet-teal/10 px-3 py-1 text-xs font-medium text-planet-teal">
                      {normalizedMetadata.resolution}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h2
                    id="story-preview-title"
                    className="text-xl font-heading font-semibold leading-tight text-planet-dark-blue"
                  >
                    {activeStory.title}
                  </h2>
                  {activeStory.location && (
                    <p className="text-sm text-planet-dark-blue/70 font-sans">
                      {activeStory.location}
                    </p>
                  )}
                </div>

                <p className="line-clamp-4 text-sm leading-relaxed text-planet-dark-blue/70 font-sans">
                  {activeStory.description ||
                    normalizedMetadata.impactSummary ||
                    "High-resolution capture available for mission analysis."}
                </p>

                <div className="space-y-2">
                  {(normalizedMetadata.capturedAt ||
                    normalizedMetadata.sensor ||
                    normalizedMetadata.satellite) && (
                      <dl className="grid grid-cols-2 gap-2 text-xs text-planet-dark-blue/70 font-sans">
                        {normalizedMetadata.capturedAt && (
                          <div>
                            <dt className="uppercase tracking-wide">Captured</dt>
                            <dd className="font-medium text-planet-dark-blue">
                              {formatDate(normalizedMetadata.capturedAt)}
                            </dd>
                          </div>
                        )}
                        {normalizedMetadata.sensor && (
                          <div>
                            <dt className="uppercase tracking-wide">Sensor</dt>
                            <dd className="font-medium text-planet-dark-blue">
                              {normalizedMetadata.sensor}
                            </dd>
                          </div>
                        )}
                        {!normalizedMetadata.sensor &&
                          normalizedMetadata.satellite && (
                            <div>
                              <dt className="uppercase tracking-wide">
                                Satellite
                              </dt>
                              <dd className="font-medium text-planet-dark-blue">
                                {normalizedMetadata.satellite}
                              </dd>
                            </div>
                          )}
                        {normalizedMetadata.revisit && (
                          <div>
                            <dt className="uppercase tracking-wide">Revisit</dt>
                            <dd className="font-medium text-planet-dark-blue">
                              {normalizedMetadata.revisit}
                            </dd>
                          </div>
                        )}
                      </dl>
                    )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button asChild className="w-full gap-2 bg-planet-teal hover:bg-planet-dark-teal text-white">
                  <Link href={`/gallery/${activeStory.id}`}>
                    <ExternalLink className="h-4 w-4" /> View full story
                  </Link>
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="gap-2 border-planet-teal text-planet-teal hover:bg-planet-teal hover:text-white"
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

                  <Button variant="outline" className="gap-2 border-planet-teal text-planet-teal hover:bg-planet-teal hover:text-white" asChild>
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
                  <details className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-planet-dark-blue/70 font-sans">
                    <summary className="cursor-pointer font-semibold text-planet-dark-blue">
                      Metadata summary
                    </summary>
                    <div className="mt-3 grid gap-2">
                      {metadataEntries.slice(0, 4).map(([key, value]) => (
                        <div key={key}>
                          <div className="font-semibold text-planet-dark-blue">
                            {formatMetadataKey(key)}
                          </div>
                          <div>{formatMetadataValue(value)}</div>
                        </div>
                      ))}
                      {metadataEntries.length > 4 && (
                        <Link
                          className="text-planet-teal underline"
                          href={`/gallery/${activeStory.id}`}
                          onClick={onClose}
                        >
                          View full metadata on detail page
                        </Link>
                      )}
                    </div>
                  </details>
                )}

                <p className="text-[11px] text-planet-dark-blue/70 font-sans">
                  Tip: use ← / → to browse previews, Esc to close
                </p>
              </div>
            </aside>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 text-xs text-planet-dark-blue/70 font-sans lg:hidden">
            <span>
              {activeIndex + 1} of {stories.length} stories
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-full bg-gray-100 px-3 py-1 font-medium text-planet-dark-blue transition hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-planet-teal"
                onClick={() => cycleStory(-1)}
              >
                Prev
              </button>
              <button
                type="button"
                className="rounded-full bg-gray-100 px-3 py-1 font-medium text-planet-dark-blue transition hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-planet-teal"
                onClick={() => cycleStory(1)}
              >
                Next
              </button>
            </div>
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
