import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  profile: any;
  session: Session | null;
  loading: boolean;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for active session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      
      setLoading(false);
    };
    
    getSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change event:', event);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchProfile(session.user.id);
        toast.success('Signed in successfully!');
        navigate('/');
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        toast.info('Signed out successfully');
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for ID:', userId);
  
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
  
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        throw error;
      }
  
      if (data) {
        console.log('User profile found:', data);
        setProfile(data);
      } else {
        await createUserProfile(userId);
      }
    } catch (err) {
      console.error('Exception in fetchProfile:', err);
    }
  };
  
  const createUserProfile = async (userId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
  
      if (!userData?.user) return;
  
      const newUser = {
        id: userData.user.id,
        username:
          userData.user.user_metadata?.name ||
          userData.user.user_metadata?.full_name ||
          'Anonymous Coder',
        email: userData.user.email,
        avatar_url: userData.user.user_metadata?.avatar_url || null,
        rating: 1000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
  
      const { data, error } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single();
  
      if (error) {
        console.error('Error creating user:', error);
        toast.error('Failed to create user record.');
      } else {
        console.log('User created:', data);
        setProfile(data);
      }
    } catch (err) {
      console.error('Exception in createUserProfile:', err);
    }
  };

  const signInWithGithub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    });
    
    if (error) {
      toast.error('Failed to sign in with GitHub');
      console.error('GitHub Sign In Error:', error);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast.error('Failed to sign out');
      console.error('Sign Out Error:', error);
    } else {
      setUser(null);
      setProfile(null);
      setSession(null);
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signInWithGithub,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};