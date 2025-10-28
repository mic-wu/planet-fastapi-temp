"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GalleryPageSizeProps {
  currentSize: number;
  onSizeChange: (size: number) => void;
  sizes?: number[];
}

export function GalleryPageSize({
  currentSize,
  onSizeChange,
  sizes = [12, 24, 48],
}: GalleryPageSizeProps) {
  const handleSizeChange = (newSize: string) => {
    onSizeChange(parseInt(newSize, 10));
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-planet-dark-blue font-sans">Items per page:</span>
      <Select value={currentSize.toString()} onValueChange={handleSizeChange}>
        <SelectTrigger className="w-20 border-planet-teal focus:ring-planet-teal">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sizes.map((option) => (
            <SelectItem key={option} value={option.toString()}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
