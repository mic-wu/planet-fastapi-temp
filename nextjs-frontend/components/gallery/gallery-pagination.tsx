"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";

interface GalleryPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function GalleryPagination({
  currentPage,
  totalPages,
  onPageChange,
}: GalleryPaginationProps) {
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  return (
    <div className="flex items-center space-x-2">
      {/* First Page */}
      <Button
        variant="outline"
        size="sm"
        disabled={!hasPreviousPage}
        onClick={() => onPageChange(1)}
        className="border-planet-teal text-planet-teal hover:bg-planet-teal hover:text-white disabled:border-gray-300 disabled:text-gray-400"
      >
        <DoubleArrowLeftIcon className="h-4 w-4" />
      </Button>

      {/* Previous Page */}
      <Button
        variant="outline"
        size="sm"
        disabled={!hasPreviousPage}
        onClick={() => onPageChange(currentPage - 1)}
        className="border-planet-teal text-planet-teal hover:bg-planet-teal hover:text-white disabled:border-gray-300 disabled:text-gray-400"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>

      {/* Page Info */}
      {totalPages > 0 && (
        <span className="text-sm font-medium text-planet-dark-blue font-sans">
          Page {currentPage} of {totalPages}
        </span>
      )}

      {/* Next Page */}
      <Button
        variant="outline"
        size="sm"
        disabled={!hasNextPage}
        onClick={() => onPageChange(currentPage + 1)}
        className="border-planet-teal text-planet-teal hover:bg-planet-teal hover:text-white disabled:border-gray-300 disabled:text-gray-400"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </Button>

      {/* Last Page */}
      <Button
        variant="outline"
        size="sm"
        disabled={!hasNextPage}
        onClick={() => onPageChange(totalPages)}
        className="border-planet-teal text-planet-teal hover:bg-planet-teal hover:text-white disabled:border-gray-300 disabled:text-gray-400"
      >
        <DoubleArrowRightIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
