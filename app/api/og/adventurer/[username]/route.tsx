import { ImageResponse } from 'next/og';
import { NextResponse } from 'next/server';

import { getPublicAdventurerProfile } from '@/lib/public-adventurer-profile';

export const runtime = 'nodejs';
const imageSize = {
  width: 1200,
  height: 630,
};

const RANK_COLORS: Record<string, { background: string; foreground: string }> = {
  S: { background: '#ef4444', foreground: '#ffffff' },
  A: { background: '#f97316', foreground: '#111827' },
  B: { background: '#fbbf24', foreground: '#111827' },
  C: { background: '#8b5cf6', foreground: '#ffffff' },
  D: { background: '#3b82f6', foreground: '#ffffff' },
  E: { background: '#10b981', foreground: '#ffffff' },
  F: { background: '#64748b', foreground: '#ffffff' },
};

export async function GET(
  _request: Request,
  props: { params: Promise<{ username: string }> }
) {
  const { username } = await props.params;
  const profile = await getPublicAdventurerProfile(username);

  if (!profile) {
    return NextResponse.json({ error: 'Adventurer not found' }, { status: 404 });
  }

  const rankStyle = RANK_COLORS[profile.rank] ?? RANK_COLORS.F;
  const skillPreview = profile.skills.slice(0, 3);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          background:
            'radial-gradient(circle at top left, rgba(249,115,22,0.28), transparent 28%), radial-gradient(circle at bottom right, rgba(59,130,246,0.24), transparent 24%), #020617',
          color: '#f8fafc',
          padding: 56,
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            borderRadius: 32,
            border: '1px solid rgba(148,163,184,0.3)',
            background: 'rgba(15,23,42,0.8)',
            padding: 40,
            justifyContent: 'space-between',
            gap: 32,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              flex: 1,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 88,
                    height: 88,
                    borderRadius: 9999,
                    border: '2px solid rgba(148,163,184,0.5)',
                    background: 'rgba(15,23,42,0.65)',
                    fontSize: 34,
                    fontWeight: 800,
                  }}
                >
                  {profile.name
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase() ?? '')
                    .join('') || 'AG'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div
                    style={{
                      fontSize: 18,
                      textTransform: 'uppercase',
                      letterSpacing: 2.5,
                      color: '#f97316',
                    }}
                  >
                    Adventurers Guild Credential
                  </div>
                  <div style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.05 }}>
                    {profile.name}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 72,
                    height: 72,
                    borderRadius: 20,
                    background: rankStyle.background,
                    color: rankStyle.foreground,
                    fontSize: 34,
                    fontWeight: 900,
                  }}
                >
                  {profile.rank}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>
                    {profile.rank}-Rank Adventurer
                  </div>
                  <div style={{ fontSize: 18, color: '#cbd5e1' }}>
                    {profile.stats.totalQuestsCompleted} quests completed - {profile.xp.toLocaleString()} XP
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 20,
                  color: '#cbd5e1',
                }}
              >
                <span>XP progression</span>
                <span>
                  {Math.round(profile.xpProgress.progressPercent)}%
                  {profile.xpProgress.nextRank
                    ? ` to ${profile.xpProgress.nextRank}-Rank`
                    : ' complete'}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  height: 18,
                  borderRadius: 9999,
                  background: '#1e293b',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    height: '100%',
                    width: `${Math.max(6, Math.min(100, profile.xpProgress.progressPercent))}%`,
                    borderRadius: 9999,
                    background: 'linear-gradient(90deg, #f97316 0%, #fb7185 100%)',
                  }}
                />
              </div>
              {skillPreview.length > 0 ? (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {skillPreview.map((skill) => (
                    <div
                      key={skill}
                      style={{
                        display: 'flex',
                        padding: '10px 14px',
                        borderRadius: 9999,
                        border: '1px solid rgba(148,163,184,0.3)',
                        background: 'rgba(30,41,59,0.85)',
                        fontSize: 18,
                        color: '#e2e8f0',
                      }}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div
            style={{
              width: 300,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              borderRadius: 28,
              background: 'rgba(15,23,42,0.9)',
              border: '1px solid rgba(148,163,184,0.22)',
              padding: 26,
            }}
          >
            <div
              style={{
                fontSize: 18,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: '#94a3b8',
              }}
            >
              Snapshot
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20 }}>
                <span style={{ color: '#94a3b8' }}>Completion rate</span>
                <span>{profile.stats.completionRate.toFixed(1)}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20 }}>
                <span style={{ color: '#94a3b8' }}>Current streak</span>
                <span>{profile.stats.currentStreak} days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20 }}>
                <span style={{ color: '#94a3b8' }}>Longest streak</span>
                <span>{profile.stats.longestStreak} days</span>
              </div>
            </div>
            <div
              style={{
                marginTop: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                paddingTop: 18,
                borderTop: '1px solid rgba(148,163,184,0.18)',
                color: '#cbd5e1',
                fontSize: 18,
              }}
            >
              <span>Public guild card</span>
              <span style={{ color: '#f97316' }}>
                adventurers-guild.dev/adventurer/{profile.username}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    imageSize
  );
}
