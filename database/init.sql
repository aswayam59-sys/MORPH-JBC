CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE user_role AS ENUM ('ADMIN', 'TEAM');
CREATE TYPE event_status AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');
CREATE TYPE round_status AS ENUM ('LOCKED', 'RELEASED', 'ACTIVE', 'COMPLETED');
CREATE TYPE auction_status AS ENUM ('LOCKED', 'ACTIVE', 'COMPLETED');
CREATE TYPE brand_status AS ENUM ('HIDDEN', 'AVAILABLE', 'SOLD', 'UPCOMING', 'LIVE', 'CONTESTED');
CREATE TYPE product_status AS ENUM ('AVAILABLE', 'TAKEN');
CREATE TYPE card_purchase_status AS ENUM ('CLOSED', 'OPEN');
CREATE TYPE conflict_status AS ENUM (
  'PENDING_PUZZLE',
  'PUZZLE_ACTIVE',
  'ACTIVE',
  'RESOLVED'
);
CREATE TYPE market_status AS ENUM ('CLOSED', 'OPEN');
CREATE TYPE market_item_status AS ENUM ('INACTIVE', 'ACTIVE');
CREATE TYPE coin_transaction_type AS ENUM (
  'AUCTION_PURCHASE',
  'CARD_PURCHASE',
  'CELEBRITY_PURCHASE',
  'MARKET_BUY',
  'MARKET_SELL',
  'SCORE_REWARD',
  'ADMIN_ADJUSTMENT',
  'REFUND'
);
CREATE TYPE market_transaction_type AS ENUM ('BUY', 'SELL');
CREATE TYPE team_round_progress_status AS ENUM (
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED'
);
CREATE TYPE notification_type AS ENUM (
  'CONFLICT',
  'SWAP_BLOCKED',
  'SWAP_SUCCESS',
  'PURCHASE',
  'AUCTION_WIN',
  'BOOST_USED',
  'INFO',
  'ROUND_CHANGE'
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug CITEXT NOT NULL UNIQUE,
  status event_status NOT NULL DEFAULT 'DRAFT',
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  email CITEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, email)
);

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  team_number INTEGER NOT NULL CHECK (team_number > 0),
  team_name TEXT NOT NULL,
  access_code_hash TEXT NOT NULL,
  morph_coins BIGINT NOT NULL DEFAULT 10000 CHECK (morph_coins >= 0),
  total_score NUMERIC(12,2) NOT NULL DEFAULT 0,
  current_rank INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, team_number),
  UNIQUE (event_id, team_name)
);

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  member_position INTEGER NOT NULL CHECK (member_position BETWEEN 1 AND 10),
  UNIQUE (team_id, member_position)
);

CREATE TABLE event_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL CHECK (round_number > 0),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  status round_status NOT NULL DEFAULT 'LOCKED',
  info_released BOOLEAN NOT NULL DEFAULT FALSE,
  objective TEXT,
  instructions TEXT,
  rules TEXT,
  regulations TEXT,
  time_limit TEXT,
  important_notes TEXT,
  additional_info TEXT,
  deadline TIMESTAMPTZ,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, round_number),
  UNIQUE (event_id, code)
);

CREATE TABLE team_round_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  round_id UUID NOT NULL REFERENCES event_rounds(id) ON DELETE CASCADE,
  status team_round_progress_status NOT NULL DEFAULT 'NOT_STARTED',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completion_position INTEGER,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (team_id, round_id)
);

CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  lot_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  sector TEXT,
  logo_url TEXT,
  base_price BIGINT NOT NULL CHECK (base_price >= 0),
  short_description TEXT,
  brand_details TEXT,
  status brand_status NOT NULL DEFAULT 'HIDDEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, lot_number),
  UNIQUE (event_id, name)
);

CREATE TABLE auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  round_id UUID NOT NULL REFERENCES event_rounds(id) ON DELETE CASCADE,
  status auction_status NOT NULL DEFAULT 'LOCKED',
  active_brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE (event_id, round_id)
);

CREATE TABLE auction_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL CHECK (amount > 0),
  is_winner BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE brand_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  winning_bid BIGINT NOT NULL CHECK (winning_bid >= 0),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX one_active_brand_assignment
ON brand_assignments (brand_id)
WHERE revoked_at IS NULL;

CREATE UNIQUE INDEX one_active_team_brand
ON brand_assignments (team_id)
WHERE revoked_at IS NULL;

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  image_url TEXT,
  short_description TEXT,
  status product_status NOT NULL DEFAULT 'AVAILABLE',
  taken_by_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  taken_at TIMESTAMPTZ,
  UNIQUE (event_id, name)
);

CREATE TABLE round_puzzles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES event_rounds(id) ON DELETE CASCADE,
  puzzle_type TEXT NOT NULL CHECK (puzzle_type IN ('TEXT', 'IMAGE', 'BOTH')),
  puzzle_text TEXT,
  image_url TEXT,
  correct_answer_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (round_id)
);

CREATE TABLE puzzle_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  puzzle_id UUID NOT NULL REFERENCES round_puzzles(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE product_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  selected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  released_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE UNIQUE INDEX one_active_product_selection
ON product_selections (product_id)
WHERE is_active;

CREATE UNIQUE INDEX one_active_team_product_selection
ON product_selections (team_id)
WHERE is_active;

CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price BIGINT NOT NULL CHECK (price >= 0),
  power TEXT NOT NULL,
  description TEXT NOT NULL,
  max_available INTEGER CHECK (max_available IS NULL OR max_available > 0),
  purchased_count INTEGER NOT NULL DEFAULT 0 CHECK (purchased_count >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (event_id, name)
);

CREATE TABLE team_cards (
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  used_quantity INTEGER NOT NULL DEFAULT 0 CHECK (used_quantity >= 0),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (team_id, card_id)
);

CREATE TABLE card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id),
  team_id UUID NOT NULL REFERENCES teams(id),
  price BIGINT NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  transaction_status TEXT NOT NULL DEFAULT 'PURCHASED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE brand_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  status conflict_status NOT NULL DEFAULT 'PENDING_PUZZLE',
  puzzle_text TEXT NOT NULL,
  puzzle_image_url TEXT,
  correct_answer_hash TEXT NOT NULL,
  winner_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  winning_answer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE brand_conflict_teams (
  conflict_id UUID NOT NULL REFERENCES brand_conflicts(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  PRIMARY KEY (conflict_id, team_id)
);

CREATE TABLE conflict_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conflict_id UUID NOT NULL REFERENCES brand_conflicts(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE celebrities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  celebrity_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  domain TEXT,
  image_url TEXT,
  price BIGINT NOT NULL CHECK (price >= 0),
  personality_rating NUMERIC(4,2) CHECK (personality_rating BETWEEN 0 AND 10),
  popularity_rating NUMERIC(4,2) CHECK (popularity_rating BETWEEN 0 AND 10),
  business_relevance_rating NUMERIC(4,2) CHECK (business_relevance_rating BETWEEN 0 AND 10),
  public_appeal_rating NUMERIC(4,2) CHECK (public_appeal_rating BETWEEN 0 AND 10),
  additional_rating NUMERIC(4,2) CHECK (additional_rating BETWEEN 0 AND 10),
  additional_rating_label TEXT,
  description TEXT,
  public_notes TEXT,
  assigned_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  purchased_price BIGINT,
  is_identity_revealed BOOLEAN NOT NULL DEFAULT FALSE,
  revealed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, celebrity_number)
);

CREATE UNIQUE INDEX one_active_team_celebrity_assignment
ON celebrities (assigned_team_id)
WHERE assigned_team_id IS NOT NULL;

CREATE TABLE celebrity_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  round_id UUID REFERENCES event_rounds(id) ON DELETE SET NULL,
  selected_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  selected_celebrity_id UUID REFERENCES celebrities(id) ON DELETE SET NULL,
  spin_number INTEGER NOT NULL,
  spun_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE market_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  current_price BIGINT NOT NULL CHECK (current_price >= 0),
  status market_item_status NOT NULL DEFAULT 'ACTIVE',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE market_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  related_opportunity_id UUID REFERENCES market_opportunities(id) ON DELETE SET NULL,
  released BOOLEAN NOT NULL DEFAULT FALSE,
  released_at TIMESTAMPTZ,
  price_released BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE market_news_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_news_id UUID NOT NULL REFERENCES market_news(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES market_opportunities(id) ON DELETE CASCADE,
  change_percent NUMERIC(8,4) NOT NULL,
  UNIQUE (market_news_id, opportunity_id)
);

CREATE TABLE market_holdings (
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES market_opportunities(id) ON DELETE CASCADE,
  quantity NUMERIC(14,4) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  average_buy_price NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (average_buy_price >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (team_id, opportunity_id)
);

CREATE TABLE market_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id),
  opportunity_id UUID NOT NULL REFERENCES market_opportunities(id),
  transaction_type market_transaction_type NOT NULL,
  quantity NUMERIC(14,4) NOT NULL CHECK (quantity > 0),
  price_per_unit BIGINT NOT NULL CHECK (price_per_unit >= 0),
  total_amount BIGINT NOT NULL CHECK (total_amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE judging_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES event_rounds(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  max_score NUMERIC(6,2) NOT NULL CHECK (max_score > 0),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (round_id, name)
);

CREATE TABLE team_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES event_rounds(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  total_score NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  is_released BOOLEAN NOT NULL DEFAULT FALSE,
  confirmed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  confirmed_at TIMESTAMPTZ,
  UNIQUE (round_id, team_id)
);

CREATE TABLE criterion_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_score_id UUID NOT NULL REFERENCES team_scores(id) ON DELETE CASCADE,
  criterion_id UUID NOT NULL REFERENCES judging_criteria(id) ON DELETE CASCADE,
  score NUMERIC(6,2) NOT NULL CHECK (score >= 0),
  notes TEXT,
  UNIQUE (team_score_id, criterion_id)
);

CREATE TABLE coin_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  -- Backend must update this immutable history row and teams.morph_coins
  -- atomically in the same database transaction.
  transaction_type coin_transaction_type NOT NULL,
  amount BIGINT NOT NULL,
  balance_before BIGINT NOT NULL CHECK (balance_before >= 0),
  balance_after BIGINT NOT NULL CHECK (balance_after >= 0),
  reference_id UUID,
  note TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  title TEXT,
  message TEXT NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  target_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notification_reads (
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (notification_id, user_id)
);

CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  round_id UUID NOT NULL REFERENCES event_rounds(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  submission_text TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (round_id, team_id)
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE event_state_versions (
  event_id UUID PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE event_state (
  event_id UUID PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  version BIGINT NOT NULL DEFAULT 1 CHECK (version > 0),
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_event_role
  ON users(event_id, role);

CREATE INDEX idx_teams_event
  ON teams(event_id);

CREATE INDEX idx_rounds_event_status
  ON event_rounds(event_id, status);

CREATE INDEX idx_team_progress_team
  ON team_round_progress(team_id);

CREATE INDEX idx_auction_bids_auction_brand
  ON auction_bids(auction_id, brand_id, amount DESC);

CREATE INDEX idx_auction_bids_team_id
  ON auction_bids(team_id);

CREATE INDEX idx_brand_assignments_team_id
  ON brand_assignments(team_id);

CREATE INDEX idx_product_selections_team_id
  ON product_selections(team_id);

CREATE INDEX idx_puzzle_attempts_team_id
  ON puzzle_attempts(team_id);

CREATE INDEX idx_conflict_attempts_team_id
  ON conflict_attempts(team_id);

CREATE INDEX idx_celebrity_spins_selected_team_id
  ON celebrity_spins(selected_team_id);

CREATE INDEX idx_market_holdings_opportunity_id
  ON market_holdings(opportunity_id);

CREATE INDEX idx_team_scores_team_id
  ON team_scores(team_id);

CREATE INDEX idx_criterion_scores_criterion_id
  ON criterion_scores(criterion_id);

CREATE INDEX idx_market_news_effects_opportunity_id
  ON market_news_effects(opportunity_id);

CREATE INDEX idx_coin_ledger_team_created
  ON coin_ledger(team_id, created_at DESC);

CREATE INDEX idx_market_transactions_team_created
  ON market_transactions(team_id, created_at DESC);

CREATE INDEX idx_notifications_event_created
  ON notifications(event_id, created_at DESC);

CREATE INDEX idx_audit_logs_event_created
  ON audit_logs(event_id, created_at DESC);

CREATE INDEX idx_submissions_round_team
  ON submissions(round_id, team_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER teams_updated_at
BEFORE UPDATE ON teams
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER rounds_updated_at
BEFORE UPDATE ON event_rounds
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER brands_updated_at
BEFORE UPDATE ON brands
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER market_opportunities_updated_at
BEFORE UPDATE ON market_opportunities
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Product state is derived from the active selection record. The backend
-- should claim or release products through product_selections inside a
-- transaction; the row lock prevents two concurrent claims from succeeding.
CREATE OR REPLACE FUNCTION sync_product_selection_state()
RETURNS TRIGGER AS $$
DECLARE
  selected_product_id UUID;
  selected_team_id UUID;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    selected_product_id := OLD.product_id;
    SELECT ps.team_id
    INTO selected_team_id
    FROM product_selections ps
    WHERE ps.product_id = selected_product_id
      AND ps.is_active
    ORDER BY ps.selected_at DESC
    LIMIT 1;

    UPDATE products p
    SET status = CASE WHEN selected_team_id IS NULL THEN 'AVAILABLE'::product_status ELSE 'TAKEN'::product_status END,
        taken_by_team_id = selected_team_id,
        taken_at = CASE WHEN selected_team_id IS NULL THEN NULL ELSE COALESCE(p.taken_at, now()) END
    WHERE p.id = selected_product_id;
  END IF;

  IF TG_OP <> 'DELETE'
     AND (TG_OP <> 'UPDATE' OR NEW.product_id IS DISTINCT FROM OLD.product_id) THEN
    selected_product_id := NEW.product_id;
    SELECT ps.team_id
    INTO selected_team_id
    FROM product_selections ps
    WHERE ps.product_id = selected_product_id
      AND ps.is_active
    ORDER BY ps.selected_at DESC
    LIMIT 1;

    UPDATE products p
    SET status = CASE WHEN selected_team_id IS NULL THEN 'AVAILABLE'::product_status ELSE 'TAKEN'::product_status END,
        taken_by_team_id = selected_team_id,
        taken_at = CASE WHEN selected_team_id IS NULL THEN NULL ELSE COALESCE(p.taken_at, now()) END
    WHERE p.id = selected_product_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION lock_product_for_selection()
RETURNS TRIGGER AS $$
DECLARE
  product_record products%ROWTYPE;
BEGIN
  IF TG_OP = 'UPDATE' AND NOT NEW.is_active THEN
    SELECT *
    INTO product_record
    FROM products
    WHERE id = OLD.product_id
    FOR UPDATE;
    RETURN NEW;
  END IF;

  SELECT *
  INTO product_record
  FROM products
  WHERE id = NEW.product_id
  FOR UPDATE;

  IF (product_record.status = 'TAKEN'
      OR product_record.taken_by_team_id IS NOT NULL)
     AND NOT EXISTS (
       SELECT 1
       FROM product_selections ps
       WHERE ps.id = NEW.id
         AND ps.product_id = NEW.product_id
         AND ps.is_active
     ) THEN
    RAISE EXCEPTION 'Product % has already been taken', NEW.product_id
      USING ERRCODE = '23505';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_selection_lock
BEFORE INSERT OR UPDATE OF product_id, is_active ON product_selections
FOR EACH ROW EXECUTE FUNCTION lock_product_for_selection();

CREATE TRIGGER product_selection_state_sync
AFTER INSERT OR UPDATE OR DELETE ON product_selections
FOR EACH ROW EXECUTE FUNCTION sync_product_selection_state();

CREATE OR REPLACE FUNCTION validate_product_state()
RETURNS TRIGGER AS $$
DECLARE
  active_team_id UUID;
BEGIN
  SELECT ps.team_id
  INTO active_team_id
  FROM product_selections ps
  WHERE ps.product_id = NEW.id
    AND ps.is_active
  LIMIT 1;

  IF (NEW.status = 'TAKEN') IS DISTINCT FROM (active_team_id IS NOT NULL)
     OR NEW.taken_by_team_id IS DISTINCT FROM active_team_id THEN
    RAISE EXCEPTION 'Product state must match its active product selection';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_state_validation
BEFORE INSERT OR UPDATE OF status, taken_by_team_id, taken_at ON products
FOR EACH ROW EXECUTE FUNCTION validate_product_state();

-- Keep the cached leaderboard total equal to the criterion rows. Updates to
-- criterion_scores and team_scores therefore remain transactionally aligned.
CREATE OR REPLACE FUNCTION sync_team_score_total()
RETURNS TRIGGER AS $$
DECLARE
  score_record_id UUID;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    score_record_id := OLD.team_score_id;
    PERFORM sync_one_team_score_total(score_record_id);
  END IF;

  IF TG_OP <> 'DELETE' THEN
    score_record_id := NEW.team_score_id;
    PERFORM sync_one_team_score_total(score_record_id);
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sync_one_team_score_total(score_record_id UUID)
RETURNS VOID AS $$
DECLARE
  calculated_total NUMERIC(12,2);
BEGIN
  PERFORM id
  FROM team_scores
  WHERE id = score_record_id
  FOR UPDATE;

  SELECT COALESCE(SUM(score), 0)::NUMERIC(12,2)
  INTO calculated_total
  FROM criterion_scores
  WHERE team_score_id = score_record_id;

  UPDATE team_scores
  SET total_score = calculated_total
  WHERE id = score_record_id;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER criterion_score_total_sync
AFTER INSERT OR UPDATE OR DELETE ON criterion_scores
FOR EACH ROW EXECUTE FUNCTION sync_team_score_total();

CREATE OR REPLACE FUNCTION validate_team_score_total()
RETURNS TRIGGER AS $$
DECLARE
  calculated_total NUMERIC(12,2);
BEGIN
  SELECT COALESCE(SUM(score), 0)::NUMERIC(12,2)
  INTO calculated_total
  FROM criterion_scores
  WHERE team_score_id = NEW.id;

  IF NEW.total_score IS DISTINCT FROM calculated_total THEN
    RAISE EXCEPTION 'team_scores.total_score must equal the sum of criterion_scores';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER team_score_total_validation
BEFORE INSERT OR UPDATE OF total_score ON team_scores
FOR EACH ROW EXECUTE FUNCTION validate_team_score_total();

COMMENT ON TABLE teams IS
  'morph_coins is the cached current balance. Backend balance changes must update teams and coin_ledger atomically in one transaction.';

COMMENT ON TABLE coin_ledger IS
  'Immutable coin transaction history. Insert the ledger row and update teams.morph_coins atomically in one transaction.';

CREATE OR REPLACE FUNCTION prevent_coin_ledger_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'coin_ledger is immutable; insert a correcting transaction instead';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER coin_ledger_immutable
BEFORE UPDATE OR DELETE ON coin_ledger
FOR EACH ROW EXECUTE FUNCTION prevent_coin_ledger_mutation();