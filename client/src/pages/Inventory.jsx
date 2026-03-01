// import { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import api from '../api/axios';
// import { Search, Plus, MoreVertical, AlertCircle, CheckCircle2, Package, PackageX } from 'lucide-react';

// // Animation Variants
// const containerVariants = {
//   hidden: { opacity: 0 },
//   show: {
//     opacity: 1,
//     transition: { staggerChildren: 0.05 }
//   }
// };

// const rowVariants = {
//   hidden: { opacity: 0, y: 10 },
//   show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
// };

// export default function Inventory() {
//   const [medicines, setMedicines] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     const fetchMedicines = async () => {
//       try {
//         const res = await api.get('/medicines');
//         setMedicines(res.data.data);
//       } catch (error) {
//         console.error("Failed to fetch inventory", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchMedicines();
//   }, []);

//   // Real-time search filter
//   const filteredMedicines = medicines.filter(med => 
//     med.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
//     med.category.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // Helper function to generate the correct status badge
//   const getStatusBadge = (stock) => {
//     if (stock === 0) {
//       return (
//         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-status-danger border border-red-200">
//           <PackageX size={14} /> Out of Stock
//         </span>
//       );
//     }
//     if (stock < 50) {
//       return (
//         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-status-warning border border-amber-200">
//           <AlertCircle size={14} /> Low Stock
//         </span>
//       );
//     }
//     return (
//       <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-status-success border border-emerald-200">
//         <CheckCircle2 size={14} /> In Stock
//       </span>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="h-full flex items-center justify-center">
//         <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto space-y-6">
      
//       {/* 1. Page Header & Actions */}
//       <motion.div 
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
//       >
//         <div>
//           <h1 className="text-3xl font-extrabold text-text-main tracking-tight">Inventory Vault</h1>
//           <p className="text-text-muted font-medium mt-1">Manage medicines, stock levels, and batches.</p>
//         </div>
        
//         <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95">
//           <Plus size={20} />
//           <span>Add Medicine</span>
//         </button>
//       </motion.div>

//       {/* 2. Search & Controls Bar */}
//       <motion.div 
//         initial={{ opacity: 0, scale: 0.98 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ delay: 0.1 }}
//         className="bento-card p-4 flex items-center"
//       >
//         <div className="relative flex-1 max-w-md group">
//           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
//           <input 
//             type="text" 
//             placeholder="Search by medicine name or category..." 
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-text-main"
//           />
//         </div>
//       </motion.div>

//       {/* 3. The Data Table (Futuristic List) */}
//       <div className="bento-card overflow-hidden p-0">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
            
//             {/* Table Header */}
//             <thead>
//               <tr className="border-b border-slate-100 bg-slate-50/50">
//                 <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Medicine Info</th>
//                 <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Category</th>
//                 <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Total Stock</th>
//                 <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
//                 <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Actions</th>
//               </tr>
//             </thead>

//             {/* Table Body (Animated) */}
//             <motion.tbody 
//               variants={containerVariants}
//               initial="hidden"
//               animate="show"
//               className="divide-y divide-slate-100"
//             >
//               {filteredMedicines.length > 0 ? (
//                 filteredMedicines.map((med) => (
//                   <motion.tr 
//                     key={med._id} 
//                     variants={rowVariants}
//                     className="hover:bg-slate-50/80 transition-colors group"
//                   >
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-3">
//                         <div className="p-2.5 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform">
//                           <Package size={20} />
//                         </div>
//                         <div>
//                           <p className="font-bold text-text-main text-base">{med.name}</p>
//                           <p className="text-xs font-medium text-text-muted">{med.genericName}</p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold">
//                         {med.category}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <p className="text-lg font-extrabold text-text-main">{med.totalStock}</p>
//                       <p className="text-xs font-medium text-text-muted">{med.batches.length} Batch(es)</p>
//                     </td>
//                     <td className="px-6 py-4">
//                       {getStatusBadge(med.totalStock)}
//                     </td>
//                     <td className="px-6 py-4 text-right">
//                       <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary-light/50 rounded-xl transition-colors">
//                         <MoreVertical size={20} />
//                       </button>
//                     </td>
//                   </motion.tr>
//                 ))
//               ) : (
//                 /* Empty State */
//                 <tr>
//                   <td colSpan="5" className="px-6 py-16 text-center">
//                     <div className="flex flex-col items-center justify-center opacity-60">
//                       <Search size={48} className="text-slate-400 mb-4" />
//                       <p className="text-lg font-bold text-text-main">No medicines found</p>
//                       <p className="text-sm font-medium text-text-muted">Try adjusting your search criteria.</p>
//                     </div>
//                   </td>
//                 </tr>
//               )}
//             </motion.tbody>
            
//           </table>
//         </div>
//       </div>

//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { Search, Plus, MoreVertical, Package, SlidersHorizontal } from 'lucide-react';

export default function Inventory() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const res = await api.get('/medicines');
        setMedicines(res.data.data);
      } catch (error) {
        console.error("Failed to fetch inventory", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMedicines();
  }, []);

  const filteredMedicines = medicines.filter(med => 
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    med.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIndicator = (stock) => {
    if (stock === 0) {
      return (
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-danger opacity-40"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-status-danger"></span>
          </div>
          <span className="text-sm font-semibold text-status-danger">Out of Stock</span>
        </div>
      );
    }
    if (stock < 50) {
      return (
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-status-warning shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
          <span className="text-sm font-semibold text-status-warning">Low Stock</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2.5">
        <div className="w-2.5 h-2.5 rounded-full bg-status-success"></div>
        <span className="text-sm font-semibold text-text-muted">In Stock</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* 1. Header Area */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-text-main tracking-tight">Inventory</h1>
          <p className="text-text-muted font-medium mt-1">Manage your medical catalog and stock levels.</p>
        </div>
        
        {/* CORRECTED: Back to Primary Medical Blue */}
        <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95">
          <Plus size={18} />
          <span>New Medicine</span>
        </button>
      </motion.div>

      {/* 2. Sleek Controls Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 items-center justify-between"
      >
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search catalog..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-surface border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-text-main shadow-sm"
          />
        </div>

        <button className="flex items-center gap-2 px-4 py-3 bg-surface border border-slate-200 text-text-muted hover:text-text-main rounded-xl font-medium transition-all shadow-sm hover:shadow">
          <SlidersHorizontal size={18} />
          <span>Filters</span>
        </button>
      </motion.div>

      {/* 3. The Professional Data Table */}
      <div className="bento-card overflow-hidden p-0 border-slate-200/60 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Stock Level</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-surface">
              <AnimatePresence mode="popLayout">
                {filteredMedicines.length > 0 ? (
                  filteredMedicines.map((med, index) => (
                    <motion.tr 
                      key={med._id} 
                      layout="position" 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, filter: "blur(2px)", transition: { duration: 0.2 } }}
                      transition={{ duration: 0.4, delay: index * 0.05, type: "spring", bounce: 0.2 }}
                      className="group hover:bg-slate-50 transition-colors duration-300"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-slate-100 text-slate-500 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                            <Package size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-text-main text-base group-hover:text-primary transition-colors">{med.name}</p>
                            <p className="text-xs font-medium text-slate-400">{med.genericName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-600">
                          {med.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-base font-extrabold text-text-main tabular-nums">{med.totalStock}</p>
                        <p className="text-xs font-medium text-slate-400">{med.batches.length} Batch(es)</p>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusIndicator(med.totalStock)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-300 hover:text-primary hover:bg-primary-light/50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
                          <MoreVertical size={20} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan="5" className="px-6 py-24 text-center">
                      <div className="max-w-xs mx-auto flex flex-col items-center justify-center opacity-80">
                        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4 group-hover:text-primary">
                          <Search size={28} />
                        </div>
                        <p className="text-xl font-bold text-text-main mb-1">No results found</p>
                        <p className="text-sm font-medium text-text-muted text-center">
                          We couldn't find anything matching "<span className="text-text-main">{searchTerm}</span>". Try different keywords.
                        </p>
                      </div>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
            
          </table>
        </div>
      </div>
    </div>
  );
}