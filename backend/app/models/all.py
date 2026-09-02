"""Complete SQLAlchemy table mappings for the existing MORPH schema.

Models intentionally mirror database/init.sql. Domain workflows remain in API
services; this module only describes persisted tables and relationships.
"""
from datetime import datetime
from decimal import Decimal
from typing import Any
from uuid import UUID
from sqlalchemy import BigInteger, Boolean, DateTime, Integer, Numeric, Text, ForeignKey, CheckConstraint, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

UUIDCol = PG_UUID(as_uuid=True)

class TeamMember(Base):
    __tablename__ = "team_members"
    id: Mapped[UUID] = mapped_column(UUIDCol, primary_key=True, server_default=text("gen_random_uuid()"))
    team_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    member_name: Mapped[str] = mapped_column(Text, nullable=False)
    member_position: Mapped[int] = mapped_column(Integer, nullable=False)

class TeamRoundProgress(Base):
    __tablename__ = "team_round_progress"
    id: Mapped[UUID] = mapped_column(UUIDCol, primary_key=True, server_default=text("gen_random_uuid()"))
    team_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    round_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("event_rounds.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(Text, nullable=False, server_default="NOT_STARTED")
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completion_position: Mapped[int | None] = mapped_column(Integer)
    data: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))

class Brand(Base):
    __tablename__ = "brands"
    id: Mapped[UUID] = mapped_column(UUIDCol, primary_key=True, server_default=text("gen_random_uuid()"))
    event_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    lot_number: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    sector: Mapped[str | None] = mapped_column(Text)
    logo_url: Mapped[str | None] = mapped_column(Text)
    base_price: Mapped[int] = mapped_column(BigInteger, nullable=False)
    short_description: Mapped[str | None] = mapped_column(Text)
    brand_details: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(Text, nullable=False, server_default="HIDDEN")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

class Auction(Base):
    __tablename__ = "auctions"
    id: Mapped[UUID] = mapped_column(UUIDCol, primary_key=True, server_default=text("gen_random_uuid()"))
    event_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    round_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("event_rounds.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(Text, nullable=False, server_default="LOCKED")
    active_brand_id: Mapped[UUID | None] = mapped_column(UUIDCol, ForeignKey("brands.id", ondelete="SET NULL"))
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

class AuctionBid(Base):
    __tablename__ = "auction_bids"
    id: Mapped[UUID] = mapped_column(UUIDCol, primary_key=True, server_default=text("gen_random_uuid()"))
    auction_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("auctions.id", ondelete="CASCADE"), nullable=False)
    brand_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("brands.id", ondelete="CASCADE"), nullable=False)
    team_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    amount: Mapped[int] = mapped_column(BigInteger, nullable=False)
    is_winner: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

class BrandAssignment(Base):
    __tablename__ = "brand_assignments"
    id: Mapped[UUID] = mapped_column(UUIDCol, primary_key=True, server_default=text("gen_random_uuid()"))
    brand_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("brands.id", ondelete="CASCADE"), nullable=False)
    team_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    winning_bid: Mapped[int] = mapped_column(BigInteger, nullable=False)
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

class Product(Base):
    __tablename__ = "products"
    id: Mapped[UUID] = mapped_column(UUIDCol, primary_key=True, server_default=text("gen_random_uuid()"))
    event_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str | None] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(Text)
    short_description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(Text, nullable=False, server_default="AVAILABLE")
    taken_by_team_id: Mapped[UUID | None] = mapped_column(UUIDCol, ForeignKey("teams.id", ondelete="SET NULL"))
    taken_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

class RoundPuzzle(Base):
    __tablename__ = "round_puzzles"
    id: Mapped[UUID] = mapped_column(UUIDCol, primary_key=True, server_default=text("gen_random_uuid()"))
    round_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("event_rounds.id", ondelete="CASCADE"), nullable=False)
    puzzle_type: Mapped[str] = mapped_column(Text, nullable=False)
    puzzle_text: Mapped[str | None] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(Text)
    correct_answer_hash: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

class PuzzleAttempt(Base):
    __tablename__ = "puzzle_attempts"
    id: Mapped[UUID] = mapped_column(UUIDCol, primary_key=True, server_default=text("gen_random_uuid()"))
    puzzle_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("round_puzzles.id", ondelete="CASCADE"), nullable=False)
    team_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    attempted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

class ProductSelection(Base):
    __tablename__ = "product_selections"
    id: Mapped[UUID] = mapped_column(UUIDCol, primary_key=True, server_default=text("gen_random_uuid()"))
    product_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    team_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    selected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))
    released_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))

class Card(Base):
    __tablename__ = "cards"
    id: Mapped[UUID] = mapped_column(UUIDCol, primary_key=True, server_default=text("gen_random_uuid()"))
    event_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    price: Mapped[int] = mapped_column(BigInteger, nullable=False)
    power: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    max_available: Mapped[int | None] = mapped_column(Integer)
    purchased_count: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))

class TeamCard(Base):
    __tablename__ = "team_cards"
    team_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("teams.id", ondelete="CASCADE"), primary_key=True)
    card_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("cards.id", ondelete="CASCADE"), primary_key=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("1"))
    used_quantity: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    purchased_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

class CardTransaction(Base):
    __tablename__ = "card_transactions"
    id: Mapped[UUID] = mapped_column(UUIDCol, primary_key=True, server_default=text("gen_random_uuid()"))
    card_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("cards.id"), nullable=False)
    team_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("teams.id"), nullable=False)
    price: Mapped[int] = mapped_column(BigInteger, nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("1"))
    transaction_status: Mapped[str] = mapped_column(Text, nullable=False, server_default="PURCHASED")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

class BrandConflict(Base):
    __tablename__ = "brand_conflicts"
    id: Mapped[UUID] = mapped_column(UUIDCol, primary_key=True, server_default=text("gen_random_uuid()"))
    brand_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("brands.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(Text, nullable=False, server_default="PENDING_PUZZLE")
    puzzle_text: Mapped[str] = mapped_column(Text, nullable=False)
    puzzle_image_url: Mapped[str | None] = mapped_column(Text)
    correct_answer_hash: Mapped[str] = mapped_column(Text, nullable=False)
    winner_team_id: Mapped[UUID | None] = mapped_column(UUIDCol, ForeignKey("teams.id", ondelete="SET NULL"))
    winning_answer: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

class BrandConflictTeam(Base):
    __tablename__ = "brand_conflict_teams"
    conflict_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("brand_conflicts.id", ondelete="CASCADE"), primary_key=True)
    team_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("teams.id", ondelete="CASCADE"), primary_key=True)

class ConflictAttempt(Base):
    __tablename__ = "conflict_attempts"
    id: Mapped[UUID] = mapped_column(UUIDCol, primary_key=True, server_default=text("gen_random_uuid()"))
    conflict_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("brand_conflicts.id", ondelete="CASCADE"), nullable=False)
    team_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

class Celebrity(Base):
    __tablename__ = "celebrities"
    id: Mapped[UUID] = mapped_column(UUIDCol, primary_key=True, server_default=text("gen_random_uuid()"))
    event_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    celebrity_number: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    domain: Mapped[str | None] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(Text)
    price: Mapped[int] = mapped_column(BigInteger, nullable=False)
    personality_rating: Mapped[Decimal | None] = mapped_column(Numeric(4, 2))
    popularity_rating: Mapped[Decimal | None] = mapped_column(Numeric(4, 2))
    business_relevance_rating: Mapped[Decimal | None] = mapped_column(Numeric(4, 2))
    public_appeal_rating: Mapped[Decimal | None] = mapped_column(Numeric(4, 2))
    additional_rating: Mapped[Decimal | None] = mapped_column(Numeric(4, 2))
    additional_rating_label: Mapped[str | None] = mapped_column(Text)
    description: Mapped[str | None] = mapped_column(Text)
    public_notes: Mapped[str | None] = mapped_column(Text)
    assigned_team_id: Mapped[UUID | None] = mapped_column(UUIDCol, ForeignKey("teams.id", ondelete="SET NULL"))
    purchased_price: Mapped[int | None] = mapped_column(BigInteger)
    is_identity_revealed: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    revealed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

class CelebritySpin(Base):
    __tablename__ = "celebrity_spins"
    id: Mapped[UUID] = mapped_column(UUIDCol, primary_key=True, server_default=text("gen_random_uuid()"))
    event_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    round_id: Mapped[UUID | None] = mapped_column(UUIDCol, ForeignKey("event_rounds.id", ondelete="SET NULL"))
    selected_team_id: Mapped[UUID | None] = mapped_column(UUIDCol, ForeignKey("teams.id", ondelete="SET NULL"))
    selected_celebrity_id: Mapped[UUID | None] = mapped_column(UUIDCol, ForeignKey("celebrities.id", ondelete="SET NULL"))
    spin_number: Mapped[int] = mapped_column(Integer, nullable=False)
    spun_by: Mapped[UUID | None] = mapped_column(UUIDCol, ForeignKey("users.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

class MarketNews(Base):
    __tablename__ = "market_news"
    id: Mapped[UUID] = mapped_column(UUIDCol, primary_key=True, server_default=text("gen_random_uuid()"))
    event_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    related_opportunity_id: Mapped[UUID | None] = mapped_column(UUIDCol, ForeignKey("market_opportunities.id", ondelete="SET NULL"))
    released: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    released_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    price_released: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

class MarketNewsEffect(Base):
    __tablename__ = "market_news_effects"
    id: Mapped[UUID] = mapped_column(UUIDCol, primary_key=True, server_default=text("gen_random_uuid()"))
    market_news_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("market_news.id", ondelete="CASCADE"), nullable=False)
    opportunity_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("market_opportunities.id", ondelete="CASCADE"), nullable=False)
    change_percent: Mapped[Decimal] = mapped_column(Numeric(8, 4), nullable=False)

class JudgingCriterion(Base):
    __tablename__ = "judging_criteria"
    id: Mapped[UUID] = mapped_column(UUIDCol, primary_key=True, server_default=text("gen_random_uuid()"))
    round_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("event_rounds.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    max_score: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))

class TeamScore(Base):
    __tablename__ = "team_scores"
    id: Mapped[UUID] = mapped_column(UUIDCol, primary_key=True, server_default=text("gen_random_uuid()"))
    round_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("event_rounds.id", ondelete="CASCADE"), nullable=False)
    team_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    total_score: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, server_default=text("0"))
    is_confirmed: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    is_released: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    confirmed_by: Mapped[UUID | None] = mapped_column(UUIDCol, ForeignKey("users.id", ondelete="SET NULL"))
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

class CriterionScore(Base):
    __tablename__ = "criterion_scores"
    id: Mapped[UUID] = mapped_column(UUIDCol, primary_key=True, server_default=text("gen_random_uuid()"))
    team_score_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("team_scores.id", ondelete="CASCADE"), nullable=False)
    criterion_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("judging_criteria.id", ondelete="CASCADE"), nullable=False)
    score: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)

class Notification(Base):
    __tablename__ = "notifications"
    id: Mapped[UUID] = mapped_column(UUIDCol, primary_key=True, server_default=text("gen_random_uuid()"))
    event_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    notification_type: Mapped[str] = mapped_column(Text, nullable=False)
    title: Mapped[str | None] = mapped_column(Text)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    team_id: Mapped[UUID | None] = mapped_column(UUIDCol, ForeignKey("teams.id", ondelete="CASCADE"))
    target_team_id: Mapped[UUID | None] = mapped_column(UUIDCol, ForeignKey("teams.id", ondelete="CASCADE"))
    metadata_json: Mapped[dict[str, Any]] = mapped_column("metadata", JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

class NotificationRead(Base):
    __tablename__ = "notification_reads"
    notification_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("notifications.id", ondelete="CASCADE"), primary_key=True)
    user_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    read_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

class Submission(Base):
    __tablename__ = "submissions"
    id: Mapped[UUID] = mapped_column(UUIDCol, primary_key=True, server_default=text("gen_random_uuid()"))
    event_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    round_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("event_rounds.id", ondelete="CASCADE"), nullable=False)
    team_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    file_url: Mapped[str | None] = mapped_column(Text)
    file_name: Mapped[str | None] = mapped_column(Text)
    file_type: Mapped[str | None] = mapped_column(Text)
    submission_text: Mapped[str | None] = mapped_column(Text)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id: Mapped[UUID] = mapped_column(UUIDCol, primary_key=True, server_default=text("gen_random_uuid()"))
    event_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    actor_user_id: Mapped[UUID | None] = mapped_column(UUIDCol, ForeignKey("users.id", ondelete="SET NULL"))
    actor_team_id: Mapped[UUID | None] = mapped_column(UUIDCol, ForeignKey("teams.id", ondelete="SET NULL"))
    action: Mapped[str] = mapped_column(Text, nullable=False)
    entity_type: Mapped[str] = mapped_column(Text, nullable=False)
    entity_id: Mapped[UUID | None] = mapped_column(UUIDCol)
    old_data: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    new_data: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    ip_address: Mapped[str | None] = mapped_column(Text)
    user_agent: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

class EventStateVersion(Base):
    __tablename__ = "event_state_versions"
    event_id: Mapped[UUID] = mapped_column(UUIDCol, ForeignKey("events.id", ondelete="CASCADE"), primary_key=True)
    version: Mapped[int] = mapped_column(BigInteger, nullable=False, server_default=text("1"))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))
