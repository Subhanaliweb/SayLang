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
      console.log('Auth event:', event, session?.user?.email_confirmed_at);
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Handle specific error for unconfirmed email
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please check your email and click the verification link before signing in.');
      }
      throw error;
    }
    setUser(data.user);
    return data;
  };

  const register = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: 'YOUR_APP_DEEP_LINK_OR_WEBSITE', // Replace with your actual redirect URL
      }
    });
    
    if (error) {
      // Handle specific errors
      if (error.message.includes('User already registered')) {
        throw new Error('An account with this email already exists. Please try logging in instead.');
      }
      if (error.message.includes('Password should be at least')) {
        throw new Error('Password must be at least 6 characters long.');
      }
      if (error.message.includes('Unable to validate email address')) {
        throw new Error('Please enter a valid email address.');
      }
      throw error;
    }
    
    // Check if data exists before proceeding
    if (!data) {
      throw new Error('Registration failed. Please try again.');
    }
    
    // Note: With email confirmation enabled, data.user will exist but email_confirmed_at will be null
    // Don't set user here - wait for email confirmation
    
    return data;
  };

  const resendConfirmation = async (email) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: 'YOUR_APP_DEEP_LINK_OR_WEBSITE', // Replace with your actual redirect URL
      }
    });
    
    if (error) {
      if (error.message.includes('For security purposes')) {
        throw new Error('Please wait a moment before requesting another verification email.');
      }
      throw error;
    }
    return true;
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
    <AuthContext.Provider value={{ 
      user, 
      anonymousUser, 
      login, 
      register, 
      resendConfirmation,
      continueAsAnonymous, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);