import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

const DIFFICULTY_COLORS: Record<string, string> = {
  F: '#94a3b8',
  E: '#22c55e',
  D: '#3b82f6',
  C: '#a855f7',
  B: '#f59e0b',
  A: '#ef4444',
  S: '#f97316',
};

const RADIAL_ACCENT = 'radial-gradient(circle at top right, rgba(249,115,22,0.22), transparent 42%)';
const LINEAR_BASE = 'linear-gradient(135deg, #0b1220 0%, #0f172a 55%, #111827 100%)';
const BACKGROUND = `${RADIAL_ACCENT}, ${LINEAR_BASE}`;

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  try {
    const quest = await prisma.quest.findUnique({
      where: { id },
      select: {
        title: true,
        difficulty: true,
        xpReward: true,
        monetaryReward: true,
        company: {
          select: {
            companyProfile: {
              select: { companyName: true },
            },
          },
        },
      },
    });

    if (!quest) {
      return new ImageResponse(
        (
          <div style={{ display: 'flex', width: '100%', height: '100%', background: '#0f172a', color: '#fff', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
            Quest not found
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    const rankColor = DIFFICULTY_COLORS[quest.difficulty] || '#94a3b8';
    const companyName = quest.company?.companyProfile?.companyName || 'Guild';
    const title = quest.title.length > 60 ? `${quest.title.slice(0, 57)}...` : quest.title;
    const reward = quest.monetaryReward ? `$${Number(quest.monetaryReward).toLocaleString()}` : null;

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            background: BACKGROUND,
            padding: '42px 54px',
            fontFamily: 'system-ui, sans-serif',
            color: '#f8fafc',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  display: 'flex',
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(145deg, #fb923c, #f97316)',
                  color: '#0f172a',
                  fontSize: '26px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                }}
              >
                AG
              </div>
              <div style={{ display: 'flex', fontSize: '27px', color: '#fb923c', fontWeight: 800, letterSpacing: '-0.3px' }}>
                Guild
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                borderRadius: '999px',
                border: `1px solid ${rankColor}8c`,
                background: `${rankColor}1f`,
                padding: '10px 18px',
                color: rankColor,
                fontSize: '19px',
                fontWeight: 700,
              }}
            >
              Rank {quest.difficulty}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flex: 1,
              marginTop: '18px',
              marginBottom: '18px',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: '52px',
                fontWeight: 800,
                lineHeight: 1.15,
                color: '#f8fafc',
                marginBottom: '12px',
              }}
            >
              {title}
            </div>
            <div style={{ display: 'flex', fontSize: '24px', color: '#94a3b8' }}>
              Posted by {companyName}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '18px' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px',
                border: '1px solid rgba(148,163,184,0.25)',
                background: 'rgba(15,23,42,0.6)',
                padding: '14px 24px',
                minWidth: '180px',
              }}
            >
              <div style={{ display: 'flex', fontSize: '15px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.2px' }}>XP Reward</div>
              <div style={{ display: 'flex', fontSize: '36px', color: '#fb923c', fontWeight: 800 }}>{quest.xpReward.toLocaleString()}</div>
            </div>
            {reward ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px',
                  border: '1px solid rgba(148,163,184,0.25)',
                  background: 'rgba(15,23,42,0.6)',
                  padding: '14px 24px',
                  minWidth: '180px',
                }}
              >
                <div style={{ display: 'flex', fontSize: '15px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.2px' }}>Reward</div>
                <div style={{ display: 'flex', fontSize: '36px', color: '#22c55e', fontWeight: 800 }}>{reward}</div>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px',
                  border: '1px solid rgba(148,163,184,0.25)',
                  background: 'rgba(15,23,42,0.6)',
                  padding: '14px 24px',
                  minWidth: '180px',
                }}
              >
                <div style={{ display: 'flex', fontSize: '15px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.2px' }}>Reward</div>
                <div style={{ display: 'flex', fontSize: '36px', color: '#94a3b8', fontWeight: 800 }}>XP Only</div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', marginTop: 'auto', fontSize: '18px', color: '#64748b' }}>
            adventurersguild.space/quests/{id}
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new ImageResponse(
      (
        <div style={{ display: 'flex', width: '100%', height: '100%', background: '#0f172a', color: '#fff', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
          Guild
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
