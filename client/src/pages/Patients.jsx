import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
  Search, Users, Award, Filter, UserPlus, Phone, MapPin, 
  Calendar, HeartPulse, AlertTriangle, Droplet, Activity, X, ShieldAlert, CheckCircle2, Save, Edit2, UserPlus2
} from 'lucide-react';

// Simplified Config: No thresholds, just fixed subscription discounts
const MEMBERSHIP_CONFIG = {
  Standard: { discountPct: 5, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  Silver:   { discountPct: 15, color: 'bg-slate-100 text-slate-700 border-slate-300' },
  Gold:     { discountPct: 25, color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  Platinum: { discountPct: 40, color: 'bg-slate-800 text-slate-100 border-slate-600' }
};

const formatINR = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const initialFormState = {
  name: '', mobile: '', address: '', bloodGroup: 'Unknown', 
  status: 'Active', allergies: '', chronicConditions: '', membershipTier: 'Standard'
};

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  
  // Drawer & Form States
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get('/patients');
        setPatients(res.data.data);
      } catch (error) { toast.error("Failed to load CRM data"); } 
      finally { setLoading(false); }
    };
    fetchPatients();
  }, []);

  const totalActive = patients.filter(p => p.status === 'Active').length;
  const totalPlatinum = patients.filter(p => p.membershipTier === 'Platinum').length;
  const totalValue = patients.reduce((sum, p) => sum + (p.totalLifetimeSpent || 0), 0);

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.mobile.includes(searchTerm);
    const matchesTier = tierFilter === 'All' || p.membershipTier === tierFilter;
    return matchesSearch && matchesTier;
  });

  // Handle Form Inputs
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Open Create Drawer
  const handleOpenCreate = () => {
    setSelectedPatient(null);
    setIsEditing(false);
    setFormData(initialFormState);
    setIsCreating(true);
  };

  // Open Edit Drawer
  const handleEditClick = () => {
    setFormData({
      ...selectedPatient,
      allergies: selectedPatient.allergies?.join(', ') || '',
      chronicConditions: selectedPatient.chronicConditions?.join(', ') || ''
    });
    setIsEditing(true);
  };

  // Save (Create or Update)
  const handleSaveProfile = async () => {
    if (!formData.name || !formData.mobile) return toast.error("Name and Mobile are required!");

    try {
      const payload = {
        ...formData,
        allergies: typeof formData.allergies === 'string' ? formData.allergies.split(',').map(a => a.trim()).filter(a=>a) : formData.allergies,
        chronicConditions: typeof formData.chronicConditions === 'string' ? formData.chronicConditions.split(',').map(a => a.trim()).filter(a=>a) : formData.chronicConditions
      };

      if (isCreating) {
        const res = await api.post('/patients', payload);
        setPatients([res.data.data, ...patients]);
        toast.success('New Patient Registered!');
        setIsCreating(false);
      } else {
        const res = await api.put(`/patients/${selectedPatient._id}`, payload);
        setPatients(patients.map(p => p._id === res.data.data._id ? res.data.data : p));
        setSelectedPatient(res.data.data);
        setIsEditing(false);
        toast.success('Patient Profile Updated!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save profile');
    }
  };

  const closeDrawer = () => {
    setSelectedPatient(null);
    setIsEditing(false);
    setIsCreating(false);
  };

  return (
    <div className="max-w-[1600px] mx-auto h-auto min-h-[calc(100vh-8rem)] relative flex">
      {/* MAIN CRM DASHBOARD */}
      <div className="flex-1 space-y-8 pb-10 transition-all duration-500 pr-0">
        <div className="flex flex-col xl:flex-row gap-6 justify-between items-start">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3"><Users className="text-primary" size={32} />Patient CRM</h1>
            <p className="text-slate-500 font-medium mt-2 flex items-center gap-2"><Activity size={16} /> Managing {patients.length} total subscriptions.</p>
          </div>
          <div className="flex gap-4 w-full xl:w-auto overflow-x-auto pb-2 custom-scrollbar">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm min-w-[160px] flex-shrink-0 flex flex-col justify-center"><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Active</p><p className="text-2xl font-black text-slate-800">{totalActive}</p></div>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-4 rounded-2xl shadow-lg min-w-[160px] flex-shrink-0 flex flex-col justify-center relative overflow-hidden"><Award className="absolute -right-4 -bottom-4 text-slate-700/50" size={64} /><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 relative z-10">Platinum VIPs</p><p className="text-2xl font-black text-white relative z-10">{totalPlatinum}</p></div>
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl shadow-sm min-w-[200px] flex-shrink-0 flex flex-col justify-center"><p className="text-xs font-bold text-emerald-600/70 uppercase tracking-widest mb-1">Total LTV</p><p className="text-2xl font-black text-emerald-700">{formatINR(totalValue)}</p></div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
            <input type="text" placeholder="Search patients by name or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-transparent outline-none font-semibold text-slate-700 placeholder:text-slate-400" />
          </div>
          <div className="h-px w-full md:w-px md:h-12 bg-slate-200 hidden md:block"></div>
          <div className="flex items-center gap-2 px-2 pb-2 md:pb-0">
            <Filter size={18} className="text-slate-400 ml-2" />
            <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl focus:ring-primary focus:border-primary block p-2.5 outline-none cursor-pointer hover:bg-slate-100 transition-colors">
              <option value="All">All Tiers</option><option value="Standard">Standard</option><option value="Silver">Silver</option><option value="Gold">Gold</option><option value="Platinum">Platinum</option>
            </select>
            <button onClick={handleOpenCreate} className="ml-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"><UserPlus size={16} /> New</button>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {filteredPatients.map((patient, index) => {
                const tier = MEMBERSHIP_CONFIG[patient.membershipTier || 'Standard'];
                return (
                  <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2, delay: index * 0.05 }} key={patient._id} onClick={() => { setSelectedPatient(patient); setIsEditing(false); setIsCreating(false); }} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer group flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-2 shadow-sm ${tier.color}`}>{patient.name.charAt(0)}</div>
                          <div><h3 className="font-extrabold text-slate-800 text-lg group-hover:text-primary transition-colors leading-tight">{patient.name}</h3><p className="text-xs font-bold text-slate-400 mt-0.5">{patient.mobile}</p></div>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${tier.color}`}>{patient.membershipTier || 'Standard'}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {patient.bloodGroup && patient.bloodGroup !== 'Unknown' && <span className="flex items-center gap-1 text-[10px] font-bold bg-rose-50 text-rose-600 px-2 py-1 rounded-md border border-rose-100"><Droplet size={10} /> {patient.bloodGroup}</span>}
                        {patient.allergies?.length > 0 && <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-1 rounded-md border border-amber-100"><AlertTriangle size={10} /> {patient.allergies.length} Allergies</span>}
                      </div>
                    </div>
                    {/* Simplified Fixed Subscription Display */}
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                      <div>
                        <p className="text-xs font-bold text-slate-500 mb-1">Lifetime Spend</p>
                        <p className="text-primary font-bold text-lg leading-none">{formatINR(patient.totalLifetimeSpent || 0)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Discount</p>
                        <p className="text-slate-800 font-bold leading-none">{tier.discountPct}% Off</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* SIDE DRAWER (CREATE / EDIT / DOSSIER) */}
      <AnimatePresence>
        {(selectedPatient || isCreating) && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeDrawer} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-50 overflow-y-auto border-l border-slate-200 flex flex-col">
              
              <div className="p-6 border-b border-slate-100 flex justify-between items-start sticky top-0 bg-white/90 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                  {isCreating ? (
                    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-primary text-white border-4 shadow-md"><UserPlus2 size={24} /></div>
                  ) : (
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl border-4 shadow-md ${MEMBERSHIP_CONFIG[selectedPatient.membershipTier || 'Standard'].color}`}>{selectedPatient.name.charAt(0)}</div>
                  )}
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
                      {isCreating ? 'New Patient' : selectedPatient.name}
                    </h2>
                    {!isCreating && (
                      <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${MEMBERSHIP_CONFIG[selectedPatient.membershipTier || 'Standard'].color}`}>{selectedPatient.membershipTier || 'Standard'} Sub</span>
                    )}
                  </div>
                </div>
                <button onClick={closeDrawer} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
              </div>

              <div className="p-6 space-y-8 flex-1">
                {(isEditing || isCreating) ? (
                  // --- FORM MODE (CREATE OR EDIT) ---
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div><label className="text-xs font-bold text-slate-500 mb-1 block">Full Name *</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-semibold" /></div>
                    <div><label className="text-xs font-bold text-slate-500 mb-1 block">Mobile Number *</label><input type="text" name="mobile" value={formData.mobile} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-semibold" /></div>
                    
                    {/* Membership Subscription Selector */}
                    <div>
                      <label className="text-xs font-bold text-primary mb-1 block">Subscription Tier</label>
                      <select name="membershipTier" value={formData.membershipTier} onChange={handleInputChange} className="w-full p-3 bg-primary/5 border border-primary/20 text-primary rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold">
                        <option value="Standard">Standard (5% Off)</option>
                        <option value="Silver">Silver (15% Off)</option>
                        <option value="Gold">Gold (25% Off)</option>
                        <option value="Platinum">Platinum (40% Off)</option>
                      </select>
                    </div>

                    <div><label className="text-xs font-bold text-slate-500 mb-1 block">Address</label><input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-semibold" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs font-bold text-slate-500 mb-1 block">Blood Group</label><select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-semibold"><option>Unknown</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option></select></div>
                      <div><label className="text-xs font-bold text-slate-500 mb-1 block">Status</label><select name="status" value={formData.status} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-semibold"><option>Active</option><option>Discharged</option></select></div>
                    </div>
                    <div><label className="text-xs font-bold text-slate-500 mb-1 block">Allergies (comma separated)</label><textarea name="allergies" value={formData.allergies} onChange={handleInputChange} placeholder="Peanuts, Penicillin..." className="w-full p-3 bg-amber-50 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none font-semibold min-h-[80px]" /></div>
                    <div><label className="text-xs font-bold text-slate-500 mb-1 block">Chronic Conditions (comma sep.)</label><textarea name="chronicConditions" value={formData.chronicConditions} onChange={handleInputChange} placeholder="Asthma, Diabetes..." className="w-full p-3 bg-purple-50 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none font-semibold min-h-[80px]" /></div>
                  </div>
                ) : (
                  // --- VIEW DOSSIER MODE ---
                  <>
                    <section>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Contact Details</h3>
                      <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3 text-sm font-semibold text-slate-700"><Phone size={16} className="text-slate-400" /> {selectedPatient.mobile}</div>
                        {selectedPatient.address && <div className="flex items-center gap-3 text-sm font-semibold text-slate-700"><MapPin size={16} className="text-slate-400 shrink-0" /> {selectedPatient.address}</div>}
                        <div className="flex items-center gap-3 text-sm font-semibold text-slate-700"><Calendar size={16} className="text-slate-400 shrink-0" /> Last Visit: {new Date(selectedPatient.lastVisit || Date.now()).toLocaleDateString()}</div>
                      </div>
                    </section>
                    <section>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><HeartPulse size={14} /> Clinical Profile</h3>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl"><p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-1">Blood Group</p><p className="font-black text-rose-700 flex items-center gap-2"><Droplet size={14} /> {selectedPatient.bloodGroup || 'Unknown'}</p></div>
                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</p><p className="font-black text-slate-700 flex items-center gap-2">{selectedPatient.status === 'Active' ? <CheckCircle2 size={14} className="text-emerald-500" /> : <X size={14} className="text-slate-400"/>} {selectedPatient.status}</p></div>
                      </div>
                      <div className="mb-4">
                        <p className="text-xs font-bold text-slate-500 mb-2">Known Allergies</p>
                        {selectedPatient.allergies?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">{selectedPatient.allergies.map((allergy, i) => <span key={i} className="flex items-center gap-1.5 text-xs font-bold bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-200"><ShieldAlert size={12} /> {allergy}</span>)}</div>
                        ) : <p className="text-sm font-medium text-slate-400 italic">No known allergies recorded.</p>}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 mb-2">Chronic Conditions</p>
                        {selectedPatient.chronicConditions?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">{selectedPatient.chronicConditions.map((condition, i) => <span key={i} className="flex items-center gap-1.5 text-xs font-bold bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-200"><Activity size={12} /> {condition}</span>)}</div>
                        ) : <p className="text-sm font-medium text-slate-400 italic">No chronic conditions recorded.</p>}
                      </div>
                    </section>
                    <section className="bg-slate-900 text-white p-5 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full"></div>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 relative z-10">Financial Overview</h3>
                      <div className="flex justify-between items-end relative z-10">
                        <div><p className="text-sm text-slate-300 font-medium">Lifetime Spend</p><p className="text-3xl font-black">{formatINR(selectedPatient.totalLifetimeSpent || 0)}</p></div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-primary bg-primary/20 px-3 py-1.5 rounded-md">
                            {MEMBERSHIP_CONFIG[selectedPatient.membershipTier || 'Standard'].discountPct}% Base Discount
                          </p>
                        </div>
                      </div>
                    </section>
                  </>
                )}
              </div>
              
              <div className="p-6 border-t border-slate-100 bg-slate-50 mt-auto">
                {(isEditing || isCreating) ? (
                  <div className="flex gap-3">
                    <button onClick={() => { setIsEditing(false); setIsCreating(false); }} className="flex-1 py-3.5 bg-white border border-slate-300 text-slate-600 rounded-xl font-bold transition-colors">Cancel</button>
                    <button onClick={handleSaveProfile} className="flex-1 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-black transition-all shadow-md shadow-primary/30 flex items-center justify-center gap-2"><Save size={18} /> {isCreating ? 'Register Patient' : 'Save Changes'}</button>
                  </div>
                ) : (
                  <button onClick={handleEditClick} className="w-full py-3.5 bg-white border-2 border-slate-200 hover:border-primary hover:text-primary text-slate-700 rounded-xl font-black transition-colors shadow-sm flex items-center justify-center gap-2"><Edit2 size={18} /> Edit Patient Profile</button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}