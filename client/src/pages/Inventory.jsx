import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Search, Plus, MoreVertical, Package, SlidersHorizontal, X, Save, Edit3, Trash2, ChevronDown } from 'lucide-react';

export default function Inventory() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- NEW: Filter & Action Menu States ---
  const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'In Stock', 'Low Stock', 'Out of Stock'
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null); // Tracks which 3-dots menu is open

  // Drawer & Form State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null); // If null, we are adding new. If ID, we are editing.
  
  const [formData, setFormData] = useState({
    name: '', genericName: '', manufacturer: '', category: 'Tablet',
    batchNumber: '', quantity: '', expiryDate: '', buyPrice: '', sellPrice: '' // 🔴 FIX: Changed costPrice to buyPrice
  });

  const fetchMedicines = async () => {
    try {
      const res = await api.get('/medicines');
      setMedicines(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // --- 🔴 THE UPGRADED SMART FILTER ENGINE ---
  const filteredMedicines = medicines.filter(med => {
    // 1. Search Filter
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          med.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Status Filter
    let matchesStatus = true;
    if (filterStatus === 'Out of Stock') matchesStatus = med.totalStock === 0;
    if (filterStatus === 'Low Stock') matchesStatus = med.totalStock > 0 && med.totalStock < 50;
    if (filterStatus === 'In Stock') matchesStatus = med.totalStock >= 50;

    return matchesSearch && matchesStatus;
  });

  // --- DRAWER CONTROLS ---
  const openNewDrawer = () => {
    setEditingId(null);
    setFormData({ name: '', genericName: '', manufacturer: '', category: 'Tablet', batchNumber: '', quantity: '', expiryDate: '', buyPrice: '', sellPrice: '' });
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (med) => {
    setEditingId(med._id);
    setActiveMenuId(null); // Close the 3-dots menu
    
    // Grab the first batch for editing (assuming simple editing for now)
    const primaryBatch = med.batches && med.batches.length > 0 ? med.batches[0] : {};
    
    setFormData({
      name: med.name,
      genericName: med.genericName || '',
      manufacturer: med.manufacturer || '',
      category: med.category || 'Tablet',
      batchNumber: primaryBatch.batchNumber || '',
      quantity: primaryBatch.quantity || '',
      expiryDate: primaryBatch.expiryDate ? primaryBatch.expiryDate.split('T')[0] : '', // Format date for input
      buyPrice: primaryBatch.buyPrice || '',
      sellPrice: primaryBatch.sellPrice || ''
    });
    setIsDrawerOpen(true);
  };

  // --- THE SUBMIT HANDLER (Handles both Add and Edit) ---
  const handleSaveMedicine = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        name: formData.name,
        genericName: formData.genericName,
        manufacturer: formData.manufacturer,
        category: formData.category,
        batches: [{
          batchNumber: formData.batchNumber,
          quantity: Number(formData.quantity),
          expiryDate: formData.expiryDate,
          buyPrice: Number(formData.buyPrice), // 🔴 FIX: Matches your backend schema
          sellPrice: Number(formData.sellPrice)
        }]
      };

      if (editingId) {
        // UPDATE EXISTING
        const res = await api.put(`/medicines/${editingId}`, payload);
        setMedicines(prev => prev.map(m => m._id === editingId ? res.data.data : m));
        toast.success(`${formData.name} updated successfully!`);
      } else {
        // ADD NEW
        const res = await api.post('/medicines', payload);
        setMedicines(prev => [res.data.data, ...prev]);
        toast.success(`${formData.name} added to vault!`);
      }
      
      setIsDrawerOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save medicine');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- DELETE HANDLER ---
  const handleDeleteMedicine = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${name}?`)) return;
    
    try {
      await api.delete(`/medicines/${id}`);
      setMedicines(prev => prev.filter(m => m._id !== id));
      toast.success(`${name} deleted permanently.`);
      setActiveMenuId(null);
    } catch (error) {
      toast.error('Failed to delete medicine');
    }
  };

  const getStatusIndicator = (stock) => {
    if (stock === 0) return <div className="flex items-center gap-2.5"><span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-danger opacity-40"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-status-danger"></span></span><span className="text-sm font-semibold text-status-danger">Out of Stock</span></div>;
    if (stock < 50) return <div className="flex items-center gap-2.5"><div className="w-2.5 h-2.5 rounded-full bg-status-warning shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div><span className="text-sm font-semibold text-status-warning">Low Stock</span></div>;
    return <div className="flex items-center gap-2.5"><div className="w-2.5 h-2.5 rounded-full bg-status-success"></div><span className="text-sm font-semibold text-text-muted">In Stock</span></div>;
  };

  if (loading) return <div className="h-full flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      
      {/* 1. Header Area */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-main tracking-tight">Inventory</h1>
          <p className="text-text-muted font-medium mt-1">Manage your medical catalog and stock levels.</p>
        </div>
        <button onClick={openNewDrawer} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-95">
          <Plus size={18} /><span>New Medicine</span>
        </button>
      </motion.div>

      {/* 2. Controls Bar (Search + Dropdown Filters) */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-4 items-center justify-between z-20 relative">
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <input type="text" placeholder="Search catalog..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-surface border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-text-main shadow-sm" />
        </div>
        
        {/* Filter Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            className={`flex items-center gap-2 px-4 py-3 bg-surface border rounded-xl font-medium transition-all shadow-sm ${filterStatus !== 'All' ? 'border-primary text-primary bg-primary-light/10' : 'border-slate-200 text-text-muted hover:text-text-main hover:border-slate-300'}`}
          >
            <SlidersHorizontal size={18} />
            <span>{filterStatus === 'All' ? 'Filters' : filterStatus}</span>
            <ChevronDown size={16} className={`transition-transform ${isFilterMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {isFilterMenuOpen && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-30">
                {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map(status => (
                  <button 
                    key={status}
                    onClick={() => { setFilterStatus(status); setIsFilterMenuOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors ${filterStatus === status ? 'bg-primary-light/20 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {status}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* 3. The Data Table */}
      <div className="bento-card p-0 border-slate-200/60 shadow-sm relative z-10" style={{ overflow: activeMenuId ? 'visible' : 'hidden' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Stock Level</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-surface">
              <AnimatePresence mode="popLayout">
                {filteredMedicines.length > 0 ? (
                  filteredMedicines.map((med, index) => (
                    <motion.tr key={med._id} layout="position" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, filter: "blur(2px)", transition: { duration: 0.2 } }} transition={{ duration: 0.4, delay: index * 0.05, type: "spring", bounce: 0.2 }} className="group hover:bg-slate-50 transition-colors duration-300">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-slate-100 text-slate-500 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300"><Package size={20} /></div>
                          <div>
                            <p className="font-bold text-text-main text-base group-hover:text-primary transition-colors">{med.name}</p>
                            <p className="text-xs font-medium text-slate-400">{med.genericName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-sm font-semibold text-slate-600">{med.category}</span></td>
                      <td className="px-6 py-4">
                        <p className="text-base font-extrabold text-text-main tabular-nums">{med.totalStock}</p>
                        <p className="text-xs font-medium text-slate-400">{med.batches?.length || 0} Batch(es)</p>
                      </td>
                      <td className="px-6 py-4">{getStatusIndicator(med.totalStock)}</td>
                      <td className="px-6 py-4 text-right relative">
                        
                        {/* 🔴 THE 3-DOTS ACTION MENU */}
                        <button onClick={() => setActiveMenuId(activeMenuId === med._id ? null : med._id)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary-light/50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
                          <MoreVertical size={20} />
                        </button>

                        <AnimatePresence>
                          {activeMenuId === med._id && (
                            <motion.div initial={{ opacity: 0, scale: 0.9, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -10 }} className="absolute right-8 top-10 w-40 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
                              <button onClick={() => openEditDrawer(med)} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors flex items-center gap-2 border-b border-slate-100">
                                <Edit3 size={16} /> Edit Details
                              </button>
                              <button onClick={() => handleDeleteMedicine(med._id, med.name)} className="w-full text-left px-4 py-3 text-sm font-bold text-status-danger hover:bg-red-50 transition-colors flex items-center gap-2">
                                <Trash2 size={16} /> Delete
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td colSpan="5" className="px-6 py-24 text-center">
                      <div className="max-w-xs mx-auto flex flex-col items-center justify-center opacity-80">
                        <Search size={48} className="text-slate-300 mb-4" />
                        <p className="text-xl font-bold text-text-main mb-1">No results found</p>
                        <p className="text-sm font-medium text-text-muted text-center">Try changing your search or filter status.</p>
                      </div>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================== */}
      {/* 4. THE SMART SLIDE-OUT DRAWER              */}
      {/* ========================================== */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDrawerOpen(false)} className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: "100%", boxShadow: "-20px 0 40px rgba(0,0,0,0)" }} animate={{ x: 0, boxShadow: "-20px 0 40px rgba(0,0,0,0.1)" }} exit={{ x: "100%", boxShadow: "-20px 0 40px rgba(0,0,0,0)" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-surface z-50 flex flex-col border-l border-slate-200">
              
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-xl font-bold text-text-main">{editingId ? 'Edit Medicine' : 'Add New Medicine'}</h2>
                  <p className="text-sm font-medium text-text-muted mt-0.5">{editingId ? 'Update product details and stock' : 'Register a new product and its first batch.'}</p>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-slate-400 hover:text-status-danger hover:bg-red-50 rounded-xl transition-colors"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form id="medicineForm" onSubmit={handleSaveMedicine} className="space-y-8">
                  {/* Product Details */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2"><Package size={14} /> Product Profile</h3>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Brand Name *</label>
                      <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-semibold text-text-main" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Generic Name</label>
                      <input type="text" value={formData.genericName} onChange={(e) => setFormData({...formData, genericName: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-text-main" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Category *</label>
                        <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-text-main">
                          <option>Tablet</option><option>Syrup</option><option>Injection</option><option>Ointment</option><option>Drops</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Manufacturer</label>
                        <input type="text" value={formData.manufacturer} onChange={(e) => setFormData({...formData, manufacturer: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-text-main" />
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100"></div>

                  {/* Batch Details */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2"><SlidersHorizontal size={14} /> Batch Tracking</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Batch Number *</label>
                        <input required type="text" value={formData.batchNumber} onChange={(e) => setFormData({...formData, batchNumber: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-mono font-bold text-text-main uppercase" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Expiry Date *</label>
                        <input required type="date" value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-text-main" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Quantity (Units) *</label>
                      <input required type="number" min="0" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-extrabold text-text-main tabular-nums" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Buy Price (₹) *</label>
                        <input required type="number" min="0" step="0.01" value={formData.buyPrice} onChange={(e) => setFormData({...formData, buyPrice: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-text-main" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-status-success mb-1.5">Sell Price (₹) *</label>
                        <input required type="number" min="0" step="0.01" value={formData.sellPrice} onChange={(e) => setFormData({...formData, sellPrice: e.target.value})} className="w-full px-3 py-2 bg-white border border-status-success/30 rounded-lg focus:ring-2 focus:ring-status-success/20 outline-none transition-all font-bold text-status-success" />
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-surface flex gap-3">
                <button type="button" onClick={() => setIsDrawerOpen(false)} className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors">Cancel</button>
                <button type="submit" form="medicineForm" disabled={isSubmitting} className="flex-1 py-3 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-[0_8px_20px_rgba(37,99,235,0.25)] transition-all active:scale-95 flex justify-center items-center gap-2">
                  {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={18} /> {editingId ? 'Update Vault' : 'Save to Vault'}</>}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}