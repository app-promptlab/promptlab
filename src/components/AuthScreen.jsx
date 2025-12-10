import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Loader2, Mail, Lock, User, ArrowRight, CheckSquare, Square } from 'lucide-react';

export default function AuthScreen({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Chama a função de login
    await onLogin(formData.email, formData.password, formData.name, isRegister);
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });
    if (error) {
        alert('Erro no Google: ' + error.message);
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg flex items-center justify-center p-4">
      <div className="bg-theme-sidebar border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn">
        
        {/* Cabeçalho */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">PromptLab</h1>
          <p className="text-gray-400">
            {isRegister ? 'Crie sua conta gratuita' : 'Acesse sua conta'}
          </p>
        </div>

        {/* Botão Google (Sempre visível) */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors mb-6"
        >
          {loading ? (
             <Loader2 className="animate-spin text-black" size={20} />
          ) : (
             // Ícone G do Google (SVG inline para garantir que apareça)
             <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.61.81-.23z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
             </svg>
          )}
          Entrar com Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-theme-sidebar text-gray-500">ou continue com e-mail</span>
          </div>
        </div>

        {/* Formulário com Autocomplete */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegister && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-400 ml-1">Nome</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-500" size={20} />
                <input
                  type="text"
                  name="name" // Importante para o navegador
                  autoComplete="name"
                  required
                  placeholder="Seu nome"
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-theme-primary transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-400 ml-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-500" size={20} />
              <input
                type="email"
                name="email" // Importante
                autoComplete="email" // Importante
                required
                placeholder="seu@email.com"
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-theme-primary transition-colors"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-400 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
              <input
                type="password"
                name="password" // Importante
                autoComplete={isRegister ? "new-password" : "current-password"} // Importante para salvar/preencher
                required
                placeholder="******"
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-theme-primary transition-colors"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {/* Opção "Lembrar de mim" */}
          {!isRegister && (
             <div className="flex items-center gap-2 cursor-pointer mt-2" onClick={() => setRememberMe(!rememberMe)}>
                {rememberMe ? <CheckSquare size={18} className="text-theme-primary" /> : <Square size={18} className="text-gray-500" />}
                <span className="text-sm text-gray-400 select-none">Lembrar de mim</span>
             </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-theme-primary hover:bg-theme-primary/90 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-theme-primary/20 mt-6"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isRegister ? 'Criar Conta' : 'Entrar na Plataforma')}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-400 text-sm">
          {isRegister ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-theme-primary font-bold ml-2 hover:underline"
          >
            {isRegister ? 'Fazer Login' : 'Criar agora'}
          </button>
        </p>

      </div>
    </div>
  );
}