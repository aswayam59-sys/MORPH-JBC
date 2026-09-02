/** Frontend authentication API client. */

const API_BASE_URL = `${import.meta.env.VITE_API_URL || ''}/api`;

export async function loginTeam(teamNumber: number, accessCode: string): Promise<{ teamId: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/team`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team_number: teamNumber, access_code: accessCode }),
  });

  if (!response.ok) return Promise.reject(new Error('Invalid team number or access code'));

  const data = (await response.json()) as { access_token: string; team_id: string };
  sessionStorage.setItem('morph_access_token', data.access_token);
  return { teamId: data.team_id };
}

export async function loginAdmin(email: string, password: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error('Invalid admin credentials');
  const data = (await response.json()) as { access_token: string };
  sessionStorage.setItem('morph_access_token', data.access_token);
}
