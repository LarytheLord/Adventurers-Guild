import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Quests — Guild",
  description:
    "Browse real coding quests from real companies. Earn XP, rank up, and get paid for code that ships to production.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function QuestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}