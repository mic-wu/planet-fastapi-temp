import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { getStories } from "@/components/actions/stories-action";
import { StoryRead } from "@/app/openapi-client/types.gen";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { StoryCard } from "@/components/gallery/story-card";
import {
  ResolutionFilterOption,
  StoryFilters,
} from "@/components/gallery/story-filters";
import { StoryPreviewModal } from "@/components/gallery/story-preview-modal";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock("@/components/actions/stories-action", () => ({
  getStories: jest.fn(),
}));

const mockedGetStories = getStories as jest.MockedFunction<typeof getStories>;

const mockStory: StoryRead = {
  id: "test-id",
  story_id: "test-story-1",
  title: "Test Story",
  location: "Test Location",
  description: "Test description",
  image_url: "https://example.com/image.jpg",
  thumbnail_url: "https://example.com/thumb.jpg",
  category: "optical",
  story_metadata: { resolution: "30cm", sensor: "PSX-Optic" },
  user_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockInitialData = {
  data: [mockStory],
  total: 1,
  page: 1,
  limit: 12,
  has_more: false,
};

describe("Gallery Components", () => {
  beforeEach(() => {
    pushMock.mockClear();
    mockedGetStories.mockReset();
    mockedGetStories.mockResolvedValue(mockInitialData);
  });

  describe("StoryCard", () => {
    it("renders story information correctly", () => {
      const mockOnClick = jest.fn();

      render(<StoryCard story={mockStory} onClick={mockOnClick} />);

      expect(screen.getByText("Test Story")).toBeInTheDocument();
      expect(screen.getByText("Test Location")).toBeInTheDocument();
      expect(screen.getByText("optical")).toBeInTheDocument();
      expect(screen.getByText("30cm")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /view details/i })).toBeInTheDocument();
    });

    it("calls onClick when the card is clicked", () => {
      const mockOnClick = jest.fn();

      render(<StoryCard story={mockStory} onClick={mockOnClick} />);

      fireEvent.click(screen.getByText("Test Story"));
      expect(mockOnClick).toHaveBeenCalledWith(mockStory);
    });

    it("shows placeholder when image fails to load", async () => {
      render(<StoryCard story={mockStory} />);

      const image = screen.getByAltText("Test Story");
      fireEvent.error(image);

      await waitFor(() => {
        expect(screen.getByText("Image unavailable")).toBeInTheDocument();
      });
    });

    it("navigates to the detail page when view details is clicked", async () => {
      const mockOnClick = jest.fn();
      const user = userEvent.setup();

      render(<StoryCard story={mockStory} onClick={mockOnClick} />);

      const viewDetailsButton = screen.getByRole("button", {
        name: /view details/i,
      });
      await user.click(viewDetailsButton);

      expect(pushMock).toHaveBeenCalledWith(`/gallery/${mockStory.id}`);
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe("StoryFilters", () => {
    const renderStoryFilters = (overrides?: Partial<Parameters<typeof StoryFilters>[0]>) => {
      const defaultProps = {
        onSearchChange: jest.fn(),
        onCategoryChange: jest.fn(),
        onSensorChange: jest.fn(),
        onResolutionChange: jest.fn(),
        onClearAdvancedFilters: jest.fn(),
        searchValue: "",
        categoryValue: "all",
        availableSensors: ["PSX-Optic", "PSX-Radar"],
        sensorValue: null,
        resolutionValue: "any" as ResolutionFilterOption,
        hasActiveAdvancedFilters: false,
      };

      return render(<StoryFilters {...defaultProps} {...overrides} />);
    };

    it("renders search input and category tabs", () => {
      renderStoryFilters();

      expect(
        screen.getByPlaceholderText(/search stories/i),
      ).toBeInTheDocument();
      expect(screen.getByText("All")).toBeInTheDocument();
      expect(screen.getByText("Optical")).toBeInTheDocument();
      expect(screen.getByText("Radar")).toBeInTheDocument();
    });

    it("calls onSearchChange when search input changes", async () => {
      const onSearchChange = jest.fn();
      renderStoryFilters({ onSearchChange });

      const searchInput = screen.getByPlaceholderText(/search stories/i);
      fireEvent.change(searchInput, { target: { value: "test search" } });

      await waitFor(
        () => {
          expect(onSearchChange).toHaveBeenCalledWith("test search");
        },
        { timeout: 500 },
      );
    });

    it("calls onCategoryChange when category tab is clicked", async () => {
      const onCategoryChange = jest.fn();
      const user = userEvent.setup();
      renderStoryFilters({ onCategoryChange });

      await user.click(screen.getByText("Optical"));

      await waitFor(() => {
        expect(onCategoryChange).toHaveBeenCalledWith("optical");
      });
    });

    it("allows selecting advanced filters", async () => {
      const onSensorChange = jest.fn();
      const onResolutionChange = jest.fn();
      const onClear = jest.fn();
      const user = userEvent.setup();

      renderStoryFilters({
        onSensorChange,
        onResolutionChange,
        onClearAdvancedFilters: onClear,
      });

      await user.click(
        screen.getByRole("button", { name: /advanced filters/i }),
      );

      await user.click(
        screen.getByRole("combobox", { name: /sensor filter/i }),
      );
      const sensorOption = await screen.findByRole("option", {
        name: "PSX-Radar",
      });
      await user.click(sensorOption);

      await waitFor(() => {
        expect(onSensorChange).toHaveBeenCalledWith("PSX-Radar");
      });

      await user.click(
        screen.getByRole("combobox", { name: /resolution filter/i }),
      );
      const resolutionOption = await screen.findByRole("option", {
        name: "≤ 1 m",
      });
      await user.click(resolutionOption);

      await waitFor(() => {
        expect(onResolutionChange).toHaveBeenCalledWith(
          "lte-1" as ResolutionFilterOption,
        );
      });

      await user.click(screen.getByRole("button", { name: /clear advanced filters/i }));
      expect(onClear).toHaveBeenCalled();
    });
  });

  describe("StoryPreviewModal", () => {
    it("renders story details when open", async () => {
      const handleClose = jest.fn();

      render(
        <StoryPreviewModal
          stories={[mockStory]}
          open
          activeStoryId={mockStory.id}
          onClose={handleClose}
          onChangeStory={jest.fn()}
        />,
      );

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
      expect(screen.getByText("Test Story")).toBeInTheDocument();
      expect(screen.getByText("Test Location")).toBeInTheDocument();
      expect(screen.getAllByText("30cm").length).toBeGreaterThan(0);
    });

    it("calls onClose when escape key pressed", async () => {
      const handleClose = jest.fn();

      render(
        <StoryPreviewModal
          stories={[mockStory]}
          open
          activeStoryId={mockStory.id}
          onClose={handleClose}
          onChangeStory={jest.fn()}
        />,
      );

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
      fireEvent.keyDown(window, { key: "Escape" });

      await waitFor(() => {
        expect(handleClose).toHaveBeenCalled();
      });
    });

    it("links to the detail page", async () => {
      render(
        <StoryPreviewModal
          stories={[mockStory]}
          open
          activeStoryId={mockStory.id}
          onClose={jest.fn()}
          onChangeStory={jest.fn()}
        />,
      );

      const detailLink = await screen.findByRole("link", {
        name: /view full story/i,
      });
      expect(detailLink).toHaveAttribute("href", `/gallery/${mockStory.id}`);
    });

    it("navigates to next story using buttons", async () => {
      const secondStory: StoryRead = {
        ...mockStory,
        id: "second",
        title: "Second Story",
        story_metadata: { resolution: "1m", sensor: "PSX" },
      };
      const handleChange = jest.fn();

      const user = userEvent.setup();

      render(
        <StoryPreviewModal
          stories={[mockStory, secondStory]}
          open
          activeStoryId={mockStory.id}
          onClose={jest.fn()}
          onChangeStory={handleChange}
        />,
      );

      await user.click(screen.getByRole("button", { name: /^Next$/i }));

      expect(handleChange).toHaveBeenCalledWith("second");
    });
  });

  describe("GalleryGrid", () => {
    it("renders stories grid with initial data", () => {
      render(<GalleryGrid initialData={mockInitialData} />);

      expect(screen.getByText("Test Story")).toBeInTheDocument();
      expect(screen.getByText("Test Location")).toBeInTheDocument();
    });

    it("shows empty state when no stories", () => {
      const emptyData = { ...mockInitialData, data: [], total: 0 };

      render(<GalleryGrid initialData={emptyData} />);

      expect(screen.getByText("No stories found")).toBeInTheDocument();
    });

    it("fetches stories when search term changes", async () => {
      render(<GalleryGrid initialData={mockInitialData} />);

      const searchInput = screen.getByPlaceholderText(
        /search stories, locations, or descriptions/i,
      );
      fireEvent.change(searchInput, { target: { value: "aurora" } });

      await waitFor(() => {
        expect(mockedGetStories).toHaveBeenLastCalledWith({
          page: 1,
          limit: 12,
          search: "aurora",
          category: undefined,
        });
      });
    });

    it("fetches stories when category changes", async () => {
      render(<GalleryGrid initialData={mockInitialData} />);

      const user = userEvent.setup();
      const radarTab = screen.getByText("Radar");
      await user.click(radarTab);

      await waitFor(() => {
        expect(mockedGetStories).toHaveBeenLastCalledWith({
          page: 1,
          limit: 12,
          search: undefined,
          category: "radar",
        });
      });
    });

    it("opens and closes preview modal when story card is clicked", async () => {
      const user = userEvent.setup();
      render(<GalleryGrid initialData={mockInitialData} />);

      await user.click(screen.getByText("Test Story"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /close preview/i }));

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("shows an error message when fetching stories fails", async () => {
      mockedGetStories.mockRejectedValueOnce(new Error("Network error"));
      render(<GalleryGrid initialData={mockInitialData} />);

      const searchInput = screen.getByPlaceholderText(
        /search stories, locations, or descriptions/i,
      );
      fireEvent.change(searchInput, { target: { value: "aurora" } });

      await waitFor(() => {
        expect(
          screen.getByText(
            "Something went wrong while fetching stories. Please try again.",
          ),
        ).toBeInTheDocument();
      });
    });

    it("filters stories using advanced sensor filter", async () => {
      const user = userEvent.setup();
      const radarStory: StoryRead = {
        ...mockStory,
        id: "radar-id",
        story_id: "radar-story",
        title: "Radar Story",
        category: "radar",
        story_metadata: { resolution: "1m", sensor: "PSX-Radar" },
      };

      const dataWithMultipleStories = {
        data: [mockStory, radarStory],
        total: 2,
        page: 1,
        limit: 12,
        has_more: false,
      };

      render(<GalleryGrid initialData={dataWithMultipleStories} />);

      await user.click(
        screen.getByRole("button", { name: /advanced filters/i }),
      );

      await user.click(
        screen.getByRole("combobox", { name: /sensor filter/i }),
      );
      const sensorOption = await screen.findByRole("option", {
        name: "PSX-Radar",
      });
      await user.click(sensorOption);

      await waitFor(() => {
        expect(screen.getByText("Radar Story")).toBeInTheDocument();
        expect(screen.queryByText("Test Story")).not.toBeInTheDocument();
      });
    });
  });
});
