import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, Images, Star, Zap, BookOpen, User, LogOut, Menu, X, 
  Heart, Copy, Check, ExternalLink, Camera, Edit3, Lock, Unlock, 
  ShoppingCart, Sparkles, Play, Mail, ArrowRight, Loader2, Database, 
  Trash2, Bold, Italic, Underline, Link as LinkIcon, List, AlignLeft, 
  Facebook, Instagram, Music, Key, ChevronLeft, ChevronRight, Crown,
  Shield, Save, Plus, Search, Users,
  ShoppingBag, Settings, UploadCloud,
  Twitter, Linkedin, Globe, Github, HelpCircle, LayoutGrid, Monitor, 
  Gamepad2, Trophy
} from 'lucide-react';

// --- CONEXÃO COM SUPABASE ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchProfileData(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const fetchProfileData = async (userId, email) => {
    try {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
        const { data: purchases } = await supabase.from('user_purchases').select('product_id').eq('user_id', userId);
        const accessList = purchases ? purchases.map(p => p.product_id) : [];

        // --- EMAIL DO ADMIN DEFINIDO ---
        const MEU_EMAIL = "app.promptlab@gmail.com"; 
        
        const finalPlan = (email === MEU_EMAIL) ? 'admin' : (profile?.plan || 'free');

        setUser({
            ...profile,
            email: email,
            name: profile?.name || 'Usuário',
            access: accessList, 
            plan: finalPlan,
            avatar: profile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            cover: profile?.cover || 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1000&q=80'
        });
    } catch (error) {
        console.error("Erro login:", error);
        setUser(null);
    } finally {
        setLoading(false);
    }
  };

  const handleLogin = async (email, password, name, isRegister) => {
    setLoading(true);
    try {
        let authResponse;
        if (isRegister) {
            authResponse = await supabase.auth.signUp({ email, password, options: { data: { name } } });
        } else {
            authResponse = await supabase.auth.signInWithPassword({ email, password });
        }
        if (authResponse.error) throw authResponse.error;
        
        if (authResponse.data.user) {
            setTimeout(() => fetchProfileData(authResponse.data.user.id, email), 1500);
        } else if (isRegister) { 
            alert("Verifique seu email para confirmar o cadastro!"); 
            setLoading(false); 
        }
    } catch (error) {
        alert("Erro: " + error.message);
        setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handlePurchase = async (productId) => {
    if (window.confirm(`Confirmar compra?`)) {
      const { error } = await supabase.from('user_purchases').insert({ user_id: user.id, product_id: productId });
      if (!error) {
          setUser(prev => ({ ...prev, access: [...prev.access, productId] }));
          alert("Compra realizada com sucesso!");
      }
    }
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-blue-600"><Loader2 size={48} className="animate-spin" /></div>;
  if (!user) return <AuthScreen onLogin={handleLogin} />;

  return <MainApp user={user} setUser={setUser} onLogout={handleLogout} onPurchase={handlePurchase} />;
}

// --- COMPONENTE UPLOAD ---
function ImageUploader({ currentImage, onUploadComplete, label, compact = false }) {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) throw new Error('Selecione uma imagem.');
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;
      const { error: uploadError } = await supabase.storage.from('uploads').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
      onUploadComplete(data.publicUrl);
    } catch (error) { alert('Erro no upload: ' + error.message); } finally { setUploading(false); }
  };

  return (
    <div className={`relative group ${compact ? '' : 'mb-4'}`}>
      {!compact && <label className="text-gray-400 text-sm font-bold block mb-2">{label}</label>}
      <div className="flex items-center gap-3">
         <input type="file" accept="image/*" onChange={uploadImage} className="hidden" id={`file-${label}`} disabled={uploading}/>
         <label htmlFor={`file-${label}`} className={`cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg transition-all flex items-center ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
             {uploading ? <Loader2 size={16} className="animate-spin mr-2"/> : <UploadCloud size={16} className="mr-2"/>}
             {uploading ? 'Enviando...' : (compact ? 'Trocar' : 'Escolher Imagem')}
         </label>
         {!compact && currentImage && <img src={currentImage} className="h-10 w-10 rounded object-cover border border-gray-700"/>}
      </div>
    </div>
  );
}

// --- TELA DE LOGIN (ARCADE COMPLETO) ---
function AuthScreen({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Estados do Jogo
  const canvasRef = useRef(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [gameData, setGameData] = useState({ score: 0, lives: 3, level: 1, gameOver: false });
  const gameState = useRef({ score: 0, lives: 3, level: 1, gameOver: false, lastShot: 0 }); // Ref para acesso dentro do loop

  useEffect(() => {
      supabase.from('app_settings').select('logo_header_url').single().then(({data}) => {
          if(data && data.logo_header_url) setLogoUrl(data.logo_header_url);
      });
  }, []);

  const restartGame = () => {
      gameState.current = { score: 0, lives: 3, level: 1, gameOver: false, lastShot: 0 };
      setGameData({ score: 0, lives: 3, level: 1, gameOver: false });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width; canvas.height = height;
    const isMobile = width < 768;
    
    let stars = [];
    let player = { x: width / 2, y: height - 100 };
    let bullets = [];
    let enemies = [];
    let particles = []; 
    let mouseX = width / 2;
    let isMouseDown = false;

    // Inicializa estrelas
    for(let i=0; i<100; i++) stars.push({x: Math.random()*width, y: Math.random()*height, z: Math.random()*2, speed: isMobile ? 15 : 2});

    const handleMouseMove = (e) => { mouseX = e.clientX; };
    const handleMouseDown = () => { isMouseDown = true; };
    const handleMouseUp = () => { isMouseDown = false; };

    if(!isMobile) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
    }

    const render = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)'; // Rastro
        ctx.fillRect(0, 0, width, height);

        // 1. Estrelas (Fundo)
        ctx.fillStyle = '#ffffff';
        stars.forEach(star => {
            star.y += star.speed; if(star.y > height) star.y = 0;
            ctx.globalAlpha = Math.random();
            ctx.beginPath(); ctx.arc(star.x, star.y, isMobile ? 1 : 2, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
        });

        // Lógica do Jogo (Apenas se não for mobile e não for Game Over)
        if (!isMobile && !gameState.current.gameOver) {
            const gs = gameState.current;

            // Níveis e Dificuldade (A cada 15 pontos)
            const currentLevel = Math.floor(gs.score / 15) + 1;
            if(currentLevel !== gs.level) {
                gs.level = currentLevel;
                setGameData(prev => ({ ...prev, level: currentLevel })); // Atualiza UI
            }

            // Jogador
            player.x += (mouseX - player.x) * 0.15;
            ctx.shadowBlur = 15; ctx.shadowColor = '#3b82f6';
            ctx.fillStyle = '#2563eb'; 
            ctx.beginPath(); ctx.moveTo(player.x, player.y); ctx.lineTo(player.x - 15, player.y + 30); ctx.lineTo(player.x, player.y + 20); ctx.lineTo(player.x + 15, player.y + 30); ctx.fill();
            ctx.shadowBlur = 0;

            // Sistema de Tiro (Power-ups)
            const fireRate = gs.level >= 2 ? 100 : 200; // Nível 2: Tiro Rápido
            if (isMouseDown && Date.now() - gs.lastShot > fireRate) {
                if (gs.level >= 3) { // Nível 3: Tiro Triplo
                    bullets.push({x: player.x, y: player.y, speed: 15, color: '#60a5fa', vx: -2});
                    bullets.push({x: player.x, y: player.y, speed: 15, color: '#60a5fa', vx: 0});
                    bullets.push({x: player.x, y: player.y, speed: 15, color: '#60a5fa', vx: 2});
                } else {
                    bullets.push({x: player.x - 10, y: player.y, speed: 15, color: '#60a5fa', vx: 0});
                    bullets.push({x: player.x + 10, y: player.y, speed: 15, color: '#60a5fa', vx: 0});
                }
                gs.lastShot = Date.now();
            }

            // Balas
            bullets.forEach((b, i) => {
                b.y -= b.speed; b.x += b.vx;
                ctx.fillStyle = b.color; ctx.fillRect(b.x - 2, b.y, 4, 15);
                if(b.y < 0) bullets.splice(i, 1);
            });

            // Inimigos (Spawn rate aumenta com nível)
            const spawnRate = 0.02 + (gs.level * 0.005);
            if(Math.random() < spawnRate) enemies.push({x: Math.random() * width, y: -50, size: 20 + Math.random()*30, speed: 2 + (gs.level * 0.5), hp: 1 + Math.floor(gs.level/3)});

            enemies.forEach((e, i) => {
                e.y += e.speed;
                
                ctx.shadowBlur = 20; ctx.shadowColor = '#f97316'; ctx.fillStyle = '#ef4444';
                ctx.beginPath(); ctx.arc(e.x, e.y, e.size/2, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;

                // Passou da tela (Perde Vida)
                if(e.y > height) {
                    enemies.splice(i, 1);
                    gs.lives -= 1;
                    setGameData(prev => ({ ...prev, lives: gs.lives }));
                    if(gs.lives <= 0) {
                        gs.gameOver = true;
                        setGameData(prev => ({ ...prev, gameOver: true }));
                    }
                }

                // Colisão
                bullets.forEach((b, bi) => {
                    if(b.x > e.x - e.size/2 && b.x < e.x + e.size/2 && b.y < e.y + e.size/2 && b.y > e.y - e.size/2) {
                        e.hp--; bullets.splice(bi, 1);
                        if(e.hp <= 0) {
                            // Explosão
                            for(let k=0; k<10; k++) particles.push({x: e.x, y: e.y, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10, life: 1.0, color: Math.random()>0.5?'#f97316':'#ef4444'});
                            enemies.splice(i, 1);
                            gs.score += 1;
                            setGameData(prev => ({ ...prev, score: gs.score }));
                        }
                    }
                });
            });

            // Partículas
            particles.forEach((p, i) => {
                p.x += p.vx; p.y += p.vy; p.life -= 0.05;
                ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 3, 3); ctx.globalAlpha = 1;
                if(p.life <= 0) particles.splice(i, 1);
            });
        }
        animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mouseup', handleMouseUp);
        cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden font-sans select-none">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 cursor-crosshair" />
      
      {/* HUD DO JOGO (Só Desktop) */}
      <div className="absolute top-4 left-4 hidden md:flex gap-6 text-white font-mono z-20">
          <div className="bg-blue-900/50 px-4 py-2 rounded border border-blue-500/30">SCORE: <span className="text-blue-400 font-bold">{gameData.score}</span></div>
          <div className="bg-red-900/50 px-4 py-2 rounded border border-red-500/30">VIDAS: <span className="text-red-400 font-bold">{'♥'.repeat(Math.max(0, gameData.lives))}</span></div>
          <div className="bg-yellow-900/50 px-4 py-2 rounded border border-yellow-500/30">LEVEL: <span className="text-yellow-400 font-bold">{gameData.level}</span></div>
      </div>

      {/* TELA DE GAME OVER */}
      {gameData.gameOver && (
          <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center animate-fadeIn">
              <h1 className="text-6xl font-black text-red-600 mb-4 tracking-tighter">GAME OVER</h1>
              <p className="text-white text-2xl mb-8">Pontuação Final: <span className="text-blue-500 font-bold">{gameData.score}</span></p>
              <button onClick={restartGame} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-xl shadow-lg hover:scale-105 transition-transform">Tentar Novamente</button>
          </div>
      )}

      {/* CARD DE LOGIN (Escondido se der Game Over para não atrapalhar) */}
      {!gameData.gameOver && (
          <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-lg p-10 rounded-2xl border border-blue-900/30 relative z-10 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_50px_rgba(37,99,235,0.4)] shadow-2xl group">
            <div className="text-center mb-8">
                {logoUrl ? <img src={logoUrl} className="h-20 mx-auto mb-4 object-contain drop-shadow-lg"/> : <h2 className="text-4xl font-bold text-white mb-2 tracking-tighter">Prompt<span className="text-blue-600">Lab</span></h2>}
                <p className="text-blue-200/60 text-sm font-medium tracking-wide">{isRegister ? "Criar nova conta" : "Acessar o sistema"}</p>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); onLogin(email, password, name, isRegister); }} className="space-y-5">
              {isRegister && <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white focus:border-blue-600 outline-none transition-all focus:shadow-[0_0_15px_rgba(37,99,235,0.3)]" placeholder="Nome completo" />}
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white focus:border-blue-600 outline-none transition-all focus:shadow-[0_0_15px_rgba(37,99,235,0.3)]" placeholder="Seu e-mail" />
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white focus:border-blue-600 outline-none transition-all focus:shadow-[0_0_15px_rgba(37,99,235,0.3)]" placeholder="Sua senha" />
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-600/40 active:scale-95 uppercase tracking-widest text-xs">{isRegister ? "Cadastrar" : "Entrar"}</button>
            </form>
            <button onClick={() => setIsRegister(!isRegister)} className="w-full text-center mt-6 text-sm text-gray-500 hover:text-blue-400 transition-colors">{isRegister ? "Já tenho conta? Login" : "Não tem conta? Cadastre-se"}</button>
          </div>
      )}
    </div>
  );
}

// --- APP PRINCIPAL ---
function MainApp({ user, setUser, onLogout, onPurchase }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false); 
  const [appSettings, setAppSettings] = useState({ logo_menu_url: '', banner_url: '', logo_header_url: '', logo_position: 'center' }); 

  const [packs, setPacks] = useState([]);
  const [news, setNews] = useState([]);
  const isAdmin = user.plan === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      const { data: packsRes } = await supabase.from('products').select();
      const { data: newsRes } = await supabase.from('news').select().order('id', { ascending: false });
      const { data: settingsRes } = await supabase.from('app_settings').select().single();
      if (packsRes) setPacks(packsRes);
      if (newsRes) setNews(newsRes);
      if (settingsRes) setAppSettings(settingsRes);
    };
    fetchData();
  }, []);

  const updateSettings = (newSettings) => setAppSettings(prev => ({ ...prev, ...newSettings }));

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard news={news} changeTab={setActiveTab} user={user} settings={appSettings} />;
      case 'prompts': return <PromptsGallery user={user} onPurchase={onPurchase} />;
      case 'tutorials': return <TutorialsPage user={user} />;
      case 'loja': return <StorePage packs={packs} user={user} onPurchase={onPurchase} />;
      case 'favorites': return <Favorites user={user} />;
      case 'generator': return <GeneratorsHub user={user} onPurchase={onPurchase} />;
      case 'admin': return isAdmin ? <AdminPanel user={user} updateSettings={updateSettings} settings={appSettings} /> : null;
      case 'profile': return <Profile user={user} setUser={setUser} />;
      default: return <Dashboard news={news} changeTab={setActiveTab} user={user} settings={appSettings} />;
    }
  };

  return (
    <div className="flex h-screen bg-black text-gray-100 font-sans overflow-hidden">
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 bg-black border-r border-gray-800 transform transition-all duration-300 ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'} ${sidebarMinimized ? 'lg:w-24' : 'lg:w-64'}`}>
        <div className={`p-6 flex items-center ${sidebarMinimized ? 'justify-center' : 'justify-between'} transition-all border-b border-gray-800`}>
           {!sidebarMinimized ? (appSettings.logo_menu_url ? <img src={appSettings.logo_menu_url} className="h-8 object-contain"/> : <span className="text-xl font-bold text-white">Prompt<span className="text-blue-600">Lab</span></span>) : (<Menu size={28} className="text-blue-600"/>)}
           <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white"><X/></button>
           <button onClick={() => setSidebarMinimized(!sidebarMinimized)} className="hidden lg:block text-gray-400 hover:text-white focus:outline-none transition-transform hover:scale-110"><Menu size={24} /></button>
        </div>
        <nav className={`space-y-2 mt-4 ${sidebarMinimized ? 'px-2' : 'px-4'}`}>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => {setActiveTab('dashboard'); setSidebarOpen(false)}} minimized={sidebarMinimized} />
          <SidebarItem icon={ShoppingBag} label="Loja Oficial" active={activeTab === 'loja'} onClick={() => {setActiveTab('loja'); setSidebarOpen(false)}} minimized={sidebarMinimized} />
          <SidebarItem icon={LayoutGrid} label="Prompts" active={activeTab === 'prompts'} onClick={() => {setActiveTab('prompts'); setSidebarOpen(false)}} minimized={sidebarMinimized} />
          <SidebarItem icon={Play} label="Tutoriais" active={activeTab === 'tutorials'} onClick={() => {setActiveTab('tutorials'); setSidebarOpen(false)}} minimized={sidebarMinimized} />
          <SidebarItem icon={Zap} label="Geradores" active={activeTab === 'generator'} onClick={() => {setActiveTab('generator'); setSidebarOpen(false)}} minimized={sidebarMinimized} />
          <SidebarItem icon={Heart} label="Favoritos" active={activeTab === 'favorites'} onClick={() => {setActiveTab('favorites'); setSidebarOpen(false)}} minimized={sidebarMinimized} />
          <div className="my-4 border-t border-gray-800 mx-2"></div>
          {isAdmin && <SidebarItem icon={Shield} label="Painel Admin" active={activeTab === 'admin'} onClick={() => {setActiveTab('admin'); setSidebarOpen(false)}} minimized={sidebarMinimized} />}
          <SidebarItem icon={User} label="Meu Perfil" active={activeTab === 'profile'} onClick={() => {setActiveTab('profile'); setSidebarOpen(false)}} minimized={sidebarMinimized} />
          <div className="pt-4"><SidebarItem icon={LogOut} label="Sair" onClick={onLogout} minimized={sidebarMinimized} isLogout/></div>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-black">
        <header className="lg:hidden flex items-center p-4 border-b border-gray-800 bg-gray-900"><button onClick={() => setSidebarOpen(true)}><Menu/></button><span className="ml-4 font-bold">Menu</span></header>
        <main className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-gray-800">{renderContent()}</main>
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick, minimized, isLogout }) {
  return (
    <button onClick={onClick} className={`flex items-center w-full rounded-xl transition-all duration-200 group font-medium ${minimized ? 'justify-center px-2 py-4' : 'px-4 py-3'} ${active && !isLogout ? 'text-blue-500 bg-blue-500/10' : 'text-gray-400 hover:text-white hover:bg-gray-900'} ${active && !minimized && !isLogout ? 'border-l-4 border-blue-500 rounded-l-none' : ''} ${isLogout ? 'hover:text-red-400 hover:bg-red-500/10' : ''}`} title={minimized ? label : ''}>
      <Icon size={minimized ? 28 : 20} className={`${minimized ? '' : 'mr-3'} transition-all ${active && !isLogout ? 'drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]' : ''}`} />
      {!minimized && <span className="truncate animate-fadeIn">{label}</span>}
    </button>
  );
}

// --- DASHBOARD ---
function Dashboard({ news, changeTab, user, settings }) {
  const isAdmin = user.plan === 'admin';
  return (
    <div className="w-full animate-fadeIn">
      <div className="relative w-full h-64 md:h-80 bg-gray-900 overflow-hidden">
          {settings.banner_url && <img src={settings.banner_url} className="w-full h-full object-cover opacity-80" alt="Banner"/>}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black"></div>
          <div className={`absolute inset-0 p-8 flex items-center ${settings.logo_position === 'flex-start' ? 'justify-start' : settings.logo_position === 'flex-end' ? 'justify-end' : 'justify-center'}`}>
              {settings.logo_header_url && <img src={settings.logo_header_url} className="h-24 md:h-32 object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"/>}
          </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10 space-y-8 pb-20">
          <div className="flex justify-between items-end pb-4 border-b border-gray-800">
            <div><h2 className="text-3xl font-bold text-white mb-1">Olá, {user.name.split(' ')[0]}</h2><p className="text-gray-400">Bem-vindo ao seu laboratório.</p></div>
            {isAdmin && <span className="text-xs bg-blue-900 text-blue-200 px-3 py-1 rounded border border-blue-700 font-bold tracking-wider">ADMIN</span>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div onClick={() => changeTab('prompts')} className="bg-gray-900 border border-gray-800 p-6 rounded-xl hover:border-blue-600 cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] group"><div className="mb-4 bg-blue-600/20 w-12 h-12 rounded-lg flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform"><Images size={24}/></div><h3 className="text-xl font-bold text-white">Prompts</h3><p className="text-sm text-gray-500">Acessar galeria</p></div>
            <div onClick={() => changeTab('tutorials')} className="bg-gray-900 border border-gray-800 p-6 rounded-xl hover:border-blue-600 cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] group"><div className="mb-4 bg-purple-500/20 w-12 h-12 rounded-lg flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform"><Play size={24}/></div><h3 className="text-xl font-bold text-white">Tutoriais</h3><p className="text-sm text-gray-500">Aulas exclusivas</p></div>
            <div onClick={() => changeTab('generator')} className="bg-gray-900 border border-gray-800 p-6 rounded-xl hover:border-blue-600 cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] group"><div className="mb-4 bg-green-500/20 w-12 h-12 rounded-lg flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform"><Zap size={24}/></div><h3 className="text-xl font-bold text-white">Geradores</h3><p className="text-sm text-gray-500">Criar com IA</p></div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center"><span className="w-1.5 h-6 bg-blue-600 mr-3 rounded-full"></span>Feed de Novidades</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {news.map(item => (
                <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col hover:border-gray-600 transition-all group">
                    {item.image && <div className="h-48 w-full overflow-hidden"><img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/></div>}
                    <div className="p-6"><span className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-2 block">{item.date}</span><h4 className="text-xl font-bold text-white mb-2">{item.title}</h4><p className="text-gray-400 text-sm leading-relaxed">{item.content}</p></div>
                </div>
              ))}
            </div>
          </div>
      </div>
    </div>
  );
}

// --- PERFIL ---
function Profile({ user, setUser }) {
  const [activeTab, setActiveTab] = useState('perfil');
  const [formData, setFormData] = useState({
     firstName: user.name?.split(' ')[0] || '', lastName: user.name?.split(' ').slice(1).join(' ') || '',
     phone: user.phone || '', avatar: user.avatar, cover: user.cover,
     facebook: user.social_facebook || '', twitter: user.social_twitter || '', linkedin: user.social_linkedin || '', website: user.social_website || '', github: user.social_github || ''
  });

  const handleSave = async () => {
      const updates = {
          name: `${formData.firstName} ${formData.lastName}`, phone: formData.phone, avatar: formData.avatar, cover: formData.cover,
          social_facebook: formData.facebook, social_twitter: formData.twitter, social_linkedin: formData.linkedin, social_website: formData.website, social_github: formData.github
      };
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if(!error) { setUser({ ...user, ...updates }); alert("Perfil atualizado!"); } else { alert("Erro ao salvar."); }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn p-8">
      <h2 className="text-3xl font-bold text-white mb-8">Configurações</h2>
      <div className="flex space-x-8 border-b border-gray-800 mb-8 overflow-x-auto">
         {['perfil', 'senha', 'social'].map(tab => (
             <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-sm font-medium capitalize relative whitespace-nowrap ${activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-white'}`}>{tab === 'social' ? 'Perfil Social' : tab}{activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}</button>
         ))}
      </div>
      {activeTab === 'perfil' && (
         <div className="mb-10">
            <div className="h-48 w-full rounded-t-xl bg-gray-800 relative overflow-hidden group">
                <img src={formData.cover} className="w-full h-full object-cover opacity-80"/>
                <div className="absolute bottom-4 right-4"><ImageUploader compact label="Capa" onUploadComplete={(url) => setFormData({...formData, cover: url})} /></div>
            </div>
            <div className="px-8 relative">
                <div className="w-32 h-32 rounded-full border-4 border-black bg-gray-700 -mt-16 overflow-hidden relative group">
                    <img src={formData.avatar} className="w-full h-full object-cover"/>
                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center"><ImageUploader compact label="Avatar" onUploadComplete={(url) => setFormData({...formData, avatar: url})} /></div>
                </div>
            </div>
         </div>
      )}
      {activeTab === 'perfil' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div><label className="text-white text-sm font-bold mb-2 block">Nome</label><input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-600 outline-none"/></div>
             <div><label className="text-white text-sm font-bold mb-2 block">Último nome</label><input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-600 outline-none"/></div>
             <div className="col-span-2"><label className="text-white text-sm font-bold mb-2 block">Telefone</label><input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-600 outline-none" placeholder="(00) 00000-0000"/></div>
             <div className="col-span-2 mt-4"><button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors">Atualizar Perfil</button></div>
          </div>
      )}
      {activeTab === 'senha' && (
          <div className="max-w-2xl space-y-6">
              <div><label className="text-white text-sm font-bold mb-2 block">Senha atual</label><input type="password" className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-600 outline-none" placeholder="Senha atual"/></div>
              <div><label className="text-white text-sm font-bold mb-2 block">Nova Senha</label><input type="password" className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-600 outline-none" placeholder="Digite a senha"/></div>
              <div><label className="text-white text-sm font-bold mb-2 block">Redigite a nova senha</label><input type="password" className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-600 outline-none" placeholder="Digite a senha"/></div>
              <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg mt-4">Redefinir senha</button>
          </div>
      )}
      {activeTab === 'social' && (
          <div className="space-y-6">
              {[ { l: 'Facebook', i: Facebook, k: 'facebook' }, { l: 'Twitter', i: Twitter, k: 'twitter' }, { l: 'Linkedin', i: Linkedin, k: 'linkedin' }, { l: 'Site', i: Globe, k: 'website' }, { l: 'Github', i: Github, k: 'github' } ].map(s => (
                  <div key={s.k} className="flex items-center"><div className="w-32 flex items-center text-white"><s.i size={18} className="mr-2"/> {s.l}</div><input type="text" value={formData[s.k]} onChange={e => setFormData({...formData, [s.k]: e.target.value})} className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-3 text-gray-400 focus:text-white focus:border-blue-600 outline-none" placeholder={`Link do ${s.l}`}/></div>
              ))}
              <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg mt-4">Atualizar Perfil</button>
          </div>
      )}
    </div>
  );
}

// --- ADMIN PANEL ---
function AdminPanel({ user, updateSettings, settings }) {
  const [activeSection, setActiveSection] = useState('users');
  const [dataList, setDataList] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedPackForAlbum, setSelectedPackForAlbum] = useState(null); 
  const [packItems, setPackItems] = useState([]); 

  const fetchData = async () => {
    let query;
    if (activeSection === 'users') query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (activeSection === 'prompts') query = supabase.from('products').select('*').order('id', { ascending: true });
    if (activeSection === 'tutorials') query = supabase.from('tutorials_videos').select('*').order('id', { ascending: true });
    if (activeSection === 'news') query = supabase.from('news').select('*').order('id', { ascending: false });
    if (query) { const { data } = await query; setDataList(data || []); }
  };

  const fetchPackItems = async (packId) => {
      const { data } = await supabase.from('pack_items').select('*').eq('pack_id', packId);
      setPackItems(data || []);
  };

  useEffect(() => { fetchData(); setSelectedPackForAlbum(null); }, [activeSection]);

  const handleSave = async (e) => {
      e.preventDefault();
      if (activeSection === 'settings') {
          await supabase.from('app_settings').update(editingItem).gt('id', 0);
          updateSettings(editingItem); alert('Configurações salvas!'); return;
      }
      if (selectedPackForAlbum && activeSection === 'prompts') {
          const { error } = await supabase.from('pack_items').upsert({ ...editingItem, pack_id: selectedPackForAlbum.id }).eq('id', editingItem.id || 0);
          if (!error) { alert('Item salvo!'); setEditingItem(null); fetchPackItems(selectedPackForAlbum.id); } return;
      }
      let table = activeSection === 'users' ? 'profiles' : activeSection === 'prompts' ? 'products' : activeSection === 'tutorials' ? 'tutorials_videos' : activeSection;
      let payload = activeSection === 'users' ? { plan: editingItem.plan } : editingItem;
      const { error } = await supabase.from(table).upsert(payload).eq('id', editingItem.id || 0);
      if(!error) { alert('Salvo!'); setEditingItem(null); fetchData(); }
  };

  const handleDelete = async (id, isPackItem = false) => {
      if(!confirm('Tem certeza?')) return;
      let table = isPackItem ? 'pack_items' : activeSection === 'prompts' ? 'products' : activeSection === 'tutorials' ? 'tutorials_videos' : activeSection;
      await supabase.from(table).delete().eq('id', id);
      if(isPackItem) fetchPackItems(selectedPackForAlbum.id); else fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-fadeIn px-6">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-800 pb-4 gap-4">
          <div><h2 className="text-3xl font-bold text-white"><Shield className="inline text-blue-600 mr-2"/> Painel Admin</h2><p className="text-gray-400">Controle total do sistema</p></div>
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">{['users', 'prompts', 'tutorials', 'news', 'settings'].map(sec => (<button key={sec} onClick={() => {setActiveSection(sec); setEditingItem(sec === 'settings' ? settings : null)}} className={`px-4 py-2 rounded capitalize font-bold whitespace-nowrap ${activeSection === sec ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>{sec === 'prompts' ? 'Prompts (Packs)' : sec}</button>))}</div>
      </div>

      {activeSection === 'settings' && editingItem && (
          <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 grid grid-cols-1 gap-6">
              <h3 className="text-white font-bold text-xl">Configurações Visuais</h3>
              <div><ImageUploader label="Logo Menu (Simples)" currentImage={editingItem.logo_menu_url} onUploadComplete={(url) => setEditingItem({...editingItem, logo_menu_url: url})} /></div>
              <div><ImageUploader label="Banner Dashboard" currentImage={editingItem.banner_url} onUploadComplete={(url) => setEditingItem({...editingItem, banner_url: url})} /></div>
              <div><ImageUploader label="Logo Header (Slogan)" currentImage={editingItem.logo_header_url} onUploadComplete={(url) => setEditingItem({...editingItem, logo_header_url: url})} /></div>
              <div>
                  <label className="text-gray-400 block mb-2">Posição da Logo no Banner</label>
                  <div className="flex gap-4">{['flex-start', 'center', 'flex-end'].map(pos => (<button key={pos} onClick={() => setEditingItem({...editingItem, logo_position: pos})} className={`px-4 py-2 rounded border ${editingItem.logo_position === pos ? 'bg-blue-600 border-blue-600 text-white' : 'bg-black border-gray-700 text-gray-400'}`}>{pos === 'flex-start' ? 'Esquerda' : pos === 'center' ? 'Centro' : 'Direita'}</button>))}</div>
              </div>
              <button onClick={handleSave} className="bg-green-600 text-white px-8 py-3 rounded font-bold w-full md:w-auto">Salvar Alterações</button>
          </div>
      )}

      {activeSection === 'prompts' && selectedPackForAlbum && (
          <div className="mb-8 animate-fadeIn">
              <button onClick={() => setSelectedPackForAlbum(null)} className="mb-6 text-gray-400 hover:text-white flex items-center font-bold"><ChevronLeft/> Voltar para Packs</button>
              <div className="bg-gray-900 p-6 rounded-xl border border-blue-500/30">
                  <div className="flex justify-between items-center mb-6"><h3 className="text-2xl font-bold text-white">Álbum: {selectedPackForAlbum.title}</h3><button onClick={() => setEditingItem({})} className="bg-blue-600 text-white px-4 py-2 rounded font-bold flex items-center"><Plus size={16} className="mr-2"/> Nova Imagem</button></div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {packItems.map(item => (
                          <div key={item.id} className="relative group aspect-[3/4] bg-black rounded-lg overflow-hidden border border-gray-800">
                              <img src={item.url} className="w-full h-full object-cover"/>
                              <div className="absolute inset-0 bg-black/80 hidden group-hover:flex flex-col items-center justify-center gap-2"><button onClick={() => setEditingItem(item)} className="text-blue-400 hover:text-white bg-gray-800 p-2 rounded"><Edit3/></button><button onClick={() => handleDelete(item.id, true)} className="text-red-500 hover:text-white bg-gray-800 p-2 rounded"><Trash2/></button></div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {(!selectedPackForAlbum || activeSection !== 'prompts') && activeSection !== 'settings' && (
          <div className="animate-fadeIn">
            {activeSection !== 'users' && <div className="mb-4 flex justify-end"><button onClick={() => setEditingItem({})} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold flex items-center"><Plus size={16} className="mr-2"/> Adicionar Novo</button></div>}
            {editingItem && !selectedPackForAlbum && (
                <div className="bg-gray-900 p-6 rounded-xl border border-blue-500 mb-8">
                    <h3 className="text-white font-bold mb-4">Editor</h3>
                    <form onSubmit={handleSave} className="grid grid-cols-1 gap-4">
                        {activeSection === 'users' && <select className="bg-black border border-gray-700 p-3 rounded text-white" value={editingItem.plan || 'free'} onChange={e => setEditingItem({...editingItem, plan: e.target.value})}><option value="free">Free</option><option value="pro">Pro</option><option value="gold">Gold</option><option value="admin">Admin</option></select>}
                        {(activeSection === 'prompts' || activeSection === 'tutorials' || activeSection === 'news' || selectedPackForAlbum) && (
                            Object.keys(editingItem).map(key => {
                                if(key === 'id' || key === 'created_at' || key === 'pack_id') return null;
                                if(key === 'cover' || key === 'image' || key === 'thumbnail' || key === 'url') return <div key={key}><ImageUploader label={key} currentImage={editingItem[key]} onUploadComplete={(url) => setEditingItem({...editingItem, [key]: url})} /></div>
                                return <div key={key}><label className="text-gray-500 text-xs uppercase font-bold mb-1 block">{key}</label><input type="text" className="bg-black border border-gray-700 p-3 rounded text-white w-full" value={editingItem[key] || ''} onChange={e => setEditingItem({...editingItem, [key]: e.target.value})}/></div>
                            })
                        )}
                        <div className="flex justify-end gap-2 mt-4"><button type="button" onClick={() => setEditingItem(null)} className="text-gray-500 font-bold">Cancelar</button><button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-bold">Salvar</button></div>
                    </form>
                </div>
            )}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-black text-xs uppercase font-bold"><tr><th className="p-4">Info Principal</th><th className="p-4">Detalhes</th><th className="p-4 text-right">Ações</th></tr></thead>
                    <tbody className="divide-y divide-gray-800">
                        {dataList.map(item => (
                            <tr key={item.id} className="hover:bg-gray-800/50">
                                <td className="p-4">{activeSection === 'users' ? <div><span className="text-white font-bold">{item.name}</span><br/>{item.email}</div> : (item.title || item.id)}</td>
                                <td className="p-4">{activeSection === 'users' ? <div><span className="block text-white font-mono text-xs mb-1">{item.phone || 'Sem telefone'}</span><span className={`text-xs uppercase font-bold px-2 py-1 rounded ${item.plan === 'admin' ? 'bg-blue-900 text-blue-200' : 'bg-gray-700'}`}>{item.plan}</span></div> : (item.video_url || item.date || item.price)}</td>
                                <td className="p-4 text-right"><button onClick={() => setEditingItem(item)} className="text-blue-400 mr-3"><Edit3 size={16}/></button>{activeSection !== 'users' && <button onClick={() => handleDelete(item.id)} className="text-red-500"><Trash2 size={16}/></button>}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
      )}
    </div>
  );
}

function TutorialsPage({ user }) {
    const [tutorials, setTutorials] = useState([]);
    useEffect(() => { supabase.from('tutorials_videos').select('*').order('id', { ascending: true }).then(({ data }) => setTutorials(data || [])); }, []);
    return (
        <div className="max-w-3xl mx-auto pb-20 animate-fadeIn px-6">
             <div className="text-center mb-12 mt-8">
                 <h2 className="text-5xl font-black text-white mb-2 tracking-tighter">TUTORIAIS</h2>
                 <p className="text-blue-600 font-bold tracking-[0.2em] text-sm uppercase mb-8">Ferramentas de Criação</p>
             </div>
             <div className="space-y-12">
                 {tutorials.map(video => (
                     <div key={video.id} className="bg-black border border-gray-800 rounded-2xl overflow-hidden shadow-2xl hover:border-blue-900 transition-all">
                         <div className="p-4 flex items-center border-b border-gray-900"><div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div><h3 className="text-white font-bold text-lg">{video.title}</h3></div>
                         <div className="relative aspect-video group cursor-pointer overflow-hidden">
                             <img src={video.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"/>
                             <div className="absolute inset-0 flex items-center justify-center"><div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform"><Play className="ml-1 text-white fill-white w-8 h-8"/></div></div>
                             <a href={video.video_url} target="_blank" className="absolute inset-0 z-10"></a>
                         </div>
                         <div className="p-6 text-center bg-gray-900"><a href={video.link_action || '#'} target="_blank" className="text-blue-500 hover:text-white font-bold text-sm uppercase tracking-wider border-b-2 border-blue-500/30 pb-1 hover:border-white transition-colors">{video.link_label || 'Acessar Recurso'}</a></div>
                     </div>
                 ))}
             </div>
        </div>
    );
}

function StorePage({ packs, onPurchase }) {
    return (
        <div className="max-w-7xl mx-auto animate-fadeIn px-6">
             <h2 className="text-3xl font-bold text-white mb-8">Loja Oficial</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                 {packs.map(pack => (
                     <div key={pack.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-600 transition-all cursor-pointer group shadow-lg">
                         <div className="aspect-square relative overflow-hidden">
                             <img src={pack.cover} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                             <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent"><h4 className="text-white font-bold text-sm md:text-base leading-tight">{pack.title}</h4><p className="text-blue-500 font-bold text-xs mt-1">{pack.price}</p></div>
                         </div>
                         <button onClick={() => onPurchase(pack.id)} className="w-full bg-blue-600 text-white font-bold py-2 text-sm hover:bg-blue-500 transition-colors">COMPRAR</button>
                     </div>
                 ))}
             </div>
        </div>
    );
}

function PromptsGallery({ user }) {
    const [prompts, setPrompts] = useState([]);
    useEffect(() => { supabase.from('pack_items').select('*').limit(50).then(({data}) => setPrompts(data || [])); }, []);
    return (
        <div className="max-w-7xl mx-auto animate-fadeIn px-6 pb-20">
             <div className="flex justify-between items-center mb-8"><h2 className="text-3xl font-bold text-white">Galeria de Prompts</h2></div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {prompts.map(item => (
                     <div key={item.id} className="aspect-[3/4] bg-gray-900 rounded-2xl overflow-hidden relative group hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:border-2 border-blue-500 transition-all duration-300 border border-gray-800">
                         <img src={item.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
                         <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"><button className="bg-black/60 backdrop-blur-md text-white p-3 rounded-full hover:bg-blue-600 hover:text-white transition-colors shadow-xl border border-white/10"><Heart size={22}/></button></div>
                         <div className="absolute bottom-8 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0"><button onClick={() => navigator.clipboard.writeText(item.prompt)} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-2xl hover:scale-105 hover:bg-blue-500 transition-transform flex items-center border border-blue-400"><Copy size={18} className="mr-2"/> COPIAR PROMPT</button></div>
                     </div>
                 ))}
             </div>
        </div>
    );
}

function GeneratorsHub() { return <div className="text-white text-center py-20 text-xl font-bold animate-pulse">⚡ Geradores em Manutenção</div>; }
function Favorites() { return <div className="text-white text-center py-20 text-gray-500">Você ainda não favoritou nada.</div>; }