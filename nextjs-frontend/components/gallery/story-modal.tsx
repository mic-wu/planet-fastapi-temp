"use client";

import type { MouseEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

import { StoryRead } from "@/app/openapi-client/types.gen";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatMetadataKey,
  formatMetadataValue,
} from "@/components/gallery/story-metadata";

interface StoryModalProps {
  story: StoryRead | null;
  open: boolean;
  onClose: () => void;
}

export function StoryModal({ story, open, onClose }: StoryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setImageError(false);
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);


  useEffect(() => {
    setImageError(false);
  }, [story]);

  const imageSource = useMemo(() => {
    if (!story || imageError) {
      return null;
    }

    return story.image_url ?? story.thumbnail_url ?? null;
  }, [story, imageError]);

  if (!mounted || !open || !story) {
    return null;
  }

  const metadataEntries = Object.entries(story.story_metadata ?? {});

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="story-modal-title"
      onClick={handleOverlayClick}
    >
      <div className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-background shadow-2xl">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 z-10 h-10 w-10 rounded-full bg-background/80"
          onClick={onClose}
          aria-label="Close story details"
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="relative h-72 w-full bg-muted sm:h-96">
          {imageSource ? (
            <Image
              src={imageSource}
              alt={story.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
              onError={() => setImageError(true)}
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              Image unavailable
            </div>
          )}
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2
                id="story-modal-title"
                className="text-2xl font-semibold leading-tight sm:text-3xl"
              >
                {story.title}
              </h2>
              {story.location && (
                <p className="text-muted-foreground">{story.location}</p>
              )}
            </div>
            <Badge className="w-fit uppercase">{story.category}</Badge>
          </div>

          <p className="text-base leading-relaxed text-muted-foreground">
            {story.description || "No description available for this story."}
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              onClick={() => {
                onClose();
              }}
            >
              <Link href={`/gallery/${story.id}`}>Open detail page</Link>
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>

          {metadataEntries.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Story Metadata
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {metadataEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-md border border-border/60 bg-muted/30 p-3 text-sm"
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
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
