import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

const RANK_COLORS: Record<string, string> = {
  F: '#94a3b8',
  E: '#22c55e',
  D: '#3b82f6',
  C: '#a855f7',
  B: '#f59e0b',
  A: '#ef4444',
  S: '#f97316',
};

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ username: string }> }
) {
  const { username } = await props.params;

  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUuid = uuidRegex.test(username);

    const user = await prisma.user.findFirst({
      where: isUuid
        ? { id: username, role: 'adventurer', isActive: true }
        : { username, role: 'adventurer', isActive: true },
      select: {
        name: true,
        username: true,
        rank: true,
        xp: true,
        adventurerProfile: {
          select: {
            primarySkills: true,
            totalQuestsCompleted: true,
          },
        },
      },
    });

    if (!user) {
      return new ImageResponse(
        (
          <div style={{ display: 'flex', width: '100%', height: '100%', background: '#0f172a', color: '#fff', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
            Adventurer not found
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    const rankColor = RANK_COLORS[user.rank] || '#94a3b8';
    const skills = user.adventurerProfile?.primarySkills?.slice(0, 4) || [];
    const quests = user.adventurerProfile?.totalQuestsCompleted || 0;

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '60px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {/* Top: Guild branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
            <div style={{ display: 'flex', fontSize: '24px', color: '#f97316', fontWeight: 700, letterSpacing: '-0.5px' }}>
              ADVENTURERS GUILD
            </div>
            <div style={{ display: 'flex', fontSize: '18px', color: '#64748b' }}>
              Guild Card
            </div>
          </div>

          {/* Middle: Name + Rank */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '80px',
                height: '80px',
                borderRadius: '16px',
                background: rankColor,
                fontSize: '40px',
                fontWeight: 800,
                color: '#fff',
              }}
            >
              {user.rank}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', fontSize: '48px', fontWeight: 700, color: '#f8fafc', lineHeight: 1.1 }}>
                {user.name || user.username || 'Adventurer'}
              </div>
              {user.username && (
                <div style={{ display: 'flex', fontSize: '24px', color: '#94a3b8', marginTop: '4px' }}>
                  @{user.username}
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '40px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', fontSize: '36px', fontWeight: 700, color: '#f97316' }}>
                {user.xp.toLocaleString()}
              </div>
              <div style={{ display: 'flex', fontSize: '16px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Total XP
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', fontSize: '36px', fontWeight: 700, color: '#22c55e' }}>
                {quests}
              </div>
              <div style={{ display: 'flex', fontSize: '16px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Quests Done
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', fontSize: '36px', fontWeight: 700, color: rankColor }}>
                {user.rank}-Rank
              </div>
              <div style={{ display: 'flex', fontSize: '16px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Rank
              </div>
            </div>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {skills.map((skill) => (
                <div
                  key={skill}
                  style={{
                    display: 'flex',
                    padding: '8px 20px',
                    borderRadius: '999px',
                    background: 'rgba(249, 115, 22, 0.15)',
                    border: '1px solid rgba(249, 115, 22, 0.3)',
                    color: '#f97316',
                    fontSize: '18px',
                    fontWeight: 500,
                  }}
                >
                  {skill}
                </div>
              ))}
            </div>
          )}

          {/* Bottom: URL */}
          <div style={{ display: 'flex', marginTop: 'auto', fontSize: '18px', color: '#475569' }}>
            adventurersguild.space/adventurer/{user.username || 'profile'}
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
          Adventurers Guild
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
