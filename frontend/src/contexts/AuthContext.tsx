import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  signIn: (username: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  signUp: (username: string, password: string, confirmPassword: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/auth/check', {
          method: 'GET',
          credentials: 'include', // Include cookies
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.user) {
            setUser({
              id: data.user.id,
              username: data.user.username,
            });
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const signIn = async (username: string, password: string, rememberMe = false): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const response = await fetch('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ username, password, rememberMe }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Sign in failed:', errorData.message);
        return false;
      }
      
      const data = await response.json();
      if (data && data.user) {
        const user: User = {
          id: data.user.id,
          username: data.user.username,
        };
        setUser(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Sign in error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (username: string, password: string, confirmPassword: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ username, password, confirmPassword }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Sign up failed:', errorData.message);
        return false;
      }
      
      const data = await response.json();
      if (data && data.user) {
        setUser({ id: data.user.id, username: data.user.username });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Sign up error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      // Call backend to clear session
      await fetch('http://localhost:3000/api/auth/signout', {
        method: 'POST',
        credentials: 'include', // Include cookies
      });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Always clear user from state
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
