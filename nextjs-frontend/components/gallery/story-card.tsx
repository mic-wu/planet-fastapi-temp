"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { StoryRead } from "@/app/openapi-client/types.gen";

interface StoryCardProps {
  story: StoryRead;
  onClick?: (story: StoryRead) => void;
}

export function StoryCard({ story, onClick }: StoryCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(story);
    }
  };

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
      onClick={handleClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={
            story.thumbnail_url || story.image_url || "/images/placeholder.jpg"
          }
          alt={story.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-semibold text-lg mb-1 line-clamp-2">
            {story.title}
          </h3>
          {story.location && (
            <p className="text-sm text-white/90 mb-2">{story.location}</p>
          )}
          <div className="flex items-center justify-between">
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              {story.category}
            </Badge>
            {story.story_metadata?.resolution && (
              <span className="text-xs text-white/80">
                {story.story_metadata.resolution}
              </span>
            )}
          </div>
        </div>
      </div>
      {story.description && (
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {story.description}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
