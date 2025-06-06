
import { useEffect } from 'react';
import { useAuthStore } from '@/context/authStore';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseAuth = () => {
  const { setUser, logout } = useAuthStore();

  useEffect(() => {
    // Vérifier la session existante au chargement
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (profileData) {
          const userData = {
            id: session.user.id,
            email: session.user.email!,
            firstName: profileData.first_name,
            lastName: profileData.last_name,
            role: profileData.role as 'USER' | 'ADMIN',
            settings: profileData.settings || { privateMode: false },
          };
          setUser(userData);
        }
      }
    };

    getSession();

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (profileData) {
            const userData = {
              id: session.user.id,
              email: session.user.email!,
              firstName: profileData.first_name,
              lastName: profileData.last_name,
              role: profileData.role as 'USER' | 'ADMIN',
              settings: profileData.settings || { privateMode: false },
            };
            setUser(userData);
          }
        } else if (event === 'SIGNED_OUT') {
          logout();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, logout]);
};
