import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { saveUserProfile, getUserProfile, UserProfile } from '@/services/userService';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { auth } = await import('@/lib/firebase');
        const { onAuthStateChanged } = await import('firebase/auth');
        
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              // Try to load existing profile from Firebase first
              const existingProfile = await getUserProfile(firebaseUser.uid);
              
              const userData = {
                id: firebaseUser.uid,
                name: existingProfile?.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                email: firebaseUser.email || '',
                avatar: existingProfile?.avatar || firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${firebaseUser.displayName || 'User'}`
              };
              
              setUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
              
              // Save/update user profile in Firebase
              const userProfile: UserProfile = {
                ...userData,
                createdAt: existingProfile?.createdAt || new Date().toISOString(),
                lastLoginAt: new Date().toISOString()
              };
              await saveUserProfile(userProfile);
            } catch (error) {
              console.error('Failed to load/save user profile:', error);
              // Fallback to basic user data
              const userData = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                email: firebaseUser.email || '',
                avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${firebaseUser.displayName || 'User'}`
              };
              setUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
            }
          } else {
            setUser(null);
            localStorage.removeItem('user');
          }
        });
        
        return () => unsubscribe();
      } catch (error) {
        // Fallback to localStorage if Firebase fails
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      }
    };
    
    initAuth();
  }, []);

  const login = async (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Save user profile to Firebase
    try {
      const userProfile: UserProfile = {
        ...userData,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      await saveUserProfile(userProfile);
    } catch (error) {
      console.error('Failed to save user profile:', error);
    }
  };

  const logout = async () => {
    try {
      const { auth } = await import('@/lib/firebase');
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};