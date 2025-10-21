import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Gallery - Planet Story Explorer",
  description:
    "Discover beautiful satellite imagery of Earth captured by our constellation",
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
