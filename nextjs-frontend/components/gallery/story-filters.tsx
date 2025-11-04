"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type ResolutionFilterOption =
  | "any"
  | "lte-0.5"
  | "lte-1"
  | "lte-3"
  | "gt-3";

interface StoryFiltersProps {
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string | null) => void;
  onSensorChange: (sensor: string | null) => void;
  onResolutionChange: (resolution: ResolutionFilterOption) => void;
  onClearAdvancedFilters: () => void;
  searchValue: string;
  categoryValue: string;
  availableSensors: string[];
  sensorValue: string | null;
  resolutionValue: ResolutionFilterOption;
  hasActiveAdvancedFilters: boolean;
}

export function StoryFilters({
  onSearchChange,
  onCategoryChange,
  onSensorChange,
  onResolutionChange,
  onClearAdvancedFilters,
  searchValue,
  categoryValue,
  availableSensors,
  sensorValue,
  resolutionValue,
  hasActiveAdvancedFilters,
}: StoryFiltersProps) {
  const [searchInput, setSearchInput] = useState(searchValue);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

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

  const advancedBadge = useMemo(() => {
    if (!hasActiveAdvancedFilters) {
      return null;
    }

    return <span className="ml-2 inline-block h-2 w-2 rounded-full bg-primary" />;
  }, [hasActiveAdvancedFilters]);

  useEffect(() => {
    if (hasActiveAdvancedFilters) {
      setIsAdvancedOpen(true);
    }
  }, [hasActiveAdvancedFilters]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Bar */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="Search stories, locations, or descriptions..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button
          type="button"
          variant={isAdvancedOpen ? "default" : "outline"}
          size="sm"
          onClick={() => setIsAdvancedOpen((value) => !value)}
          className="w-full sm:w-auto"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Advanced filters
          {advancedBadge}
        </Button>
      </div>

      {/* Category Filters */}
      <Tabs value={categoryValue} onValueChange={handleCategoryChange}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="optical">Optical</TabsTrigger>
          <TabsTrigger value="radar">Radar</TabsTrigger>
        </TabsList>
      </Tabs>

      {isAdvancedOpen && (
        <div className="space-y-4 rounded-lg border border-border/60 bg-muted/30 p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Sensor
              </p>
              <Select
                value={sensorValue ?? "all"}
                onValueChange={(value) =>
                  onSensorChange(value === "all" ? null : value)
                }
                disabled={availableSensors.length === 0}
              >
                <SelectTrigger aria-label="Sensor filter">
                  <SelectValue placeholder="All sensors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sensors</SelectItem>
                  {availableSensors.map((sensor) => (
                    <SelectItem key={sensor} value={sensor}>
                      {sensor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Resolution
              </p>
              <Select
                value={resolutionValue}
                onValueChange={(value) =>
                  onResolutionChange(value as ResolutionFilterOption)
                }
              >
                <SelectTrigger aria-label="Resolution filter">
                  <SelectValue placeholder="Any resolution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any resolution</SelectItem>
                  <SelectItem value="lte-0.5">≤ 0.5 m</SelectItem>
                  <SelectItem value="lte-1">≤ 1 m</SelectItem>
                  <SelectItem value="lte-3">≤ 3 m</SelectItem>
                  <SelectItem value="gt-3">&gt; 3 m</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Advanced filters apply to the stories shown on the current page.
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onClearAdvancedFilters();
              }}
            >
              Clear advanced filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
