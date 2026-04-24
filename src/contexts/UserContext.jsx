import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('esports_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        localStorage.removeItem('esports_user');
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    // Sincronização extra se necessário
  }, []);

  function login(userData) {
    const userObj = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      avatar_url: userData.avatar_url || null,
      banner_url: userData.banner_url || null,
    };
    setUser(userObj);
    localStorage.setItem('esports_user', JSON.stringify(userObj));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('esports_user');
  }

  function updateUser(updatedFields) {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('esports_user', JSON.stringify(updated));
      return updated;
    });
  }

  return (
    <UserContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
