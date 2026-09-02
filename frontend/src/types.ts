export type BrandStatus = 'HIDDEN' | 'AVAILABLE' | 'SOLD' | 'UPCOMING' | 'LIVE' | 'CONTESTED';

export type RoundActivityStatus = 'LOCKED' | 'INACTIVE' | 'ACTIVE' | 'COMPLETED';

export type RoundStatus = 'LOCKED' | 'RELEASED' | 'ACTIVE' | 'COMPLETED';

export type AuctionStatus = 'LOCKED' | 'ACTIVE' | 'COMPLETED';

export interface AuctionRoundControlState {
  infoReleased: boolean;
  roundStatus: RoundActivityStatus;
  objective: string;
  instructions: string;
  rules: string;
}

export type ProductStatus = 'AVAILABLE' | 'TAKEN';

export interface Product {
  id: string;
  name: string;
  category?: string;
  image: string; // image url, svg, or data uri
  productImageUrl?: string;
  shortDescription: string;
  status: ProductStatus;
  takenByTeamId?: string | null;
  takenByTeamNumber?: string | null;
  takenAt?: string | null;
}

export interface ProductRevealPuzzle {
  type: 'text' | 'image' | 'both';
  text: string;
  imageUrl?: string;
  correctAnswer: string;
}

export interface RoundControlState {
  currentRoundId: string;
  currentRoundName: string;
  roundNumber: number; // e.g. 2
  infoReleased: boolean; // Controlled by RELEASE INFO
  roundStatus: RoundActivityStatus; // Controlled by RELEASE ROUND (INACTIVE | ACTIVE | COMPLETED)
  status?: RoundStatus; // Compatibility helper
  objective: string;
  rules: string;
  timeLimit: string;
  importantNotes: string;
  instructions: string;
  puzzle: ProductRevealPuzzle;
}

export interface Brand {
  id: string;
  lotNumber: number;
  name: string;
  sector?: string;
  logo: string; // image url or data url
  basePrice: number; // e.g. 3000
  shortDescription: string;
  brandDetails: string;
  status: BrandStatus;
  winningTeamId?: string | null;
  winningTeamNumber?: string | null;
  winningBid?: number | null;
  soldAt?: string | null;
}

export interface Team {
  id: string; // "1" to "15"
  teamNumber: string; // "Team 01" to "Team 15"
  teamName: string; // "Team 01" to "Team 15" or custom editable name
  member1: string;
  member2: string;
  member3: string;
  accessCode?: string; // Never used for authentication; stored as a hash in PostgreSQL.
  morphCoins: number; // starts at 10000
  score: number; // initially 0
  brand: string; // initially "—"
  brandId?: string | null;
  winningBid?: number | null;
  product: string; // initially "—"
  productId?: string | null;
  rank: number | string; // 1, 2, ... or "—"
  
  // Round 2: Product reveal progress
  puzzleSolved?: boolean;
  puzzleSolvedAt?: string | null;
  productSelectedAt?: string | null;
  completionPosition?: number | null;

  // Round 3: Morph Cards
  cards?: string[]; // array of card names owned by team e.g. ['SAFE', 'BOOST']
  usedCards?: string[]; // array of used card names e.g. ['SWAP', 'BOOST']

  // Round 5: Celebrity Reveal
  celebrityId?: string | null;
  celebrityMysteryNumber?: number | null;
  celebrityName?: string | null;
  celebrityRevealed?: boolean;
  celebritySpinTime?: string | null;
  celebrityPurchasePrice?: number | null;
  celebrityPurchaseTime?: string | null;

  // Round 7: Morph Market & Portfolio
  marketInvestedValue?: number; // Total current value of active market investments
  totalMorphValue?: number; // morphCoins + marketInvestedValue (used for leaderboard ranking)
}

export interface CelebrityRatings {
  personalityRating: number; // 0 to 10
  popularityRating: number; // 0 to 10
  businessRelevanceRating: number; // 0 to 10
  publicAppealRating: number; // 0 to 10
  additionalRating?: number; // 0 to 10
  additionalRatingLabel?: string; // e.g. "Social Engagement", "Market Influence"
  youthAppeal?: number; // legacy optional
  legacyTrust?: number;
  socialEngagement?: number;
  riskFactor?: number;
  globalReach?: number;
}

export type CelebrityRatingCategory = 'personalityRating' | 'popularityRating' | 'businessRelevanceRating' | 'publicAppealRating' | 'additionalRating';

export interface CelebrityCard {
  id: string;
  celebrityNumber: number; // 1 to 20
  name: string;
  domain?: string;
  imageUrl?: string; // url, data uri or svg
  image?: string;
  price: number; // in Morph Coins (Admin editable, e.g. 3000)
  personalityRating: number; // 0 to 10
  popularityRating: number; // 0 to 10
  businessRelevanceRating: number; // 0 to 10
  publicAppealRating: number; // 0 to 10
  additionalRating?: number; // 0 to 10
  additionalRatingLabel?: string; // e.g. "Social Engagement"
  ratings?: CelebrityRatings;
  description: string;
  publicNotes?: string;
  status: 'AVAILABLE' | 'TAKEN';
  assignedTeamId?: string | null;
  assignedTeamNumber?: string | null;
  purchasedPrice?: number | null;
  purchaseTime?: string | null;
  spinTime?: string | null;
  isIdentityRevealed: boolean;
  revealedAt?: string | null;
}

export interface CelebritySpinHistoryItem {
  id: string;
  spinNumber: number;
  teamId: string;
  teamNumber: string;
  teamName: string;
  timestamp: string;
}

export interface CelebrityRoundControlState {
  roundName?: string;
  infoReleased: boolean;
  roundStatus: RoundActivityStatus;
  objective: string;
  rules: string;
  regulations?: string;
  instructions: string;
  timeLimit?: string;
  additionalInfo?: string;
  selectedTeamId: string | null; // The team selected by the Admin Spin Wheel (e.g. "7")
  selectedTeamNumber: string | null; // "Team 07"
  selectedAt: string | null;
  spinHistory: CelebritySpinHistoryItem[];
  allowedTeamIdForSpin?: string | null; // legacy
}

export interface MorphCard {
  id: string;
  name: string; // 'SAFE', 'SWAP', 'INTEL', 'BOOST' or custom
  price: number; // in Morph Coins
  power: string; // Power / Function
  description: string; // Description
  maxAvailable: number | null; // null = Unlimited, or number e.g. 15, 3
  purchasedCount: number;
}

export type CardPurchaseStatus = 'CLOSED' | 'OPEN';

export interface CardRoundControlState {
  roundName?: string;
  infoReleased: boolean;
  purchaseStatus: CardPurchaseStatus;
  roundStatus: RoundActivityStatus;
  objective?: string;
  rules?: string;
  regulations?: string;
  instructions?: string;
  timeLimit?: string;
  additionalInfo?: string;
}

export interface ProductCreationConfig {
  infoReleased: boolean;
  roundStatus: RoundActivityStatus;
  title: string;
  objective: string;
  instructions: string;
  rules?: string;
  regulations?: string;
  timeLimit: string;
  theme?: string;
  deadline?: string;
  deliverables?: string[] | string;
  caseStudy?: string;
  caseStudyText?: string;
  caseStudyFileName?: string;
  caseStudyFileType?: string;
  uploadedFileName?: string;
  additionalNotes?: string;
  additionalInfo?: string;
  submissionEmail?: string;
  submissionInstructions?: string;
}

export interface CardTransaction {
  id: string;
  teamId: string;
  teamNumber: string;
  teamName: string;
  cardId: string;
  cardName: string;
  price: number;
  timePurchased: string;
  status: 'PURCHASED';
}

export interface BrandConflict {
  id: string;
  brandId: string;
  brandName: string;
  conflictingTeamIds: string[]; // e.g. ['3', '7']
  conflictingTeamNumbers: string[]; // e.g. ['Team 03', 'Team 07']
  status: 'PENDING_PUZZLE' | 'PUZZLE_ACTIVE' | 'ACTIVE' | 'RESOLVED';
  puzzleText: string;
  puzzleImageUrl?: string;
  correctAnswer: string;
  winnerTeamId?: string | null;
  winnerTeamNumber?: string | null;
  winningAnswer?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface AdminNotification {
  id: string;
  type: 'conflict' | 'swap_blocked' | 'swap_success' | 'purchase' | 'auction_win' | 'boost_used' | 'info' | 'round_change';
  title?: string;
  message: string;
  teamId?: string;
  teamNumber?: string;
  targetTeamId?: string;
  targetTeamNumber?: string;
  cardName?: string;
  brandName?: string;
  timestamp: string;
  read?: boolean;
}

export interface CoinUpdateLog {
  id: string;
  teamId: string;
  teamNumber: string;
  previousBalance: number;
  newBalance: number;
  timestamp: string;
  note?: string;
}

export interface AuctionHistoryItem {
  id: string;
  lotNumber: number;
  brandId: string;
  brandName: string;
  basePrice: number;
  winningTeamId: string;
  winningTeamNumber: string;
  winningBid: number;
  status: 'SOLD';
  timestamp: string;
}

export type ViewState = 'landing' | 'admin-login' | 'admin-dashboard' | 'team-login' | 'team-dashboard';

export interface AuthState {
  role: 'none' | 'admin' | 'team';
  authenticatedTeamId: string | null;
}

// ==========================================
// ROUND 6: PR CRISIS INTERFACES
// ==========================================
export interface PrCrisisConfig {
  roundName: string; // e.g. "ROUND 6: PR CRISIS"
  infoReleased: boolean;
  roundStatus: RoundActivityStatus;
  objective: string;
  crisisCaseText: string; // Situation / Case
  deliverables: string;
  submissionMethod: string;
  submissionDeadline: string; // Time / Deadline
  rules: string;
  additionalInstructions: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

// ==========================================
// UNIVERSAL JUDGING & SCORING SYSTEM INTERFACES
// ==========================================
export interface JudgingCriterion {
  id: string;
  name: string; // e.g. "Creativity"
  description: string; // e.g. "Originality and uniqueness of strategic mitigation"
  weightage: number; // e.g. 25 for 25% (total across criteria must equal 100)
  order: number;
}

export interface TeamScoreRecord {
  teamId: string;
  teamNumber?: string;
  teamName?: string;
  roundId?: 'PR_CRISIS' | 'FINAL_GROWTH';
  scores: { [criterionId: string]: number }; // score 0 - 100 per criterion
  weightedScore: number; // e.g. 84.1 (out of 100)
  morphCoinsEarned: number; // weightedScore * 100 (e.g. 8410)
  isConfirmed: boolean; // Confirmed by Admin (awarded coins)
  confirmedAt?: string | null;
  isReleased?: boolean; // Released to Team View
  releasedAt?: string | null;
  lastAwardedCoins?: number; // Previously credited coins to calculate diff on edit
  judgeNotes?: string;
}

export interface RoundJudgingState {
  roundId: 'PR_CRISIS' | 'FINAL_GROWTH';
  criteria: JudgingCriterion[];
  teamScores: { [teamId: string]: TeamScoreRecord };
  scoresReleased?: boolean;
  isScoresReleased?: boolean;
}

// ==========================================
// ROUND 8: FINAL GROWTH EXPANSION INTERFACES
// ==========================================
export interface FinalGrowthConfig {
  roundName: string; // "ROUND 8: FINAL GROWTH EXPANSION"
  infoReleased: boolean;
  roundStatus: RoundActivityStatus;
  objective: string;
  caseStudyText: string; // 2-3 page comprehensive case study
  deliverables: string;
  rules: string;
  timeLimit: string;
  submissionDeadline?: string; // Time / Deadline
  submissionMethod: string;
  additionalInstructions?: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

// ==========================================
// SCORE AUDIT & TRANSACTION HISTORY
// ==========================================
export interface ScoreHistoryTransaction {
  id: string;
  roundId: 'PR_CRISIS' | 'FINAL_GROWTH' | 'AUCTION' | 'CARDS' | 'MARKET' | 'CUSTOM';
  teamId: string;
  teamNumber: string;
  type?: 'SCORE_AWARDED' | 'SCORE_EDITED' | 'ROUND_RESET';
  roundName?: string;
  previousScore?: number;
  newScore?: number;
  previousAwardedCoins?: number;
  newAwardedCoins?: number;
  deltaCoins?: number; // amount added or subtracted from balance
  previousBalance?: number;
  coinsDelta?: number; // e.g. +8410, -3000
  newBalance?: number;
  weightedScore?: number; // e.g. 84.1 / 100
  note?: string;
  adminNote?: string;
  timestamp: string;
}

// ==========================================
// ROUND 7: MORPH MARKET INTERFACES
// ==========================================
export type OpportunityStatus = 'ACTIVE' | 'INACTIVE';

export interface MarketOpportunity {
  id: string;
  name: string; // e.g. "MARKET EXPANSION", "GLOBAL EXPANSION", etc.
  description: string;
  startingValue: number; // e.g. 100
  currentValue: number; // e.g. 100, updates with % changes
  status: OpportunityStatus;
  changePercent?: number; // total % change from start
}

export interface MarketNewsAffectedOpportunity {
  opportunityId: string;
  opportunityName: string;
  changePercent: number; // e.g. 50 for +50%, -20 for -20%
  priceReleased?: boolean;
  priceReleasedAt?: string | null;
}

export interface MarketNews {
  id: string;
  headline: string;
  fullText: string;
  affectedOpportunities: MarketNewsAffectedOpportunity[];
  additionalEffects?: string;
  status: 'DRAFT' | 'RELEASED';
  releasedAt?: string | null;
}

export interface TeamOpportunityInvestment {
  opportunityId: string;
  opportunityName: string;
  investedAmount: number; // Cost basis invested (e.g. 200)
  currentValue: number; // Current value after price fluctuations (e.g. 300)
  gainLoss: number; // currentValue - investedAmount (e.g. +100)
  gainLossPercent: number; // % gain or loss
  quantity?: number; // Units currently held; legacy investments infer this from value
}

export interface TeamMarketPortfolio {
  teamId: string;
  teamNumber?: string;
  investments: { [opportunityId: string]: TeamOpportunityInvestment };
  availableCash: number; // Available Morph Coins
  totalInvested: number; // Sum of cost basis
  totalCurrentValue: number; // Sum of current values of all investments
  netGainLoss: number; // totalCurrentValue - totalInvested
  netGainLossPercent: number; // % gain or loss on total investments
  totalPortfolioValue: number; // availableCash + totalCurrentValue
}

export interface MarketTransaction {
  id: string;
  teamId: string;
  teamNumber: string;
  teamName: string;
  type: 'BUY' | 'SELL' | 'MARKET_UPDATE';
  opportunityId?: string;
  opportunityName?: string;
  amount: number; // amount of cash traded or value change
  quantity?: number;
  priceOrValue?: number;
  changePercent?: number;
  profitOrLoss?: number;
  timestamp: string;
  description?: string;
}

export interface MarketRoundControlState {
  roundName: string; // "ROUND 7: MORPH MARKET"
  infoReleased: boolean;
  roundStatus: RoundActivityStatus;
  tradingStatus: 'OPEN' | 'CLOSED';
  objective: string;
  instructions: string;
  rules: string;
  regulations?: string;
  additionalInfo?: string;
}
