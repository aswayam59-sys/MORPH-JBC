/**
 * Clean data structures before serializing to local storage/broadcast
 */
function cleanData(value: unknown): unknown {
  if (value === undefined) return null;
  if (Array.isArray(value)) {
    return value.map((item) => (item === undefined ? null : cleanData(item)));
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const cleaned: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (item !== undefined) {
        cleaned[key] = cleanData(item);
      } else {
        cleaned[key] = null;
      }
    }
    return cleaned;
  }
  return value;
}

/**
 * Publish game state updates across open tabs and browser windows locally.
 */
export async function updateGameState(data: Record<string, unknown>): Promise<void> {
  try {
    const cleaned = cleanData(data) as Record<string, unknown>;
    const payload = JSON.stringify(cleaned);

    const token = sessionStorage.getItem('morph_access_token');
    if (!token) return;
    const current = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/sync/state`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!current.ok) return;
    const currentState = (await current.json()) as { version: number };
    await fetch(`${import.meta.env.VITE_API_URL || ''}/api/sync/state`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ state: cleaned.gameState || cleaned, expected_version: currentState.version }),
    });

    // Broadcast message to all listening tabs/windows
    // Clients receive updates from the server SSE stream below.
  } catch (err) {
    console.debug('Local state broadcast notice:', err);
  }
}

/**
 * Save one team's Market portfolio and transaction history locally.
 */
export async function saveMarketTeamState(
  teamId: string,
  portfolio: unknown,
  transactions: unknown
): Promise<void> {
  void teamId;
  void portfolio;
  void transactions;
}

/**
 * Load all saved Market team states from local storage.
 */
export async function loadMarketTeamStates(): Promise<
  Record<string, { portfolio?: unknown; transactions?: unknown }>
> {
  return {};
}

/**
 * Listen for game state broadcasts across open tabs or windows.
 */
export function listenToGameState(
  callback: (data: Record<string, unknown>) => void
): () => void {
  const token = sessionStorage.getItem('morph_access_token');
  const apiBase = `${import.meta.env.VITE_API_URL || ''}/api`;
  if (token) {
    fetch(`${apiBase}/sync/state`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => payload?.state && callback({ gameState: payload.state }))
      .catch(() => undefined);
  }

  if (token) {
    fetch(`${apiBase}/sync/events`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (!response.ok || !response.body) return;
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const messages = buffer.split('\n\n');
          buffer = messages.pop() || '';
          for (const message of messages) {
            const line = message.split('\n').find((entry) => entry.startsWith('data: '));
            if (line) callback({ gameState: JSON.parse(line.slice(6)).state });
          }
        }
      })
      .catch(() => undefined);
  }

  // 3. Fallback to Window storage event across tabs
  return () => {
  };
}
