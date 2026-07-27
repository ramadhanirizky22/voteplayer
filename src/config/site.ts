export const siteConfig = {
  name: 'VotePlay E-sports',
  description: 'Enterprise Production-Grade Vote Player Game Application',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ogImage: 'https://cdn.nevacloud.io/esarizky/covers/mlbb-cover.webp',
  links: {
    github: 'https://github.com/ramadhanirizky22/voteplayer',
  },
  nav: [
    { title: 'Home', href: '/' },
    { title: 'Leaderboards', href: '/#leaderboard' },
    { title: 'Admin Console', href: '/admin' },
  ],
};
