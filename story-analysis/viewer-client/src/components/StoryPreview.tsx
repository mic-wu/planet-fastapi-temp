import type { Story } from "../lib/types";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActionArea,
  Box,
} from "@mui/material";
import { Compare, Notes, Videocam } from "@mui/icons-material";

interface StoryPreviewProps {
  story: Story;
  onClick: () => void;
  isSelected: boolean;
}

export function StoryPreview({ story, onClick, isSelected }: StoryPreviewProps) {
  const thumbnailUrl = `https://storage.googleapis.com/planet-t2/${story.id}/frame-000.png`;
  const author = story.author ?? "no author";
  const descriptionLength = story.description?.length ?? 0;
  const frameCount = story.my_framecount ?? 0;

  // Format date as "Oct 25"
  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
    });
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        outline: isSelected ? "3px solid #1976d255" : "none",
        outlineOffset: "3px",
      }}
    >
      <CardActionArea onClick={onClick}>
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            height="60"
            image={thumbnailUrl}
            alt={story.title || "Story thumbnail"}
            sx={{ objectFit: "cover", filter: "grayscale(100%) invert(100%)", opacity: 0.5 }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 4,
              left: 4,
              bgcolor: "rgba(255, 255, 255, 0.9)",
              borderRadius: 1,
              p: 0.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {story.format === "raw" ? (
              <Compare sx={{ fontSize: 16 }} />
            ) : story.format === "mp4" ? (
              <Videocam sx={{ fontSize: 16 }} />
            ) : null}
            {story.format === "mp4" && (
              <Typography
                variant="body2"
                align="left"
                component="h2"
                sx={{
                  mx: "4px",
                  fontSize: "0.75rem",
                }}
              >
                {frameCount}
              </Typography>
            )}
          </Box>
          {descriptionLength > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                bgcolor: descriptionLength > 100 ? "rgba(144, 238, 144, 0.9)" : "rgba(255, 255, 255, 0.9)",
                borderRadius: 1,
                p: 0.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Notes sx={{ fontSize: 16 }} />
              <Typography
                variant="body2"
                align="left"
                component="h2"
                sx={{
                  mx: "4px",
                  fontSize: "0.75rem",
                }}
              >
                {descriptionLength}
              </Typography>
            </Box>
          )}
        </Box>
        <CardContent sx={{ py: 1, px: 1.5, "&:last-child": { pb: 1 } }}>
          <Typography
            variant="body2"
            align="left"
            component="h2"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              mb: 0.5,
              fontSize: "0.75rem",
            }}
          >
            <b>{story.title || "Untitled"}</b>
            <br />
            {formatDate(story.created)} | {author}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
