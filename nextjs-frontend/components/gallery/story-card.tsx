"use client";

import { useState } from "react";
import Image from "next/image";
import { StoryRead } from "@/app/openapi-client/types.gen";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface StoryCardProps {
  story: StoryRead;
  onClick?: (story: StoryRead) => void;
}

export function StoryCard({ story, onClick }: StoryCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    onClick?.(story);
  };

  const resolution =
    typeof story.story_metadata?.resolution === "string"
      ? story.story_metadata.resolution
      : undefined;

  const imageSource = !imageError
    ? story.thumbnail_url ?? story.image_url ?? null
    : null;

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
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
          <div className="flex h-full w-full items-center justify-center bg-muted text-sm font-medium text-muted-foreground">
            Image unavailable
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3
            className="mb-1 line-clamp-2 text-lg font-semibold"
            title={story.title}
          >
            {story.title}
          </h3>
          {story.location && (
            <p className="mb-2 text-sm text-white/90" title={story.location}>
              {story.location}
            </p>
          )}
          <div className="flex items-center justify-between">
            <Badge
              variant="secondary"
              className="border-white/30 bg-white/20 text-white hover:bg-white/30"
            >
              {story.category}
            </Badge>
            {resolution && (
              <span className="text-xs text-white/80">{resolution}</span>
            )}
          </div>
        </div>
      </div>
      {story.description && (
        <CardContent className="p-4">
          <p
            className="line-clamp-2 text-sm text-muted-foreground"
            title={story.description}
          >
            {story.description}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
