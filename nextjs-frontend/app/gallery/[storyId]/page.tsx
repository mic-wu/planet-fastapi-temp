import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getStoryById } from "@/components/actions/stories-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatMetadataKey,
  formatMetadataValue,
} from "@/components/gallery/story-metadata";

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

  const metadataEntries = Object.entries(story.story_metadata ?? {});
  const imageSource = story.image_url ?? story.thumbnail_url ?? null;

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

          <div className="flex items-center gap-2">
            <Badge className="uppercase">{story.category}</Badge>
            <Button variant="outline" asChild>
              <Link href="/">Back to gallery</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-[1.7fr,1fr]">
          <div className="space-y-6">
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

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Story overview</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {story.description ||
                  "This story does not include a description yet."}
              </p>
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
                  <dd className="text-right">
                    {new Date(story.created_at).toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Last updated</dt>
                  <dd className="text-right">
                    {new Date(story.updated_at).toLocaleString()}
                  </dd>
                </div>
                {typeof story.story_metadata?.captured_at === "string" && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Captured at</dt>
                    <dd className="text-right">
                      {new Date(
                        story.story_metadata.captured_at,
                      ).toLocaleString()}
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            {metadataEntries.length > 0 && (
              <section className="space-y-3 rounded-lg border border-border/60 bg-muted/10 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Story metadata
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
      </div>
    </div>
  );
}
