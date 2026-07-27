# VotePlay - Next.js Production-Grade Boilerplate

Boilerplate Next.js (App Router) production-grade yang scalable, maintainable, aman secara default, dan mengikuti best practices industri terkini.

## 🚀 Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query v5 (Server State), Zustand (Global Client State)
- **Validation**: Zod & React Hook Form
- **Code Quality**: ESLint, Prettier, Husky, lint-staged, Commitlint
- **Testing**: Vitest, React Testing Library, Playwright
- **CI/CD**: GitHub Actions

---

## 📁 Struktur Folder Utama

- `src/app/`: Next.js App Router (Layouts, Routing, Error Boundaries).
- `src/components/`: Shared UI (Atomic Design System).
- `src/features/`: Domain Features (Modul terisolasi seperti `auth/`, `dashboard/`).
- `src/config/`: Konfigurasi terpusat & Validasi Environment Variable.
- `src/lib/`: Custom Loggers, Errors, & External SDK Wrappers.
- `src/utils/`: Pure helper functions.

---

## 🛠️ Panduan Memulai (Development)

### 1. Prasyarat
- Node.js >= 20
- pnpm >= 9

### 2. Install Dependensi & Setup Env
```bash
# Clone & masuki direktori project
cd voteplay

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local
```

### 3. Jalankan Server Development
```bash
pnpm dev
```
Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

## 🧪 Testing & Code Quality

```bash
# Typecheck TypeScript
pnpm typecheck

# ESLint & Prettier
pnpm lint
pnpm format:check

# Unit Tests (Vitest)
pnpm test
pnpm test:coverage
```
