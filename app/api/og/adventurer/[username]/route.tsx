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

const RADIAL_ACCENT = 'radial-gradient(circle at top right, rgba(249,115,22,0.22), transparent 42%)';
const LINEAR_BASE = 'linear-gradient(135deg, #0b1220 0%, #0f172a 55%, #111827 100%)';
const BACKGROUND = `${RADIAL_ACCENT}, ${LINEAR_BASE}`;

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
    const skills = user.adventurerProfile?.primarySkills?.slice(0, 3) || [];
    const quests = user.adventurerProfile?.totalQuestsCompleted || 0;

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
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', fontSize: '27px', color: '#fb923c', fontWeight: 800, letterSpacing: '-0.3px' }}>
                  Adventurers Guild
                </div>
                <div style={{ display: 'flex', fontSize: '17px', color: '#94a3b8' }}>
                  Guild Card
                </div>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                borderRadius: '999px',
                border: '1px solid rgba(251,146,60,0.55)',
                background: 'rgba(249,115,22,0.12)',
                padding: '10px 18px',
                color: '#fdba74',
                fontSize: '19px',
                fontWeight: 700,
              }}
            >
              Rank {user.rank}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              marginTop: '18px',
              marginBottom: '18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  minWidth: '92px',
                  height: '60px',
                  padding: '0 20px',
                  borderRadius: '999px',
                  background: rankColor,
                  color: '#fff',
                  fontSize: '36px',
                  fontWeight: 900,
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                }}
              >
                {user.rank}
              </div>
              <div style={{ display: 'flex', fontSize: '62px', fontWeight: 800, lineHeight: 1 }}>
                {user.name || user.username || 'Adventurer'}
              </div>
            </div>
            {user.username && (
              <div style={{ display: 'flex', fontSize: '26px', color: '#94a3b8', marginBottom: '26px' }}>
                @{user.username}
              </div>
            )}
            <div
              style={{
                display: 'flex',
                width: '100%',
                gap: '18px',
                justifyContent: 'center',
                marginBottom: '22px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px',
                  border: '1px solid rgba(148,163,184,0.25)',
                  background: 'rgba(15,23,42,0.6)',
                  padding: '14px 24px',
                  minWidth: '230px',
                }}
              >
                <div style={{ display: 'flex', fontSize: '15px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.2px' }}>Total XP</div>
                <div style={{ display: 'flex', fontSize: '38px', color: '#fb923c', fontWeight: 800 }}>{user.xp.toLocaleString()}</div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px',
                  border: '1px solid rgba(148,163,184,0.25)',
                  background: 'rgba(15,23,42,0.6)',
                  padding: '14px 24px',
                  minWidth: '230px',
                }}
              >
                <div style={{ display: 'flex', fontSize: '15px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.2px' }}>Quests Completed</div>
                <div style={{ display: 'flex', fontSize: '38px', color: '#f8fafc', fontWeight: 800 }}>{quests}</div>
              </div>
            </div>

            {skills.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', minHeight: '52px' }}>
                {skills.map((skill) => (
                  <div
                    key={skill}
                    style={{
                      display: 'flex',
                      padding: '10px 18px',
                      borderRadius: '999px',
                      border: '1px solid rgba(251,146,60,0.45)',
                      background: 'rgba(249,115,22,0.14)',
                      color: '#fed7aa',
                      fontSize: '20px',
                      fontWeight: 700,
                    }}
                  >
                    #{skill}
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '52px',
                  fontSize: '20px',
                  color: '#94a3b8',
                }}
              >
                No primary skills listed
              </div>
            )}
          </div>

          <div style={{ display: 'flex', marginTop: 'auto', fontSize: '18px', color: '#64748b' }}>
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
