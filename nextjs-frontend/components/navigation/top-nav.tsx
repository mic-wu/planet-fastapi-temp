'use client';

import Link from 'next/link';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TopNav() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-[hsl(230,19%,13%)] text-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left Section: Logo, Brand, Navigation */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary text-sm font-semibold text-white">
            p
          </div>
          
          {/* Brand Name */}
          <span className="text-base font-medium font-sans">Insights Platform</span>
          
          {/* Separator */}
          <div className="h-6 w-px bg-white/20" />
          
          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white transition-colors hover:text-primary"
            >
              Stories
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-4">
          {/* Browse Link */}
          <Link
            href="/gallery"
            className="text-sm font-medium text-white transition-colors hover:text-primary"
          >
            Browse
          </Link>

          {/* CREATE Button */}
          <Button
            variant="default"
            size="sm"
            className="bg-primary text-white hover:bg-primary-dark"
          >
            CREATE
          </Button>

          {/* Help Icon */}
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-white/10"
            aria-label="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          {/* LOG IN Link */}
          <Link
            href="/login"
            className="text-sm font-semibold uppercase text-primary transition-colors hover:text-primary-light"
          >
            LOG IN
          </Link>
        </div>
      </div>
    </nav>
  );
}

