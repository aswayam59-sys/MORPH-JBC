import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { listenToGameState, updateGameState } from '../localSync';
import {
  Team,
  CoinUpdateLog,
  AuthState,
  ViewState,
  Brand,
  AuctionHistoryItem,
  BrandStatus,
  Product,
  RoundControlState,
  RoundStatus,
  RoundActivityStatus,
  AuctionStatus,
  ProductRevealPuzzle,
  MorphCard,
  CardRoundControlState,
  CardTransaction,
  BrandConflict,
  AdminNotification,
  ProductCreationConfig,
  CelebrityCard,
  CelebrityRoundControlState,
  CelebritySpinHistoryItem,
  PrCrisisConfig,
  MarketOpportunity,
  MarketNews,
  TeamOpportunityInvestment,
  TeamMarketPortfolio,
  MarketTransaction,
  MarketRoundControlState,
  JudgingCriterion,
  TeamScoreRecord,
  RoundJudgingState,
  FinalGrowthConfig,
  ScoreHistoryTransaction,
} from '../types';
import { loginAdmin as loginAdminWithApi, loginTeam as loginTeamWithApi } from '../api/auth';
import {
  fetchGameState,
  submitRiddleAnswerApi,
  selectProductApi,
  purchaseCardApi,
  useCardApi,
  answerConflictApi,
  resolveConflictApi,
  purchaseCelebrityApi,
  spinCelebrityApi,
  revealCelebrityApi,
  confirmScoreApi,
  marketBuyApi,
  marketSellApi,
  resetActiveGameplayApi,
  updateAuctionStatusApi,
} from '../api/client';
import {
  INITIAL_TEAMS,
  INITIAL_BRANDS,
  INITIAL_PRODUCTS,
  INITIAL_ROUND_CONFIG,
  INITIAL_CARDS,
  INITIAL_CARD_ROUND_CONFIG,
  INITIAL_PRODUCT_CREATION_CONFIG,
  INITIAL_CELEBRITIES,
  INITIAL_CELEBRITY_ROUND_CONFIG,
  INITIAL_PR_CRISIS_CONFIG,
  INITIAL_PR_CRISIS_CRITERIA,
  INITIAL_MARKET_OPPORTUNITIES,
  INITIAL_MARKET_NEWS,
  INITIAL_MARKET_ROUND_CONFIG,
  INITIAL_FINAL_GROWTH_CONFIG,
  INITIAL_FINAL_GROWTH_CRITERIA,
} from '../utils/initialData';
import { calculateRankings } from '../utils/ranking';

export interface RoundCompletionItem {
  position: number;
  teamId: string;
  teamNumber: string;
  teamName: string;
  puzzleSolved: boolean;
  puzzleSolvedAt: string | null;
  productName: string;
  productSelectedAt: string | null;
}

export type Round3CompletionItem = RoundCompletionItem;

interface EventContextType {
  teams: Team[];
  brands: Brand[];
  activeBrandId: string | null;
  auctionHistory: AuctionHistoryItem[];
  logs: CoinUpdateLog[];
  authState: AuthState;
  currentView: ViewState;
  
  // Auth & Team management
  loginAdmin: (email: string, password: string) => Promise<boolean>;
  loginTeam: (teamId: string, accessCode: string) => Promise<boolean>;
  logout: () => void;
  navigate: (view: ViewState) => void;
  updateTeamCoins: (teamId: string, newCoins: number) => { success: boolean; error?: string };
  updateTeamProfile: (teamId: string, profile: { teamName?: string; member1?: string; member2?: string; member3?: string; accessCode?: string }) => void;
  
  // Round 1: Brand Auction Management
  auctionStatus: AuctionStatus;
  setAuctionStatus: (status: AuctionStatus) => void;
  resetAuctionRound: () => void;
  addBrand: (brandData: Omit<Brand, 'id' | 'lotNumber' | 'status'>) => void;
  updateBrand: (brandId: string, brandData: Partial<Brand>) => void;
  deleteBrand: (brandId: string) => void;
  setActiveAuctionBrand: (brandId: string) => void;
  revealBrand: (brandId: string) => void;
  hideBrand: (brandId: string) => void;
  setBrandStatus: (brandId: string, status: BrandStatus) => void;
  confirmAuctionResult: (brandId: string, winningTeamId: string, winningBid: number) => { success: boolean; error?: string };
  revertAuctionResult: (brandId: string) => { success: boolean; error?: string };

  // Round 2: Product Reveal / Vault Round Controls
  roundConfig: RoundControlState;
  products: Product[];
  releaseRoundInfo: () => void;
  hideRoundInfo: () => void;
  releaseRound: () => void;
  pauseRound: () => void;
  completeRound: () => void;
  resetRound: () => void;
  resetProductRevealRound: () => void;
  restoreDefaultProducts: () => void;
  updateRoundDetails: (details: Partial<RoundControlState>) => void;
  setRoundStatus: (status: RoundStatus) => void;
  updateRoundInstructions: (instructions: string) => void;
  updatePuzzle: (puzzle: Partial<ProductRevealPuzzle>) => void;
  submitPuzzleAnswer: (teamId: string, answer: string) => { success: boolean; error?: string };
  selectVaultProduct: (teamId: string, productId: string) => { success: boolean; error?: string };
  addProduct: (productData: Omit<Product, 'id' | 'status' | 'takenByTeamId' | 'takenByTeamNumber' | 'takenAt'>) => void;
  updateProduct: (productId: string, data: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  resetProduct: (productId: string) => void;
  resetRound3: () => void;
  completeRound3: () => void;
  getRound3Leaderboard: () => RoundCompletionItem[];
  getRound2Leaderboard: () => RoundCompletionItem[];

  // Round 3: Morph Cards
  cards: MorphCard[];
  cardTransactions: CardTransaction[];
  cardRoundConfig: CardRoundControlState;
  addCard: (cardData: Omit<MorphCard, 'id' | 'purchasedCount'>) => void;
  updateCard: (cardId: string, cardData: Partial<MorphCard>) => void;
  deleteCard: (cardId: string) => void;
  updateCardRoundConfig: (config: Partial<CardRoundControlState>) => void;
  releaseCardInfo: () => void;
  hideCardInfo: () => void;
  releaseCardPurchase: () => void;
  closeCardPurchase: () => void;
  completeCardRound: () => void;
  resetCardRound: () => void;
  purchaseCard: (teamId: string, cardId: string) => { success: boolean; error?: string };

  // Card Powers & Mechanics
  executeSwapCard: (initiatingTeamId: string, targetTeamId: string) => { success: boolean; error?: string; blockedBySafe?: boolean };
  useBoostCard: (teamId: string) => { success: boolean; error?: string };

  // Brand Conflicts & Puzzles
  brandConflicts: BrandConflict[];
  createBrandConflict: (brandId: string, teamIds: string[], puzzleText: string, correctAnswer: string, puzzleImageUrl?: string) => { success: boolean; error?: string };
  submitConflictAnswer: (conflictId: string, teamId: string, answer: string) => { success: boolean; isWinner?: boolean; error?: string };
  resolveBrandConflictManually: (conflictId: string, winningTeamId: string) => void;
  deleteBrandConflict: (conflictId: string) => void;

  // Admin Notifications Feed
  adminNotifications: AdminNotification[];
  addNotification: (notification: Omit<AdminNotification, 'id' | 'timestamp'>) => void;
  markNotificationsRead: () => void;
  clearNotifications: () => void;

  // Round 4: Product Creation / Overnight Build
  productCreationConfig: ProductCreationConfig;
  releaseProductCreationInfo: () => void;
  hideProductCreationInfo: () => void;
  releaseProductCreationRound: () => void;
  pauseProductCreationRound: () => void;
  completeProductCreationRound: () => void;
  resetProductCreationRound: () => void;
  updateProductCreationConfig: (config: Partial<ProductCreationConfig>) => void;

  // Round 5: Celebrity Reveal / Endorsements
  celebrities: CelebrityCard[];
  celebrityRoundConfig: CelebrityRoundControlState;
  releaseCelebrityInfo: () => void;
  hideCelebrityInfo: () => void;
  releaseCelebrityRound: () => void;
  pauseCelebrityRound: () => void;
  completeCelebrityRound: () => void;
  resetCelebrityRound: () => void;
  updateCelebrityRoundConfig: (config: Partial<CelebrityRoundControlState>) => void;
  addCelebrity: (cardData: Omit<CelebrityCard, 'id'>) => void;
  updateCelebrity: (celebrityId: string, data: Partial<CelebrityCard>) => void;
  deleteCelebrity: (celebrityId: string) => void;
  restoreDefaultCelebrities: () => void;
  spinAdminCelebrityWheel: () => { success: boolean; error?: string; selectedTeam?: Team };
  purchaseMysteryCelebrityForTeam: (teamId: string, celebrityId: string) => { success: boolean; error?: string; celebrity?: CelebrityCard };
  revealCelebrityForTeam: (teamId: string) => { success: boolean; error?: string };
  resetTeamCelebrityPurchase: (teamId: string) => { success: boolean };
  allowTeamToSpin: (teamId: string) => void; // compatibility
  spinWheelForTeam: (teamId: string) => { success: boolean; error?: string; celebrity?: CelebrityCard }; // compatibility
  resetTeamCelebritySpin: (teamId: string) => void; // compatibility

  // Round 6: PR Crisis
  prCrisisConfig: PrCrisisConfig;
  releasePrCrisisInfo: () => void;
  hidePrCrisisInfo: () => void;
  releasePrCrisisRound: () => void;
  pausePrCrisisRound: () => void;
  completePrCrisisRound: () => void;
  resetPrCrisisRound: () => void;
  updatePrCrisisConfig: (config: Partial<PrCrisisConfig>) => void;

  // Round 7: MORPH Market
  marketRoundConfig: MarketRoundControlState;
  marketOpportunities: MarketOpportunity[];
  marketNews: MarketNews[];
  marketTransactions: MarketTransaction[];
  releaseMarketInfo: () => void;
  hideMarketInfo: () => void;
  releaseMarketRound: () => void;
  pauseMarketRound: () => void;
  completeMarketRound: () => void;
  resetMarketRound: () => void;
  updateMarketRoundConfig: (config: Partial<MarketRoundControlState>) => void;
  openTrading: () => void;
  closeTrading: () => void;
  addMarketOpportunity: (opportunityData: Omit<MarketOpportunity, 'id'>) => void;
  updateMarketOpportunity: (opportunityId: string, data: Partial<MarketOpportunity>) => void;
  deleteMarketOpportunity: (opportunityId: string) => void;
  toggleMarketOpportunityStatus: (opportunityId: string) => void;
  addMarketNews: (newsData: Omit<MarketNews, 'id' | 'status' | 'releasedAt'>) => void;
  updateMarketNews: (newsId: string, data: Partial<MarketNews>) => void;
  deleteMarketNews: (newsId: string) => void;
  releaseMarketNews: (newsId: string) => { success: boolean; error?: string };
  releaseMarketNewsPrice: (newsId: string, opportunityId: string) => { success: boolean; error?: string };
  buyMarketOpportunity: (teamId: string, opportunityId: string, amount: number) => { success: boolean; error?: string };
  sellMarketOpportunity: (teamId: string, opportunityId: string, amount: number) => { success: boolean; error?: string };
  getTeamMarketPortfolio: (teamId: string) => TeamMarketPortfolio;
  resetMarketRoundActivity: () => void;

  // Round 8: Final Growth Expansion
  finalGrowthConfig: FinalGrowthConfig;
  releaseFinalGrowthInfo: () => void;
  hideFinalGrowthInfo: () => void;
  releaseFinalGrowthRound: () => void;
  pauseFinalGrowthRound: () => void;
  completeFinalGrowthRound: () => void;
  resetFinalGrowthRound: () => void;
  updateFinalGrowthConfig: (config: Partial<FinalGrowthConfig>) => void;

  // Universal Judging & Scoring Engine (PR Crisis & Final Growth Expansion)
  prCrisisCriteria: JudgingCriterion[];
  prCrisisScores: { [teamId: string]: TeamScoreRecord };
  prCrisisScoresReleased: boolean;
  finalGrowthCriteria: JudgingCriterion[];
  finalGrowthScores: { [teamId: string]: TeamScoreRecord };
  finalGrowthScoresReleased: boolean;
  scoreHistory: ScoreHistoryTransaction[];

  updateJudgingCriteria: (roundId: 'PR_CRISIS' | 'FINAL_GROWTH', criteria: JudgingCriterion[]) => { success: boolean; error?: string };
  addJudgingCriterion: (roundId: 'PR_CRISIS' | 'FINAL_GROWTH', criterion: Omit<JudgingCriterion, 'id' | 'order'>) => { success: boolean; error?: string };
  editJudgingCriterion: (roundId: 'PR_CRISIS' | 'FINAL_GROWTH', criterionId: string, updates: Partial<JudgingCriterion>) => { success: boolean; error?: string };
  deleteJudgingCriterion: (roundId: 'PR_CRISIS' | 'FINAL_GROWTH', criterionId: string) => { success: boolean; error?: string };
  reorderJudgingCriteria: (roundId: 'PR_CRISIS' | 'FINAL_GROWTH', criteria: JudgingCriterion[]) => void;
  resetJudgingCriteriaToDefault: (roundId: 'PR_CRISIS' | 'FINAL_GROWTH') => void;

  setTeamCriterionScore: (roundId: 'PR_CRISIS' | 'FINAL_GROWTH', teamId: string, criterionId: string, score: number) => void;
  confirmTeamScore: (roundId: 'PR_CRISIS' | 'FINAL_GROWTH', teamId: string) => { success: boolean; error?: string; morphCoinsAwarded?: number; balanceDelta?: number };
  unlockTeamScoreForEdit: (roundId: 'PR_CRISIS' | 'FINAL_GROWTH', teamId: string) => void;
  toggleReleaseRoundScores: (roundId: 'PR_CRISIS' | 'FINAL_GROWTH', release: boolean) => void;
  toggleTeamScoreRelease: (roundId: 'PR_CRISIS' | 'FINAL_GROWTH', teamId: string, release: boolean) => void;
  getTeamScoreRecord: (roundId: 'PR_CRISIS' | 'FINAL_GROWTH', teamId: string) => TeamScoreRecord | undefined;
  getRoundJudgingState: (roundId: 'PR_CRISIS' | 'FINAL_GROWTH') => RoundJudgingState;
  getTeamScoreHistory: (teamId: string) => ScoreHistoryTransaction[];

  resetAllData: () => void;
  getAuthenticatedTeam: () => Team | null;
  getTeamWonBrand: (teamId: string) => Brand | null;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

// Gameplay state is authoritative from PostgreSQL. Browser storage is not used.
const STORAGE_KEY_AUTH = 'morph_event_auth_v3';
const STORAGE_KEY_VIEW = 'morph_event_view_v3';

function getSessionAuthState(): AuthState {
  const token = sessionStorage.getItem('morph_access_token');
  if (!token) return { role: 'none', authenticatedTeamId: null };
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { role?: string; sub?: string };
    if (payload.role === 'ADMIN') return { role: 'admin', authenticatedTeamId: null };
    if (payload.role === 'TEAM' && payload.sub) return { role: 'team', authenticatedTeamId: payload.sub };
  } catch {
    sessionStorage.removeItem('morph_access_token');
  }
  return { role: 'none', authenticatedTeamId: null };
}

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isApplyingRemoteUpdateRef = useRef<boolean>(false);

  const [auctionStatus, setAuctionStatusState] = useState<AuctionStatus>('LOCKED');
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [brands, setBrands] = useState<Brand[]>(INITIAL_BRANDS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [roundConfig, setRoundConfig] = useState<RoundControlState>(INITIAL_ROUND_CONFIG);
  const [activeBrandId, setActiveBrandId] = useState<string | null>(INITIAL_BRANDS[0]?.id || null);
  const [auctionHistory, setAuctionHistory] = useState<AuctionHistoryItem[]>([]);
  const [logs, setLogs] = useState<CoinUpdateLog[]>([]);
  const [cards, setCards] = useState<MorphCard[]>(INITIAL_CARDS);
  const [cardTransactions, setCardTransactions] = useState<CardTransaction[]>([]);
  const [cardRoundConfig, setCardRoundConfig] = useState<CardRoundControlState>(INITIAL_CARD_ROUND_CONFIG);
  const [brandConflicts, setBrandConflicts] = useState<BrandConflict[]>([]);
  const [productCreationConfig, setProductCreationConfig] = useState<ProductCreationConfig>(INITIAL_PRODUCT_CREATION_CONFIG);
  const [celebrities, setCelebrities] = useState<CelebrityCard[]>(INITIAL_CELEBRITIES);
  const [celebrityRoundConfig, setCelebrityRoundConfig] = useState<CelebrityRoundControlState>(INITIAL_CELEBRITY_ROUND_CONFIG);
  const [prCrisisConfig, setPrCrisisConfig] = useState<PrCrisisConfig>(INITIAL_PR_CRISIS_CONFIG);
  const [marketRoundConfig, setMarketRoundConfig] = useState<MarketRoundControlState>(INITIAL_MARKET_ROUND_CONFIG);
  const [marketOpportunities, setMarketOpportunities] = useState<MarketOpportunity[]>(INITIAL_MARKET_OPPORTUNITIES);
  const [marketNews, setMarketNews] = useState<MarketNews[]>(INITIAL_MARKET_NEWS);
  const [marketPortfolios, setMarketPortfolios] = useState<{ [teamId: string]: TeamMarketPortfolio }>({});
  const [marketTransactions, setMarketTransactions] = useState<MarketTransaction[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [finalGrowthConfig, setFinalGrowthConfig] = useState<FinalGrowthConfig>(INITIAL_FINAL_GROWTH_CONFIG);
  const [prCrisisCriteria, setPrCrisisCriteria] = useState<JudgingCriterion[]>(INITIAL_PR_CRISIS_CRITERIA);
  const [finalGrowthCriteria, setFinalGrowthCriteria] = useState<JudgingCriterion[]>(INITIAL_FINAL_GROWTH_CRITERIA);
  const [prCrisisScores, setPrCrisisScores] = useState<{ [teamId: string]: TeamScoreRecord }>({});
  const [finalGrowthScores, setFinalGrowthScores] = useState<{ [teamId: string]: TeamScoreRecord }>({});
  const [prCrisisScoresReleased, setPrCrisisScoresReleased] = useState<boolean>(false);
  const [finalGrowthScoresReleased, setFinalGrowthScoresReleased] = useState<boolean>(false);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistoryTransaction[]>([]);

  const [authState, setAuthState] = useState<AuthState>(() => {
    const sessionAuth = getSessionAuthState();
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY_AUTH);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.role === 'admin' || parsed.role === 'team' || parsed.role === 'none')) {
          return parsed;
        }
      }
    } catch { /* ignore */ }
    return sessionAuth;
  });

  const [currentView, setCurrentView] = useState<ViewState>(() => {
    const sessionAuth = getSessionAuthState();
    return sessionAuth.role === 'admin'
      ? 'admin-dashboard'
      : sessionAuth.role === 'team'
        ? 'team-dashboard'
        : 'landing';
  });

  // Persist only auth and view to sessionStorage (not gameplay state)
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(authState));
    } catch { /* ignore */ }
  }, [authState]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY_VIEW, currentView);
    } catch { /* ignore */ }
  }, [currentView]);

  // --- INITIAL STATE FETCH FROM BACKEND ON MOUNT ---
  useEffect(() => {
    const token = sessionStorage.getItem('morph_access_token');
    if (!token) return;

    fetchGameState().then(({ state }) => {
      if (!state || Object.keys(state).length === 0) return;
      isApplyingRemoteUpdateRef.current = true;

      if (state.auctionStatus) setAuctionStatusState(state.auctionStatus as AuctionStatus);
      if (typeof state.activeBrandId === 'string' || state.activeBrandId === null) setActiveBrandId(state.activeBrandId as string | null);
      if (Array.isArray(state.teams)) setTeams(calculateRankings(state.teams as Team[]));
      if (Array.isArray(state.brands)) setBrands(state.brands as Brand[]);
      if (Array.isArray(state.auctionHistory)) setAuctionHistory(state.auctionHistory as AuctionHistoryItem[]);
      if (Array.isArray(state.logs)) setLogs(state.logs as CoinUpdateLog[]);
      if (Array.isArray(state.products)) setProducts(state.products as Product[]);
      if (Array.isArray(state.cards)) setCards(state.cards as MorphCard[]);
      if (Array.isArray(state.cardTransactions)) setCardTransactions(state.cardTransactions as CardTransaction[]);
      if (Array.isArray(state.brandConflicts)) setBrandConflicts(state.brandConflicts as BrandConflict[]);
      if (Array.isArray(state.adminNotifications)) setAdminNotifications(state.adminNotifications as AdminNotification[]);
      if (Array.isArray(state.celebrities)) setCelebrities(state.celebrities as CelebrityCard[]);
      if (Array.isArray(state.marketOpportunities)) setMarketOpportunities(state.marketOpportunities as MarketOpportunity[]);
      if (Array.isArray(state.marketNews)) setMarketNews(state.marketNews as MarketNews[]);
      if (state.marketPortfolios && typeof state.marketPortfolios === 'object') setMarketPortfolios(state.marketPortfolios as { [teamId: string]: TeamMarketPortfolio });
      if (Array.isArray(state.marketTransactions)) setMarketTransactions(state.marketTransactions as MarketTransaction[]);
      if (Array.isArray(state.prCrisisCriteria)) setPrCrisisCriteria(state.prCrisisCriteria as JudgingCriterion[]);
      if (Array.isArray(state.finalGrowthCriteria)) setFinalGrowthCriteria(state.finalGrowthCriteria as JudgingCriterion[]);
      if (state.prCrisisScores && typeof state.prCrisisScores === 'object') setPrCrisisScores(state.prCrisisScores as { [teamId: string]: TeamScoreRecord });
      if (state.finalGrowthScores && typeof state.finalGrowthScores === 'object') setFinalGrowthScores(state.finalGrowthScores as { [teamId: string]: TeamScoreRecord });
      if (typeof state.prCrisisScoresReleased === 'boolean') setPrCrisisScoresReleased(state.prCrisisScoresReleased);
      if (typeof state.finalGrowthScoresReleased === 'boolean') setFinalGrowthScoresReleased(state.finalGrowthScoresReleased);
      if (Array.isArray(state.scoreHistory)) setScoreHistory(state.scoreHistory as ScoreHistoryTransaction[]);
      if (state.roundConfig && typeof state.roundConfig === 'object') setRoundConfig(state.roundConfig as RoundControlState);
      if (state.cardRoundConfig && typeof state.cardRoundConfig === 'object') setCardRoundConfig(state.cardRoundConfig as CardRoundControlState);
      if (state.productCreationConfig && typeof state.productCreationConfig === 'object') setProductCreationConfig(state.productCreationConfig as ProductCreationConfig);
      if (state.celebrityRoundConfig && typeof state.celebrityRoundConfig === 'object') setCelebrityRoundConfig(state.celebrityRoundConfig as CelebrityRoundControlState);
      if (state.prCrisisConfig && typeof state.prCrisisConfig === 'object') setPrCrisisConfig(state.prCrisisConfig as PrCrisisConfig);
      if (state.marketRoundConfig && typeof state.marketRoundConfig === 'object') setMarketRoundConfig(state.marketRoundConfig as MarketRoundControlState);
      if (state.finalGrowthConfig && typeof state.finalGrowthConfig === 'object') setFinalGrowthConfig(state.finalGrowthConfig as FinalGrowthConfig);

      setTimeout(() => { isApplyingRemoteUpdateRef.current = false; }, 100);
    }).catch(() => undefined);
  }, []);

  // Admin is the source of truth; team browsers receive real-time state broadcasts.
  useEffect(() => {
    const unsubscribe = listenToGameState((data) => {
      // Admin publishes state; avoid overwriting local admin working state with stale snapshots
      if (authState.role === 'admin') return;

      const state = (data.gameState || data) as Record<string, unknown>;

      if (!data.gameState && !data.auctionStatus && !data.teams) return;

      isApplyingRemoteUpdateRef.current = true;

      // Round 1
      if (
        state.auctionStatus === 'LOCKED' ||
        state.auctionStatus === 'ACTIVE' ||
        state.auctionStatus === 'COMPLETED'
      ) {
        setAuctionStatusState(state.auctionStatus);
      }

      if (typeof state.activeBrandId === 'string' || state.activeBrandId === null) {
        setActiveBrandId(state.activeBrandId as string | null);
      }

      if (Array.isArray(state.teams)) setTeams(calculateRankings(state.teams as Team[]));
      if (Array.isArray(state.brands)) setBrands(state.brands as Brand[]);
      if (Array.isArray(state.auctionHistory)) setAuctionHistory(state.auctionHistory as AuctionHistoryItem[]);
      if (Array.isArray(state.logs)) setLogs(state.logs as CoinUpdateLog[]);
      if (Array.isArray(state.products)) setProducts(state.products as Product[]);
      if (Array.isArray(state.cards)) setCards(state.cards as MorphCard[]);
      if (Array.isArray(state.cardTransactions)) setCardTransactions(state.cardTransactions as CardTransaction[]);
      if (Array.isArray(state.brandConflicts)) setBrandConflicts(state.brandConflicts as BrandConflict[]);
      if (Array.isArray(state.adminNotifications)) setAdminNotifications(state.adminNotifications as AdminNotification[]);
      if (Array.isArray(state.celebrities)) setCelebrities(state.celebrities as CelebrityCard[]);

      // Market
      if (Array.isArray(state.marketOpportunities)) {
        setMarketOpportunities(state.marketOpportunities as MarketOpportunity[]);
      }
      if (Array.isArray(state.marketNews)) {
        setMarketNews(state.marketNews as MarketNews[]);
      }
      if (state.marketPortfolios && typeof state.marketPortfolios === 'object') {
        setMarketPortfolios(
          state.marketPortfolios as { [teamId: string]: TeamMarketPortfolio }
        );
      }
      if (Array.isArray(state.marketTransactions)) {
        setMarketTransactions(state.marketTransactions as MarketTransaction[]);
      }

      // Judging
      if (Array.isArray(state.prCrisisCriteria)) {
        setPrCrisisCriteria(state.prCrisisCriteria as JudgingCriterion[]);
      }
      if (Array.isArray(state.finalGrowthCriteria)) {
        setFinalGrowthCriteria(state.finalGrowthCriteria as JudgingCriterion[]);
      }
      if (state.prCrisisScores && typeof state.prCrisisScores === 'object') {
        setPrCrisisScores(
          state.prCrisisScores as { [teamId: string]: TeamScoreRecord }
        );
      }
      if (state.finalGrowthScores && typeof state.finalGrowthScores === 'object') {
        setFinalGrowthScores(
          state.finalGrowthScores as { [teamId: string]: TeamScoreRecord }
        );
      }
      if (typeof state.prCrisisScoresReleased === 'boolean') {
        setPrCrisisScoresReleased(state.prCrisisScoresReleased);
      }
      if (typeof state.finalGrowthScoresReleased === 'boolean') {
        setFinalGrowthScoresReleased(state.finalGrowthScoresReleased);
      }
      if (Array.isArray(state.scoreHistory)) {
        setScoreHistory(state.scoreHistory as ScoreHistoryTransaction[]);
      }

      // Round 2
      if (state.roundConfig && typeof state.roundConfig === 'object') {
        setRoundConfig(state.roundConfig as RoundControlState);
      }

      // Round 3
      if (state.cardRoundConfig && typeof state.cardRoundConfig === 'object') {
        setCardRoundConfig(state.cardRoundConfig as CardRoundControlState);
      }

      // Round 4
      if (
        state.productCreationConfig &&
        typeof state.productCreationConfig === 'object'
      ) {
        setProductCreationConfig(
          state.productCreationConfig as ProductCreationConfig
        );
      }

      // Round 5
      if (
        state.celebrityRoundConfig &&
        typeof state.celebrityRoundConfig === 'object'
      ) {
        setCelebrityRoundConfig(
          state.celebrityRoundConfig as CelebrityRoundControlState
        );
      }

      // Round 6
      if (state.prCrisisConfig && typeof state.prCrisisConfig === 'object') {
        setPrCrisisConfig(state.prCrisisConfig as PrCrisisConfig);
      }

      // Round 7
      if (
        state.marketRoundConfig &&
        typeof state.marketRoundConfig === 'object'
      ) {
        setMarketRoundConfig(
          state.marketRoundConfig as MarketRoundControlState
        );
      }

      // Round 8
      if (
        state.finalGrowthConfig &&
        typeof state.finalGrowthConfig === 'object'
      ) {
        setFinalGrowthConfig(
          state.finalGrowthConfig as FinalGrowthConfig
        );
      }
    });

    return () => unsubscribe();
  }, [authState.role]);

  // Publish state updates to Firestore with echo prevention (Admin only)
  useEffect(() => {
    if (authState.role !== 'admin') return;

    if (isApplyingRemoteUpdateRef.current) {
      isApplyingRemoteUpdateRef.current = false;
      return;
    }

    const state = {
      auctionStatus,
      activeBrandId,
      teams,
      brands,
      auctionHistory,
      logs,
      products,
      roundConfig,
      cards,
      cardTransactions,
      cardRoundConfig,
      brandConflicts,
      adminNotifications,
      productCreationConfig,
      celebrities,
      celebrityRoundConfig,
      prCrisisConfig,
      marketRoundConfig,
      marketOpportunities,
      marketNews,
      marketPortfolios,
      marketTransactions,
      finalGrowthConfig,
      prCrisisCriteria,
      finalGrowthCriteria,
      prCrisisScores,
      finalGrowthScores,
      prCrisisScoresReleased,
      finalGrowthScoresReleased,
      scoreHistory,
    };

    updateGameState({ gameState: state }).catch((error) => {
      console.warn('Game-state sync notice:', error?.message || error);
    });
  }, [
    authState.role,
    auctionStatus,
    activeBrandId,
    teams,
    brands,
    auctionHistory,
    logs,
    products,
    roundConfig,
    cards,
    cardTransactions,
    cardRoundConfig,
    brandConflicts,
    adminNotifications,
    productCreationConfig,
    celebrities,
    celebrityRoundConfig,
    prCrisisConfig,
    marketRoundConfig,
    marketOpportunities,
    marketNews,
    marketPortfolios,
    marketTransactions,
    finalGrowthConfig,
    prCrisisCriteria,
    finalGrowthCriteria,
    prCrisisScores,
    finalGrowthScores,
    prCrisisScoresReleased,
    finalGrowthScoresReleased,
    scoreHistory,
  ]);

  // Cross-tab sync is handled by SSE; no StorageEvent listener needed.

 const loginAdmin = async (email: string, password: string): Promise<boolean> => {
  try {
    await loginAdminWithApi(email, password);
    setAuthState({ role: 'admin', authenticatedTeamId: null });
    setCurrentView('admin-dashboard');
    return true;
  } catch {
    return false;
  }
};

  const loginTeam = async (teamIdOrIdentifier: string, accessCode: string): Promise<boolean> => {
    if (!teamIdOrIdentifier || !accessCode) return false;
    const cleanInput = teamIdOrIdentifier.trim().toLowerCase();

    const targetTeam = teams.find((t) => {
      const tid = t.id.toLowerCase();
      const tNumStr = t.teamNumber.toLowerCase(); // "team 01"
      const tNumClean = tNumStr.replace(/\s+/g, ''); // "team01"
      const tDigits = t.teamNumber.replace(/\D/g, ''); // "01"
      const tIntStr = parseInt(tDigits, 10).toString(); // "1"
      
      const inputDigits = cleanInput.replace(/\D/g, '');
      const inputIntStr = inputDigits ? parseInt(inputDigits, 10).toString() : '';

      return (
        tid === cleanInput ||
        tid === `team-${cleanInput}` ||
        `team-${tid}` === cleanInput ||
        tNumStr === cleanInput ||
        tNumClean === cleanInput.replace(/\s+/g, '') ||
        (inputDigits.length > 0 && (tDigits === inputDigits || tIntStr === inputIntStr))
      );
    });

    if (!targetTeam) return false;

    try {
      const authenticated = await loginTeamWithApi(Number(targetTeam.teamNumber.replace(/\D/g, '')), accessCode.trim());
      setAuthState({ role: 'team', authenticatedTeamId: targetTeam.id });
      setCurrentView('team-dashboard');
      return Boolean(authenticated.teamId);
    } catch {
      return false;
    }
  };

  const logout = () => {
    setAuthState({ role: 'none', authenticatedTeamId: null });
    setCurrentView('landing');
    sessionStorage.removeItem(STORAGE_KEY_AUTH);
    sessionStorage.removeItem(STORAGE_KEY_VIEW);
    sessionStorage.removeItem('morph_access_token');
  };

  const navigate = (view: ViewState) => {
    if (view === 'admin-dashboard' && authState.role !== 'admin') {
      setCurrentView('admin-login');
      return;
    }
    if (view === 'team-dashboard' && (!authState.authenticatedTeamId || authState.role !== 'team')) {
      setCurrentView('team-login');
      return;
    }
    setCurrentView(view);
  };

  const updateTeamCoins = (teamId: string, newCoins: number): { success: boolean; error?: string } => {
    if (isNaN(newCoins) || newCoins < 0) {
      return { success: false, error: 'Morph Coins cannot be negative or invalid.' };
    }

    const currentTeam = teams.find((t) => t.id === teamId);
    if (!currentTeam) {
      return { success: false, error: 'Team not found.' };
    }

    const previousBalance = currentTeam.morphCoins;
    const updatedRaw = teams.map((t) => {
      if (t.id === teamId) {
        return { ...t, morphCoins: Math.round(newCoins) };
      }
      return t;
    });

    const newlyRanked = calculateRankings(updatedRaw);
    setTeams(newlyRanked);

    const newLog: CoinUpdateLog = {
      id: Date.now().toString(),
      teamId,
      teamNumber: currentTeam.teamNumber,
      previousBalance,
      newBalance: Math.round(newCoins),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      note: 'Admin manual balance adjustment',
    };

    setLogs((prev) => [newLog, ...prev]);
    return { success: true };
  };

  const updateTeamProfile = (
    teamId: string,
    profile: { teamName?: string; member1?: string; member2?: string; member3?: string; accessCode?: string }
  ) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          return {
            ...t,
            teamName: profile.teamName ?? t.teamName,
            member1: profile.member1 ?? t.member1,
            member2: profile.member2 ?? t.member2,
            member3: profile.member3 ?? t.member3,
            accessCode: profile.accessCode ? profile.accessCode.toUpperCase() : t.accessCode,
          };
        }
        return t;
      })
    );
  };

  // --- AUCTION OPERATIONS ---

  const setAuctionStatus = (status: AuctionStatus) => {
    setAuctionStatusState(status);
  };

  const addBrand = (brandData: Omit<Brand, 'id' | 'lotNumber' | 'status'>) => {
    const nextLot = brands.length > 0 ? Math.max(...brands.map((b) => b.lotNumber)) + 1 : 1;
    const newBrand: Brand = {
      ...brandData,
      id: `brand_${Date.now()}`,
      lotNumber: nextLot,
      status: 'HIDDEN',
    };
    setBrands((prev) => [...prev, newBrand]);
  };

  const updateBrand = (brandId: string, brandData: Partial<Brand>) => {
    setBrands((prev) =>
      prev.map((b) => {
        if (b.id === brandId) {
          return { ...b, ...brandData };
        }
        return b;
      })
    );
  };

  const deleteBrand = (brandId: string) => {
    const brandToDelete = brands.find((b) => b.id === brandId);
    const brandName = brandToDelete?.name;

    setBrands((prev) => {
      const filtered = prev.filter((b) => b.id !== brandId);
      // re-number lot numbers
      return filtered.map((b, idx) => ({ ...b, lotNumber: idx + 1 }));
    });

    // Clean up any team holding this brand
    setTeams((prev) =>
      prev.map((t) => {
        if (t.brandId === brandId || (brandName && t.brand === brandName)) {
          return {
            ...t,
            brand: '—',
            brandId: null,
            winningBid: null,
          };
        }
        return t;
      })
    );

    // Clean from auction history
    setAuctionHistory((prev) => prev.filter((h) => h.brandId !== brandId));

    if (activeBrandId === brandId) {
      const remaining = brands.filter((b) => b.id !== brandId);
      setActiveBrandId(remaining[0]?.id || null);
    }
  };

  const setActiveAuctionBrand = (brandId: string) => {
    setActiveBrandId(brandId);
  };

  const revealBrand = (brandId: string) => {
    setBrands((prev) =>
      prev.map((b) => {
        if (b.id === brandId) {
          return { ...b, status: 'AVAILABLE' };
        }
        return b;
      })
    );
    setActiveBrandId(brandId);
  };

  const hideBrand = (brandId: string) => {
    setBrands((prev) =>
      prev.map((b) => {
        if (b.id === brandId) {
          return { ...b, status: 'HIDDEN' };
        }
        return b;
      })
    );
  };

  const setBrandStatus = (brandId: string, status: BrandStatus) => {
    setBrands((prev) =>
      prev.map((b) => {
        if (b.id === brandId) {
          return { ...b, status };
        }
        return b;
      })
    );
  };

  const confirmAuctionResult = (
    brandId: string,
    winningTeamId: string,
    winningBid: number
  ): { success: boolean; error?: string } => {
    const targetBrand = brands.find((b) => b.id === brandId);
    if (!targetBrand) {
      return { success: false, error: 'Selected brand does not exist.' };
    }

    if (targetBrand.status === 'SOLD') {
      return { success: false, error: `This brand is already marked as SOLD to ${targetBrand.winningTeamNumber}.` };
    }

    if (!winningTeamId) {
      return { success: false, error: 'Please select a winning team.' };
    }

    const targetTeam = teams.find((t) => t.id === winningTeamId);
    if (!targetTeam) {
      return { success: false, error: 'Winning team not found.' };
    }

    if (isNaN(winningBid) || winningBid <= 0) {
      return { success: false, error: 'Winning bid must be a positive numerical value.' };
    }

    if (winningBid > targetTeam.morphCoins) {
      return {
        success: false,
        error: `Insufficient Morph Coins! ${targetTeam.teamNumber} only has ${targetTeam.morphCoins.toLocaleString()} coins, cannot bid ${winningBid.toLocaleString()}.`,
      };
    }

    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newCoins = targetTeam.morphCoins - winningBid;

    // 1. Update team coins & assign brand
    const updatedRawTeams = teams.map((t) => {
      if (t.id === winningTeamId) {
        return {
          ...t,
          morphCoins: newCoins,
          brand: targetBrand.name,
          brandId: targetBrand.id,
          winningBid,
        };
      }
      return t;
    });

    const rankedTeams = calculateRankings(updatedRawTeams);
    setTeams(rankedTeams);

    // 2. Mark brand as SOLD
    setBrands((prev) =>
      prev.map((b) => {
        if (b.id === brandId) {
          return {
            ...b,
            status: 'SOLD',
            winningTeamId: targetTeam.id,
            winningTeamNumber: targetTeam.teamNumber,
            winningBid,
            soldAt: timestampStr,
          };
        }
        return b;
      })
    );

    // 3. Add to auction history
    const historyEntry: AuctionHistoryItem = {
      id: `hist_${Date.now()}`,
      lotNumber: targetBrand.lotNumber,
      brandId: targetBrand.id,
      brandName: targetBrand.name,
      basePrice: targetBrand.basePrice,
      winningTeamId: targetTeam.id,
      winningTeamNumber: targetTeam.teamNumber,
      winningBid,
      status: 'SOLD',
      timestamp: timestampStr,
    };
    setAuctionHistory((prev) => [historyEntry, ...prev]);

    // 4. Record coin deduction in logs
    const coinLog: CoinUpdateLog = {
      id: Date.now().toString(),
      teamId: targetTeam.id,
      teamNumber: targetTeam.teamNumber,
      previousBalance: targetTeam.morphCoins,
      newBalance: newCoins,
      timestamp: timestampStr,
      note: `Won auction lot for ${targetBrand.name} (-${winningBid.toLocaleString()} coins)`,
    };
    setLogs((prev) => [coinLog, ...prev]);

    // 5. Trigger notification
    addNotification({
      type: 'auction_win',
      title: 'AUCTION LOT SOLD',
      message: `🏆 AUCTION WIN: ${targetTeam.teamNumber} won ${targetBrand.name} for ₹${winningBid.toLocaleString()} Morph Coins.`,
      teamId: targetTeam.id,
      teamNumber: targetTeam.teamNumber,
      brandName: targetBrand.name,
    });

    return { success: true };
  };

  const revertAuctionResult = (brandId: string): { success: boolean; error?: string } => {
    const targetBrand = brands.find((b) => b.id === brandId);
    if (!targetBrand || targetBrand.status !== 'SOLD' || !targetBrand.winningTeamId || !targetBrand.winningBid) {
      return { success: false, error: 'Cannot revert an auction lot that is not sold.' };
    }

    const winningTeam = teams.find((t) => t.id === targetBrand.winningTeamId);
    const restoredCoins = winningTeam ? winningTeam.morphCoins + targetBrand.winningBid : 0;

    if (winningTeam) {
      const updatedRawTeams = teams.map((t) => {
        if (t.id === targetBrand.winningTeamId) {
          return {
            ...t,
            morphCoins: restoredCoins,
            brand: '—',
            brandId: null,
            winningBid: null,
          };
        }
        return t;
      });
      setTeams(calculateRankings(updatedRawTeams));
    }

    setBrands((prev) =>
      prev.map((b) => {
        if (b.id === brandId) {
          return {
            ...b,
            status: 'HIDDEN',
            winningTeamId: null,
            winningTeamNumber: null,
            winningBid: null,
            soldAt: null,
          };
        }
        return b;
      })
    );

    setAuctionHistory((prev) => prev.filter((h) => h.brandId !== brandId));

    return { success: true };
  };

  const resetAuctionRound = () => {
    // 1. Refund all winning bids to teams and clear brand ownership
    setTeams((prev) => {
      const updated = prev.map((t) => {
        const refund = t.winningBid || 0;
        return {
          ...t,
          morphCoins: t.morphCoins + refund,
          brand: '—',
          brandId: null,
          winningBid: null,
        };
      });
      return calculateRankings(updated);
    });

    // 2. Reset all brands to AVAILABLE state and clear winning data
    setBrands((prev) =>
      prev.map((b) => ({
        ...b,
        status: 'AVAILABLE',
        winningTeamId: null,
        winningTeamNumber: null,
        winningBid: null,
        soldAt: null,
      }))
    );

    // 3. Clear active brand and auction history
    setActiveBrandId(null);
    setAuctionHistory([]);

    // 4. Lock auction status
    setAuctionStatus('LOCKED');

    // 5. Notify
    addNotification({
      type: 'round_change',
      title: 'AUCTION ROUND RESET',
      message: 'Admin reset the Brand Auction. All winning bids refunded and brand lots restored.',
    });
  };

  const releaseRoundInfo = () => {
    setRoundConfig((prev) => ({
      ...prev,
      infoReleased: true,
      status: prev.roundStatus === 'ACTIVE' ? 'ACTIVE' : prev.roundStatus === 'COMPLETED' ? 'COMPLETED' : 'RELEASED',
    }));
  };

  const hideRoundInfo = () => {
    setRoundConfig((prev) => ({
      ...prev,
      infoReleased: false,
      roundStatus: 'LOCKED',
      status: 'LOCKED',
    }));
  };

  const releaseRound = () => {
    setRoundConfig((prev) => ({
      ...prev,
      infoReleased: true,
      roundStatus: 'ACTIVE',
      status: 'ACTIVE',
    }));
  };

  const pauseRound = () => {
    setRoundConfig((prev) => ({
      ...prev,
      roundStatus: 'LOCKED',
      status: prev.infoReleased ? 'RELEASED' : 'LOCKED',
    }));
  };

  const completeRound = () => {
    setRoundConfig((prev) => ({
      ...prev,
      roundStatus: 'COMPLETED',
      status: 'COMPLETED',
    }));
  };

  const resetRound = () => {
    // Reset products back to available
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        status: 'AVAILABLE',
        takenByTeamId: null,
        takenByTeamNumber: null,
        takenAt: null,
      }))
    );

    // Reset teams' round completion details
    setTeams((prev) =>
      prev.map((t) => ({
        ...t,
        product: '—',
        productId: null,
        puzzleSolved: false,
        puzzleSolvedAt: null,
        productSelectedAt: null,
        completionPosition: null,
      }))
    );

    // Set round status to LOCKED and infoReleased to false
    setRoundConfig((prev) => ({
      ...prev,
      infoReleased: false,
      roundStatus: 'LOCKED',
      status: 'LOCKED',
    }));
  };

  const updateRoundDetails = (details: Partial<RoundControlState>) => {
    setRoundConfig((prev) => ({
      ...prev,
      ...details,
    }));
  };

  const setRoundStatus = (status: RoundStatus) => {
    setRoundConfig((prev) => {
      let isInfo = prev.infoReleased;
      let activity: RoundActivityStatus = prev.roundStatus;
      if (status === 'LOCKED') {
        isInfo = false;
        activity = 'LOCKED';
      } else if (status === 'RELEASED') {
        isInfo = true;
        activity = 'LOCKED';
      } else if (status === 'ACTIVE') {
        isInfo = true;
        activity = 'ACTIVE';
      } else if (status === 'COMPLETED') {
        isInfo = true;
        activity = 'COMPLETED';
      }
      return {
        ...prev,
        status,
        infoReleased: isInfo,
        roundStatus: activity,
      };
    });
  };

  const updateRoundInstructions = (instructions: string) => {
    setRoundConfig((prev) => ({
      ...prev,
      instructions,
    }));
  };

  const updatePuzzle = (puzzleData: Partial<ProductRevealPuzzle>) => {
    setRoundConfig((prev) => ({
      ...prev,
      puzzle: {
        ...prev.puzzle,
        ...puzzleData,
      },
    }));
  };

  const submitPuzzleAnswer = async (teamId: string, answer: string): Promise<{ success: boolean; error?: string }> => {
    const targetTeam = teams.find((t) => t.id === teamId);
    if (!targetTeam) return { success: false, error: 'Team not found.' };

    try {
      const result = await submitRiddleAnswerApi(answer);
      if (!result.correct) {
        return { success: false, error: 'INCORRECT ANSWER' };
      }

      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setTeams((prev) =>
        prev.map((t) => {
          if (t.id === teamId) {
            return {
              ...t,
              puzzleSolved: true,
              puzzleSolvedAt: t.puzzleSolvedAt || timeStr,
            };
          }
          return t;
        })
      );

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to submit answer' };
    }
  };

  const selectVaultProduct = async (teamId: string, productId: string): Promise<{ success: boolean; error?: string }> => {
    const targetTeam = teams.find((t) => t.id === teamId);
    if (!targetTeam) return { success: false, error: 'Team not found.' };

    if (targetTeam.product && targetTeam.product !== '—') {
      return { success: false, error: `Your team has already claimed ${targetTeam.product}.` };
    }

    try {
      await selectProductApi(productId);

      const targetProduct = products.find((p) => p.id === productId);
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            return {
              ...p,
              status: 'TAKEN',
              takenByTeamId: targetTeam.id,
              takenByTeamNumber: targetTeam.teamNumber,
              takenAt: timeStr,
            };
          }
          return p;
        })
      );

      setTeams((prev) =>
        prev.map((t) => {
          if (t.id === teamId) {
            return {
              ...t,
              product: targetProduct?.name || '—',
              productId: targetProduct?.id || null,
              productSelectedAt: timeStr,
            };
          }
          return t;
        })
      );

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Product selection failed' };
    }
  };

  const addProduct = (productData: Omit<Product, 'id' | 'status' | 'takenByTeamId' | 'takenByTeamNumber' | 'takenAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
      status: 'AVAILABLE',
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProduct = (productId: string, data: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...data } : p))
    );
  };

  const deleteProduct = (productId: string) => {
    const prodToDelete = products.find((p) => p.id === productId);
    const prodName = prodToDelete?.name;

    setProducts((prev) => prev.filter((p) => p.id !== productId));

    // Clean up any team holding this product
    setTeams((prev) =>
      prev.map((t) => {
        if (t.productId === productId || (prodName && t.product === prodName)) {
          return {
            ...t,
            product: '—',
            productId: null,
            productSelectedAt: null,
          };
        }
        return t;
      })
    );
  };

  const resetProduct = (productId: string) => {
    const prodToReset = products.find((p) => p.id === productId);
    const prodName = prodToReset?.name;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              status: 'AVAILABLE',
              takenByTeamId: null,
              takenByTeamNumber: null,
              takenAt: null,
            }
          : p
      )
    );

    // Clean up any team holding this product
    setTeams((prev) =>
      prev.map((t) => {
        if (t.productId === productId || (prodName && t.product === prodName)) {
          return {
            ...t,
            product: '—',
            productId: null,
            productSelectedAt: null,
          };
        }
        return t;
      })
    );
  };

  const restoreDefaultProducts = () => {
    setProducts(INITIAL_PRODUCTS);
    setTeams((prevTeams) =>
      prevTeams.map((t) => {
        if (t.productId && !INITIAL_PRODUCTS.some((p) => p.id === t.productId)) {
          return {
            ...t,
            product: '—',
            productId: null,
            productSelectedAt: null,
          };
        }
        return t;
      })
    );
  };

  const resetProductRevealRound = resetRound;

  // --- MORPH CARD OPERATIONS ---

  const addCard = (cardData: Omit<MorphCard, 'id' | 'purchasedCount'>) => {
    const newCard: MorphCard = {
      ...cardData,
      id: `card_${Date.now()}`,
      purchasedCount: 0,
    };
    setCards((prev) => [...prev, newCard]);
  };

  const updateCard = (cardId: string, cardData: Partial<MorphCard>) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, ...cardData } : c))
    );
  };

  const deleteCard = (cardId: string) => {
    const cardToDelete = cards.find((c) => c.id === cardId);
    const cardName = cardToDelete?.name;

    setCards((prev) => prev.filter((c) => c.id !== cardId));

    if (cardName) {
      setTeams((prev) =>
        prev.map((t) => ({
          ...t,
          cards: (t.cards || []).filter((c) => c !== cardName),
        }))
      );
    }
  };

  const releaseCardInfo = () => {
    setCardRoundConfig((prev) => ({
      ...prev,
      infoReleased: true,
    }));
  };

  const hideCardInfo = () => {
    setCardRoundConfig((prev) => ({
      ...prev,
      infoReleased: false,
      purchaseStatus: 'CLOSED',
      roundStatus: 'LOCKED',
    }));
  };

  const releaseCardPurchase = () => {
    setCardRoundConfig((prev) => ({
      ...prev,
      infoReleased: true,
      purchaseStatus: 'OPEN',
      roundStatus: 'ACTIVE',
    }));
  };

  const closeCardPurchase = () => {
    setCardRoundConfig((prev) => ({
      ...prev,
      purchaseStatus: 'CLOSED',
      roundStatus: 'LOCKED',
    }));
  };

  const completeCardRound = () => {
    setCardRoundConfig((prev) => ({
      ...prev,
      purchaseStatus: 'CLOSED',
      roundStatus: 'COMPLETED',
    }));
  };

  const resetCardRound = () => {
    // Reset cards purchased counts
    setCards((prev) => prev.map((c) => ({ ...c, purchasedCount: 0 })));

    // Refund all card transaction costs back to teams
    setTeams((prev) => {
      const refunds: Record<string, number> = {};
      cardTransactions.forEach((tx) => {
        refunds[tx.teamId] = (refunds[tx.teamId] || 0) + tx.price;
      });

      const updated = prev.map((t) => {
        const refundAmount = refunds[t.id] || 0;
        return {
          ...t,
          morphCoins: t.morphCoins + refundAmount,
          cards: [],
        };
      });

      return calculateRankings(updated);
    });

    setCardTransactions([]);
    setCardRoundConfig({
      infoReleased: false,
      purchaseStatus: 'CLOSED',
      roundStatus: 'LOCKED',
    });
  };

  const purchaseCard = async (teamId: string, cardId: string): Promise<{ success: boolean; error?: string }> => {
    if (cardRoundConfig.purchaseStatus !== 'OPEN') {
      return { success: false, error: 'CARD PURCHASES ARE CURRENTLY CLOSED BY ADMIN.' };
    }

    const targetTeam = teams.find((t) => t.id === teamId);
    if (!targetTeam) {
      return { success: false, error: 'Team not found.' };
    }

    const targetCard = cards.find((c) => c.id === cardId);
    if (!targetCard) {
      return { success: false, error: 'Selected card does not exist.' };
    }

    try {
      const result = await purchaseCardApi(cardId);
      const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const updatedRawTeams = teams.map((t) => {
        if (t.id === teamId) {
          return {
            ...t,
            morphCoins: result.balance,
            cards: [...(t.cards || []), targetCard.name],
          };
        }
        return t;
      });

      setTeams(calculateRankings(updatedRawTeams));

      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, purchasedCount: c.purchasedCount + 1 } : c))
      );

      const newTx: CardTransaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        teamId: targetTeam.id,
        teamNumber: targetTeam.teamNumber,
        teamName: targetTeam.teamName,
        cardId: targetCard.id,
        cardName: targetCard.name,
        price: targetCard.price,
        timePurchased: timestampStr,
        status: 'PURCHASED',
      };
      setCardTransactions((prev) => [newTx, ...prev]);

      const coinLog: CoinUpdateLog = {
        id: Date.now().toString(),
        teamId: targetTeam.id,
        teamNumber: targetTeam.teamNumber,
        previousBalance: targetTeam.morphCoins,
        newBalance: result.balance,
        timestamp: timestampStr,
        note: `Purchased ${targetCard.name} Morph Card (-${targetCard.price.toLocaleString()} coins)`,
      };
      setLogs((prev) => [coinLog, ...prev]);

      addNotification({
        type: 'purchase',
        title: 'CARD PURCHASED',
        message: `💳 CARD PURCHASE: ${targetTeam.teamNumber} acquired [${targetCard.name}] for ₹${targetCard.price.toLocaleString()} Morph Coins.`,
        teamId: targetTeam.id,
        teamNumber: targetTeam.teamNumber,
        cardName: targetCard.name,
      });

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Card purchase failed' };
    }
  };

  // Card Powers & Mechanics
  const executeSwapCard = (
    initiatingTeamId: string,
    targetTeamId: string
  ): { success: boolean; error?: string; blockedBySafe?: boolean } => {
    const initiatingTeam = teams.find((t) => t.id === initiatingTeamId);
    const targetTeam = teams.find((t) => t.id === targetTeamId);

    if (!initiatingTeam || !targetTeam) {
      return { success: false, error: 'Invalid team selected for swap.' };
    }

    if (initiatingTeam.id === targetTeam.id) {
      return { success: false, error: 'Cannot swap assets with your own team.' };
    }

    // Check if initiating team owns a SWAP card
    if (!initiatingTeam.cards || !initiatingTeam.cards.includes('SWAP')) {
      return { success: false, error: 'Your team does not possess an active SWAP card.' };
    }

    // Check if initiating team has a brand
    if (!initiatingTeam.brand || initiatingTeam.brand === '—') {
      return { success: false, error: 'Your team does not currently own a brand to swap.' };
    }

    // Check if target team has a brand
    if (!targetTeam.brand || targetTeam.brand === '—') {
      return { success: false, error: `${targetTeam.teamNumber} does not currently own a brand to swap.` };
    }

    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Check if target team has a SAFE card active
    if (targetTeam.cards && targetTeam.cards.includes('SAFE')) {
      // Safe card blocks swap!
      addNotification({
        type: 'swap_blocked',
        title: 'SWAP BLOCKED BY SAFE CARD',
        message: `🛡 SWAP BLOCKED: ${initiatingTeam.teamNumber} attempted to swap with ${targetTeam.teamNumber}, but ${targetTeam.teamNumber} was protected by a SAFE card.`,
        teamId: initiatingTeam.id,
        teamNumber: initiatingTeam.teamNumber,
        targetTeamId: targetTeam.id,
        targetTeamNumber: targetTeam.teamNumber,
      });

      return {
        success: false,
        blockedBySafe: true,
        error: `SWAP BLOCKED: ${targetTeam.teamNumber} is protected by a SAFE Card! Asset exchange negated.`,
      };
    }

    // Execute swap:
    const team1Brand = initiatingTeam.brand;
    const team1BrandId = initiatingTeam.brandId;
    const team1WinningBid = initiatingTeam.winningBid;

    const team2Brand = targetTeam.brand;
    const team2BrandId = targetTeam.brandId;
    const team2WinningBid = targetTeam.winningBid;

    // Remove 1 SWAP from initiatingTeam.cards and add to usedCards
    const team1Cards = [...(initiatingTeam.cards || [])];
    const swapIdx = team1Cards.indexOf('SWAP');
    if (swapIdx !== -1) {
      team1Cards.splice(swapIdx, 1);
    }
    const team1Used = [...(initiatingTeam.usedCards || []), 'SWAP'];

    // Update teams
    const updatedRawTeams = teams.map((t) => {
      if (t.id === initiatingTeam.id) {
        return {
          ...t,
          brand: team2Brand,
          brandId: team2BrandId,
          winningBid: team2WinningBid,
          cards: team1Cards,
          usedCards: team1Used,
        };
      }
      if (t.id === targetTeam.id) {
        return {
          ...t,
          brand: team1Brand,
          brandId: team1BrandId,
          winningBid: team1WinningBid,
        };
      }
      return t;
    });

    setTeams(calculateRankings(updatedRawTeams));

    // Update brands in catalog if matching
    setBrands((prev) =>
      prev.map((b) => {
        if (b.id === team1BrandId) {
          return { ...b, winningTeamId: targetTeam.id, winningTeamNumber: targetTeam.teamNumber };
        }
        if (b.id === team2BrandId) {
          return { ...b, winningTeamId: initiatingTeam.id, winningTeamNumber: initiatingTeam.teamNumber };
        }
        return b;
      })
    );

    // Notification
    addNotification({
      type: 'swap_success',
      title: 'TACTICAL ASSET SWAP EXECUTED',
      message: `🔄 SWAP EXECUTED: ${initiatingTeam.teamNumber} swapped ${team1Brand} for ${targetTeam.teamNumber}'s ${team2Brand}.`,
      teamId: initiatingTeam.id,
      teamNumber: initiatingTeam.teamNumber,
      targetTeamId: targetTeam.id,
      targetTeamNumber: targetTeam.teamNumber,
    });

    return { success: true };
  };

  const useBoostCard = (teamId: string): { success: boolean; error?: string } => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return { success: false, error: 'Team not found.' };

    if (!team.cards || !team.cards.includes('BOOST')) {
      return { success: false, error: 'Your team does not possess an active BOOST card.' };
    }

    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const boostBonus = 3000;
    const newCoins = team.morphCoins + boostBonus;

    const teamCards = [...(team.cards || [])];
    const boostIdx = teamCards.indexOf('BOOST');
    if (boostIdx !== -1) {
      teamCards.splice(boostIdx, 1);
    }
    const usedCards = [...(team.usedCards || []), 'BOOST'];

    const updatedRawTeams = teams.map((t) => {
      if (t.id === team.id) {
        return {
          ...t,
          morphCoins: newCoins,
          cards: teamCards,
          usedCards,
        };
      }
      return t;
    });

    setTeams(calculateRankings(updatedRawTeams));

    const coinLog: CoinUpdateLog = {
      id: Date.now().toString(),
      teamId: team.id,
      teamNumber: team.teamNumber,
      previousBalance: team.morphCoins,
      newBalance: newCoins,
      timestamp: timestampStr,
      note: `Activated BOOST Morph Card (+${boostBonus.toLocaleString()} coins)`,
    };
    setLogs((prev) => [coinLog, ...prev]);

    addNotification({
      type: 'boost_used',
      title: 'BOOST CARD ACTIVATED',
      message: `⚡ BOOST ACTIVATED: ${team.teamNumber} activated BOOST (+₹${boostBonus.toLocaleString()} Morph Coins).`,
      teamId: team.id,
      teamNumber: team.teamNumber,
    });

    return { success: true };
  };

  // Brand Conflicts & Puzzles
  const createBrandConflict = (
    brandId: string,
    teamIds: string[],
    puzzleText: string,
    correctAnswer: string,
    puzzleImageUrl?: string
  ): { success: boolean; error?: string } => {
    const targetBrand = brands.find((b) => b.id === brandId);
    if (!targetBrand) return { success: false, error: 'Brand not found.' };
    if (teamIds.length < 2) return { success: false, error: 'At least 2 conflicting teams must be selected.' };

    const selectedTeams = teams.filter((t) => teamIds.includes(t.id));
    const conflictingTeamNumbers = selectedTeams.map((t) => t.teamNumber);

    const conflictId = `conflict_${Date.now()}`;
    const newConflict: BrandConflict = {
      id: conflictId,
      brandId: targetBrand.id,
      brandName: targetBrand.name,
      conflictingTeamIds: teamIds,
      conflictingTeamNumbers,
      puzzleText: puzzleText.trim() || `DECRYPT CIPHER: Solve the tiebreaker riddle to claim ${targetBrand.name}.`,
      puzzleImageUrl: puzzleImageUrl || '',
      correctAnswer: correctAnswer.trim().toLowerCase(),
      status: 'ACTIVE',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setBrandConflicts((prev) => [newConflict, ...prev]);

    // Mark brand as CONTESTED
    setBrands((prev) =>
      prev.map((b) => (b.id === brandId ? { ...b, status: 'CONTESTED' } : b))
    );

    addNotification({
      type: 'conflict',
      title: 'BRAND CONFLICT INITIATED',
      message: `⚠️ BRAND CONFLICT: ${conflictingTeamNumbers.join(' and ')} are in conflict for ${targetBrand.name}. Tiebreaker puzzle active.`,
      brandName: targetBrand.name,
    });

    return { success: true };
  };

  const submitConflictAnswer = async (
    conflictId: string,
    teamId: string,
    answer: string
  ): Promise<{ success: boolean; isWinner?: boolean; error?: string }> => {
    const conflict = brandConflicts.find((c) => c.id === conflictId);
    if (!conflict) return { success: false, error: 'Conflict not found.' };
    if (conflict.status !== 'ACTIVE') {
      return { success: false, error: `This conflict is already resolved (Won by ${conflict.winnerTeamNumber}).` };
    }

    if (!conflict.conflictingTeamIds.includes(teamId)) {
      return { success: false, error: 'Your team is not a participant in this conflict.' };
    }

    const team = teams.find((t) => t.id === teamId);
    if (!team) return { success: false, error: 'Team not found.' };

    try {
      const result = await answerConflictApi(conflictId, answer);

      if (!result.correct) {
        return { success: false, isWinner: false, error: 'INCORRECT ANSWER: Decryption key failed. Try again.' };
      }

      const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setBrandConflicts((prev) =>
        prev.map((c) =>
          c.id === conflictId
            ? {
                ...c,
                status: 'RESOLVED',
                winnerTeamId: team.id,
                winnerTeamNumber: team.teamNumber,
                resolvedAt: timestampStr,
              }
            : c
        )
      );

      const brandObj = brands.find((b) => b.id === conflict.brandId);
      if (brandObj) {
        setBrands((prev) =>
          prev.map((b) =>
            b.id === conflict.brandId
              ? {
                  ...b,
                  status: 'SOLD',
                  winningTeamId: team.id,
                  winningTeamNumber: team.teamNumber,
                  soldAt: timestampStr,
                }
              : b
          )
        );

        const updatedRawTeams = teams.map((t) => {
          if (t.id === team.id) {
            return {
              ...t,
              brand: brandObj.name,
              brandId: brandObj.id,
            };
          }
          if (conflict.conflictingTeamIds.includes(t.id) && t.brandId === conflict.brandId) {
            return {
              ...t,
              brand: '—',
              brandId: null,
            };
          }
          return t;
        });

        setTeams(calculateRankings(updatedRawTeams));
      }

      addNotification({
        type: 'conflict',
        title: 'CONFLICT RESOLVED BY PUZZLE',
        message: `🧩 CONFLICT RESOLVED: ${team.teamNumber} solved the tiebreaker puzzle and secured ${conflict.brandName}!`,
        teamId: team.id,
        teamNumber: team.teamNumber,
        brandName: conflict.brandName,
      });

      return { success: true, isWinner: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to submit answer' };
    }
  };

  const resolveBrandConflictManually = (conflictId: string, winningTeamId: string) => {
    const conflict = brandConflicts.find((c) => c.id === conflictId);
    if (!conflict) return;
    const team = teams.find((t) => t.id === winningTeamId);
    if (!team) return;

    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setBrandConflicts((prev) =>
      prev.map((c) =>
        c.id === conflictId
          ? {
              ...c,
              status: 'RESOLVED',
              winnerTeamId: team.id,
              winnerTeamNumber: team.teamNumber,
              resolvedAt: timestampStr,
            }
          : c
      )
    );

    const brandObj = brands.find((b) => b.id === conflict.brandId);
    if (brandObj) {
      setBrands((prev) =>
        prev.map((b) =>
          b.id === conflict.brandId
            ? {
                ...b,
                status: 'SOLD',
                winningTeamId: team.id,
                winningTeamNumber: team.teamNumber,
                soldAt: timestampStr,
              }
            : b
        )
      );

      const updatedRawTeams = teams.map((t) => {
        if (t.id === team.id) {
          return {
            ...t,
            brand: brandObj.name,
            brandId: brandObj.id,
          };
        }
        if (conflict.conflictingTeamIds.includes(t.id) && t.brandId === conflict.brandId) {
          return {
            ...t,
            brand: '—',
            brandId: null,
          };
        }
        return t;
      });

      setTeams(calculateRankings(updatedRawTeams));
    }

    addNotification({
      type: 'conflict',
      title: 'ADMIN RESOLVED CONFLICT',
      message: `🏆 CONFLICT RESOLVED: Admin awarded ${conflict.brandName} to ${team.teamNumber}.`,
      teamId: team.id,
      teamNumber: team.teamNumber,
      brandName: conflict.brandName,
    });
  };

  const deleteBrandConflict = (conflictId: string) => {
    const conflict = brandConflicts.find((c) => c.id === conflictId);
    if (conflict) {
      if (conflict.status === 'ACTIVE') {
        // Revert brand status back to AVAILABLE
        setBrands((prev) =>
          prev.map((b) => (b.id === conflict.brandId ? { ...b, status: 'AVAILABLE' } : b))
        );
      }
    }
    setBrandConflicts((prev) => prev.filter((c) => c.id !== conflictId));
  };

  // Notifications
  const addNotification = (notification: Omit<AdminNotification, 'id' | 'timestamp'>) => {
    const newNotif: AdminNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setAdminNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationsRead = () => {
    setAdminNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setAdminNotifications([]);
  };

  const resetRound3 = () => resetRound();

  const completeRound3 = () => completeRound();

  const getRound3Leaderboard = (): RoundCompletionItem[] => {
    const completed = teams.filter((t) => t.product && t.product !== '—' && t.productSelectedAt);
    completed.sort((a, b) => (a.productSelectedAt || '').localeCompare(b.productSelectedAt || ''));

    const result: RoundCompletionItem[] = [];

    completed.forEach((t, index) => {
      result.push({
        position: index + 1,
        teamId: t.id,
        teamNumber: t.teamNumber,
        teamName: t.teamName,
        puzzleSolved: true,
        puzzleSolvedAt: t.puzzleSolvedAt || null,
        productName: t.product,
        productSelectedAt: t.productSelectedAt || null,
      });
    });

    const notCompleted = teams.filter((t) => !t.product || t.product === '—' || !t.productSelectedAt);
    notCompleted.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

    notCompleted.forEach((t) => {
      result.push({
        position: 0,
        teamId: t.id,
        teamNumber: t.teamNumber,
        teamName: t.teamName,
        puzzleSolved: !!t.puzzleSolved,
        puzzleSolvedAt: t.puzzleSolvedAt || null,
        productName: '—',
        productSelectedAt: null,
      });
    });

    return result;
  };

  const getRound2Leaderboard = (): RoundCompletionItem[] => getRound3Leaderboard();

  // --- ROUND 4: PRODUCT CREATION / OVERNIGHT BUILD ---

  const releaseProductCreationInfo = () => {
    setProductCreationConfig((prev) => ({
      ...prev,
      infoReleased: true,
    }));
  };

  const hideProductCreationInfo = () => {
    setProductCreationConfig((prev) => ({
      ...prev,
      infoReleased: false,
      roundStatus: 'LOCKED',
    }));
  };

  const releaseProductCreationRound = () => {
    setProductCreationConfig((prev) => ({
      ...prev,
      infoReleased: true,
      roundStatus: 'ACTIVE',
    }));
  };

  const pauseProductCreationRound = () => {
    setProductCreationConfig((prev) => ({
      ...prev,
      roundStatus: 'LOCKED',
    }));
  };

  const completeProductCreationRound = () => {
    setProductCreationConfig((prev) => ({
      ...prev,
      roundStatus: 'COMPLETED',
    }));
  };

  const updateCardRoundConfig = (config: Partial<CardRoundControlState>) => {
    setCardRoundConfig((prev) => ({
      ...prev,
      ...config,
    }));
  };

  const resetProductCreationRound = () => {
    setProductCreationConfig((prev) => ({
      ...prev,
      infoReleased: false,
      roundStatus: 'LOCKED',
    }));
    addNotification({
      type: 'round_change',
      title: 'PRODUCT CREATION RESET',
      message: 'Admin reset Product Creation round status.',
    });
  };

  const updateProductCreationConfig = (config: Partial<ProductCreationConfig>) => {
    setProductCreationConfig((prev) => ({
      ...prev,
      ...config,
    }));
  };

  // --- ROUND 5: CELEBRITY REVEAL / ENDORSEMENTS ---

  const releaseCelebrityInfo = () => {
    setCelebrityRoundConfig((prev) => ({
      ...prev,
      infoReleased: true,
    }));
  };

  const hideCelebrityInfo = () => {
    setCelebrityRoundConfig((prev) => ({
      ...prev,
      infoReleased: false,
      roundStatus: 'LOCKED',
    }));
  };

  const releaseCelebrityRound = () => {
    setCelebrityRoundConfig((prev) => ({
      ...prev,
      infoReleased: true,
      roundStatus: 'ACTIVE',
    }));
  };

  const pauseCelebrityRound = () => {
    setCelebrityRoundConfig((prev) => ({
      ...prev,
      roundStatus: 'LOCKED',
    }));
  };

  const completeCelebrityRound = () => {
    setCelebrityRoundConfig((prev) => ({
      ...prev,
      roundStatus: 'COMPLETED',
    }));
  };

  const resetCelebrityRound = () => {
    // 1. Refund all teams who purchased celebrities during this round
    setTeams((prev) => {
      const updated = prev.map((t) => {
        const refund = t.celebrityPurchasePrice || 0;
        return {
          ...t,
          morphCoins: t.morphCoins + refund,
          celebrityId: undefined,
          celebrityMysteryNumber: undefined,
          celebrityName: undefined,
          celebrityRevealed: false,
          celebritySpinTime: undefined,
          celebrityPurchasePrice: undefined,
          celebrityPurchaseTime: undefined,
        };
      });
      return calculateRankings(updated);
    });

    // 2. Restore all celebrity cards to AVAILABLE without wiping configurations
    setCelebrities((prev) =>
      prev.map((c) => ({
        ...c,
        status: 'AVAILABLE',
        assignedTeamId: undefined,
        assignedTeamNumber: undefined,
        purchasedPrice: undefined,
        purchaseTime: undefined,
        spinTime: undefined,
        isIdentityRevealed: false,
        revealedAt: undefined,
      }))
    );

    // 3. Reset round activity and spin history while keeping info/objective/rules
    setCelebrityRoundConfig((prev) => ({
      ...prev,
      infoReleased: false,
      roundStatus: 'LOCKED',
      selectedTeamId: null,
      selectedTeamNumber: null,
      selectedAt: null,
      spinHistory: [],
    }));

    addNotification({
      type: 'round_change',
      title: 'CELEBRITY REVEAL ROUND RESET',
      message: 'Admin reset Celebrity Reveal round activity. All celebrity cards returned to deck and spent coins refunded.',
    });
  };

  const updateCelebrityRoundConfig = (config: Partial<CelebrityRoundControlState>) => {
    setCelebrityRoundConfig((prev) => ({
      ...prev,
      ...config,
    }));
  };

  const addCelebrity = (cardData: Omit<CelebrityCard, 'id'>) => {
    const newCard: CelebrityCard = {
      ...cardData,
      id: `celeb_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    };
    setCelebrities((prev) => [...prev, newCard]);
  };

  const updateCelebrity = (celebrityId: string, data: Partial<CelebrityCard>) => {
    setCelebrities((prev) =>
      prev.map((c) => (c.id === celebrityId ? { ...c, ...data } : c))
    );
  };

  const deleteCelebrity = (celebrityId: string) => {
    setCelebrities((prev) => prev.filter((c) => c.id !== celebrityId));
  };

  const restoreDefaultCelebrities = () => {
    setCelebrities(INITIAL_CELEBRITIES);
    addNotification({
      type: 'round_change',
      title: 'CELEBRITY DECK RESTORED',
      message: 'Official 20 Celebrity Deck was reset and synchronized to default data.',
    });
  };

  // ADMIN-ONLY SPIN WHEEL: Randomly selects ONE team from those that have not yet selected/purchased a celebrity
  const spinAdminCelebrityWheel = (): { success: boolean; error?: string; selectedTeam?: Team } => {
    const eligibleTeams = teams.filter((t) => !t.celebrityId);
    if (eligibleTeams.length === 0) {
      return { success: false, error: 'All teams have already selected a celebrity card, or no eligible teams remaining.' };
    }

    const randomIndex = Math.floor(Math.random() * eligibleTeams.length);
    const chosenTeam = eligibleTeams[randomIndex];
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setCelebrityRoundConfig((prev) => {
      const history = prev.spinHistory || [];
      const newSpinItem: CelebritySpinHistoryItem = {
        id: `spin_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        spinNumber: history.length + 1,
        teamId: chosenTeam.id,
        teamNumber: chosenTeam.teamNumber,
        teamName: chosenTeam.teamName,
        timestamp: timestampStr,
      };
      return {
        ...prev,
        selectedTeamId: chosenTeam.id,
        selectedTeamNumber: chosenTeam.teamNumber,
        selectedAt: timestampStr,
        spinHistory: [newSpinItem, ...history],
      };
    });

    addNotification({
      type: 'round_change',
      title: 'TEAM SELECTED BY SPIN WHEEL',
      message: `🎰 ADMIN WHEEL: ${chosenTeam.teamNumber} (${chosenTeam.teamName}) was selected! They may now choose an available Mystery Celebrity card.`,
      teamId: chosenTeam.id,
      teamNumber: chosenTeam.teamNumber,
    });

    return { success: true, selectedTeam: chosenTeam };
  };

  // TEAM / ADMIN PURCHASE: Selected team chooses and purchases a mystery celebrity card
  const purchaseMysteryCelebrityForTeam = async (
    teamId: string,
    celebrityId: string
  ): Promise<{ success: boolean; error?: string; celebrity?: CelebrityCard }> => {
    const targetTeam = teams.find((t) => t.id === teamId);
    if (!targetTeam) {
      return { success: false, error: 'Team not found.' };
    }

    if (targetTeam.celebrityId) {
      return { success: false, error: `${targetTeam.teamNumber} has already claimed a celebrity card.` };
    }

    const targetCard = celebrities.find((c) => c.id === celebrityId);
    if (!targetCard) {
      return { success: false, error: 'Selected celebrity card does not exist.' };
    }

    try {
      const result = await purchaseCelebrityApi(celebrityId);
      const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const updatedRawTeams = teams.map((t) => {
        if (t.id === teamId) {
          return {
            ...t,
            morphCoins: result.balance,
            celebrityId: targetCard.id,
            celebrityMysteryNumber: targetCard.celebrityNumber,
            celebrityName: targetCard.name,
            celebrityRevealed: false,
            celebritySpinTime: timestampStr,
            celebrityPurchasePrice: targetCard.price,
            celebrityPurchaseTime: timestampStr,
          };
        }
        return t;
      });

      setTeams(calculateRankings(updatedRawTeams));

      setCelebrities((prev) =>
        prev.map((c) =>
          c.id === celebrityId
            ? {
                ...c,
                status: 'TAKEN',
                assignedTeamId: targetTeam.id,
                assignedTeamNumber: targetTeam.teamNumber,
                purchasedPrice: targetCard.price,
                purchaseTime: timestampStr,
                spinTime: timestampStr,
                isIdentityRevealed: false,
              }
            : c
        )
      );

      setCelebrityRoundConfig((prev) => ({
        ...prev,
        selectedTeamId: null,
        selectedTeamNumber: null,
        selectedAt: null,
      }));

      const coinLog: CoinUpdateLog = {
        id: Date.now().toString(),
        teamId: targetTeam.id,
        teamNumber: targetTeam.teamNumber,
        previousBalance: targetTeam.morphCoins,
        newBalance: result.balance,
        timestamp: timestampStr,
        note: `Purchased Mystery Celebrity #${targetCard.celebrityNumber} (-₹${targetCard.price.toLocaleString()} coins)`,
      };
      setLogs((prev) => [coinLog, ...prev]);

      addNotification({
        type: 'purchase',
        title: 'MYSTERY CELEBRITY PURCHASED',
        message: `🌟 ${targetTeam.teamNumber} acquired Mystery Celebrity #${targetCard.celebrityNumber} for ₹${targetCard.price.toLocaleString()} Morph Coins! (Identity remains locked).`,
        teamId: targetTeam.id,
        teamNumber: targetTeam.teamNumber,
      });

      return { success: true, celebrity: targetCard };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Celebrity purchase failed' };
    }
  };

  // ADMIN-ONLY REVEAL: Reveals the celebrity name & photograph for a team
  const revealCelebrityForTeam = (teamId: string): { success: boolean; error?: string } => {
    const team = teams.find((t) => t.id === teamId);
    if (!team || !team.celebrityId) {
      return { success: false, error: 'Team does not have a purchased celebrity card.' };
    }

    const celeb = celebrities.find((c) => c.id === team.celebrityId);
    if (!celeb) {
      return { success: false, error: 'Assigned celebrity card not found.' };
    }

    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setCelebrities((prev) =>
      prev.map((c) =>
        c.id === celeb.id
          ? {
              ...c,
              isIdentityRevealed: true,
              revealedAt: timestampStr,
            }
          : c
      )
    );

    setTeams((prev) =>
      prev.map((t) =>
        t.id === team.id
          ? {
              ...t,
              celebrityRevealed: true,
            }
          : t
      )
    );

    addNotification({
      type: 'round_change',
      title: 'CELEBRITY OFFICIALLY REVEALED',
      message: `🌟 OFFICIAL REVEAL: Mystery Celebrity #${celeb.celebrityNumber} is ${celeb.name} for ${team.teamNumber}!`,
      teamId: team.id,
      teamNumber: team.teamNumber,
    });

    return { success: true };
  };

  const resetTeamCelebrityPurchase = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;

    const celebId = team.celebrityId;
    const refundPrice = team.celebrityPurchasePrice || 0;

    if (celebId) {
      setCelebrities((prev) =>
        prev.map((c) =>
          c.id === celebId
            ? {
                ...c,
                status: 'AVAILABLE',
                assignedTeamId: undefined,
                assignedTeamNumber: undefined,
                purchasedPrice: undefined,
                purchaseTime: undefined,
                spinTime: undefined,
                revealedAt: undefined,
                isIdentityRevealed: false,
              }
            : c
        )
      );
    }

    setTeams((prev) => {
      const updated = prev.map((t) =>
        t.id === teamId
          ? {
              ...t,
              morphCoins: t.morphCoins + refundPrice,
              celebrityId: undefined,
              celebrityMysteryNumber: undefined,
              celebrityName: undefined,
              celebrityRevealed: false,
              celebritySpinTime: undefined,
              celebrityPurchasePrice: undefined,
              celebrityPurchaseTime: undefined,
            }
          : t
      );
      return calculateRankings(updated);
    });

    addNotification({
      type: 'round_change',
      title: 'CELEBRITY PURCHASE CANCELLED',
      message: `Admin reverted celebrity purchase for ${team.teamNumber}. Refunded ₹${refundPrice.toLocaleString()} coins.`,
      teamId: team.id,
      teamNumber: team.teamNumber,
    });

    return { success: true };
  };

  // Compatibility wrappers
  const allowTeamToSpin = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;
    setCelebrityRoundConfig((prev) => ({
      ...prev,
      selectedTeamId: team.id,
      selectedTeamNumber: team.teamNumber,
      selectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    }));
  };

  const spinWheelForTeam = (teamId: string) => {
    // Forward to random purchase if called
    const available = celebrities.filter((c) => c.status === 'AVAILABLE');
    if (available.length === 0) return { success: false, error: 'No available celebrities.' };
    const randomIndex = Math.floor(Math.random() * available.length);
    return purchaseMysteryCelebrityForTeam(teamId, available[randomIndex].id);
  };

  const resetTeamCelebritySpin = (teamId: string) => {
    resetTeamCelebrityPurchase(teamId);
  };

  // =========================================================================
  // ROUND 6: PR CRISIS CONTROLS
  // =========================================================================
  const releasePrCrisisInfo = () => {
    setPrCrisisConfig((prev) => ({ ...prev, infoReleased: true }));
    addNotification({
      type: 'round_change',
      title: 'PR CRISIS BRIEFING RELEASED',
      message: 'Admin released the PR Crisis Briefing & Submission Guidelines to all teams.',
    });
  };

  const hidePrCrisisInfo = () => {
    setPrCrisisConfig((prev) => ({ ...prev, infoReleased: false }));
  };

  const releasePrCrisisRound = () => {
    setPrCrisisConfig((prev) => ({ ...prev, roundStatus: 'ACTIVE', infoReleased: true }));
    addNotification({
      type: 'round_change',
      title: 'ROUND 6: PR CRISIS ACTIVE',
      message: 'Admin activated Round 6: PR Crisis. Emergency response protocol is now live.',
    });
  };

  const pausePrCrisisRound = () => {
    setPrCrisisConfig((prev) => ({ ...prev, roundStatus: 'LOCKED' }));
    addNotification({
      type: 'round_change',
      title: 'PR CRISIS PAUSED',
      message: 'Admin paused Round 6: PR Crisis countdown.',
    });
  };

  const completePrCrisisRound = () => {
    setPrCrisisConfig((prev) => ({ ...prev, roundStatus: 'COMPLETED' }));
    addNotification({
      type: 'round_change',
      title: 'PR CRISIS COMPLETED',
      message: 'Admin completed Round 6: PR Crisis.',
    });
  };

  const resetPrCrisisRound = () => {
    // 1. Revert any confirmed PR Crisis judging score awards from team balances
    const scoresToRevert = Object.values(prCrisisScores) as TeamScoreRecord[];
    const affectedTeams: { teamNumber: string; revertedCoins: number }[] = [];

    setTeams((prevTeams) => {
      let modified = false;
      const updated = prevTeams.map((team) => {
        const teamScore = prCrisisScores[team.id];
        const awardedCoins = teamScore?.lastAwardedCoins || 0;
        if (awardedCoins > 0) {
          modified = true;
          affectedTeams.push({ teamNumber: team.teamNumber, revertedCoins: awardedCoins });
          return {
            ...team,
            morphCoins: Math.max(0, team.morphCoins - awardedCoins),
          };
        }
        return team;
      });
      return modified ? calculateRankings(updated) : prevTeams;
    });

    // 2. Log score rollback in history and general logs
    if (scoresToRevert.length > 0) {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newHistoryEntries: ScoreHistoryTransaction[] = [];
      const newLogs: CoinUpdateLog[] = [];

      scoresToRevert.forEach((scoreRec) => {
        if ((scoreRec.lastAwardedCoins || 0) > 0) {
          const targetTeam = teams.find((t) => t.id === scoreRec.teamId);
          if (targetTeam) {
            newHistoryEntries.push({
              id: `hist_reset_pr_${scoreRec.teamId}_${Date.now()}`,
              roundId: 'PR_CRISIS',
              teamId: scoreRec.teamId,
              teamNumber: targetTeam.teamNumber,
              type: 'ROUND_RESET',
              previousScore: scoreRec.weightedScore,
              newScore: 0,
              previousAwardedCoins: scoreRec.lastAwardedCoins || 0,
              newAwardedCoins: 0,
              deltaCoins: -(scoreRec.lastAwardedCoins || 0),
              timestamp: nowStr,
              adminNote: 'Round 6: PR Crisis reset by Admin. Judging coin rewards rolled back.',
            });

            newLogs.push({
              id: `log_reset_pr_${scoreRec.teamId}_${Date.now()}`,
              teamId: scoreRec.teamId,
              teamNumber: targetTeam.teamNumber,
              previousBalance: targetTeam.morphCoins,
              newBalance: Math.max(0, targetTeam.morphCoins - (scoreRec.lastAwardedCoins || 0)),
              timestamp: nowStr,
              note: `PR Crisis Reset: -₹${(scoreRec.lastAwardedCoins || 0).toLocaleString()} coins reverted`,
            });
          }
        }
      });

      if (newHistoryEntries.length > 0) {
        setScoreHistory((prev) => [...newHistoryEntries, ...prev]);
      }
      if (newLogs.length > 0) {
        setLogs((prev) => [...newLogs, ...prev]);
      }
    }

    // 3. Reset scores and release flags
    setPrCrisisScores({});
    setPrCrisisScoresReleased(false);

    // 4. Reset round status to locked but keep case study content
    setPrCrisisConfig((prev) => ({
      ...prev,
      roundStatus: 'LOCKED',
      infoReleased: false,
    }));

    addNotification({
      type: 'round_change',
      title: 'PR CRISIS RESET',
      message: `Admin reset Round 6: PR Crisis. Judging scores wiped and ${affectedTeams.length} team balances restored to pre-round state.`,
    });
  };

  const updatePrCrisisConfig = (config: Partial<PrCrisisConfig>) => {
    setPrCrisisConfig((prev) => ({ ...prev, ...config }));
  };

  // =========================================================================
  // ROUND 7: MORPH MARKET CONTROLS & TRADING ENGINE
  // =========================================================================
  const releaseMarketInfo = () => {
    setMarketRoundConfig((prev) => ({ ...prev, infoReleased: true }));
    addNotification({
      type: 'round_change',
      title: 'MORPH MARKET OVERVIEW RELEASED',
      message: 'Admin released the MORPH Market rules and opportunity catalog.',
    });
  };

  const hideMarketInfo = () => {
    setMarketRoundConfig((prev) => ({ ...prev, infoReleased: false }));
  };

  const releaseMarketRound = () => {
    setMarketRoundConfig((prev) => ({ ...prev, roundStatus: 'ACTIVE', infoReleased: true }));
    addNotification({
      type: 'round_change',
      title: 'ROUND 7: MORPH MARKET ACTIVE',
      message: 'Admin activated Round 7: MORPH Market.',
    });
  };

  const pauseMarketRound = () => {
    setMarketRoundConfig((prev) => ({ ...prev, roundStatus: 'LOCKED', tradingStatus: 'CLOSED' }));
    addNotification({
      type: 'round_change',
      title: 'MORPH MARKET PAUSED',
      message: 'Admin paused MORPH Market round and closed trading desk.',
    });
  };

  const completeMarketRound = () => {
    setMarketRoundConfig((prev) => ({ ...prev, roundStatus: 'COMPLETED', tradingStatus: 'CLOSED' }));
    addNotification({
      type: 'round_change',
      title: 'MORPH MARKET COMPLETED',
      message: 'Admin closed MORPH Market round. Final investment portfolio valuations locked.',
    });
  };

  const resetMarketRound = () => {
    setMarketRoundConfig(INITIAL_MARKET_ROUND_CONFIG);
    resetMarketRoundActivity();
    addNotification({
      type: 'round_change',
      title: 'MORPH MARKET FULL RESET',
      message: 'Admin reset MORPH Market configuration, trading states, and portfolios.',
    });
  };

  const updateMarketRoundConfig = (config: Partial<MarketRoundControlState>) => {
    setMarketRoundConfig((prev) => ({ ...prev, ...config }));
  };

  const openTrading = () => {
    setMarketRoundConfig((prev) => ({ ...prev, tradingStatus: 'OPEN', roundStatus: 'ACTIVE', infoReleased: true }));
    addNotification({
      type: 'round_change',
      title: '📈 TRADING DESK OPEN',
      message: 'Admin has OPENED MORPH Market trading! Teams can now BUY and SELL opportunity positions.',
    });
  };

  const closeTrading = () => {
    setMarketRoundConfig((prev) => ({ ...prev, tradingStatus: 'CLOSED' }));
    addNotification({
      type: 'round_change',
      title: '🔒 TRADING DESK CLOSED',
      message: 'Admin has CLOSED MORPH Market trading. Orders are paused.',
    });
  };

  // Opportunities CRUD
  const addMarketOpportunity = (opportunityData: Omit<MarketOpportunity, 'id'>) => {
    const newId = `opp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newOpp: MarketOpportunity = {
      ...opportunityData,
      id: newId,
      currentValue: opportunityData.currentValue ?? opportunityData.startingValue,
      changePercent: 0,
    };
    setMarketOpportunities((prev) => [...prev, newOpp]);
  };

  const updateMarketOpportunity = (opportunityId: string, data: Partial<MarketOpportunity>) => {
    setMarketOpportunities((prev) =>
      prev.map((opp) => (opp.id === opportunityId ? { ...opp, ...data } : opp))
    );
  };

  const deleteMarketOpportunity = (opportunityId: string) => {
    setMarketOpportunities((prev) => prev.filter((opp) => opp.id !== opportunityId));
  };

  const toggleMarketOpportunityStatus = (opportunityId: string) => {
    setMarketOpportunities((prev) =>
      prev.map((opp) =>
        opp.id === opportunityId
          ? { ...opp, status: opp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
          : opp
      )
    );
  };

  // News CRUD & Release Engine
  const addMarketNews = (newsData: Omit<MarketNews, 'id' | 'status' | 'releasedAt'>) => {
    const newId = `news_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newNews: MarketNews = {
      ...newsData,
      id: newId,
      status: 'DRAFT',
    };
    setMarketNews((prev) => [...prev, newNews]);
  };

  const updateMarketNews = (newsId: string, data: Partial<MarketNews>) => {
    setMarketNews((prev) =>
      prev.map((item) => (item.id === newsId ? { ...item, ...data } : item))
    );
  };

  const deleteMarketNews = (newsId: string) => {
    setMarketNews((prev) => prev.filter((item) => item.id !== newsId));
  };

  const releaseMarketNews = (newsId: string): { success: boolean; error?: string } => {
    const targetNews = marketNews.find((n) => n.id === newsId);
    if (!targetNews) {
      return { success: false, error: 'News item not found.' };
    }

    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // 1. Update news status
    setMarketNews((prev) =>
      prev.map((n) =>
        n.id === newsId
          ? {
              ...n,
              status: 'RELEASED',
              releasedAt: timestampStr,
            }
          : n
      )
    );

    // News is visible immediately, but prices deliberately remain unchanged
    // until the admin releases each affected sector price separately.
    addNotification({
      type: 'round_change',
      title: '🚨 BREAKING MARKET NEWS RELEASED',
      message: `"${targetNews.headline}" is now live. Sector prices remain pending Admin release.`,
    });
    return { success: true };
  };

  const releaseMarketNewsPrice = (newsId: string, opportunityId: string): { success: boolean; error?: string } => {
    const targetNews = marketNews.find((n) => n.id === newsId);
    const affected = targetNews?.affectedOpportunities.find((item) => item.opportunityId === opportunityId);
    if (!targetNews || !affected) return { success: false, error: 'Affected sector not found.' };
    if (targetNews.status !== 'RELEASED') return { success: false, error: 'Release the news before its price.' };
    if (marketRoundConfig.tradingStatus !== 'CLOSED') {
      return { success: false, error: 'Close the trading desk before releasing a new price.' };
    }
    if (affected.priceReleased) return { success: false, error: 'This sector price is already released.' };
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Apply only this one sector/event price and revalue only holdings in it.
    const changeMap: { [oppId: string]: number } = {};
    changeMap[opportunityId] = affected.changePercent;

    setMarketNews((prev) => prev.map((news) => news.id === newsId ? {
      ...news,
      affectedOpportunities: news.affectedOpportunities.map((item) => item.opportunityId === opportunityId
        ? { ...item, priceReleased: true, priceReleasedAt: timestampStr }
        : item),
    } : news));

    let updatedOpps = marketOpportunities.map((opp) => {
      if (changeMap[opp.id] !== undefined) {
        const pct = changeMap[opp.id];
        const multiplier = 1 + pct / 100;
        const newCurrentVal = Math.max(0, Math.round(opp.currentValue * multiplier * 100) / 100);
        const totalChangePct = opp.startingValue > 0
          ? Math.round(((newCurrentVal - opp.startingValue) / opp.startingValue) * 100)
          : 0;
        return {
          ...opp,
          currentValue: newCurrentVal,
          changePercent: totalChangePct,
        };
      }
      return opp;
    });
    setMarketOpportunities(updatedOpps);

    // 3. Update all team portfolios and create transaction records
    const newTxns: MarketTransaction[] = [];
    const updatedPortfolios: { [teamId: string]: TeamMarketPortfolio } = { ...marketPortfolios };

    teams.forEach((team) => {
      const currentPort: TeamMarketPortfolio = updatedPortfolios[team.id] || {
        teamId: team.id,
        teamNumber: team.teamNumber,
        availableCash: team.morphCoins,
        totalInvested: 0,
        totalCurrentValue: 0,
        netGainLoss: 0,
        netGainLossPercent: 0,
        totalPortfolioValue: team.morphCoins,
        investments: {},
      };

      let portInvestedTotal = 0;
      let portCurrentTotal = 0;
      const updatedInvestments = { ...currentPort.investments };

      Object.keys(updatedInvestments).forEach((oppId) => {
        const inv = updatedInvestments[oppId];
        if (changeMap[oppId] !== undefined && inv.currentValue > 0) {
          const pct = changeMap[oppId];
          const multiplier = 1 + pct / 100;
          const oldVal = inv.currentValue;
          const newVal = Math.max(0, Math.round(oldVal * multiplier * 100) / 100);
          const diff = newVal - oldVal;
          const gainLoss = Math.round((newVal - inv.investedAmount) * 100) / 100;
          const gainLossPct = inv.investedAmount > 0 ? (gainLoss / inv.investedAmount) * 100 : 0;

          updatedInvestments[oppId] = {
            ...inv,
            currentValue: newVal,
            gainLoss,
            gainLossPercent: Math.round(gainLossPct * 10) / 10,
          };

          // Record market movement transaction
          newTxns.push({
            id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            timestamp: timestampStr,
            teamId: team.id,
            teamNumber: team.teamNumber,
            teamName: team.teamName,
            type: 'MARKET_UPDATE',
            opportunityId: oppId,
            opportunityName: inv.opportunityName,
            amount: Math.abs(diff),
            changePercent: pct,
            profitOrLoss: diff,
            description: `News Impact: "${targetNews.headline.slice(0, 50)}..." (${pct >= 0 ? '+' : ''}${pct}%)`,
          });
        }

        portInvestedTotal += updatedInvestments[oppId].investedAmount;
        portCurrentTotal += updatedInvestments[oppId].currentValue;
      });

      const netGainLoss = Math.round((portCurrentTotal - portInvestedTotal) * 100) / 100;
      const netGainLossPercent = portInvestedTotal > 0 ? Math.round((netGainLoss / portInvestedTotal) * 1000) / 10 : 0;
      const totalPortfolioVal = team.morphCoins + portCurrentTotal;

      updatedPortfolios[team.id] = {
        ...currentPort,
        availableCash: team.morphCoins,
        totalInvested: portInvestedTotal,
        totalCurrentValue: portCurrentTotal,
        netGainLoss,
        netGainLossPercent,
        totalPortfolioValue: totalPortfolioVal,
        investments: updatedInvestments,
      };
    });

    setMarketPortfolios(updatedPortfolios);
    if (newTxns.length > 0) {
      setMarketTransactions((prev) => [...newTxns, ...prev]);
    }

    // 4. Update team invested values and recalculate rankings based on Total Portfolio Value
    setTeams((prev) => {
      const updated = prev.map((t) => {
        const port = updatedPortfolios[t.id];
        const currentInvested = port ? port.totalCurrentValue : 0;
        return {
          ...t,
          marketInvestedValue: currentInvested,
          totalMorphValue: t.morphCoins + currentInvested,
        };
      });
      return calculateRankings(updated);
    });

    // 5. Broadcast notification
    addNotification({
      type: 'round_change',
      title: '🚨 BREAKING MARKET NEWS RELEASED',
      message: `"${targetNews.headline}" is now live! Sector valuations & team portfolios have been updated in real-time.`,
    });

    return { success: true };
  };

  // BUY OPPORTUNITY
  const buyMarketOpportunity = async (
    teamId: string,
    opportunityId: string,
    amount: number
  ): Promise<{ success: boolean; error?: string }> => {
    if (amount <= 0 || isNaN(amount)) {
      return { success: false, error: 'Please enter a valid investment amount.' };
    }

    if (marketRoundConfig.tradingStatus !== 'OPEN') {
      return { success: false, error: 'Trading is currently closed by the Admin.' };
    }

    const team = teams.find((t) => t.id === teamId);
    if (!team) {
      return { success: false, error: 'Team not found.' };
    }

    const opp = marketOpportunities.find((o) => o.id === opportunityId);
    if (!opp) {
      return { success: false, error: 'Market Opportunity not found.' };
    }
    if (opp.status !== 'ACTIVE') {
      return { success: false, error: 'This market opportunity is currently inactive for investments.' };
    }

    try {
      const result = await marketBuyApi(opportunityId, amount) as { balance: number };
      const cost = amount * opp.currentValue;
      const newCashBalance = result.balance;
      const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const currentPort = marketPortfolios[team.id] || {
        teamId: team.id,
        teamNumber: team.teamNumber,
        teamName: team.teamName,
        availableCash: team.morphCoins,
        totalInvested: 0,
        totalCurrentValue: 0,
        netGainLoss: 0,
        totalPortfolioValue: team.morphCoins,
        investments: {},
      };

      const existingInv = currentPort.investments[opp.id];
      const previousQuantity = existingInv?.quantity ?? 0;
      const prevInvested = existingInv ? existingInv.investedAmount : 0;
      const prevCurrent = existingInv ? existingInv.currentValue : 0;

      const newInvestedAmount = prevInvested + cost;
      const newCurrentVal = prevCurrent + cost;
      const gainLoss = Math.round((newCurrentVal - newInvestedAmount) * 100) / 100;
      const gainLossPct = newInvestedAmount > 0 ? (gainLoss / newInvestedAmount) * 100 : 0;

      const updatedInvestments = {
        ...currentPort.investments,
        [opp.id]: {
          opportunityId: opp.id,
          opportunityName: opp.name,
          quantity: previousQuantity + amount,
          investedAmount: newInvestedAmount,
          currentValue: newCurrentVal,
          gainLoss,
          gainLossPercent: Math.round(gainLossPct * 10) / 10,
          lastUpdated: timestampStr,
        },
      };

      let portInvestedTotal = 0;
      let portCurrentTotal = 0;
      Object.values(updatedInvestments).forEach((inv: TeamOpportunityInvestment) => {
        portInvestedTotal += inv.investedAmount;
        portCurrentTotal += inv.currentValue;
      });

      const netGainLoss = Math.round((portCurrentTotal - portInvestedTotal) * 100) / 100;
      const netGainLossPercent = portInvestedTotal > 0 ? Math.round((netGainLoss / portInvestedTotal) * 1000) / 10 : 0;

      const updatedPortfolio: TeamMarketPortfolio = {
        ...currentPort,
        availableCash: newCashBalance,
        totalInvested: portInvestedTotal,
        totalCurrentValue: portCurrentTotal,
        netGainLoss,
        netGainLossPercent,
        totalPortfolioValue: newCashBalance + portCurrentTotal,
        investments: updatedInvestments,
      };

      setMarketPortfolios((prev) => ({
        ...prev,
        [team.id]: updatedPortfolio,
      }));

      setTeams((prev) => {
        const updated = prev.map((t) =>
          t.id === team.id
            ? {
                ...t,
                morphCoins: newCashBalance,
                marketInvestedValue: portCurrentTotal,
                totalMorphValue: newCashBalance + portCurrentTotal,
              }
            : t
        );
        return calculateRankings(updated);
      });

      const txn: MarketTransaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        timestamp: timestampStr,
        teamId: team.id,
        teamNumber: team.teamNumber,
        teamName: team.teamName,
        type: 'BUY',
        opportunityId: opp.id,
        opportunityName: opp.name,
        amount: cost,
        quantity: amount,
        priceOrValue: opp.currentValue,
        description: `Bought ${amount} units of ${opp.name} for ₹${cost.toLocaleString()}`,
      };
      setMarketTransactions((prev) => [txn, ...prev]);

      const coinLog: CoinUpdateLog = {
        id: Date.now().toString(),
        teamId: team.id,
        teamNumber: team.teamNumber,
        previousBalance: team.morphCoins,
        newBalance: newCashBalance,
        timestamp: timestampStr,
        note: `Market Investment: Bought ${amount} units of ${opp.name}`,
      };
      setLogs((prev) => [coinLog, ...prev]);

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Market buy failed' };
    }
  };

  // SELL OPPORTUNITY
  const sellMarketOpportunity = async (
    teamId: string,
    opportunityId: string,
    amount: number
  ): Promise<{ success: boolean; error?: string }> => {
    if (amount <= 0 || isNaN(amount)) {
      return { success: false, error: 'Please enter a valid amount to sell.' };
    }

    if (marketRoundConfig.tradingStatus !== 'OPEN') {
      return { success: false, error: 'Trading is currently closed by the Admin.' };
    }

    const team = teams.find((t) => t.id === teamId);
    if (!team) {
      return { success: false, error: 'Team not found.' };
    }

    const port = marketPortfolios[team.id];
    const existingInv = port?.investments?.[opportunityId];

    if (!existingInv || existingInv.currentValue <= 0) {
      return { success: false, error: 'You do not have any active investment in this opportunity.' };
    }

    const opp = marketOpportunities.find((o) => o.id === opportunityId);
    const currentPrice = opp?.currentValue ?? 0;
    const heldQuantity = existingInv.quantity ?? (currentPrice > 0 ? existingInv.currentValue / currentPrice : 0);
    if (amount > heldQuantity) {
      return {
        success: false,
        error: `You can only sell up to ${heldQuantity} units.`,
      };
    }

    try {
      const result = await marketSellApi(opportunityId, amount) as { balance: number };
      const oppName = opp ? opp.name : existingInv.opportunityName;
      const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const saleProceeds = amount * currentPrice;
      const newCashBalance = result.balance;

      const costBasisRatio = heldQuantity > 0 ? amount / heldQuantity : 1;
      const costBasisSold = Math.round(existingInv.investedAmount * costBasisRatio * 100) / 100;
      const remainingInvested = Math.max(0, Math.round((existingInv.investedAmount - costBasisSold) * 100) / 100);
      const remainingQuantity = Math.max(0, heldQuantity - amount);
      const remainingCurrent = Math.max(0, Math.round(remainingQuantity * currentPrice * 100) / 100);

      const gainLoss = Math.round((remainingCurrent - remainingInvested) * 100) / 100;
      const gainLossPct = remainingInvested > 0 ? (gainLoss / remainingInvested) * 100 : 0;

      const updatedInvestments = { ...port.investments };
      if (remainingCurrent <= 0) {
        delete updatedInvestments[opportunityId];
      } else {
        updatedInvestments[opportunityId] = {
          ...existingInv,
          quantity: remainingQuantity,
          investedAmount: remainingInvested,
          currentValue: remainingCurrent,
          gainLoss,
          gainLossPercent: Math.round(gainLossPct * 10) / 10,
          lastUpdated: timestampStr,
        };
      }

      let portInvestedTotal = 0;
      let portCurrentTotal = 0;
      Object.values(updatedInvestments).forEach((inv: TeamOpportunityInvestment) => {
        portInvestedTotal += inv.investedAmount;
        portCurrentTotal += inv.currentValue;
      });

      const netGainLoss = Math.round((portCurrentTotal - portInvestedTotal) * 100) / 100;
      const netGainLossPercent = portInvestedTotal > 0 ? Math.round((netGainLoss / portInvestedTotal) * 1000) / 10 : 0;

      const updatedPortfolio: TeamMarketPortfolio = {
        ...port,
        availableCash: newCashBalance,
        totalInvested: portInvestedTotal,
        totalCurrentValue: portCurrentTotal,
        netGainLoss,
        netGainLossPercent,
        totalPortfolioValue: newCashBalance + portCurrentTotal,
        investments: updatedInvestments,
      };

      setMarketPortfolios((prev) => ({
        ...prev,
        [team.id]: updatedPortfolio,
      }));

      setTeams((prev) => {
        const updated = prev.map((t) =>
          t.id === team.id
            ? {
                ...t,
                morphCoins: newCashBalance,
                marketInvestedValue: portCurrentTotal,
                totalMorphValue: newCashBalance + portCurrentTotal,
              }
            : t
        );
        return calculateRankings(updated);
      });

      const txn: MarketTransaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        timestamp: timestampStr,
        teamId: team.id,
        teamNumber: team.teamNumber,
        teamName: team.teamName,
        type: 'SELL',
        opportunityId,
        opportunityName: oppName,
        amount: saleProceeds,
        quantity: amount,
        priceOrValue: opp?.currentValue ?? existingInv.currentValue,
        profitOrLoss: Math.round((saleProceeds - costBasisSold) * 100) / 100,
        description: `Sold ${amount} units of ${oppName} for ₹${saleProceeds.toLocaleString()}`,
      };
      setMarketTransactions((prev) => [txn, ...prev]);

      const coinLog: CoinUpdateLog = {
        id: Date.now().toString(),
        teamId: team.id,
        teamNumber: team.teamNumber,
        previousBalance: team.morphCoins,
        newBalance: newCashBalance,
        timestamp: timestampStr,
        note: `Market Divestment: Sold ${amount} units of ${oppName}`,
      };
      setLogs((prev) => [coinLog, ...prev]);

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Market sell failed' };
    }
  };

  const getTeamMarketPortfolio = (teamId: string): TeamMarketPortfolio => {
    const team = teams.find((t) => t.id === teamId);
    const existing = marketPortfolios[teamId];
    if (existing) {
      const netGainLoss = Math.round((existing.totalCurrentValue - existing.totalInvested) * 100) / 100;
      const netGainLossPercent = existing.totalInvested > 0 ? Math.round((netGainLoss / existing.totalInvested) * 1000) / 10 : 0;
      return {
        ...existing,
        teamNumber: team?.teamNumber,
        availableCash: team?.morphCoins ?? existing.availableCash,
        netGainLoss,
        netGainLossPercent,
        totalPortfolioValue: (team?.morphCoins ?? existing.availableCash) + existing.totalCurrentValue,
      };
    }
    const cash = team?.morphCoins ?? 10000;
    return {
      teamId,
      teamNumber: team?.teamNumber,
      availableCash: cash,
      totalInvested: 0,
      totalCurrentValue: 0,
      netGainLoss: 0,
      netGainLossPercent: 0,
      totalPortfolioValue: cash,
      investments: {},
    };
  };

  // Reset Market Round Activity: cleans transactions, portfolios, news states, restores baseline opp prices, but keeps configs
  const resetMarketRoundActivity = () => {
    // 1. Reset opportunities back to starting values
    setMarketOpportunities((prev) =>
      prev.map((opp) => ({
        ...opp,
        currentValue: opp.startingValue,
        changePercent: 0,
      }))
    );

    // 2. Reset news back to DRAFT
    setMarketNews((prev) =>
      prev.map((item) => ({
        ...item,
        status: 'DRAFT',
        releasedAt: undefined,
      }))
    );

    // 3. Clear Portfolios and Transactions
    setMarketPortfolios({});
    setMarketTransactions([]);

    // 4. Close Trading
    setMarketRoundConfig((prev) => ({
      ...prev,
      tradingStatus: 'CLOSED',
    }));

    // 5. Clean teams' market invested values
    setTeams((prev) => {
      const updated = prev.map((t) => ({
        ...t,
        marketInvestedValue: 0,
        totalMorphValue: t.morphCoins,
      }));
      return calculateRankings(updated);
    });
  };

  // =========================================================================
  // ROUND 8: FINAL GROWTH EXPANSION CONTROLS
  // =========================================================================
  const releaseFinalGrowthInfo = () => {
    setFinalGrowthConfig((prev) => ({ ...prev, infoReleased: true }));
    addNotification({
      type: 'round_change',
      title: 'FINAL GROWTH BRIEFING RELEASED',
      message: 'Admin released the Final Growth Expansion Boardroom Challenge Briefing to all teams.',
    });
  };

  const hideFinalGrowthInfo = () => {
    setFinalGrowthConfig((prev) => ({ ...prev, infoReleased: false }));
  };

  const releaseFinalGrowthRound = () => {
    setFinalGrowthConfig((prev) => ({ ...prev, roundStatus: 'ACTIVE', infoReleased: true }));
    addNotification({
      type: 'round_change',
      title: 'ROUND 8: FINAL GROWTH EXPANSION ACTIVE',
      message: 'Admin activated Round 8: Final Growth Expansion! Teams are preparing final boardroom presentations.',
    });
  };

  const pauseFinalGrowthRound = () => {
    setFinalGrowthConfig((prev) => ({ ...prev, roundStatus: 'LOCKED' }));
    addNotification({
      type: 'round_change',
      title: 'FINAL GROWTH ROUND PAUSED',
      message: 'Admin paused Round 8: Final Growth Expansion.',
    });
  };

  const completeFinalGrowthRound = () => {
    setFinalGrowthConfig((prev) => ({ ...prev, roundStatus: 'COMPLETED' }));
    addNotification({
      type: 'round_change',
      title: 'FINAL GROWTH ROUND COMPLETED',
      message: 'Admin completed Round 8: Final Growth Expansion.',
    });
  };

  const resetFinalGrowthRound = () => {
    // 1. Revert any confirmed Final Growth judging score awards from team balances
    const scoresToRevert = Object.values(finalGrowthScores) as TeamScoreRecord[];
    const affectedTeams: { teamNumber: string; revertedCoins: number }[] = [];

    setTeams((prevTeams) => {
      let modified = false;
      const updated = prevTeams.map((team) => {
        const teamScore = finalGrowthScores[team.id];
        const awardedCoins = teamScore?.lastAwardedCoins || 0;
        if (awardedCoins > 0) {
          modified = true;
          affectedTeams.push({ teamNumber: team.teamNumber, revertedCoins: awardedCoins });
          return {
            ...team,
            morphCoins: Math.max(0, team.morphCoins - awardedCoins),
          };
        }
        return team;
      });
      return modified ? calculateRankings(updated) : prevTeams;
    });

    // 2. Log score rollback in history and general logs
    if (scoresToRevert.length > 0) {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newHistoryEntries: ScoreHistoryTransaction[] = [];
      const newLogs: CoinUpdateLog[] = [];

      scoresToRevert.forEach((scoreRec) => {
        if ((scoreRec.lastAwardedCoins || 0) > 0) {
          const targetTeam = teams.find((t) => t.id === scoreRec.teamId);
          if (targetTeam) {
            newHistoryEntries.push({
              id: `hist_reset_fg_${scoreRec.teamId}_${Date.now()}`,
              roundId: 'FINAL_GROWTH',
              teamId: scoreRec.teamId,
              teamNumber: targetTeam.teamNumber,
              type: 'ROUND_RESET',
              previousScore: scoreRec.weightedScore,
              newScore: 0,
              previousAwardedCoins: scoreRec.lastAwardedCoins || 0,
              newAwardedCoins: 0,
              deltaCoins: -(scoreRec.lastAwardedCoins || 0),
              timestamp: nowStr,
              adminNote: 'Round 8: Final Growth Expansion reset by Admin. Judging coin rewards rolled back.',
            });

            newLogs.push({
              id: `log_reset_fg_${scoreRec.teamId}_${Date.now()}`,
              teamId: scoreRec.teamId,
              teamNumber: targetTeam.teamNumber,
              previousBalance: targetTeam.morphCoins,
              newBalance: Math.max(0, targetTeam.morphCoins - (scoreRec.lastAwardedCoins || 0)),
              timestamp: nowStr,
              note: `Final Growth Reset: -₹${(scoreRec.lastAwardedCoins || 0).toLocaleString()} coins reverted`,
            });
          }
        }
      });

      if (newHistoryEntries.length > 0) {
        setScoreHistory((prev) => [...newHistoryEntries, ...prev]);
      }
      if (newLogs.length > 0) {
        setLogs((prev) => [...newLogs, ...prev]);
      }
    }

    // 3. Reset scores and release flags
    setFinalGrowthScores({});
    setFinalGrowthScoresReleased(false);

    // 4. Reset round status to locked but keep case study content
    setFinalGrowthConfig((prev) => ({
      ...prev,
      roundStatus: 'LOCKED',
      infoReleased: false,
    }));

    addNotification({
      type: 'round_change',
      title: 'FINAL GROWTH ROUND RESET',
      message: `Admin reset Round 8: Final Growth Expansion. Judging scores wiped and ${affectedTeams.length} team balances restored to pre-round state.`,
    });
  };

  const updateFinalGrowthConfig = (config: Partial<FinalGrowthConfig>) => {
    setFinalGrowthConfig((prev) => ({ ...prev, ...config }));
  };

  // =========================================================================
  // UNIVERSAL JUDGING & SCORING ENGINE (PR CRISIS & FINAL GROWTH EXPANSION)
  // =========================================================================

  // Helper for computing weighted score and Morph Coin reward
  const computeWeightedScore = (
    scores: { [criterionId: string]: number },
    criteria: JudgingCriterion[]
  ): { weightedScore: number; morphCoinsEarned: number } => {
    let rawWeightedSum = 0;
    criteria.forEach((crit) => {
      const mark = scores[crit.id] ?? 0;
      const weightFactor = (Number(crit.weightage) || 0) / 100;
      rawWeightedSum += mark * weightFactor;
    });
    // intermediate unrounded calculation, rounded to 2 decimal places for display
    const weightedScore = Math.round(rawWeightedSum * 100) / 100;
    // Formula: Final weighted score × 100 = Morph Coins Earned (displayed as whole number)
    const morphCoinsEarned = Math.round(rawWeightedSum * 100);
    return { weightedScore, morphCoinsEarned };
  };

  // Recalculate scores for all teams in a round when criteria or weights change
  const recalculateAllTeamScoresForRound = (
    roundId: 'PR_CRISIS' | 'FINAL_GROWTH',
    newCriteria: JudgingCriterion[]
  ) => {
    const isPr = roundId === 'PR_CRISIS';
    const scoreStateSetter = isPr ? setPrCrisisScores : setFinalGrowthScores;

    scoreStateSetter((prevScores) => {
      const updated: { [teamId: string]: TeamScoreRecord } = {};
      (Object.entries(prevScores) as [string, TeamScoreRecord][]).forEach(([teamId, record]) => {
        if (!record || typeof record !== 'object') return;
        const { weightedScore, morphCoinsEarned } = computeWeightedScore(record.scores || {}, newCriteria);
        updated[teamId] = {
          ...record,
          weightedScore,
          morphCoinsEarned,
        };
      });
      return updated;
    });
  };

  const updateJudgingCriteria = (
    roundId: 'PR_CRISIS' | 'FINAL_GROWTH',
    criteria: JudgingCriterion[]
  ): { success: boolean; error?: string } => {
    const totalWeight = criteria.reduce((sum, c) => sum + (Number(c.weightage) || 0), 0);
    if (Math.round(totalWeight) !== 100) {
      return {
        success: false,
        error: `Total criteria weightage must equal exactly 100% (currently ${totalWeight}%). Please adjust weightages before saving.`,
      };
    }

    // Assign sequential order
    const orderedCriteria = criteria.map((c, idx) => ({ ...c, order: idx + 1 }));

    if (roundId === 'PR_CRISIS') {
      setPrCrisisCriteria(orderedCriteria);
    } else {
      setFinalGrowthCriteria(orderedCriteria);
    }

    recalculateAllTeamScoresForRound(roundId, orderedCriteria);

    addNotification({
      type: 'round_change',
      title: `${roundId === 'PR_CRISIS' ? 'PR CRISIS' : 'FINAL GROWTH'} RUBRIC UPDATED`,
      message: `Admin updated judging criteria rubric (${orderedCriteria.length} criteria, 100% total weightage).`,
    });

    return { success: true };
  };

  const addJudgingCriterion = (
    roundId: 'PR_CRISIS' | 'FINAL_GROWTH',
    criterionData: Omit<JudgingCriterion, 'id' | 'order'>
  ): { success: boolean; error?: string } => {
    const targetCriteria = roundId === 'PR_CRISIS' ? prCrisisCriteria : finalGrowthCriteria;
    const newId = `crit_${roundId.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newCriterion: JudgingCriterion = {
      ...criterionData,
      id: newId,
      order: targetCriteria.length + 1,
    };

    const newCriteriaList = [...targetCriteria, newCriterion];
    if (roundId === 'PR_CRISIS') {
      setPrCrisisCriteria(newCriteriaList);
    } else {
      setFinalGrowthCriteria(newCriteriaList);
    }

    return { success: true };
  };

  const editJudgingCriterion = (
    roundId: 'PR_CRISIS' | 'FINAL_GROWTH',
    criterionId: string,
    updates: Partial<JudgingCriterion>
  ): { success: boolean; error?: string } => {
    const targetCriteria = roundId === 'PR_CRISIS' ? prCrisisCriteria : finalGrowthCriteria;
    const updatedCriteria = targetCriteria.map((c) => (c.id === criterionId ? { ...c, ...updates } : c));

    if (roundId === 'PR_CRISIS') {
      setPrCrisisCriteria(updatedCriteria);
    } else {
      setFinalGrowthCriteria(updatedCriteria);
    }

    recalculateAllTeamScoresForRound(roundId, updatedCriteria);
    return { success: true };
  };

  const deleteJudgingCriterion = (
    roundId: 'PR_CRISIS' | 'FINAL_GROWTH',
    criterionId: string
  ): { success: boolean; error?: string } => {
    const targetCriteria = roundId === 'PR_CRISIS' ? prCrisisCriteria : finalGrowthCriteria;
    if (targetCriteria.length <= 1) {
      return { success: false, error: 'A round must have at least 1 judging criterion.' };
    }

    const filtered = targetCriteria
      .filter((c) => c.id !== criterionId)
      .map((c, idx) => ({ ...c, order: idx + 1 }));

    if (roundId === 'PR_CRISIS') {
      setPrCrisisCriteria(filtered);
    } else {
      setFinalGrowthCriteria(filtered);
    }

    // Clean score record maps of this criterion and recalculate
    const scoreStateSetter = roundId === 'PR_CRISIS' ? setPrCrisisScores : setFinalGrowthScores;
    scoreStateSetter((prevScores) => {
      const updated: { [teamId: string]: TeamScoreRecord } = {};
      (Object.entries(prevScores) as [string, TeamScoreRecord][]).forEach(([teamId, record]) => {
        if (!record || typeof record !== 'object') return;
        const remainingScores = { ...(record.scores || {}) };
        delete remainingScores[criterionId];
        const { weightedScore, morphCoinsEarned } = computeWeightedScore(remainingScores, filtered);
        updated[teamId] = {
          ...record,
          scores: remainingScores,
          weightedScore,
          morphCoinsEarned,
        };
      });
      return updated;
    });

    return { success: true };
  };

  const reorderJudgingCriteria = (
    roundId: 'PR_CRISIS' | 'FINAL_GROWTH',
    criteria: JudgingCriterion[]
  ) => {
    const ordered = criteria.map((c, idx) => ({ ...c, order: idx + 1 }));
    if (roundId === 'PR_CRISIS') {
      setPrCrisisCriteria(ordered);
    } else {
      setFinalGrowthCriteria(ordered);
    }
  };

  const resetJudgingCriteriaToDefault = (roundId: 'PR_CRISIS' | 'FINAL_GROWTH') => {
    const defaults = roundId === 'PR_CRISIS' ? INITIAL_PR_CRISIS_CRITERIA : INITIAL_FINAL_GROWTH_CRITERIA;
    if (roundId === 'PR_CRISIS') {
      setPrCrisisCriteria(defaults);
    } else {
      setFinalGrowthCriteria(defaults);
    }
    recalculateAllTeamScoresForRound(roundId, defaults);
  };

  const setTeamCriterionScore = (
    roundId: 'PR_CRISIS' | 'FINAL_GROWTH',
    teamId: string,
    criterionId: string,
    score: number
  ) => {
    const clampedScoreBug = isNaN(score) ? 0 : Number(score);
    const clampedScore = Math.max(0, Math.min(100, Math.round(clampedScoreBug)));
    const criteria不易 = roundId === 'PR_CRISIS' ? prCrisisCriteria : finalGrowthCriteria;
    const scoreStateSetter = roundId === 'PR_CRISIS' ? setPrCrisisScores : setFinalGrowthScores;
    const roundScoresReleased = roundId === 'PR_CRISIS' ? prCrisisScoresReleased : finalGrowthScoresReleased;
    const team = teams.find((t) => t.id === teamId);

    scoreStateSetter((prev) => {
      const existing = prev[teamId] || {
        teamId,
        teamNumber: team?.teamNumber || '',
        teamName: team?.name || '',
        roundId,
        scores: {},
        weightedScore: 0,
        morphCoinsEarned: 0,
        isConfirmed: false,
        isReleased: roundScoresReleased,
        lastAwardedCoins: 0,
      };

      const updatedScores结 = {
        ...existing.scores,
        [criterionId]: clampedScore,
      };

      const { weightedScore, morphCoinsEarned } = computeWeightedScore(updatedScores结, criteria不易);

      return {
        ...prev,
        [teamId]: {
          ...existing,
          teamNumber: team?.teamNumber || existing.teamNumber || '',
          teamName: team?.name || existing.teamName || '',
          scores: updatedScores结,
          weightedScore,
          morphCoinsEarned,
          // Keep isConfirmed status as-is until explicit confirm / unlock
        },
      };
    });
  };

  const confirmTeamScore = (
    roundId: 'PR_CRISIS' | 'FINAL_GROWTH',
    teamId: string
  ): { success: boolean; error?: string; morphCoinsAwarded?: number; balanceDelta?: number } => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return { success: false, error: 'Team not found.' };

    const criteria = roundId === 'PR_CRISIS' ? prCrisisCriteria : finalGrowthCriteria;
    const roundName = roundId === 'PR_CRISIS' ? 'Round 6: PR Crisis' : 'Round 8: Final Growth';
    const currentScoresMap = roundId === 'PR_CRISIS' ? prCrisisScores : finalGrowthScores;
    const existingRecord = currentScoresMap[teamId];

    const currentScores = existingRecord?.scores || {};
    const { weightedScore, morphCoinsEarned } = computeWeightedScore(currentScores, criteria);

    const previousAwardedCoins = existingRecord?.lastAwardedCoins || 0;
    const isEdit = existingRecord?.isConfirmed || previousAwardedCoins > 0;
    const deltaCoins = morphCoinsEarned - previousAwardedCoins;

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const nowIso = new Date().toISOString();

    // 1. Update team Morph Coin balance with delta (or reward)
    let finalTeamBalance = team.morphCoins;
    if (deltaCoins !== 0) {
      setTeams((prevTeams) => {
        const updated = prevTeams.map((t) => {
          if (t.id === teamId) {
            const nextBal = Math.max(0, t.morphCoins + deltaCoins);
            finalTeamBalance = nextBal;
            return {
              ...t,
              morphCoins: nextBal,
            };
          }
          return t;
        });
        return calculateRankings(updated);
      });

      // 2. Add to Score History Transaction Ledger
      const newTransaction: ScoreHistoryTransaction = {
        id: `tx_${roundId.toLowerCase()}_${teamId}_${Date.now()}`,
        roundId,
        teamId,
        teamNumber: team.teamNumber,
        type: isEdit ? 'SCORE_EDITED' : 'SCORE_AWARDED',
        previousScore: existingRecord?.weightedScore || 0,
        newScore: weightedScore,
        previousAwardedCoins,
        newAwardedCoins: morphCoinsEarned,
        deltaCoins,
        timestamp: nowStr,
        adminNote: isEdit
          ? `${roundName} judging score revised from ${(existingRecord?.weightedScore || 0).toFixed(1)}/100 to ${weightedScore.toFixed(1)}/100. Balance delta: ${deltaCoins >= 0 ? '+' : ''}₹${deltaCoins.toLocaleString()} coins.`
          : `${roundName} judging score confirmed (${weightedScore.toFixed(1)}/100). Awarded +₹${morphCoinsEarned.toLocaleString()} coins.`,
      };
      setScoreHistory((prev) => [newTransaction, ...prev]);

      // 3. Add to general Coin Update Logs
      const newLog: CoinUpdateLog = {
        id: `log_judging_${roundId.toLowerCase()}_${teamId}_${Date.now()}`,
        teamId,
        teamNumber: team.teamNumber,
        previousBalance: team.morphCoins,
        newBalance: Math.max(0, team.morphCoins + deltaCoins),
        timestamp: nowStr,
        note: isEdit
          ? `${roundName} Judging Adjustment (${weightedScore.toFixed(1)}/100): ${deltaCoins >= 0 ? '+' : ''}₹${deltaCoins.toLocaleString()} coins`
          : `${roundName} Judging Reward (${weightedScore.toFixed(1)}/100): +₹${morphCoinsEarned.toLocaleString()} coins`,
      };
      setLogs((prev) => [newLog, ...prev]);
    }

    // 4. Update the team's score record as CONFIRMED
    const updatedRecord: TeamScoreRecord = {
      teamId,
      teamNumber: team.teamNumber,
      teamName: team.name,
      roundId,
      scores: currentScores,
      weightedScore,
      morphCoinsEarned,
      isConfirmed: true,
      confirmedAt: nowIso,
      lastAwardedCoins: morphCoinsEarned,
      isReleased: existingRecord?.isReleased ?? (roundId === 'PR_CRISIS' ? prCrisisScoresReleased : finalGrowthScoresReleased),
    };

    if (roundId === 'PR_CRISIS') {
      setPrCrisisScores((prev) => ({ ...prev, [teamId]: updatedRecord }));
    } else {
      setFinalGrowthScores((prev) => ({ ...prev, [teamId]: updatedRecord }));
    }

    addNotification({
      type: 'round_change',
      title: `SCORE CONFIRMED: ${team.teamNumber}`,
      message: `${roundName} score for ${team.teamNumber} confirmed: ${weightedScore.toFixed(1)}/100 (₹${morphCoinsEarned.toLocaleString()} Morph Coins).`,
      teamId: team.id,
      teamNumber: team.teamNumber,
    });

    return {
      success: true,
      morphCoinsAwarded: morphCoinsEarned,
      balanceDelta: deltaCoins,
    };
  };

  const unlockTeamScoreForEdit = (roundId: 'PR_CRISIS' | 'FINAL_GROWTH', teamId: string) => {
    const scoreStateSetter = roundId === 'PR_CRISIS' ? setPrCrisisScores : setFinalGrowthScores;
    scoreStateSetter((prev) => {
      const existing = prev[teamId];
      if (!existing) return prev;
      return {
        ...prev,
        [teamId]: {
          ...existing,
          isConfirmed: false, // unlocked for admin edits, but lastAwardedCoins preserved!
        },
      };
    });
  };

  const toggleReleaseRoundScores = (roundId: 'PR_CRISIS' | 'FINAL_GROWTH', release: boolean) => {
    if (roundId === 'PR_CRISIS') {
      setPrCrisisScoresReleased(release);
      setPrCrisisScores((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((tid) => {
          updated[tid] = { ...updated[tid], isReleased: release };
        });
        return updated;
      });
    } else {
      setFinalGrowthScoresReleased(release);
      setFinalGrowthScores((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((tid) => {
          updated[tid] = { ...updated[tid], isReleased: release };
        });
        return updated;
      });
    }

    addNotification({
      type: 'round_change',
      title: release ? 'SCORES RELEASED TO TEAMS' : 'SCORES HIDDEN FROM TEAMS',
      message: `Admin ${release ? 'released' : 'withheld'} live score reports for ${roundId === 'PR_CRISIS' ? 'Round 6: PR Crisis' : 'Round 8: Final Growth'}.`,
    });
  };

  const toggleTeamScoreRelease = (roundId: 'PR_CRISIS' | 'FINAL_GROWTH', teamId: string, release: boolean) => {
    const scoreStateSetter = roundId === 'PR_CRISIS' ? setPrCrisisScores : setFinalGrowthScores;
    scoreStateSetter((prev) => {
      const existing = prev[teamId];
      if (!existing) return prev;
      return {
        ...prev,
        [teamId]: {
          ...existing,
          isReleased: release,
        },
      };
    });
  };

  const getTeamScoreRecord = (roundId: 'PR_CRISIS' | 'FINAL_GROWTH', teamId: string): TeamScoreRecord | undefined => {
    return roundId === 'PR_CRISIS' ? prCrisisScores[teamId] : finalGrowthScores[teamId];
  };

  const getRoundJudgingState = (roundId: 'PR_CRISIS' | 'FINAL_GROWTH'): RoundJudgingState => {
    return {
      roundId,
      criteria: roundId === 'PR_CRISIS' ? prCrisisCriteria : finalGrowthCriteria,
      teamScores: roundId === 'PR_CRISIS' ? prCrisisScores : finalGrowthScores,
      isScoresReleased: roundId === 'PR_CRISIS' ? prCrisisScoresReleased : finalGrowthScoresReleased,
    };
  };

  const getTeamScoreHistory = (teamId: string): ScoreHistoryTransaction[] => {
    return scoreHistory.filter((h) => h.teamId === teamId);
  };

  const resetAllData = async () => {
    try { await resetActiveGameplayApi(); } catch { /* best-effort */ }

    setTeams(INITIAL_TEAMS);
    setBrands(INITIAL_BRANDS);
    setProducts(INITIAL_PRODUCTS);
    setCards(INITIAL_CARDS);
    setRoundConfig(INITIAL_ROUND_CONFIG);
    setCardRoundConfig(INITIAL_CARD_ROUND_CONFIG);
    setProductCreationConfig(INITIAL_PRODUCT_CREATION_CONFIG);
    setCelebrities(INITIAL_CELEBRITIES);
    setCelebrityRoundConfig(INITIAL_CELEBRITY_ROUND_CONFIG);
    setPrCrisisConfig(INITIAL_PR_CRISIS_CONFIG);
    setPrCrisisCriteria(INITIAL_PR_CRISIS_CRITERIA);
    setPrCrisisScores({});
    setPrCrisisScoresReleased(false);
    setMarketRoundConfig(INITIAL_MARKET_ROUND_CONFIG);
    setMarketOpportunities(INITIAL_MARKET_OPPORTUNITIES);
    setMarketNews(INITIAL_MARKET_NEWS);
    setMarketPortfolios({});
    setMarketTransactions([]);
    setFinalGrowthConfig(INITIAL_FINAL_GROWTH_CONFIG);
    setFinalGrowthCriteria(INITIAL_FINAL_GROWTH_CRITERIA);
    setFinalGrowthScores({});
    setFinalGrowthScoresReleased(false);
    setScoreHistory([]);
    setAuctionStatusState('LOCKED');
    setActiveBrandId(INITIAL_BRANDS[0]?.id || null);
    setAuctionHistory([]);
    setCardTransactions([]);
    setBrandConflicts([]);
    setAdminNotifications([]);
    setLogs([]);

    updateGameState({
      auctionStatus: 'LOCKED',
      activeBrandId: INITIAL_BRANDS[0]?.id || null,
      teams: INITIAL_TEAMS,
      brands: INITIAL_BRANDS,
      products: INITIAL_PRODUCTS,
      roundConfig: INITIAL_ROUND_CONFIG,
      cards: INITIAL_CARDS,
      cardRoundConfig: INITIAL_CARD_ROUND_CONFIG,
      cardTransactions: [],
      brandConflicts: [],
      adminNotifications: [],
      productCreationConfig: INITIAL_PRODUCT_CREATION_CONFIG,
      celebrities: INITIAL_CELEBRITIES,
      celebrityRoundConfig: INITIAL_CELEBRITY_ROUND_CONFIG,
      prCrisisConfig: INITIAL_PR_CRISIS_CONFIG,
      prCrisisScores: {},
      prCrisisScoresReleased: false,
      marketRoundConfig: INITIAL_MARKET_ROUND_CONFIG,
      marketOpportunities: INITIAL_MARKET_OPPORTUNITIES,
      marketNews: INITIAL_MARKET_NEWS,
      marketPortfolios: {},
      marketTransactions: [],
      finalGrowthConfig: INITIAL_FINAL_GROWTH_CONFIG,
      finalGrowthScores: {},
      finalGrowthScoresReleased: false,
      scoreHistory: [],
      logs: [],
    }).catch((e) => console.warn('Broadcast sync error on reset:', e));
  };

  const getAuthenticatedTeam = (): Team | null => {
    if (authState.role !== 'team' || !authState.authenticatedTeamId) {
      return null;
    }
    return teams.find((t) => t.id === authState.authenticatedTeamId) || null;
  };

  const getTeamWonBrand = (teamId: string): Brand | null => {
    return brands.find((b) => b.winningTeamId === teamId && b.status === 'SOLD') || null;
  };

  return (
    <EventContext.Provider
      value={{
        teams,
        brands,
        activeBrandId,
        auctionHistory,
        logs,
        authState,
        currentView,
        auctionStatus,
        setAuctionStatus,
        resetAuctionRound,
        addBrand,
        updateBrand,
        deleteBrand,
        setActiveAuctionBrand,
        revealBrand,
        hideBrand,
        setBrandStatus,
        confirmAuctionResult,
        revertAuctionResult,
        roundConfig,
        products,
        releaseRoundInfo,
        hideRoundInfo,
        releaseRound,
        pauseRound,
        completeRound,
        resetRound,
        resetProductRevealRound,
        restoreDefaultProducts,
        updateRoundDetails,
        setRoundStatus,
        updateRoundInstructions,
        updatePuzzle,
        submitPuzzleAnswer,
        selectVaultProduct,
        addProduct,
        updateProduct,
        deleteProduct,
        resetProduct,
        resetRound3,
        completeRound3,
        getRound3Leaderboard,
        getRound2Leaderboard,
        cards,
        cardTransactions,
        cardRoundConfig,
        addCard,
        updateCard,
        deleteCard,
        updateCardRoundConfig,
        releaseCardInfo,
        hideCardInfo,
        releaseCardPurchase,
        closeCardPurchase,
        completeCardRound,
        resetCardRound,
        purchaseCard,
        executeSwapCard,
        useBoostCard,
        brandConflicts,
        createBrandConflict,
        submitConflictAnswer,
        resolveBrandConflictManually,
        deleteBrandConflict,
        adminNotifications,
        addNotification,
        markNotificationsRead,
        clearNotifications,
        productCreationConfig,
        releaseProductCreationInfo,
        hideProductCreationInfo,
        releaseProductCreationRound,
        pauseProductCreationRound,
        completeProductCreationRound,
        resetProductCreationRound,
        updateProductCreationConfig,
        celebrities,
        celebrityRoundConfig,
        releaseCelebrityInfo,
        hideCelebrityInfo,
        releaseCelebrityRound,
        pauseCelebrityRound,
        completeCelebrityRound,
        resetCelebrityRound,
        updateCelebrityRoundConfig,
        addCelebrity,
        updateCelebrity,
        deleteCelebrity,
        restoreDefaultCelebrities,
        spinAdminCelebrityWheel,
        purchaseMysteryCelebrityForTeam,
        revealCelebrityForTeam,
        resetTeamCelebrityPurchase,
        allowTeamToSpin,
        spinWheelForTeam,
        resetTeamCelebritySpin,
        prCrisisConfig,
        releasePrCrisisInfo,
        hidePrCrisisInfo,
        releasePrCrisisRound,
        pausePrCrisisRound,
        completePrCrisisRound,
        resetPrCrisisRound,
        updatePrCrisisConfig,
        marketRoundConfig,
        marketOpportunities,
        marketNews,
        marketTransactions,
        releaseMarketInfo,
        hideMarketInfo,
        releaseMarketRound,
        pauseMarketRound,
        completeMarketRound,
        resetMarketRound,
        updateMarketRoundConfig,
        openTrading,
        closeTrading,
        addMarketOpportunity,
        updateMarketOpportunity,
        deleteMarketOpportunity,
        toggleMarketOpportunityStatus,
        addMarketNews,
        updateMarketNews,
        deleteMarketNews,
        releaseMarketNews,
        releaseMarketNewsPrice,
        buyMarketOpportunity,
        sellMarketOpportunity,
        getTeamMarketPortfolio,
        resetMarketRoundActivity,

        // Round 8: Final Growth Expansion
        finalGrowthConfig,
        releaseFinalGrowthInfo,
        hideFinalGrowthInfo,
        releaseFinalGrowthRound,
        pauseFinalGrowthRound,
        completeFinalGrowthRound,
        resetFinalGrowthRound,
        updateFinalGrowthConfig,

        // Universal Judging & Scoring Engine
        prCrisisCriteria,
        prCrisisScores,
        prCrisisScoresReleased,
        finalGrowthCriteria,
        finalGrowthScores,
        finalGrowthScoresReleased,
        scoreHistory,

        updateJudgingCriteria,
        addJudgingCriterion,
        editJudgingCriterion,
        deleteJudgingCriterion,
        reorderJudgingCriteria,
        resetJudgingCriteriaToDefault,

        setTeamCriterionScore,
        confirmTeamScore,
        unlockTeamScoreForEdit,
        toggleReleaseRoundScores,
        toggleTeamScoreRelease,
        getTeamScoreRecord,
        getRoundJudgingState,
        getTeamScoreHistory,

        loginAdmin,
        loginTeam,
        logout,
        navigate,
        updateTeamCoins,
        updateTeamProfile,
        resetAllData,
        getAuthenticatedTeam,
        getTeamWonBrand,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = (): EventContextType => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
};
