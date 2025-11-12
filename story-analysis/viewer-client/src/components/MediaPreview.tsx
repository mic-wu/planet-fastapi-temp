import { Box, Slider, IconButton } from "@mui/material";
import { PlayArrow, Pause } from "@mui/icons-material";
import type { Story } from "../lib/types";
import { useQuery } from "@tanstack/react-query";
import { fetchFrameData } from "../lib/query";
import { useMemo, useState, useRef, useEffect } from "react";

interface MediaPreviewProps {
  story: Story;
}

export function MediaPreview({ story }: MediaPreviewProps) {
  return (
    <Box sx={{ mb: 3, width: "100%", maxWidth: "960px" }}>
      {story.format === "raw" ? (
        <CompareView story={story} />
      ) : (
        <VideoView story={story} />
      )}
    </Box>
  );
}

function VideoView({ story }: { story: Story }) {
  const [sliderValue, setSliderValue] = useState(0);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playIntervalRef = useRef<number | null>(null);

  const { data: rawData, isLoading, isError } = useQuery({
    queryKey: ["framedata", story.id],
    queryFn: () => fetchFrameData(story.id),
  });

  // Sort frames by date for chronological playback, but preserve original indices
  const sortedFrames = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];

    return rawData
      .map((frame, originalIndex) => ({ frame, originalIndex }))
      .sort((a, b) => {
        const aTime = a.frame.date?.getTime() ?? 0;
        const bTime = b.frame.date?.getTime() ?? 0;
        return aTime - bTime;
      });
  }, [rawData]);

  const data = useMemo(() => sortedFrames.map(f => f.frame), [sortedFrames]);

  const marks = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Calculate time-based positions for marks
    const firstDate = data[0]?.date?.getTime();
    const lastDate = data[data.length - 1]?.date?.getTime();

    if (!firstDate || !lastDate) {
      // Fallback to index-based if dates aren't available
      return data.map((_, index) => ({
        value: index,
      }));
    }

    // Find min and max dates to handle reverse ordering
    const minDate = Math.min(firstDate, lastDate);
    const maxDate = Math.max(firstDate, lastDate);
    const timeRange = maxDate - minDate;

    return data.map((frame) => {
      const frameTime = frame.date?.getTime();
      if (!frameTime) return { value: 0 };

      // Calculate position based on actual date spacing (0-100 scale)
      const position = ((frameTime - minDate) / timeRange) * 100;

      return {
        value: position,
      };
    });
  }, [data]);

  const valueText = useMemo(() => {
    if (!data || data.length === 0) return "";

    const frame = data[currentFrameIndex];

    return frame?.date ? frame.date.toLocaleDateString() : `Frame ${currentFrameIndex}`;
  }, [data, currentFrameIndex]);

  // Update video time when slider changes
  useEffect(() => {
    if (!videoRef.current || !sortedFrames || sortedFrames.length === 0) return;

    const video = videoRef.current;
    const totalFrames = sortedFrames.length;

    // Get the original index for the current sorted frame
    const originalIndex = sortedFrames[currentFrameIndex]?.originalIndex ?? 0;

    // Calculate the video time using the ORIGINAL index
    // Frames are evenly spaced throughout the video duration based on original order
    const frameTime = (originalIndex / (totalFrames - 1)) * video.duration;

    if (!isNaN(frameTime)) {
      video.currentTime = frameTime;
    }
  }, [currentFrameIndex, sortedFrames]);

  const handleSliderChange = (_: Event, value: number | number[]) => {
    if (!data || data.length === 0) return;

    const sliderVal = value as number;

    // Find the closest mark to snap to
    const closestMark = marks.reduce((prev, curr) => {
      return Math.abs(curr.value - sliderVal) < Math.abs(prev.value - sliderVal)
        ? curr
        : prev;
    });

    // Find the frame index for this mark
    const frameIndex = marks.findIndex(mark => mark.value === closestMark.value);

    setSliderValue(closestMark.value);
    setCurrentFrameIndex(frameIndex);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle playback
  useEffect(() => {
    if (!isPlaying || !data || data.length === 0) {
      if (playIntervalRef.current !== null) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
      return;
    }

    // Use the framerate from the story, fallback to 10 fps if not available
    const fps = story.rate ?? 10;
    const frameDuration = 1000 / fps; // milliseconds per frame

    playIntervalRef.current = window.setInterval(() => {
      setCurrentFrameIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        const loopedIndex = nextIndex >= data.length ? 0 : nextIndex;
        // Update slider value to match
        setSliderValue(marks[loopedIndex]?.value ?? 0);
        return loopedIndex;
      });
    }, frameDuration);

    return () => {
      if (playIntervalRef.current !== null) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    };
  }, [isPlaying, data, marks, story.rate]);

  if (isLoading || isError) {
    return <>oops</>;
  }

  return (
    <>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          paddingBottom: "56.25%", // 540/960 = 0.5625 = 56.25%
          height: 0,
        }}
      >
        <video
          ref={videoRef}
          src={`https://storage.googleapis.com/planet-t2/${story.id}/movie.mp4`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1, pr: "2px" }}>
        <IconButton onClick={handlePlayPause} size="small">
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
        <Slider
          marks={marks}
          min={0}
          max={100}
          value={sliderValue}
          onChange={handleSliderChange}
          valueLabelDisplay="auto"
          valueLabelFormat={() => valueText}
          sx={{ flex: 1 }}
        />
      </Box>
    </>
  );
}

function CompareView({ story }: { story: Story }) {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        paddingBottom: "56.25%", // 540/960 = 0.5625 = 56.25%
        height: 0,
      }}
    >
      <iframe
        src={`https://www.planet.com/compare/?id=${story.id}`}
        title="Story comparison"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          border: "none",
        }}
      />
    </Box>
  );
}
