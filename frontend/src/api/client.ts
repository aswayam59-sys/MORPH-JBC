/** Centralized API client for all backend gameplay endpoints. */

const API_BASE = `${import.meta.env.VITE_API_URL || ''}/api`;

function authHeaders(): Record<string, string> {
  const token = sessionStorage.getItem('morph_access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function jsonHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json', ...authHeaders() };
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail));
  }
  return res.json() as Promise<T>;
}

async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: jsonHeaders(),
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail));
  }
  return res.json() as Promise<T>;
}

async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: jsonHeaders(),
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail));
  }
  return res.json() as Promise<T>;
}

// --- State Sync ---
export async function fetchGameState(): Promise<{ version: number; state: Record<string, unknown> }> {
  const res = await fetch(`${API_BASE}/sync/state`, { headers: authHeaders() });
  if (!res.ok) return { version: 0, state: {} };
  return res.json() as Promise<{ version: number; state: Record<string, unknown> }>;
}

// --- Auction ---
export async function placeBid(brandId: string, amount: number) {
  return apiPost<{ brand_id: string; amount: number }>('/features/auction/bids', { brand_id: brandId, amount });
}

export async function confirmAuctionResultApi(brandId: string, winningBid: number) {
  return apiPost<{ brand_id: string; team_id: string; balance: number }>('/features/auction/result', {
    brand_id: brandId,
    winning_bid: winningBid,
  });
}

export async function updateAuctionStatusApi(status: string) {
  return apiPatch<{ status: string }>('/features/auction/status', { status });
}

// --- Rounds ---
export async function updateRoundStatusApi(roundId: string, status: string) {
  return apiPatch<{ status: string }>(`/features/rounds/${roundId}/status`, { status });
}

// --- Products ---
export async function submitRiddleAnswerApi(answer: string) {
  return apiPost<{ correct: boolean }>('/features/products/riddle/answer', { answer });
}

export async function selectProductApi(productId: string) {
  return apiPost<{ product_id: string; team_id: string; status: string }>('/features/products/select', {
    product_id: productId,
  });
}

// --- Cards ---
export async function purchaseCardApi(cardId: string, quantity = 1) {
  return apiPost<{ card_id: string; quantity: number; balance: number }>('/features/cards/purchase', {
    card_id: cardId,
    quantity,
  });
}

export async function useCardApi(cardId: string, targetTeamId?: string) {
  return apiPost<{ card_id: string; used_quantity: number }>('/features/cards/use', {
    card_id: cardId,
    target_team_id: targetTeamId,
  });
}

// --- Celebrities ---
export async function purchaseCelebrityApi(celebrityId: string) {
  return apiPost<{ celebrity_id: string; balance: number }>('/features/celebrities/purchase', {
    celebrity_id: celebrityId,
  });
}

export async function spinCelebrityApi(teamId: string) {
  return apiPost<{ team_id: string; celebrity_id: string; spin_number: number }>('/features/celebrities/spin', {
    team_id: teamId,
  });
}

export async function revealCelebrityApi(celebrityId: string) {
  return apiPost<{ celebrity_id: string; name: string; revealed: boolean }>(`/features/celebrities/${celebrityId}/reveal`);
}

// --- Conflicts ---
export async function answerConflictApi(conflictId: string, answer: string) {
  return apiPost<{ conflict_id: string; correct: boolean }>(`/features/conflicts/${conflictId}/answer`, { answer });
}

export async function resolveConflictApi(conflictId: string, teamId: string) {
  return apiPost<{ conflict_id: string; status: string }>(`/features/conflicts/${conflictId}/resolve`, {
    team_id: teamId,
  });
}

// --- Scoring ---
export async function setScoreApi(roundId: string, teamId: string, criterionId: string, score: number, notes?: string) {
  return apiPut(`/features/scoring/${roundId}/${teamId}`, { criterion_id: criterionId, score, notes });
}

export async function confirmScoreApi(roundId: string, teamId: string, rewardCoins = 0) {
  return apiPost<{ round_id: string; team_id: string; balance: number; confirmed: boolean }>(
    `/features/scoring/${roundId}/${teamId}/confirm`,
    { reward_coins: rewardCoins }
  );
}

// --- Leaderboard ---
export async function fetchLeaderboard() {
  return apiGet<Array<{ id: string; team_number: string; team_name: string; morph_coins: number; total_score: number; current_rank: number | null }>>('/features/scoring/leaderboard');
}

// --- Market ---
export async function marketBuyApi(opportunityId: string, quantity: number) {
  return apiPost('/market/trades/buy', { opportunity_id: opportunityId, quantity });
}

export async function marketSellApi(opportunityId: string, quantity: number) {
  return apiPost('/market/trades/sell', { opportunity_id: opportunityId, quantity });
}

// --- Notifications ---
export async function fetchNotifications() {
  return apiGet('/features/notifications');
}

// --- Admin Reset ---
export async function resetActiveGameplayApi() {
  return apiPost<{ status: string; scope: string }>('/features/admin/reset-active-gameplay');
}
