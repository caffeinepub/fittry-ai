import { useState } from "react";

export interface LocalUser {
  name: string;
  contact: string;
  contactType: "email" | "mobile";
}

const STORAGE_KEY = "fittriai_user";

function loadUser(): LocalUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LocalUser) : null;
  } catch {
    return null;
  }
}

export function useLocalAuth() {
  const [user, setUser] = useState<LocalUser | null>(loadUser);

  const login = (u: LocalUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return { user, login, logout };
}
