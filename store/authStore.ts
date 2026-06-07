import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser } from '@/types';

const USERS = [
  { id: '1', name: 'Admin User', email: 'admin@academix.uz', password: 'admin123', role: 'admin' as const },
  { id: '2', name: 'Sardor Toshmatov', email: 'teacher@academix.uz', password: 'teacher123', role: 'teacher' as const },
];

interface AuthStore {
  user: AuthUser | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      login: (email, password) => {
        const found = USERS.find(u => u.email === email && u.password === password);
        if (!found) return { success: false, error: "Email yoki parol noto'g'ri" };
        const { password: _, ...user } = found;
        set({ user });
        return { success: true };
      },
      logout: () => set({ user: null }),
    }),
    { name: 'academix-auth' }
  )
);
