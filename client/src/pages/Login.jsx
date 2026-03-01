import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Pill, Lock, Mail, ArrowRight, ShieldCheck, Activity, Users, Database, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(email, password);
    if (success) navigate('/');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-background font-sans overflow-hidden">
      
      {/* LEFT SIDE: The "MediVault" Ambient Environment */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden items-center justify-center">
        {/* Deep Animated Gradients */}
        <div className="absolute -top-[20%] -left-[10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-blue-400/40 via-primary to-indigo-900/80 animate-pulse transition-all duration-1000"></div>
        
        {/* Floating Background Icons (The Constellation) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <motion.div animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} className="absolute top-1/4 left-1/4"><Database size={100} /></motion.div>
          <motion.div animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }} className="absolute bottom-1/3 right-1/4"><Users size={120} /></motion.div>
          <motion.div animate={{ y: [0, -15, 0], rotate: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }} className="absolute top-1/2 right-1/3"><FileText size={80} /></motion.div>
        </div>

        <div className="relative z-10 px-16 text-white max-w-2xl w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
                <Pill size={36} className="text-white drop-shadow-md" />
              </div>
              <span className="text-3xl font-extrabold tracking-tight drop-shadow-sm">MediVault</span>
            </div>
            
            <h1 className="text-5xl font-extrabold leading-tight mb-6 drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
              Hospital Operations. <br/>
              Intelligently Unified.
            </h1>
            <p className="text-lg text-blue-100/90 mb-12 max-w-md leading-relaxed font-medium">
              Enterprise-grade inventory, patient management, and billing in one secure vault.
            </p>

            {/* Floating Glassmorphism Status Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="inline-flex items-center gap-4 px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl"
            >
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-status-success"></span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white tracking-wide">SYSTEM SECURE</span>
                <span className="text-xs text-blue-200 font-medium">End-to-End Encrypted (AES-256)</span>
              </div>
              <ShieldCheck size={28} className="ml-4 text-blue-200/50" />
            </motion.div>

          </motion.div>
        </div>
      </div>

      {/* RIGHT SIDE: The Form with 3D Parallax Tilt */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <Tilt 
          tiltMaxAngleX={3} 
          tiltMaxAngleY={3} 
          perspective={1000} 
          transitionSpeed={1500} 
          scale={1.01} 
          gyroscope={true}
          className="w-full max-w-md"
        >
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            className="bento-card bg-surface shadow-2xl border-slate-100/60 p-8 sm:p-10 relative overflow-hidden"
          >
            {/* Subtle inner top highlight for glass effect */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

            <div className="lg:hidden flex justify-center mb-8">
              <div className="p-3 bg-primary-light/50 rounded-2xl text-primary">
                <Pill size={32} />
              </div>
            </div>

            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-text-main tracking-tight mb-2">Welcome Back</h2>
              <p className="text-text-muted font-medium">Authenticate to access your dashboard.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Work Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-text-main"
                    placeholder="name@medivault.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-text-main text-lg tracking-widest"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-bold text-base transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 disabled:opacity-70 active:scale-[0.98] mt-6 group"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Secure Login
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </Tilt>
      </div>
    </div>
  );
}