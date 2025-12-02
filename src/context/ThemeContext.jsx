import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Valores padrão (PromptLab) caso o banco falhe
  const defaultConfig = {
    app_name: 'PromptLab',
    primary_color: '#2563eb',   // blue-600
    secondary_color: '#9333ea', // purple-600
    background_color: '#000000',
    surface_color: '#111827',   // gray-900
    text_color: '#ffffff',
    border_radius: '0.75rem',
    logo_header_url: '',
    logo_menu_url: '',
    hero_background_url: '',
    home_title: 'Olá, Criador',
    home_subtitle: 'O que vamos criar hoje?',
    // ... outros defaults
  };

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase.from('site_config').select('*').single();
      if (data) setConfig(data);
      else setConfig(defaultConfig);
    } catch (error) {
      console.error("Erro ao carregar tema:", error);
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Injeção de CSS Dinâmico (A Mágica do White Label)
  useEffect(() => {
    if (config) {
      const root = document.documentElement;
      root.style.setProperty('--color-primary', config.primary_color);
      root.style.setProperty('--color-secondary', config.secondary_color);
      root.style.setProperty('--color-bg', config.background_color);
      root.style.setProperty('--color-surface', config.surface_color);
      root.style.setProperty('--color-text', config.text_color);
      root.style.setProperty('--radius', config.border_radius);
    }
  }, [config]);

  return (
    <ThemeContext.Provider value={{ config: config || defaultConfig, refreshConfig: fetchConfig, loading }}>
      {!loading && children}
    </ThemeContext.Provider>
  );
};