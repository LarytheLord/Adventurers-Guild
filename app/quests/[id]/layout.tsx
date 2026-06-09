import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Quest Details — Guild",
  description:
    "View quest details, requirements, and rewards on the Guild quest board.",
  openGraph: {
    title: "Quest Details — Guild",
    description:
      "Browse and accept real coding quests from real companies. Earn XP and get paid.",
    images: ["/og/default.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function QuestDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}