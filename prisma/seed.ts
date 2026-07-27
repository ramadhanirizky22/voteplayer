import { PrismaClient, EntityStatus, AdminRole } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function ensureDatabaseViewsExist(db: PrismaClient) {
  // Ensure custom PostgreSQL View v_leaderboard_detail exists
  const createViewSql = `
    CREATE OR REPLACE VIEW v_leaderboard_detail AS
    SELECT 
        p.id AS player_id,
        p.nickname,
        p.full_name,
        p.avatar,
        p.role AS player_role,
        p.country AS player_country,
        t.id AS team_id,
        t.name AS team_name,
        t.slug AS team_slug,
        t.logo AS team_logo,
        g.id AS game_id,
        g.name AS game_name,
        g.slug AS game_slug,
        COALESCE(s.total_vote, 0) AS total_vote,
        COALESCE(s.daily_vote, 0) AS daily_vote,
        COALESCE(s.weekly_vote, 0) AS weekly_vote,
        COALESCE(s.monthly_vote, 0) AS monthly_vote,
        COALESCE(s.yearly_vote, 0) AS yearly_vote,
        COALESCE(s.updated_at, p.created_at) AS last_voted_at
    FROM players p
    JOIN teams t ON p.team_id = t.id
    JOIN games g ON p.game_id = g.id
    LEFT JOIN player_vote_summary s ON p.id = s.player_id
    WHERE p.deleted_at IS NULL AND p.status = 'ACTIVE';
  `;
  await db.$executeRawUnsafe(createViewSql);
  console.log('✅ PostgreSQL View v_leaderboard_detail verified.');
}

async function main() {
  console.log('🌱 Starting Enterprise Seeder for Vote Player Game Database...');

  // Ensure DB Views & Triggers exist
  await ensureDatabaseViewsExist(prisma);

  // 1. Seed Default Admin User
  const adminPasswordHash = crypto.createHash('sha256').update('Admin123!Secure').digest('hex');
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@voteplay.com' },
    update: {},
    create: {
      email: 'admin@voteplay.com',
      passwordHash: adminPasswordHash,
      role: AdminRole.SUPER_ADMIN,
      status: EntityStatus.ACTIVE,
    },
  });
  console.log(`✅ Admin seeded: ${admin.email}`);

  // 2. Seed E-sports Games
  const gameMobileLegends = await prisma.game.upsert({
    where: { slug: 'mobile-legends' },
    update: {},
    create: {
      slug: 'mobile-legends',
      name: 'Mobile Legends: Bang Bang',
      description: 'Multiplayer Online Battle Arena (MOBA) game by Moonton.',
      coverImage: 'https://cdn.nevacloud.io/esarizky/covers/mlbb-cover.webp',
      logo: 'https://cdn.nevacloud.io/esarizky/logos/mlbb-logo.webp',
      status: EntityStatus.ACTIVE,
    },
  });

  const gameValorant = await prisma.game.upsert({
    where: { slug: 'valorant' },
    update: {},
    create: {
      slug: 'valorant',
      name: 'VALORANT',
      description: '5v5 character-based tactical FPS game by Riot Games.',
      coverImage: 'https://cdn.nevacloud.io/esarizky/covers/valorant-cover.webp',
      logo: 'https://cdn.nevacloud.io/esarizky/logos/valorant-logo.webp',
      status: EntityStatus.ACTIVE,
    },
  });

  console.log(`✅ Games seeded: ${gameMobileLegends.name}, ${gameValorant.name}`);

  // 3. Seed E-sports Teams
  const teamOnic = await prisma.team.upsert({
    where: { slug: 'onic-esports' },
    update: {},
    create: {
      gameId: gameMobileLegends.id,
      slug: 'onic-esports',
      name: 'ONIC Esports',
      country: 'Indonesia',
      description: 'Dominant Indonesian Mobile Legends professional team.',
      logo: 'https://cdn.nevacloud.io/esarizky/logos/onic.webp',
      status: EntityStatus.ACTIVE,
    },
  });

  const teamRrq = await prisma.team.upsert({
    where: { slug: 'rrq-hoshi' },
    update: {},
    create: {
      gameId: gameMobileLegends.id,
      slug: 'rrq-hoshi',
      name: 'Rex Regum Qeon (RRQ)',
      country: 'Indonesia',
      description: 'The Kings of Kings e-sports organization.',
      logo: 'https://cdn.nevacloud.io/esarizky/logos/rrq.webp',
      status: EntityStatus.ACTIVE,
    },
  });

  const teamPrx = await prisma.team.upsert({
    where: { slug: 'paper-rex' },
    update: {},
    create: {
      gameId: gameValorant.id,
      slug: 'paper-rex',
      name: 'Paper Rex',
      country: 'Singapore',
      description: 'Aggressive VCT Pacific Valorant contender.',
      logo: 'https://cdn.nevacloud.io/esarizky/logos/prx.webp',
      status: EntityStatus.ACTIVE,
    },
  });

  console.log(`✅ Teams seeded: ${teamOnic.name}, ${teamRrq.name}, ${teamPrx.name}`);

  // 4. Seed Players
  const playerKiboy = await prisma.player.upsert({
    where: { id: '11111111-1111-1111-1111-111111111111' },
    update: {},
    create: {
      id: '11111111-1111-1111-1111-111111111111',
      gameId: gameMobileLegends.id,
      teamId: teamOnic.id,
      nickname: 'Kiboy',
      fullName: 'Nicky Fernando',
      role: 'Roamer',
      country: 'Indonesia',
      avatar: 'https://cdn.nevacloud.io/esarizky/avatars/kiboy.webp',
      biography: 'MVP Roamer known for aggressive initiator plays.',
      status: EntityStatus.ACTIVE,
    },
  });

  const playerAlberttt = await prisma.player.upsert({
    where: { id: '22222222-2222-2222-2222-222222222222' },
    update: {},
    create: {
      id: '22222222-2222-2222-2222-222222222222',
      gameId: gameMobileLegends.id,
      teamId: teamOnic.id,
      nickname: 'Alberttt',
      fullName: 'Albert Neilsen Iskandar',
      role: 'Jungler',
      country: 'Indonesia',
      avatar: 'https://cdn.nevacloud.io/esarizky/avatars/alberttt.webp',
      biography: 'Baby Assassin, premier Ling and Lancelot player.',
      status: EntityStatus.ACTIVE,
    },
  });

  const playerForsaken = await prisma.player.upsert({
    where: { id: '33333333-3333-3333-3333-333333333333' },
    update: {},
    create: {
      id: '33333333-3333-3333-3333-333333333333',
      gameId: gameValorant.id,
      teamId: teamPrx.id,
      nickname: 'f0rsakeN',
      fullName: 'Jason Susanto',
      role: 'Flex / Duelist',
      country: 'Indonesia',
      avatar: 'https://cdn.nevacloud.io/esarizky/avatars/forsaken.webp',
      biography: 'VCT Pacific superstar known for Yoru and Jett plays.',
      status: EntityStatus.ACTIVE,
    },
  });

  console.log(`✅ Players seeded: ${playerKiboy.nickname}, ${playerAlberttt.nickname}, ${playerForsaken.nickname}`);

  // 5. Seed Initial Vote Summary Values
  await prisma.playerVoteSummary.upsert({
    where: { playerId: playerKiboy.id },
    update: { totalVote: 1250, dailyVote: 45, weeklyVote: 320, monthlyVote: 890 },
    create: { playerId: playerKiboy.id, totalVote: 1250, dailyVote: 45, weeklyVote: 320, monthlyVote: 890 },
  });

  await prisma.playerVoteSummary.upsert({
    where: { playerId: playerAlberttt.id },
    update: { totalVote: 2100, dailyVote: 110, weeklyVote: 650, monthlyVote: 1450 },
    create: { playerId: playerAlberttt.id, totalVote: 2100, dailyVote: 110, weeklyVote: 650, monthlyVote: 1450 },
  });

  await prisma.playerVoteSummary.upsert({
    where: { playerId: playerForsaken.id },
    update: { totalVote: 3400, dailyVote: 180, weeklyVote: 920, monthlyVote: 2300 },
    create: { playerId: playerForsaken.id, totalVote: 3400, dailyVote: 180, weeklyVote: 920, monthlyVote: 2300 },
  });

  console.log('🚀 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
