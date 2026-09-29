import type { RegisteredUser } from './src/types/auth'

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function getRegisteredUsers(): RegisteredUser[] {
  try {
    const storedUsers = localStorage.getItem('registeredUsers')

    if (!storedUsers) {
      return []
    }

    const parsedUsers: unknown = JSON.parse(storedUsers)
    return Array.isArray(parsedUsers) ? (parsedUsers as RegisteredUser[]) : []
  } catch {
    return []
  }
}
