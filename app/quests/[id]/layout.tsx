import type { Metadata } from 'next';

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;

  return {
    openGraph: {
      images: [
        {
          url: `/api/og/quests/${id}`,
          width: 1200,
          height: 630,
          alt: 'Quest preview',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      images: [`/api/og/quests/${id}`],
    },
  };
}

export default function QuestDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
