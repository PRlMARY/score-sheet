import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  signIn: (username: string, password: string) => Promise<boolean>;
  signUp: (username: string, password: string) => Promise<boolean>;
  signOut: () => void;
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

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('scoresheet-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('scoresheet-user');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get stored users
      const storedUsers = JSON.parse(localStorage.getItem('scoresheet-users') || '[]');
      const foundUser = storedUsers.find((u: any) => 
        u.username === username && u.password === password
      );
      
      if (foundUser) {
        const user: User = {
          id: foundUser.id,
          username: foundUser.username,
        };
        setUser(user);
        localStorage.setItem('scoresheet-user', JSON.stringify(user));
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

  const signUp = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get stored users
      const storedUsers = JSON.parse(localStorage.getItem('scoresheet-users') || '[]');
      
      // Check if username already exists
      if (storedUsers.find((u: any) => u.username === username)) {
        return false;
      }
      
      // Create new user
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        password,
      };
      
      storedUsers.push(newUser);
      localStorage.setItem('scoresheet-users', JSON.stringify(storedUsers));
      
      // Auto sign in the new user
      const user: User = {
        id: newUser.id,
        username: newUser.username,
      };
      setUser(user);
      localStorage.setItem('scoresheet-user', JSON.stringify(user));
      
      return true;
    } catch (error) {
      console.error('Sign up error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('scoresheet-user');
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
