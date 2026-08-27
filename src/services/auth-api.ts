const API_ORIGIN = process.env.NEXT_PUBLIC_LARAVEL_API_ORIGIN ?? 'http://localhost';

type AuthResponse = {
  user: {
    id: number;
    name: string;
    email: string;
  };
  token: string;
};

export type AuthenticatedUser = AuthResponse['user'];

type AuthRequest = {
  name?: string;
  email: string;
  password: string;
  password_confirmation?: string;
};

const authRequest = async (path: string, payload: AuthRequest): Promise<AuthResponse> => {
  const response = await fetch(`${API_ORIGIN}/api/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
      errors?: Record<string, string[]>;
    } | null;
    const firstError = body?.errors ? Object.values(body.errors).flat()[0] : undefined;
    throw new Error(firstError ?? body?.message ?? '認証に失敗しました。');
  }

  return (await response.json()) as AuthResponse;
};

export const register = (payload: Required<AuthRequest>): Promise<AuthResponse> =>
  authRequest('register', payload);
