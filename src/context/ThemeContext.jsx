import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [identity, setIdentity] = useState(null);
  const [loading, setLoading] = useState(true);

  // Padrão de Fallback
  const defaultIdentity = {
    app_name: 'PromptLab',
    primary_color: '#2563eb', secondary_color: '#9333ea',
    background_color: '#000000', surface_color: '#111827',
    text_color: '#ffffff', border_radius: '0.75rem',
    logo_header_url: '', logo_menu_url: ''
  };

  const fetchIdentity = async () => {
    try {
      const { data } = await supabase.from('site_identity').select('*').single();
      setIdentity(data || defaultIdentity);
    } catch (error) {
      console.error("Erro tema:", error);
      setIdentity(defaultIdentity);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchIdentity(); }, []);

  // Injetar CSS Variables no HTML
  useEffect(() => {
    if (identity) {
      const root = document.documentElement;
      root.style.setProperty('--color-primary', identity.primary_color);
      root.style.setProperty('--color-secondary', identity.secondary_color);
      root.style.setProperty('--color-bg', identity.background_color);
      root.style.setProperty('--color-surface', identity.surface_color);
      root.style.setProperty('--color-text', identity.text_color);
      root.style.setProperty('--radius', identity.border_radius);
      // Atualiza título da aba
      document.title = identity.app_name || 'PromptLab';
    }
  }, [identity]);

  return (
    <ThemeContext.Provider value={{ identity: identity || defaultIdentity, refreshIdentity: fetchIdentity, loading }}>
      {!loading && children}
    </ThemeContext.Provider>
  );
};