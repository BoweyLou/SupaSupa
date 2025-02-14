'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // If user is authenticated, redirect to dashboard
          window.location.href = '/dashboard';
        } else {
          // If user is not authenticated, redirect to login
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        window.location.href = '/login';
      }
    };

    checkAuth();
  }, []);

  // Show a loading state while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Loading...</div>
    </div>
  );
}
