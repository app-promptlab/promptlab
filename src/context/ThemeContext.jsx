import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Padrão de segurança (para não quebrar se o banco demorar)
  const defaultIdentity = {
    app_name: 'PromptLab',
    primary_color: '#2563eb',
    secondary_color: '#9333ea',
    background_color: '#000000',
    surface_color: '#111827',
    text_color: '#ffffff',
    
    // Cores Novas
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
      if (data) setIdentity(data);
    } catch (error) { 
      console.error("Erro ao carregar tema:", error); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchIdentity(); }, []);

  // Injetar CSS Variables no HTML
  useEffect(() => {
    const root = document.documentElement;
    const theme = identity || defaultIdentity;

    // Cores Principais
    root.style.setProperty('--color-primary', theme.primary_color || '#2563eb');
    root.style.setProperty('--color-secondary', theme.secondary_color || '#9333ea');
    root.style.setProperty('--color-bg', theme.background_color || '#000000');
    root.style.setProperty('--color-surface', theme.surface_color || '#111827'); // Fallback visual
    root.style.setProperty('--color-text', theme.text_color || '#ffffff');
    
    // Cores Específicas (Menu, Card, Modal)
    root.style.setProperty('--color-sidebar', theme.sidebar_color || '#000000');
    root.style.setProperty('--color-sidebar-text', theme.sidebar_text_color || '#9ca3af');
    root.style.setProperty('--color-card', theme.card_color || '#111827');
    root.style.setProperty('--color-card-text', theme.card_text_color || '#ffffff');
    root.style.setProperty('--color-modal', theme.modal_color || '#111827');

    // Configs
    root.style.setProperty('--radius', theme.border_radius || '0.75rem');
    document.title = theme.app_name || 'PromptLab';

    // Favicon
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