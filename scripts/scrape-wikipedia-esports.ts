import { PrismaClient, EntityStatus } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

interface WikipediaRosterPlayer {
  nickname: string;
  fullName?: string;
  role?: string;
  country?: string;
}

interface WikipediaTeamData {
  name: string;
  slug: string;
  gameSlug: string;
  gameName: string;
  country?: string;
  logoUrl?: string;
  description?: string;
  players: WikipediaRosterPlayer[];
}

/**
 * Fetch Wikipedia article HTML cleanly using MediaWiki User-Agent
 */
async function fetchWikipediaHtml(title: string): Promise<string> {
  const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
  console.log(`🌐 Fetching Wikipedia page: ${url}`);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'VotePlayBot/1.0 (https://voteplay.app; contact@voteplay.app) NodeFetcher/1.0',
      'Accept': 'text/html,application/xhtml+xml',
    },
  });

  if (!response.ok) {
    throw new Error(`Wikipedia fetch failed with status ${response.status} for title: ${title}`);
  }

  return response.text();
}

/**
 * Parse Wikipedia E-sports Infobox & Wikitable Roster
 */
export function parseWikipediaTeamHtml(html: string, fallbackName: string, gameSlug: string, gameName: string): WikipediaTeamData {
  const $ = cheerio.load(html);

  // Extract Team Name from Infobox or Heading
  const infoboxTitle = $('.infobox .fn').first().text().trim() || $('#firstHeading').text().trim() || fallbackName;
  const logoSrc = $('.infobox .infobox-image img').first().attr('src');
  const logoUrl = logoSrc ? (logoSrc.startsWith('//') ? `https:${logoSrc}` : logoSrc) : undefined;

  // Extract Country from Infobox
  const country = $('.infobox th:contains("Location"), .infobox th:contains("Country")')
    .next('td')
    .text()
    .trim()
    .replace(/\[\d+\]/g, '');

  const description = $('.mw-parser-output > p').not('.mw-empty-elt').first().text().trim().replace(/\[\d+\]/g, '');

  const players: WikipediaRosterPlayer[] = [];

  // Parse Wikitable Roster
  $('table.wikitable tr').each((_, row) => {
    const cols = $(row).find('td');
    if (cols.length >= 2) {
      const col0Text = $(cols[0]).text().trim().replace(/\[\d+\]/g, '');
      const col1Text = $(cols[1]).text().trim().replace(/\[\d+\]/g, '');
      const col2Text = cols.length >= 3 ? $(cols[2]).text().trim().replace(/\[\d+\]/g, '') : '';
      const col3Text = cols.length >= 4 ? $(cols[3]).text().trim().replace(/\[\d+\]/g, '') : '';

      if (col0Text && col0Text.length < 30 && !col0Text.toLowerCase().includes('name')) {
        players.push({
          nickname: col0Text,
          fullName: col1Text || undefined,
          role: col2Text || 'Player',
          country: col3Text || country || 'Global',
        });
      }
    }
  });

  return {
    name: infoboxTitle.replace(/\(esports\)/gi, '').trim(),
    slug: infoboxTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    gameSlug,
    gameName,
    country: country || 'Indonesia',
    logoUrl,
    description,
    players,
  };
}

/**
 * Main Wikipedia Scraper & Supabase PostgreSQL Ingestion Engine
 */
async function scrapeAndIngestFromWikipedia() {
  console.log('🚀 Starting Wikipedia E-sports Scraper & Database Ingestion...');

  // Target Wikipedia articles to scrape
  const wikipediaTargets = [
    { title: 'ONIC_Esports', gameSlug: 'mobile-legends', gameName: 'Mobile Legends: Bang Bang' },
    { title: 'Rex_Regum_Qeon', gameSlug: 'mobile-legends', gameName: 'Mobile Legends: Bang Bang' },
    { title: 'EVOS_Esports', gameSlug: 'mobile-legends', gameName: 'Mobile Legends: Bang Bang' },
    { title: 'Paper_Rex', gameSlug: 'valorant', gameName: 'VALORANT' },
  ];

  for (const target of wikipediaTargets) {
    try {
      // 1. Ingest/Ensure Game entity exists
      const game = await prisma.game.upsert({
        where: { slug: target.gameSlug },
        update: {},
        create: {
          slug: target.gameSlug,
          name: target.gameName,
          description: `E-sports competition game for ${target.gameName}`,
          status: EntityStatus.ACTIVE,
        },
      });

      // 2. Fetch & Parse Wikipedia Page
      const html = await fetchWikipediaHtml(target.title);
      const teamData = parseWikipediaTeamHtml(html, target.title.replace(/_/g, ' '), target.gameSlug, target.gameName);

      console.log(`  🛡️ Wikipedia Parsed Team: ${teamData.name} (${teamData.players.length} players found)`);

      // 3. Upsert Team into Supabase Database
      const team = await prisma.team.upsert({
        where: { slug: teamData.slug },
        update: { name: teamData.name, country: teamData.country },
        create: {
          gameId: game.id,
          slug: teamData.slug,
          name: teamData.name,
          country: teamData.country,
          description: teamData.description || `Professional ${game.name} team.`,
          logo: teamData.logoUrl || `https://cdn.nevacloud.io/esarizky/logos/${teamData.slug}.webp`,
          status: EntityStatus.ACTIVE,
        },
      });

      // 4. Ingest Scraped Players into Database
      for (const p of teamData.players) {
        if (!p.nickname) continue;

        const existingPlayer = await prisma.player.findFirst({
          where: { nickname: p.nickname, teamId: team.id },
        });

        if (!existingPlayer) {
          const newPlayer = await prisma.player.create({
            data: {
              gameId: game.id,
              teamId: team.id,
              nickname: p.nickname,
              fullName: p.fullName,
              role: p.role || 'Player',
              country: p.country || teamData.country || 'Global',
              avatar: `https://cdn.nevacloud.io/esarizky/avatars/${p.nickname.toLowerCase()}.webp`,
              status: EntityStatus.ACTIVE,
            },
          });

          // Inisialisasi Summary Vote
          await prisma.playerVoteSummary.upsert({
            where: { playerId: newPlayer.id },
            update: {},
            create: { playerId: newPlayer.id, totalVote: 0 },
          });

          console.log(`    👤 Ingested Wikipedia Player: ${newPlayer.nickname} (${newPlayer.role})`);
        }
      }
    } catch (err) {
      console.warn(`  ⚠️ Warning scraping Wikipedia title "${target.title}":`, (err as Error).message);
    }
  }

  // Ensure Database Views Are Up To Date
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
  await prisma.$executeRawUnsafe(createViewSql);

  console.log('🎉 Wikipedia E-sports Scraper & Database Ingestion successfully completed!');
}

scrapeAndIngestFromWikipedia()
  .catch((e) => {
    console.error('❌ Wikipedia Ingestion Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
