import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [anonymousUser, setAnonymousUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
      setLoading(false);
    };

    checkSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setUser(data.user);
    return data;
  };

  const register = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    setUser(data.user);
    return data;
  };

  const continueAsAnonymous = async (username) => {
    try {
      // First, try to find existing anonymous user with this username
      const { data: existingUser, error: findError } = await supabase
        .from('anonymous_users')
        .select('*')
        .eq('username', username)
        .single();

      if (findError && findError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw findError;
      }

      if (existingUser) {
        // User exists, return existing user
        console.log('Welcome back!', username);
        setAnonymousUser(existingUser);
        return existingUser;
      } else {
        // Create new anonymous user
        const { data, error } = await supabase
          .from('anonymous_users')
          .insert({ username })
          .select()
          .single();
        
        if (error) throw error;
        console.log('New guest user created:', username);
        setAnonymousUser(data);
        return data;
      }
    } catch (error) {
      console.error('Error in continueAsAnonymous:', error);
      throw error;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setAnonymousUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, anonymousUser, login, register, continueAsAnonymous, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);