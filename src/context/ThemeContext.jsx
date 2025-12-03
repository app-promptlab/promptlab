import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [identity, setIdentity] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchIdentity = async () => {
    try {
      const { data } = await supabase.from('site_identity').select('*').single();
      setIdentity(data || {});
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchIdentity(); }, []);

  // Injetar CSS e Favicon
  useEffect(() => {
    if (identity) {
      const root = document.documentElement;
      root.style.setProperty('--color-primary', identity.primary_color || '#2563eb');
      root.style.setProperty('--color-secondary', identity.secondary_color || '#9333ea');
      root.style.setProperty('--color-bg', identity.background_color || '#000000');
      root.style.setProperty('--color-surface', identity.surface_color || '#111827');
      root.style.setProperty('--color-text', identity.text_color || '#ffffff');
      root.style.setProperty('--radius', identity.border_radius || '0.75rem');
      
      // Atualiza Título
      document.title = identity.app_name || 'PromptLab';

      // Atualiza Favicon
      if (identity.favicon_url) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = identity.favicon_url;
      }
    }
  }, [identity]);

  return (
    <ThemeContext.Provider value={{ identity: identity || {}, refreshIdentity: fetchIdentity, loading }}>
      {!loading && children}
    </ThemeContext.Provider>
  );
};