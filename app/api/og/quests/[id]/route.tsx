import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

const RANK_COLORS: Record<string, string> = {
  F: '#64748b',
  E: '#22c55e',
  D: '#3b82f6',
  C: '#a855f7',
  B: '#f59e0b',
  A: '#ef4444',
  S: '#f97316',
};

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  try {
    const quest = await prisma.quest.findUnique({
      where: { id },
      include: {
        company: {
          include: { companyProfile: true },
        },
      },
    });

    if (!quest) {
      return new ImageResponse(
        (
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #0b1220 0%, #0f172a 55%, #111827 100%)',
              color: '#fff',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            Quest not found
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    const title =
      quest.title.length > 60
        ? quest.title.slice(0, 57) + '...'
        : quest.title;
    const companyName =
      quest.company?.companyProfile?.companyName ??
      quest.company?.name ??
      'Unknown';
    const rankColor = RANK_COLORS[quest.difficulty] || '#64748b';
    const xpText = `${quest.xpReward.toLocaleString()} XP`;
    const payoutText =
      quest.monetaryReward != null
        ? `$${Number(quest.monetaryReward).toLocaleString()}`
        : null;

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            background:
              'radial-gradient(circle at 80% 10%, rgba(99,102,241,0.18), transparent 50%), radial-gradient(circle at 20% 90%, rgba(249,115,22,0.10), transparent 40%), linear-gradient(135deg, #0b1220 0%, #0f172a 55%, #111827 100%)',
            padding: 64,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {/* Top branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(99,102,241,0.2)',
                border: '1px solid rgba(99,102,241,0.3)',
                fontSize: 18,
                fontWeight: 700,
                color: '#818cf8',
              }}
            >
              AG
            </div>
            <span
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: '#94a3b8',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              Adventurers Guild
            </span>
          </div>

          {/* Main content */}
          <div
            style={{
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            {/* Rank badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `${rankColor}22`,
                  border: `2px solid ${rankColor}44`,
                  fontSize: 22,
                  fontWeight: 800,
                  color: rankColor,
                }}
              >
                {quest.difficulty}
              </div>
              <span
                style={{
                  fontSize: 22,
                  color: '#64748b',
                  fontWeight: 500,
                }}
              >
                {companyName}
              </span>
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: '#f1f5f9',
                lineHeight: 1.2,
                margin: 0,
                maxWidth: 800,
              }}
            >
              {title}
            </h1>
          </div>

          {/* Bottom stats */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              marginTop: 32,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                borderRadius: 12,
                background: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.2)',
              }}
            >
              <span style={{ fontSize: 20, color: '#818cf8', fontWeight: 700 }}>
                ⚡
              </span>
              <span style={{ fontSize: 20, color: '#c7d2fe', fontWeight: 600 }}>
                {xpText}
              </span>
            </div>

            {payoutText && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  borderRadius: 12,
                  background: 'rgba(16,185,129,0.12)',
                  border: '1px solid rgba(16,185,129,0.2)',
                }}
              >
                <span
                  style={{ fontSize: 20, color: '#34d399', fontWeight: 700 }}
                >
                  $
                </span>
                <span
                  style={{ fontSize: 20, color: '#d1fae5', fontWeight: 600 }}
                >
                  {payoutText}
                </span>
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'cache-control': 'public, max-age=3600, s-maxage=3600',
        },
      }
    );
  } catch {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #0b1220 0%, #0f172a 55%, #111827 100%)',
            color: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Adventurers Guild
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
