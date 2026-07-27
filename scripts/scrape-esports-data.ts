import { PrismaClient, EntityStatus } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

interface ScrapedPlayer {
  nickname: string;
  fullName?: string;
  role?: string;
  country?: string;
  avatarUrl?: string;
}

interface ScrapedTeam {
  name: string;
  slug: string;
  country?: string;
  logoUrl?: string;
  players: ScrapedPlayer[];
}

/**
 * Enterprise Scraper & Ingestion Script
 * Scrapes e-sports roster data and ingests directly into Supabase PostgreSQL database.
 */
async function scrapeAndIngestLiquipediaData() {
  console.log('🌐 Starting E-sports Data Scraper & Ingestion Engine...');

  // 1. Target Game Setup
  const game = await prisma.game.upsert({
    where: { slug: 'mobile-legends' },
    update: {},
    create: {
      slug: 'mobile-legends',
      name: 'Mobile Legends: Bang Bang',
      description: 'Professional MOBA E-sports Game',
      status: EntityStatus.ACTIVE,
    },
  });

  console.log(`🎮 Game Ingested: ${game.name} (ID: ${game.id})`);

  // Sample Scraped Roster Dataset (Simulated parsed DOM result from Liquipedia MPL / VCT)
  const teamsToIngest: ScrapedTeam[] = [
    {
      name: 'Fnatic ONIC',
      slug: 'fnatic-onic',
      country: 'Indonesia',
      logoUrl: 'https://cdn.nevacloud.io/esarizky/logos/onic.webp',
      players: [
        { nickname: 'Kiboy', fullName: 'Nicky Fernando', role: 'Roamer', country: 'Indonesia', avatarUrl: 'https://cdn.nevacloud.io/esarizky/avatars/kiboy.webp' },
        { nickname: 'CW', fullName: 'Calvin Winata', role: 'Gold Laner', country: 'Indonesia', avatarUrl: 'https://cdn.nevacloud.io/esarizky/avatars/cw.webp' },
        { nickname: 'SANZ', fullName: 'Gilang', role: 'Mid Laner', country: 'Indonesia', avatarUrl: 'https://cdn.nevacloud.io/esarizky/avatars/sanz.webp' },
        { nickname: 'Kairi', fullName: 'Kairi Ygnacio Rayosdelsol', role: 'Jungler', country: 'Philippines', avatarUrl: 'https://cdn.nevacloud.io/esarizky/avatars/kairi.webp' },
        { nickname: 'Lutpiii', fullName: 'Lutfi Ardianto', role: 'EXP Laner', country: 'Indonesia', avatarUrl: 'https://cdn.nevacloud.io/esarizky/avatars/lutpiii.webp' },
      ],
    },
    {
      name: 'RRQ Hoshi',
      slug: 'rrq-hoshi',
      country: 'Indonesia',
      logoUrl: 'https://cdn.nevacloud.io/esarizky/logos/rrq.webp',
      players: [
        { nickname: 'Skylar', fullName: 'Schevenko David Tendean', role: 'Gold Laner', country: 'Indonesia', avatarUrl: 'https://cdn.nevacloud.io/esarizky/avatars/skylar.webp' },
        { nickname: 'Sutsujin', fullName: 'Arthur Sunarkho', role: 'Jungler', country: 'Indonesia', avatarUrl: 'https://cdn.nevacloud.io/esarizky/avatars/sutsujin.webp' },
        { nickname: 'Idok', fullName: 'Idok', role: 'Roamer', country: 'Indonesia', avatarUrl: 'https://cdn.nevacloud.io/esarizky/avatars/idok.webp' },
        { nickname: 'Rinz', fullName: 'Rinz', role: 'Mid Laner', country: 'Indonesia', avatarUrl: 'https://cdn.nevacloud.io/esarizky/avatars/rinz.webp' },
      ],
    },
    {
      name: 'EVOS Glory',
      slug: 'evos-glory',
      country: 'Indonesia',
      logoUrl: 'https://cdn.nevacloud.io/esarizky/logos/evos.webp',
      players: [
        { nickname: 'Branz', fullName: 'Jabran Bagus Wiloko', role: 'Gold Laner', country: 'Indonesia', avatarUrl: 'https://cdn.nevacloud.io/esarizky/avatars/branz.webp' },
        { nickname: 'Anavel', fullName: 'Junivito Anavel', role: 'Jungler', country: 'Indonesia', avatarUrl: 'https://cdn.nevacloud.io/esarizky/avatars/anavel.webp' },
        { nickname: 'FlapTzy', fullName: 'David Charles Canon', role: 'EXP Laner', country: 'Philippines', avatarUrl: 'https://cdn.nevacloud.io/esarizky/avatars/flaptzy.webp' },
      ],
    },
  ];

  for (const teamData of teamsToIngest) {
    const team = await prisma.team.upsert({
      where: { slug: teamData.slug },
      update: { name: teamData.name, logo: teamData.logoUrl },
      create: {
        gameId: game.id,
        slug: teamData.slug,
        name: teamData.name,
        country: teamData.country,
        logo: teamData.logoUrl,
        status: EntityStatus.ACTIVE,
      },
    });

    console.log(`  🛡️ Team Ingested: ${team.name}`);

    for (const playerData of teamData.players) {
      const existingPlayer = await prisma.player.findFirst({
        where: { nickname: playerData.nickname, teamId: team.id },
      });

      if (!existingPlayer) {
        const newPlayer = await prisma.player.create({
          data: {
            gameId: game.id,
            teamId: team.id,
            nickname: playerData.nickname,
            fullName: playerData.fullName,
            role: playerData.role,
            country: playerData.country,
            avatar: playerData.avatarUrl,
            status: EntityStatus.ACTIVE,
          },
        });

        // Initialize Summary Counter
        await prisma.playerVoteSummary.upsert({
          where: { playerId: newPlayer.id },
          update: {},
          create: { playerId: newPlayer.id, totalVote: 0 },
        });

        console.log(`    👤 Player Added: ${newPlayer.nickname} (${newPlayer.role})`);
      }
    }
  }

  console.log('🎉 Scraper Ingestion Engine successfully populated database!');
}

/**
 * Utility function to scrape live Liquipedia HTML directly
 */
export async function scrapeLiquipediaPage(url: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) VotePlayBot/1.0',
    },
  });
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const title = $('h1#firstHeading').text().trim();
  console.log(`Parsed Liquipedia Title: ${title}`);
  return { title, htmlLength: html.length };
}

scrapeAndIngestLiquipediaData()
  .catch((e) => {
    console.error('❌ Scraping error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
