"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { StoryRead } from "@/app/openapi-client/types.gen";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatToCategory } from "@/lib/utils/storyFormat";

interface StoryCardProps {
  story: StoryRead;
  onClick?: (story: StoryRead) => void;
}

export function StoryCard({ story, onClick }: StoryCardProps) {
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    onClick?.(story);
  };

  const resolution =
    typeof story.story_metadata?.resolution === "string"
      ? story.story_metadata.resolution
      : undefined;

  // Derive category from format for display
  const format =
    (story.story_metadata?.format as string) ||
    (story as unknown as { format?: string }).format ||
    'raw';
  const displayCategory = formatToCategory(format);

  const imageSource = !imageError
    ? story.thumbnail_url ?? story.image_url ?? null
    : null;

  return (
    <Card
      className="group cursor-pointer overflow-hidden border border-border bg-card text-foreground shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-lg"
      onClick={handleClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {imageSource ? (
          <Image
            src={imageSource}
            alt={story.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImageError(true)}
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-muted text-sm font-medium text-muted-foreground font-sans">
            Image unavailable
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-text-inverse/80 via-text-inverse/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3
            className="mb-1 line-clamp-2 text-lg font-heading font-semibold"
            title={story.title}
          >
            {story.title}
          </h3>
          {story.location && (
            <p className="mb-2 text-sm text-white/80 font-sans" title={story.location}>
              {story.location}
            </p>
          )}
          <div className="flex items-center justify-between">
            <Badge
              variant="secondary"
              className="border-transparent bg-primary-light/20 text-white backdrop-blur-sm transition hover:bg-primary-light/30"
            >
              {displayCategory}
            </Badge>
            {resolution && (
              <span className="text-xs text-white/80 font-sans">{resolution}</span>
            )}
          </div>
        </div>
      </div>
      <CardContent className="p-4 space-y-3">
        {story.description && (
          <p
            className="line-clamp-2 text-sm text-muted-foreground font-sans"
            title={story.description}
          >
            {story.description}
          </p>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            router.push(`/gallery/${story.id}`);
          }}
        >
          View details
        </Button>
      </CardContent>
    </Card>
  );
}
