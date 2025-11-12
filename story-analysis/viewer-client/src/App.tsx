import { useState, useEffect, useRef } from "react";
import { useInfiniteQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Container, Grid, Typography, Button, Box, CircularProgress, TextField, Link } from "@mui/material";
import { Search } from "@mui/icons-material";
import { Virtuoso } from "react-virtuoso";
import { StoryPreview } from "./components/StoryPreview";
import { fetchStories } from "./lib/query";
import type { Story } from "./lib/types";
import "./App.css";
import { MediaPreview } from "./components/MediaPreview";

const queryClient = new QueryClient();

function StoriesGrid() {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [filterText, setFilterText] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Measure container width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    // Use ResizeObserver for more reliable tracking
    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", updateWidth);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["stories", activeFilter],
    queryFn: ({ pageParam = 0 }) => fetchStories(48, pageParam, activeFilter),
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.limit;
      return nextOffset < lastPage.total ? nextOffset : undefined;
    },
    initialPageParam: 0,
  });

  const handleSearch = () => {
    setActiveFilter(filterText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
  };

  const allStories = data?.pages.flatMap((page) => page.stories) ?? [];

  // Get stats from backend (already filtered by backend)
  const totalResults = data?.pages[0]?.total ?? 0;
  const uniqueAuthors = data?.pages[0]?.unique_authors ?? 0;

  // Calculate stories per row based on container width
  // Account for padding (24px * 2 = 48px) and spacing
  const minCardWidth = 150;
  const spacing = 16; // Grid spacing={2} = 16px
  const padding = 48; // 24px on each side
  const availableWidth = containerWidth - padding;

  let storiesPerRow = 3;
  if (availableWidth > 0) {
    // Calculate how many cards fit: (width + spacing) * n - spacing <= availableWidth
    storiesPerRow = Math.max(1, Math.floor((availableWidth + spacing) / (minCardWidth + spacing)));
  }

  // Group stories into rows
  const storyRows: Story[][] = [];
  for (let i = 0; i < allStories.length; i += storiesPerRow) {
    storyRows.push(allStories.slice(i, i + storiesPerRow));
  }

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };


  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Container>
        <Typography color="error" variant="h6" sx={{ mt: 4 }}>
          Error loading stories: {error.message}
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Left side: Grid view */}
      <Box ref={containerRef} sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* Filter bar - Fixed at top */}
        <Box sx={{ p: 3, pb: 0, flexShrink: 0 }}>
          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Filter: location:-122.4,37.8,50 type:mp4 author:&quot;name&quot; desc_length:>100 text..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button
              color="primary"
              onClick={handleSearch}
              sx={{ bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark" }}}
            >
              <Search sx={{ fontSize: "16px" }}/>
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
            {totalResults} results | {uniqueAuthors} unique authors
          </Typography>
        </Box>

        {/* Scrollable grid area */}
        <Box
          sx={{
            flex: 1,
            px: 0,
            minWidth: 0,
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "10px",
              background: "linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,255,255,0))",
              pointerEvents: "none",
              zIndex: 1,
            },
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "10px",
              background: "linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))",
              pointerEvents: "none",
              zIndex: 1,
            },
          }}
        >
          {allStories.length > 0 ? (
            <Virtuoso
              style={{ height: "100%" }}
              totalCount={storyRows.length}
              endReached={loadMore}
              itemContent={(index) => {
                const row = storyRows[index];
                return (
                  <Box sx={{ pt: 2, px: 3 }}>
                    <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
                      {row.map((story) => (
                        <Grid key={story.id} size={{ xs: 12, sm: 6, md: 4 }} sx={{ minWidth: "150px" }}>
                          <StoryPreview
                            story={story}
                            onClick={() => handleStoryClick(story)}
                            isSelected={selectedStory?.id === story.id}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                );
              }}
              components={{
                Footer: () =>
                  isFetchingNextPage ? (
                    <Box display="flex" justifyContent="center" sx={{ py: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : null,
              }}
            />
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ minHeight: "200px" }}>
              <Typography variant="body1" color="text.secondary">
                No stories found
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Right side: Detail panel */}
      <Box
        sx={{
          width: "50%",
          borderLeft: "1px solid #ccc",
          p: 3,
          overflowY: "auto",
          bgcolor: "background.paper",
        }}
      >
        {selectedStory ? (
          <Box>
            {/* Embed */}
            <MediaPreview story={selectedStory} />

            {/* Title */}
            <Typography variant="h5" gutterBottom>
              {selectedStory.title || "Untitled"}
            </Typography>

            {/* ID with link */}
            <Typography variant="body2" gutterBottom>
              <strong>ID:</strong>{" "}
              <Link
                href={`https://www.planet.com/stories/${selectedStory.id}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textDecoration: "none" }}
              >
                {selectedStory.id}
              </Link>
            </Typography>

            {/* Author */}
            <Typography variant="body2" gutterBottom>
              <strong>Author:</strong> {selectedStory.author || "N/A"}
            </Typography>

            {/* Location link */}
            {selectedStory.center_lat && selectedStory.center_lon && selectedStory.zoom && (
              <Typography variant="body2" gutterBottom>
                <strong>Location:</strong>{" "}
                <Link
                  href={`https://nominatim.openstreetmap.org/reverse?lat=${selectedStory.center_lat}&lon=${selectedStory.center_lon}&zoom=${Math.floor(selectedStory.zoom)}&format=json`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ textDecoration: "none" }}
                >
                  {selectedStory.center_lat.toFixed(4)}, {selectedStory.center_lon.toFixed(4)}
                </Link>
              </Typography>
            )}

            {/* Rest of info */}
            <Typography variant="body2" gutterBottom>
              <strong>Format:</strong> {selectedStory.format || "N/A"}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Frame Count:</strong> {selectedStory.my_framecount ?? "N/A"}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Created:</strong> {selectedStory.created?.toLocaleDateString() || "N/A"}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Updated:</strong> {selectedStory.updated?.toLocaleDateString() || "N/A"}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Center:</strong> {selectedStory.center_lat?.toFixed(4)}, {selectedStory.center_lon?.toFixed(4)}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Dimensions:</strong> {selectedStory.width} x {selectedStory.height}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Zoom:</strong> {selectedStory.zoom}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Rate:</strong> {selectedStory.rate}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Description ({selectedStory.description?.length ?? 0} chars):</strong>
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {selectedStory.description || "No description available"}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary">
            Select a story to view details
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StoriesGrid />
    </QueryClientProvider>
  );
}

export default App;
