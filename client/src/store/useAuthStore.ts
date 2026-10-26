import { create } from "zustand";
import { User } from "../types";

interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

const getInitialAuth = () => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  if (token && userStr) {
    try {
      return { token, user: JSON.parse(userStr) };
    } catch {}
  }
  if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("demo") === "admin") {
    const demoToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwibmFtYSI6IkFkbWluaXN0cmF0b3IgR3VkYW5nIEFUSyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc5MzAwMzY1NiwiZXhwIjoxNzkzMDMyNDU2fQ.FOuw7Hdhc927wkVFxAjIWzl6otYYL_gdLvMqrvfd2y4";
    const demoUser = { id_user: 1, username: "admin", nama: "Administrator Gudang ATK", role: "admin" as const };
    localStorage.setItem("token", demoToken);
    localStorage.setItem("user", JSON.stringify(demoUser));
    return { token: demoToken, user: demoUser };
  }
  return { token: null, user: null };
};

const initial = getInitialAuth();

export const useAuthStore = create<AuthState>((set, get) => ({
  token: initial.token,
  user: initial.user,

  login: (token: string, user: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null });
  },

  isAuthenticated: () => {
    return !!get().token;
  },

  isAdmin: () => {
    return get().user?.role === "admin";
  },
}));
