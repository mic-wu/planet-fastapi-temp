"use client";

import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

interface StoryFiltersProps {
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string | null) => void;
  searchValue: string;
  categoryValue: string;
}

export function StoryFilters({
  onSearchChange,
  onCategoryChange,
  searchValue,
  categoryValue,
}: StoryFiltersProps) {
  const [searchInput, setSearchInput] = useState(searchValue);

  useEffect(() => {
    setSearchInput(searchValue);
  }, [searchValue]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, onSearchChange]);

  const handleCategoryChange = (value: string) => {
    const category = value === "all" ? null : value;
    onCategoryChange(category);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search stories, locations, or descriptions..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Filters */}
      <Tabs value={categoryValue} onValueChange={handleCategoryChange}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="optical">Optical</TabsTrigger>
          <TabsTrigger value="radar">Radar</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
