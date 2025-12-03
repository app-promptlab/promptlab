import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Fallback seguro
  const defaultIdentity = {
    app_name: 'PromptLab',
    primary_color: '#2563eb',
    secondary_color: '#9333ea',
    background_color: '#000000',
    surface_color: '#111827',
    text_color: '#ffffff',
    sidebar_color: '#000000',
    sidebar_text_color: '#9ca3af',
    card_color: '#111827',
    card_text_color: '#ffffff',
    modal_color: '#111827',
    border_radius: '0.75rem',
    logo_header_url: '',
    logo_menu_url: '',
    favicon_url: ''
  };

  const [identity, setIdentity] = useState(defaultIdentity);
  const [loading, setLoading] = useState(true);

  const fetchIdentity = async () => {
    try {
      const { data } = await supabase.from('site_identity').select('*').single();
      // Se data existir, mescla com default para garantir que nenhum campo fique undefined
      if (data) setIdentity({ ...defaultIdentity, ...data });
    } catch (error) { 
      console.error("Erro tema:", error); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchIdentity(); }, []);

  useEffect(() => {
    const root = document.documentElement;
    const theme = identity;

    root.style.setProperty('--color-primary', theme.primary_color);
    root.style.setProperty('--color-secondary', theme.secondary_color);
    root.style.setProperty('--color-bg', theme.background_color);
    root.style.setProperty('--color-surface', theme.surface_color);
    root.style.setProperty('--color-text', theme.text_color);
    
    root.style.setProperty('--color-sidebar', theme.sidebar_color);
    root.style.setProperty('--color-sidebar-text', theme.sidebar_text_color);
    root.style.setProperty('--color-card', theme.card_color);
    root.style.setProperty('--color-card-text', theme.card_text_color);
    root.style.setProperty('--color-modal', theme.modal_color);
    
    root.style.setProperty('--radius', theme.border_radius);
    document.title = theme.app_name;

    if (theme.favicon_url) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = theme.favicon_url;
    }
  }, [identity]);

  return (
    <ThemeContext.Provider value={{ identity, refreshIdentity: fetchIdentity, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};