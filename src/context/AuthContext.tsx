import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Household } from '@/types';
import { INITIAL_PROFILE, INITIAL_HOUSEHOLD } from '@/lib/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';

interface AuthContextType {
  user: UserProfile | null;
  household: Household | null;
  loading: boolean;
  isOnboarded: boolean;
  signInWithEmail: (email: string, password?: string) => Promise<boolean>;
  signUpWithEmail: (fullName: string, email: string, password?: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  signInAsDemo: () => void;
  signOut: () => Promise<void>;
  completeOnboarding: (name: string, householdName: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    // If the user explicitly logged out, keep them logged out
    const isLoggedOut = localStorage.getItem('paisapilot_logged_out') === 'true';
    if (isLoggedOut) return null;

    const saved = localStorage.getItem('paisapilot_user');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [household, setHousehold] = useState<Household | null>(() => {
    const saved = localStorage.getItem('paisapilot_household');
    return saved ? JSON.parse(saved) : INITIAL_HOUSEHOLD;
  });

  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    const saved = localStorage.getItem('paisapilot_onboarded');
    return saved ? JSON.parse(saved) : true;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('paisapilot_user', JSON.stringify(user));
      localStorage.removeItem('paisapilot_logged_out');
    } else {
      localStorage.removeItem('paisapilot_user');
    }
  }, [user]);

  useEffect(() => {
    if (household) {
      localStorage.setItem('paisapilot_household', JSON.stringify(household));
    }
  }, [household]);

  const signInWithEmail = async (email: string, password = 'password123'): Promise<boolean> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || email.split('@')[0],
            avatar_url: data.user.user_metadata?.avatar_url || null,
            currency: 'INR',
            created_at: new Date().toISOString(),
          };
          setUser(profile);
        }
      } else {
        // Fast local authentication
        const namePart = email.split('@')[0].replace(/[._]/g, ' ');
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        const signedInUser: UserProfile = {
          id: `usr-${Date.now()}`,
          full_name: formattedName || 'Parth Saini',
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          currency: 'INR',
          created_at: new Date().toISOString(),
        };
        setUser(signedInUser);
      }
      localStorage.removeItem('paisapilot_logged_out');
      toast.success('Welcome back to PaisaPilot!');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign in');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (
    fullName: string,
    email: string,
    password = 'password123'
  ): Promise<boolean> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            full_name: fullName,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            currency: 'INR',
            created_at: new Date().toISOString(),
          };
          setUser(profile);
        }
      } else {
        const newUser: UserProfile = {
          id: `usr-${Date.now()}`,
          full_name: fullName.trim(),
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          currency: 'INR',
          created_at: new Date().toISOString(),
        };
        setUser(newUser);
      }

      localStorage.removeItem('paisapilot_logged_out');
      setIsOnboarded(false); // Trigger onboarding to set household name
      toast.success(`Account created for ${fullName}! Let's set up your household.`);
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to create account');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: window.location.origin },
        });
      } else {
        const googleUser: UserProfile = {
          id: 'usr-google-demo',
          full_name: 'Aarav Sharma',
          avatar_url:
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          currency: 'INR',
          created_at: new Date().toISOString(),
        };
        setUser(googleUser);
        localStorage.removeItem('paisapilot_logged_out');
        toast.success('Signed in with Google!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const signInAsDemo = () => {
    setUser(INITIAL_PROFILE);
    localStorage.removeItem('paisapilot_logged_out');
    toast.success('Signed in as Demo User (Parth Saini)');
  };

  const signOut = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Supabase sign out error:', e);
    }
    // Set logged out state
    localStorage.setItem('paisapilot_logged_out', 'true');
    localStorage.removeItem('paisapilot_user');
    setUser(null);
    toast.info('Signed out successfully');
  };

  const completeOnboarding = (name: string, householdName: string) => {
    if (user) {
      const updated = { ...user, full_name: name };
      setUser(updated);
    }
    const newHousehold: Household = {
      id: `hh-${Date.now()}`,
      name: householdName || 'My Indian Household',
      created_by: user?.id || 'usr-pilot-01',
      created_at: new Date().toISOString(),
    };
    setHousehold(newHousehold);
    setIsOnboarded(true);
    localStorage.setItem('paisapilot_onboarded', JSON.stringify(true));
    toast.success('Setup complete! Your household is ready.');
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...updates });
      toast.success('Profile updated');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        household,
        loading,
        isOnboarded,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInAsDemo,
        signOut,
        completeOnboarding,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
