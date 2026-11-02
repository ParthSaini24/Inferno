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
  signInWithEmail: (email: string, password?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: (name: string, householdName: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
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
    } else {
      localStorage.removeItem('paisapilot_user');
    }
  }, [user]);

  useEffect(() => {
    if (household) {
      localStorage.setItem('paisapilot_household', JSON.stringify(household));
    }
  }, [household]);

  const signInWithEmail = async (email: string, password = 'password123') => {
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
        // Instant Demo/Offline authentication
        const demoUser: UserProfile = {
          id: `usr-${Date.now()}`,
          full_name: email.split('@')[0].replace('.', ' '),
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          currency: 'INR',
          created_at: new Date().toISOString(),
        };
        setUser(demoUser);
      }
      toast.success('Welcome back to PaisaPilot!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign in');
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
          options: { redirectTo: window.location.origin }
        });
      } else {
        // Fast Demo Google Sign-in simulation
        const googleUser: UserProfile = {
          id: 'usr-google-demo',
          full_name: 'Aarav Sharma',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          currency: 'INR',
          created_at: new Date().toISOString(),
        };
        setUser(googleUser);
        toast.success('Signed in with Google!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    toast.info('Signed out safely');
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
    toast.success('Onboarding complete! Your categories and budget are ready.');
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
        signInWithGoogle,
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
