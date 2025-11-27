import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient'; // <--- IMPORTA A CONEXÃO ÚNICA

export default function AuthScreen({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const canvasRef = useRef(null);
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
      supabase.from('app_settings').select('logo_header_url').single().then(({data}) => {
          if(data && data.logo_header_url) setLogoUrl(data.logo_header_url);
      });
  }, []);

  // Animação Warp Speed
  useEffect(() => {
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
    let width = window.innerWidth; let height = window.innerHeight; canvas.width = width; canvas.height = height;
    let stars = []; for(let i=0; i<200; i++) stars.push({x: (Math.random()-0.5)*width, y: (Math.random()-0.5)*height, z: Math.random()*width});
    const render = () => {
        ctx.fillStyle = 'black'; ctx.fillRect(0, 0, width, height); ctx.fillStyle = 'white';
        stars.forEach(star => {
            star.z -= 2; if(star.z <= 0) { star.z = width; star.x = (Math.random()-0.5)*width; star.y = (Math.random()-0.5)*height; }
            const x = (star.x / star.z) * width + width/2; const y = (star.y / star.z) * height + height/2; const size = (1 - star.z / width) * 3;
            if(x>0 && x<width && y>0 && y<height) { ctx.globalAlpha = (1 - star.z / width); ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI*2); ctx.fill(); }
        });
        requestAnimationFrame(render);
    };
    render();
  }, []);
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden font-sans select-none">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-60" />
      <div className="w-full max-w-md bg-gray-900/60 backdrop-blur-xl p-10 rounded-3xl border border-white/10 relative z-10 shadow-2xl">
        <div className="text-center mb-8">
            {logoUrl ? <img src={logoUrl} className="h-24 mx-auto mb-6 object-contain drop-shadow-2xl"/> : <h2 className="text-5xl font-bold text-white mb-4 tracking-tighter">Prompt<span className="text-blue-600">Lab</span></h2>}
            <p className="text-gray-400 text-sm font-medium tracking-widest uppercase">{isRegister ? "Criar Conta" : "Acessar Plataforma"}</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(email, password, name, isRegister); }} className="space-y-6">
          {isRegister && <div className="group"><input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl p-4 text-white focus:border-blue-500 outline-none" placeholder="Nome completo" /></div>}
          <div className="group"><input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl p-4 text-white focus:border-blue-500 outline-none" placeholder="Seu e-mail" /></div>
          <div className="group"><input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl p-4 text-white focus:border-blue-500 outline-none" placeholder="Sua senha" /></div>
          <button type="submit" className="w-full bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white font-bold py-4 rounded-xl shadow-lg uppercase tracking-widest text-xs mt-4">{isRegister ? "Cadastrar" : "Entrar"}</button>
        </form>
        <button onClick={() => setIsRegister(!isRegister)} className="w-full text-center mt-8 text-xs text-gray-500 hover:text-white transition-colors">{isRegister ? "Já tenho conta? Login" : "Não tem conta? Criar"}</button>
      </div>
    </div>
  );
}