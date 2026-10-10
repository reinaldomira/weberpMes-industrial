import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User } from 'firebase/auth';
import { authService } from '../services/authService';
import { companyService } from '../services/companyService';
import { isFirebaseConfigured } from '../lib/firebase';
import { CompanyDocument, CompanyMemberDocument } from '../services/companyFirestoreTypes';

interface AuthContextType {
  currentUser: User | null;
  activeCompany: CompanyDocument | null;
  currentMember: CompanyMemberDocument | null;
  isLoading: boolean;
  isLoadingCompany: boolean;
  isConfigured: boolean;
  login: (email: string, pass: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  register: (email: string, pass: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshMembership: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  activeCompany: null,
  currentMember: null,
  isLoading: true,
  isLoadingCompany: false,
  isConfigured: false,
  login: async () => { throw new Error('Auth not initialized'); },
  loginWithGoogle: async () => { throw new Error('Auth not initialized'); },
  register: async () => { throw new Error('Auth not initialized'); },
  logout: async () => {},
  refreshMembership: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeCompany, setActiveCompany] = useState<CompanyDocument | null>(null);
  const [currentMember, setCurrentMember] = useState<CompanyMemberDocument | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingCompany, setIsLoadingCompany] = useState<boolean>(false);
  const isConfigured = isFirebaseConfigured();

  const loadMembership = useCallback(async (uid: string) => {
    setIsLoadingCompany(true);
    try {
      const memberships = await companyService.getUserMemberships(uid);
      if (memberships.length > 0) {
        // Seleciona a primeira empresa ativa vinculada
        setActiveCompany(memberships[0].company);
        setCurrentMember(memberships[0].member);
      } else {
        setActiveCompany(null);
        setCurrentMember(null);
      }
    } catch (err) {
      console.warn('[AuthProvider] Erro ao carregar vínculo com empresa:', err);
      setActiveCompany(null);
      setCurrentMember(null);
    } finally {
      setIsLoadingCompany(false);
    }
  }, []);

  const refreshMembership = useCallback(async () => {
    if (currentUser) {
      await loadMembership(currentUser.uid);
    }
  }, [currentUser, loadMembership]);

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = authService.onAuthStateChange(async (user) => {
      setCurrentUser(user);
      setIsLoading(false);

      if (user) {
        await loadMembership(user.uid);
      } else {
        setActiveCompany(null);
        setCurrentMember(null);
      }
    });

    return () => unsubscribe();
  }, [isConfigured, loadMembership]);

  const loginWithGoogle = async () => {
    const user = await authService.loginWithGoogle();
    setCurrentUser(user);
    await loadMembership(user.uid);
    return user;
  };

  const login = async (email: string, pass: string) => {
    const user = await authService.login(email, pass);
    setCurrentUser(user);
    await loadMembership(user.uid);
    return user;
  };

  const register = async (email: string, pass: string) => {
    const user = await authService.register(email, pass);
    setCurrentUser(user);
    // Novo usuário inicia sem empresa vinculada e sem privilégio de admin
    setActiveCompany(null);
    setCurrentMember(null);
    return user;
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setActiveCompany(null);
    setCurrentMember(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeCompany,
        currentMember,
        isLoading,
        isLoadingCompany,
        isConfigured,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshMembership,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
