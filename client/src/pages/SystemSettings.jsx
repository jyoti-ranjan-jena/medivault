import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { 
  Building2, Users, Shield, Bell, 
  Save, Plus, Mail, Lock, UserPlus, MoreVertical, X, ScanLine, Cpu
} from 'lucide-react';

const pageVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  exit: { opacity: 0, scale: 0.98, filter: "blur(4px)", transition: { duration: 0.2 } }
};

export default function SystemSettings() {
  const { user } = useContext(AuthContext); 
  const [activeTab, setActiveTab] = useState('general'); 
  
  const [staff, setStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  
  // Modal State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStaffData, setNewStaffData] = useState({ name: '', email: '', password: '', role: 'attendant' });

  const tabs = [
    { id: 'general', label: 'Hospital Profile', icon: Building2 },
    { id: 'team', label: 'Team & Access', icon: Users },
    { id: 'security', label: 'Security Protocols', icon: Shield },
    { id: 'notifications', label: 'System Alerts', icon: Bell },
  ];

  // --- FETCH STAFF FROM BACKEND ---
  useEffect(() => {
    if (activeTab === 'team' && user?.role === 'admin') {
      const fetchStaff = async () => {
        setLoadingStaff(true);
        try {
          const res = await api.get('/users');
          setStaff(res.data.data);
        } catch (error) {
          toast.error("Failed to load staff directory.");
        } finally {
          setLoadingStaff(false);
        }
      };
      fetchStaff();
    }
  }, [activeTab, user]);

  // --- ADD NEW STAFF HANDLER ---
  const handleAddStaff = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/users', newStaffData);
      setStaff([res.data.data, ...staff]);
      toast.success(`${newStaffData.name} granted system access!`, { icon: '🔐' });
      setIsStaffModalOpen(false);
      setNewStaffData({ name: '', email: '', password: '', role: 'attendant' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Access Denied.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col relative">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-extrabold text-text-main tracking-tight flex items-center gap-3">
          <Cpu className="text-primary" size={28} />
          Mainframe Configuration
        </h1>
        <p className="text-text-muted font-medium mt-1 flex items-center gap-2">
          <ScanLine size={16} className="text-primary/70" />
          Manage core hospital parameters, encryption, and access controls.
        </p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-8 flex-1 overflow-hidden">
        
        {/* ========================================== */}
        {/* LEFT PANE: FUTURISTIC VERTICAL NAVIGATION  */}
        {/* ========================================== */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full md:w-64 flex-shrink-0 space-y-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all relative z-10 overflow-hidden ${
                  isActive ? 'text-primary drop-shadow-md' : 'text-slate-500 hover:text-slate-700 hover:bg-surface border border-transparent hover:border-slate-200 shadow-sm'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-primary-light/10 border border-primary/20 shadow-[0_0_20px_rgba(37,99,235,0.1)] rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  />
                )}
                <Icon size={18} className={isActive ? 'text-primary' : 'text-slate-400'} />
                {tab.label}
                {isActive && (
                  <motion.div layoutId="activeTabIndicator" className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
                )}
              </button>
            );
          })}
        </motion.div>

        {/* ========================================== */}
        {/* RIGHT PANE: DYNAMIC COMMAND CENTER         */}
        {/* ========================================== */}
        <div className="flex-1 overflow-y-auto relative p-1">
          <AnimatePresence mode="wait">
            
            {/* --- TAB 1: HOSPITAL PROFILE --- */}
            {activeTab === 'general' && (
              <motion.div key="general" variants={pageVariants} initial="hidden" animate="show" exit="exit" className="max-w-3xl">
                <div className="bento-card border-slate-200/60 shadow-xl shadow-slate-200/40 relative overflow-hidden p-8">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-pulse z-20"></div>
                  
                  <h2 className="text-xl font-bold text-text-main mb-8 uppercase tracking-widest text-xs flex items-center gap-2">
                    <Building2 size={16} className="text-primary"/> Official Registry
                  </h2>
                  
                  <form className="space-y-8 relative z-10">
                    
                    {/* Futuristic Image Scanner */}
                    <div className="flex items-start gap-6 mb-8 p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner">
                      <div className="w-28 h-28 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-primary transition-colors cursor-pointer group relative overflow-hidden shadow-sm">
                        {/* Scanning Laser Effect on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent -translate-y-full group-hover:animate-[scan_2s_ease-in-out_infinite]"></div>
                        <div className="text-center relative z-10">
                          <Building2 size={28} className="mx-auto mb-2 group-hover:text-primary transition-colors" />
                          <span className="text-xs font-bold uppercase tracking-wider group-hover:text-primary transition-colors">Upload</span>
                        </div>
                      </div>
                      <div className="pt-2">
                        <p className="text-base font-extrabold text-slate-800 tracking-tight">System Logo</p>
                        <p className="text-sm font-medium text-slate-500 mt-1 max-w-xs leading-relaxed">This insignia will be embedded into all digital interfaces and thermal receipts.</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="relative group transition-all duration-300 focus-within:shadow-[0_0_30px_rgba(37,99,235,0.1)] focus-within:-translate-y-0.5 rounded-xl">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">Hospital Name</label>
                        <input type="text" defaultValue="MediVault Central" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-text-main text-lg shadow-sm" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-5">
                        <div className="relative group transition-all duration-300 focus-within:shadow-[0_0_30px_rgba(37,99,235,0.1)] focus-within:-translate-y-0.5 rounded-xl">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">Registration ID</label>
                          <input type="text" defaultValue="REG-2026-8991" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-mono font-bold text-primary tracking-wider shadow-sm" />
                        </div>
                        <div className="relative group transition-all duration-300 focus-within:shadow-[0_0_30px_rgba(37,99,235,0.1)] focus-within:-translate-y-0.5 rounded-xl">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">Emergency Contact</label>
                          <input type="text" defaultValue="+91 98765 43210" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-text-main shadow-sm" />
                        </div>
                      </div>
                      
                      <div className="relative group transition-all duration-300 focus-within:shadow-[0_0_30px_rgba(37,99,235,0.1)] focus-within:-translate-y-0.5 rounded-xl">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">Billing Address</label>
                        <textarea rows="3" defaultValue="123 Health Avenue, Medical District&#10;Bhubaneswar, Odisha 751001" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-text-main resize-none shadow-sm" />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" className="py-3.5 px-8 bg-primary text-white rounded-xl font-bold shadow-[0_8px_25px_rgba(37,99,235,0.35)] transition-all flex items-center gap-2 relative overflow-hidden group">
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                        <Save size={18} className="relative z-10" /> <span className="relative z-10 tracking-wide">Update Protocol</span>
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* --- TAB 2: TEAM & ACCESS --- */}
            {activeTab === 'team' && (
              <motion.div key="team" variants={pageVariants} initial="hidden" animate="show" exit="exit" className="h-full flex flex-col">
                <div className="bento-card border-slate-200/60 shadow-xl shadow-slate-200/40 relative overflow-hidden flex-1 flex flex-col p-0">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-pulse z-20"></div>
                  
                  <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 relative z-10">
                    <div>
                      <h2 className="text-xl font-bold text-text-main tracking-tight">Active Clearances</h2>
                      <p className="text-sm text-text-muted font-medium mt-1">Personnel authorized to access the mainframe.</p>
                    </div>
                    {user?.role === 'admin' && (
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsStaffModalOpen(true)} className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 text-sm">
                        <UserPlus size={16} /> Grant Access
                      </motion.button>
                    )}
                  </div>

                  <div className="overflow-y-auto flex-1 bg-surface relative z-10">
                    {loadingStaff ? (
                      <div className="flex justify-center items-center h-full"><div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-white border-b border-slate-100">
                            <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Operative</th>
                            <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Security Level</th>
                            <th className="px-8 py-4"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {staff.map((member, index) => (
                            <motion.tr initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} key={member._id} className="hover:bg-slate-50/80 transition-colors group">
                              <td className="px-8 py-5">
                                <p className="font-extrabold text-text-main text-base">{member.name} {user?._id === member._id && <span className="text-[10px] font-black bg-primary text-white px-2 py-0.5 rounded-full ml-2 shadow-[0_0_10px_rgba(37,99,235,0.4)]">YOU</span>}</p>
                                <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mt-1"><Mail size={12} className="text-slate-300"/> {member.email}</p>
                              </td>
                              <td className="px-8 py-5">
                                <span className={`text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-sm ${
                                  member.role === 'admin' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 
                                  member.role === 'pharmacist' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}>
                                  {member.role}
                                </span>
                              </td>
                              <td className="px-8 py-5 text-right">
                                <button className="p-2 text-slate-300 hover:text-primary hover:bg-primary-light/30 rounded-lg transition-all opacity-0 group-hover:opacity-100 shadow-sm"><MoreVertical size={18} /></button>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* --- TAB 3 & 4 Placeholders --- */}
            {(activeTab === 'security' || activeTab === 'notifications') && (
              <motion.div key="wip" variants={pageVariants} initial="hidden" animate="show" exit="exit" className="h-full flex flex-col items-center justify-center opacity-60 bg-surface/50 rounded-2xl border border-slate-200 border-dashed">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-primary blur-xl opacity-20 rounded-full"></div>
                  <Shield size={64} className="text-slate-300 relative z-10" />
                </div>
                <p className="text-2xl font-black text-text-main tracking-tight">Encrypted Sector</p>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Awaiting Level 5 Clearance</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* --- HIGH-TECH ADD STAFF MODAL --- */}
      <AnimatePresence>
        {isStaffModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsStaffModalOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.3)] z-50 overflow-hidden border border-slate-200/50">
              
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>

              <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2.5 tracking-tight">
                  <div className="p-1.5 bg-primary/10 rounded-lg text-primary"><UserPlus size={20} /></div>
                  Initialize Operative
                </h2>
                <button onClick={() => setIsStaffModalOpen(false)} className="p-2 text-slate-400 hover:text-status-danger hover:bg-red-50 rounded-xl transition-colors"><X size={20} /></button>
              </div>

              <form onSubmit={handleAddStaff} className="p-8 space-y-5 bg-white">
                <div className="relative group transition-all duration-300 focus-within:shadow-[0_0_20px_rgba(37,99,235,0.08)] rounded-xl">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Full Designation</label>
                  <input required type="text" value={newStaffData.name} onChange={(e) => setNewStaffData({...newStaffData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-text-main shadow-inner" placeholder="Dr. John Doe" />
                </div>
                
                <div className="relative group transition-all duration-300 focus-within:shadow-[0_0_20px_rgba(37,99,235,0.08)] rounded-xl">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Comms Channel (Email)</label>
                  <input required type="email" value={newStaffData.email} onChange={(e) => setNewStaffData({...newStaffData, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-text-main shadow-inner" placeholder="john@medivault.com" />
                </div>
                
                <div className="relative group transition-all duration-300 focus-within:shadow-[0_0_20px_rgba(37,99,235,0.08)] rounded-xl">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Initial Passcode</label>
                  <input required type="password" value={newStaffData.password} onChange={(e) => setNewStaffData({...newStaffData, password: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-black text-text-main shadow-inner tracking-widest" placeholder="••••••••" />
                </div>
                
                <div className="relative group transition-all duration-300 focus-within:shadow-[0_0_20px_rgba(37,99,235,0.08)] rounded-xl">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Security Clearance</label>
                  <select value={newStaffData.role} onChange={(e) => setNewStaffData({...newStaffData, role: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-slate-700 cursor-pointer shadow-inner">
                    <option value="attendant">Level 1: Attendant (Billing Only)</option>
                    <option value="pharmacist">Level 2: Pharmacist (Inventory)</option>
                    <option value="admin">Level 3: Administrator (Full Access)</option>
                  </select>
                </div>

                <div className="pt-6 flex gap-3">
                  <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-xl transition-all active:scale-95 flex justify-center items-center overflow-hidden relative group">
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="tracking-wide relative z-10">Grant System Access</span>}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add global tailwind animation for the scanner if you haven't yet in index.css */}
      {/* @keyframes scan {
          0% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
          100% { transform: translateY(-100%); }
        }
      */}
    </div>
  );
}