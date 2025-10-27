import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { StoryCard } from "@/components/gallery/story-card";
import { StoryFilters } from "@/components/gallery/story-filters";
import { StoryModal } from "@/components/gallery/story-modal";
import { StoryRead } from "@/app/openapi-client/types.gen";
import { getStories } from "@/components/actions/stories-action";

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
  story_metadata: { resolution: "30cm" },
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
    });

    it("calls onClick when clicked", () => {
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
  });

  describe("StoryFilters", () => {
    it("renders search input and category tabs", () => {
      const mockOnSearchChange = jest.fn();
      const mockOnCategoryChange = jest.fn();

      render(
        <StoryFilters
          onSearchChange={mockOnSearchChange}
          onCategoryChange={mockOnCategoryChange}
          searchValue=""
          categoryValue="all"
        />,
      );

      expect(
        screen.getByPlaceholderText(/search stories/i),
      ).toBeInTheDocument();
      expect(screen.getByText("All")).toBeInTheDocument();
      expect(screen.getByText("Optical")).toBeInTheDocument();
      expect(screen.getByText("Radar")).toBeInTheDocument();
    });

    it("calls onSearchChange when search input changes", async () => {
      const mockOnSearchChange = jest.fn();
      const mockOnCategoryChange = jest.fn();

      render(
        <StoryFilters
          onSearchChange={mockOnSearchChange}
          onCategoryChange={mockOnCategoryChange}
          searchValue=""
          categoryValue="all"
        />,
      );

      const searchInput = screen.getByPlaceholderText(/search stories/i);
      fireEvent.change(searchInput, { target: { value: "test search" } });

      await waitFor(
        () => {
          expect(mockOnSearchChange).toHaveBeenCalledWith("test search");
        },
        { timeout: 500 },
      );
    });

    it("calls onCategoryChange when category tab is clicked", async () => {
      const mockOnSearchChange = jest.fn();
      const mockOnCategoryChange = jest.fn();

      const user = userEvent.setup();

      render(
        <StoryFilters
          onSearchChange={mockOnSearchChange}
          onCategoryChange={mockOnCategoryChange}
          searchValue=""
          categoryValue="all"
        />,
      );

      await user.click(screen.getByText("Optical"));

      await waitFor(() => {
        expect(mockOnCategoryChange).toHaveBeenCalledWith("optical");
      });
    });
  });

  describe("StoryModal", () => {
    it("renders story details when open", async () => {
      const handleClose = jest.fn();

      render(<StoryModal story={mockStory} open onClose={handleClose} />);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
      expect(screen.getByText("Test Story")).toBeInTheDocument();
      expect(screen.getByText("Test Location")).toBeInTheDocument();
      expect(screen.getByText("30cm")).toBeInTheDocument();
    });

    it("calls onClose when escape key pressed", async () => {
      const handleClose = jest.fn();

      render(<StoryModal story={mockStory} open onClose={handleClose} />);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
      fireEvent.keyDown(window, { key: "Escape" });

      await waitFor(() => {
        expect(handleClose).toHaveBeenCalled();
      });
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

    it("opens and closes modal when story card is clicked", async () => {
      const user = userEvent.setup();
      render(<GalleryGrid initialData={mockInitialData} />);

      await user.click(screen.getByText("Test Story"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole("button", { name: /close story details/i }),
      );

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
  });
});
