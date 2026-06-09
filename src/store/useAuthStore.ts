import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "influencer" | "brand" | "admin";
  avatar: string;
  instagramHandle?: string;
  companyName?: string;
}

export interface AuthState {
  user: UserSession;
  notifications: Array<{ id: string; title: string; message: string; read: boolean; time: string }>;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  updateUser: (data: Partial<UserSession>) => void;
  setNotifications: (notifs: Array<{ id: string; title: string; message: string; read: boolean; time: string }>) => void;
  markNotificationsRead: () => void;
  logout: () => void;
}

const defaultSessionUser: UserSession = {
  id: "",
  name: "",
  email: "",
  role: "influencer",
  avatar: "",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: defaultSessionUser,
      notifications: [],
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      updateUser: (data) =>
        set((state) => ({
          user: { ...state.user, ...data },
        })),
      setNotifications: (notifs) => set({ notifications: notifs }),
      markNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("reelio_session_token");
          // Clear the middleware-readable cookie too
          document.cookie = "reelio_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        }
        set({ user: defaultSessionUser, notifications: [] });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
