-- Migration: 00001_initial_schema.sql
-- Description: Core Schema Setup for Vote Player Game Application

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- 1. ENUMS
-- =========================================================================
DO $$ BEGIN
    CREATE TYPE entity_status AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED', 'SUSPENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE admin_role AS ENUM ('SUPER_ADMIN', 'MODERATOR', 'ANALYST');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE vote_source AS ENUM ('WEB', 'MOBILE_WEB', 'IOS_APP', 'ANDROID_APP', 'PARTNER_API');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE audit_action AS ENUM ('LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'RESTORE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =========================================================================
-- 2. TABLES
-- =========================================================================

-- TABLE: games
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    cover_image VARCHAR(512),
    logo VARCHAR(512),
    status entity_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- TABLE: teams
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    logo VARCHAR(512),
    description TEXT,
    country VARCHAR(100),
    status entity_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- TABLE: players
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    nickname VARCHAR(100) NOT NULL,
    full_name VARCHAR(150),
    avatar VARCHAR(512),
    role VARCHAR(100),
    country VARCHAR(100),
    biography TEXT,
    status entity_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- TABLE: votes (PARTITIONED TABLE FOR HIGH-SCALE IMMUTABLE LOGS)
CREATE TABLE IF NOT EXISTS votes (
    id UUID DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID DEFAULT NULL,
    ip_hash CHAR(64) NOT NULL,
    device_hash CHAR(64) NOT NULL,
    session_hash CHAR(64) NOT NULL,
    source vote_source NOT NULL DEFAULT 'WEB',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Partitions
CREATE TABLE IF NOT EXISTS votes_y2026m07 PARTITION OF votes
    FOR VALUES FROM ('2026-07-01 00:00:00+00') TO ('2026-08-01 00:00:00+00');
CREATE TABLE IF NOT EXISTS votes_y2026m08 PARTITION OF votes
    FOR VALUES FROM ('2026-08-01 00:00:00+00') TO ('2026-09-01 00:00:00+00');
CREATE TABLE IF NOT EXISTS votes_default PARTITION OF votes DEFAULT;

-- TABLE: player_vote_summary (REALTIME AGGREGATES)
CREATE TABLE IF NOT EXISTS player_vote_summary (
    player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
    total_vote BIGINT NOT NULL DEFAULT 0,
    daily_vote BIGINT NOT NULL DEFAULT 0,
    weekly_vote BIGINT NOT NULL DEFAULT 0,
    monthly_vote BIGINT NOT NULL DEFAULT 0,
    yearly_vote BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: admins
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role admin_role NOT NULL DEFAULT 'MODERATOR',
    status entity_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- TABLE: audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE RESTRICT,
    action audit_action NOT NULL,
    target_entity VARCHAR(100) NOT NULL,
    target_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 3. FUNCTIONS & TRIGGERS
-- =========================================================================

-- Trigger Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_games_timestamp ON games;
CREATE TRIGGER trg_update_games_timestamp
BEFORE UPDATE ON games FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_update_teams_timestamp ON teams;
CREATE TRIGGER trg_update_teams_timestamp
BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_update_players_timestamp ON players;
CREATE TRIGGER trg_update_players_timestamp
BEFORE UPDATE ON players FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_update_admins_timestamp ON admins;
CREATE TRIGGER trg_update_admins_timestamp
BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- Trigger Function: Auto-initialize player_vote_summary on new player
CREATE OR REPLACE FUNCTION init_player_vote_summary()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO player_vote_summary (player_id, total_vote, daily_vote, weekly_vote, monthly_vote, yearly_vote)
    VALUES (NEW.id, 0, 0, 0, 0, 0)
    ON CONFLICT (player_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_init_player_vote_summary ON players;
CREATE TRIGGER trg_init_player_vote_summary
AFTER INSERT ON players FOR EACH ROW EXECUTE FUNCTION init_player_vote_summary();

-- Trigger Function: Aggregate vote count atomically
CREATE OR REPLACE FUNCTION process_vote_aggregation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO player_vote_summary (player_id, total_vote, daily_vote, weekly_vote, monthly_vote, yearly_vote, updated_at)
    VALUES (NEW.player_id, 1, 1, 1, 1, 1, CURRENT_TIMESTAMP)
    ON CONFLICT (player_id) DO UPDATE SET
        total_vote = player_vote_summary.total_vote + 1,
        daily_vote = player_vote_summary.daily_vote + 1,
        weekly_vote = player_vote_summary.weekly_vote + 1,
        monthly_vote = player_vote_summary.monthly_vote + 1,
        yearly_vote = player_vote_summary.yearly_vote + 1,
        updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_process_vote_aggregation ON votes;
CREATE TRIGGER trg_process_vote_aggregation
AFTER INSERT ON votes FOR EACH ROW EXECUTE FUNCTION process_vote_aggregation();

-- Stored Procedure: Reset periodic counters
CREATE OR REPLACE PROCEDURE reset_periodic_vote_counters(p_period VARCHAR)
LANGUAGE plpgsql AS $$
BEGIN
    IF p_period = 'daily' THEN
        UPDATE player_vote_summary SET daily_vote = 0, updated_at = CURRENT_TIMESTAMP;
    ELSIF p_period = 'weekly' THEN
        UPDATE player_vote_summary SET weekly_vote = 0, updated_at = CURRENT_TIMESTAMP;
    ELSIF p_period = 'monthly' THEN
        UPDATE player_vote_summary SET monthly_vote = 0, updated_at = CURRENT_TIMESTAMP;
    ELSIF p_period = 'yearly' THEN
        UPDATE player_vote_summary SET yearly_vote = 0, updated_at = CURRENT_TIMESTAMP;
    END IF;
END;
$$;

-- =========================================================================
-- 4. INDEXES
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_games_slug_active ON games(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_teams_game_id_active ON teams(game_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_teams_slug_active ON teams(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_players_game_team_active ON players(game_id, team_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_players_search_gin ON players USING gin(to_tsvector('english', nickname || ' ' || COALESCE(full_name, '')));
CREATE INDEX IF NOT EXISTS idx_teams_search_gin ON teams USING gin(to_tsvector('english', name));

CREATE INDEX IF NOT EXISTS idx_votes_anti_cheat ON votes(player_id, device_hash, ip_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_session_cooldown ON votes(session_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id) WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_summary_total ON player_vote_summary(total_vote DESC);
CREATE INDEX IF NOT EXISTS idx_summary_daily ON player_vote_summary(daily_vote DESC);
CREATE INDEX IF NOT EXISTS idx_summary_weekly ON player_vote_summary(weekly_vote DESC);
CREATE INDEX IF NOT EXISTS idx_summary_monthly ON player_vote_summary(monthly_vote DESC);
CREATE INDEX IF NOT EXISTS idx_summary_yearly ON player_vote_summary(yearly_vote DESC);

-- =========================================================================
-- 5. VIEWS & MATERIALIZED VIEWS
-- =========================================================================
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
    s.total_vote,
    s.daily_vote,
    s.weekly_vote,
    s.monthly_vote,
    s.yearly_vote,
    s.updated_at AS last_voted_at
FROM players p
JOIN teams t ON p.team_id = t.id
JOIN games g ON p.game_id = g.id
JOIN player_vote_summary s ON p.id = s.player_id
WHERE p.deleted_at IS NULL AND p.status = 'ACTIVE';
