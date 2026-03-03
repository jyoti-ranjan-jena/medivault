// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import api from "../api/axios";
// import toast from "react-hot-toast";
// import {
//   Search,
//   Plus,
//   User,
//   Phone,
//   MapPin,
//   Calendar,
//   Activity,
//   X,
// } from "lucide-react";

// const pageVariants = {
//   hidden: { opacity: 0 },
//   show: { opacity: 1, transition: { staggerChildren: 0.1 } },
// };

// const itemVariants = {
//   hidden: { opacity: 0, y: 20 },
//   show: {
//     opacity: 1,
//     y: 0,
//     transition: { type: "spring", stiffness: 300, damping: 24 },
//   },
// };

// export default function Patients() {
//   const [patients, setPatients] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");

//   // Modal State
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // New Patient Form State
//   const [formData, setFormData] = useState({
//     name: "",
//     mobile: "",
//     age: "",
//     gender: "Male",
//     address: "",
//   });

//   // Fetch Patients
//   const fetchPatients = async () => {
//     try {
//       const res = await api.get("/patients");
//       setPatients(res.data.data);
//     } catch (error) {
//       toast.error("Failed to load patient directory");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPatients();
//   }, []);

//   // Handle Search
//   const filteredPatients = patients.filter(
//     (p) =>
//       p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       p.mobile.includes(searchTerm),
//   );

//   // Handle Form Submit
//   //   const handleAddPatient = async (e) => {
//   //     e.preventDefault();
//   //     setIsSubmitting(true);
//   //     try {
//   //       await api.post('/patients', {
//   //         ...formData,
//   //         age: Number(formData.age)
//   //       });
//   //       toast.success('Patient Registered Successfully!');
//   //       setIsModalOpen(false);
//   //       setFormData({ name: '', mobile: '', age: '', gender: 'Male', address: '' }); // Reset form
//   //       fetchPatients(); // Refresh list
//   //     } catch (error) {
//   //       toast.error(error.response?.data?.message || 'Registration Failed');
//   //     } finally {
//   //       setIsSubmitting(false);
//   //     }
//   //   };
//   // Handle Form Submit
//   const handleAddPatient = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     try {
//       // 1. Send to backend
//       const res = await api.post("/patients", {
//         ...formData,
//         age: Number(formData.age),
//       });

//       const newPatient = res.data.data; // The fresh patient from the database

//       // 2. INSTANT UI UPDATE: Inject at the top of the array
//       // This triggers Framer Motion's layout animations instantly!
//       setPatients((prevPatients) => [newPatient, ...prevPatients]);

//       toast.success("Patient Registered Successfully!");
//       setIsModalOpen(false);
//       setFormData({
//         name: "",
//         mobile: "",
//         age: "",
//         gender: "Male",
//         address: "",
//       }); // Reset form
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Registration Failed");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="h-full flex items-center justify-center">
//         <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto space-y-8 relative">
//       {/* 1. Header Area */}
//       <motion.div
//         initial={{ opacity: 0, y: -10 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
//       >
//         <div>
//           <h1 className="text-3xl font-extrabold text-text-main tracking-tight">
//             Patient Directory
//           </h1>
//           <p className="text-text-muted font-medium mt-1">
//             Manage hospital records and patient details.
//           </p>
//         </div>

//         <button
//           onClick={() => setIsModalOpen(true)}
//           className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95"
//         >
//           <Plus size={18} />
//           <span>Register Patient</span>
//         </button>
//       </motion.div>

//       {/* 2. Controls Bar */}
//       <motion.div
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.1 }}
//       >
//         <div className="relative w-full max-w-md group">
//           <Search
//             className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
//             size={18}
//           />
//           <input
//             type="text"
//             placeholder="Search by name or mobile number..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-11 pr-4 py-3 bg-surface border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-text-main shadow-sm"
//           />
//         </div>
//       </motion.div>

//       {/* 3. Patients Grid */}
//       <motion.div
//         variants={pageVariants}
//         initial="hidden"
//         animate="show"
//         className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
//       >
//         <AnimatePresence mode="popLayout">
//           {filteredPatients.length > 0 ? (
//             filteredPatients.map((patient) => (
//               <motion.div
//                 layout
//                 variants={itemVariants}
//                 key={patient._id}
//                 className="bento-card group hover:shadow-xl transition-all duration-300 border-slate-200/60 relative overflow-hidden"
//               >
//                 {/* Decorative Top Accent */}
//                 <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

//                 <div className="flex items-start gap-4 mb-4">
//                   <div className="w-12 h-12 rounded-full bg-primary-light/30 text-primary flex items-center justify-center font-bold text-lg border border-primary/10">
//                     {patient.name.charAt(0)}
//                   </div>
//                   <div>
//                     <h3 className="font-extrabold text-text-main text-lg leading-tight group-hover:text-primary transition-colors">
//                       {patient.name}
//                     </h3>
//                     <p className="text-sm font-medium text-slate-400">
//                       ID:{" "}
//                       {patient._id
//                         .substring(patient._id.length - 6)
//                         .toUpperCase()}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="space-y-2.5">
//                   <div className="flex items-center gap-3 text-sm font-medium text-text-muted">
//                     <Phone size={16} className="text-slate-400" />
//                     {patient.mobile}
//                   </div>
//                   <div className="flex items-center gap-3 text-sm font-medium text-text-muted">
//                     <Calendar size={16} className="text-slate-400" />
//                     {patient.age} years • {patient.gender}
//                   </div>
//                   <div className="flex items-center gap-3 text-sm font-medium text-text-muted">
//                     <MapPin
//                       size={16}
//                       className="text-slate-400 flex-shrink-0"
//                     />
//                     <span className="truncate">
//                       {patient.address || "No address provided"}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
//                   <span className="text-xs font-bold text-status-success bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1.5">
//                     <Activity size={14} /> Active
//                   </span>
//                   <button className="text-sm font-bold text-primary hover:text-primary-hover transition-colors">
//                     View History
//                   </button>
//                 </div>
//               </motion.div>
//             ))
//           ) : (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="col-span-full py-20 flex flex-col items-center justify-center opacity-70"
//             >
//               <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
//                 <User size={32} className="text-slate-400" />
//               </div>
//               <p className="text-xl font-bold text-text-main">
//                 No patients found
//               </p>
//               <p className="text-sm font-medium text-text-muted mt-1">
//                 Try adjusting your search or register a new patient.
//               </p>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </motion.div>

//       {/* 4. Glassmorphism Registration Modal */}
//       <AnimatePresence>
//         {isModalOpen && (
//           <>
//             {/* Backdrop */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setIsModalOpen(false)}
//               className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
//             />

//             {/* Modal */}
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95, y: 20 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.95, y: 20 }}
//               className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-surface rounded-2xl shadow-2xl z-50 overflow-hidden border border-slate-100"
//             >
//               <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
//                 <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
//                   <User size={20} className="text-primary" /> New Patient
//                   Registration
//                 </h2>
//                 <button
//                   onClick={() => setIsModalOpen(false)}
//                   className="p-2 text-slate-400 hover:text-status-danger hover:bg-red-50 rounded-lg transition-colors"
//                 >
//                   <X size={20} />
//                 </button>
//               </div>

//               <form onSubmit={handleAddPatient} className="p-6 space-y-4">
//                 <div>
//                   <label className="block text-sm font-bold text-slate-700 mb-1.5">
//                     Full Name
//                   </label>
//                   <input
//                     required
//                     type="text"
//                     value={formData.name}
//                     onChange={(e) =>
//                       setFormData({ ...formData, name: e.target.value })
//                     }
//                     className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-text-main"
//                     placeholder="John Doe"
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-bold text-slate-700 mb-1.5">
//                       Mobile Number
//                     </label>
//                     <input
//                       required
//                       type="tel"
//                       pattern="[0-9]{10}"
//                       value={formData.mobile}
//                       onChange={(e) =>
//                         setFormData({ ...formData, mobile: e.target.value })
//                       }
//                       className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-text-main"
//                       placeholder="10-digit number"
//                     />
//                   </div>
//                   <div className="grid grid-cols-2 gap-2">
//                     <div>
//                       <label className="block text-sm font-bold text-slate-700 mb-1.5">
//                         Age
//                       </label>
//                       <input
//                         required
//                         type="number"
//                         min="0"
//                         max="120"
//                         value={formData.age}
//                         onChange={(e) =>
//                           setFormData({ ...formData, age: e.target.value })
//                         }
//                         className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-text-main"
//                         placeholder="Years"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-bold text-slate-700 mb-1.5">
//                         Gender
//                       </label>
//                       <select
//                         value={formData.gender}
//                         onChange={(e) =>
//                           setFormData({ ...formData, gender: e.target.value })
//                         }
//                         className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-text-main cursor-pointer"
//                       >
//                         <option>Male</option>
//                         <option>Female</option>
//                         <option>Other</option>
//                       </select>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-bold text-slate-700 mb-1.5">
//                     Address
//                   </label>
//                   <textarea
//                     value={formData.address}
//                     onChange={(e) =>
//                       setFormData({ ...formData, address: e.target.value })
//                     }
//                     rows="2"
//                     className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-text-main resize-none"
//                     placeholder="Residential address..."
//                   />
//                 </div>

//                 <div className="pt-4 flex gap-3">
//                   <button
//                     type="button"
//                     onClick={() => setIsModalOpen(false)}
//                     className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={isSubmitting}
//                     className="flex-1 py-3 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-lg shadow-primary/30 transition-all active:scale-95 flex justify-center items-center"
//                   >
//                     {isSubmitting ? (
//                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                     ) : (
//                       "Save Patient"
//                     )}
//                   </button>
//                 </div>
//               </form>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
  Users, Search, Plus, MoreVertical, ShieldAlert, 
  Activity, Calendar, Droplet, CheckCircle2, X, Wallet, FileText
} from 'lucide-react';

// --- ANIMATION VARIANTS ---
const pageVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const slideIn = {
  hidden: { opacity: 0, x: "100%" },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  exit: { opacity: 0, x: "100%", transition: { duration: 0.2 } }
};

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals & Drawers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null); // For the Dossier Drawer
  
  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', mobile: '', age: '', gender: 'Male', bloodGroup: 'Unknown',
    allergies: '', chronicConditions: '', notes: '', status: 'Active', membershipTier: 'Standard'
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data.data);
    } catch (error) {
      toast.error("Failed to load patient registry.");
    } finally {
      setLoading(false);
    }
  };

  const getTierStyles = (tier) => {
    switch(tier) {
      case 'Platinum': return 'bg-gradient-to-r from-slate-800 to-slate-600 text-white shadow-slate-500/50 border-transparent';
      case 'Gold': return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-amber-500/40 border-transparent';
      case 'Silver': return 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-800 shadow-slate-300/50 border-transparent';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.mobile.includes(searchTerm)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Convert comma-separated strings to arrays
    const payload = { ...formData };
    if (typeof payload.allergies === 'string') payload.allergies = payload.allergies.split(',').map(s => s.trim()).filter(Boolean);
    if (typeof payload.chronicConditions === 'string') payload.chronicConditions = payload.chronicConditions.split(',').map(s => s.trim()).filter(Boolean);

    try {
      if (editingId) {
        const res = await api.put(`/patients/${editingId}`, payload);
        setPatients(patients.map(p => p._id === editingId ? res.data.data : p));
        toast.success('Patient dossier updated.');
      } else {
        const res = await api.post('/patients', payload);
        setPatients([res.data.data, ...patients]);
        toast.success('New patient registered successfully.', { icon: '✅' });
      }
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', mobile: '', age: '', gender: 'Male', bloodGroup: 'Unknown', allergies: '', chronicConditions: '', notes: '', status: 'Active', membershipTier: 'Standard' });
    setEditingId(null);
  };

  const openEdit = (patient) => {
    setFormData({
      ...patient,
      allergies: patient.allergies ? patient.allergies.join(', ') : '',
      chronicConditions: patient.chronicConditions ? patient.chronicConditions.join(', ') : ''
    });
    setEditingId(patient._id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to archive this patient record?")) {
      try {
        await api.delete(`/patients/${id}`);
        setPatients(patients.filter(p => p._id !== id));
        toast.success('Record archived securely.');
      } catch (error) {
        toast.error('Failed to archive record.');
      }
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative overflow-hidden h-full flex flex-col">
      
      {/* Header & Controls */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-text-main tracking-tight flex items-center gap-3">
            <Users className="text-primary" size={28} /> Patient Registry
          </h1>
          <p className="text-text-muted font-medium mt-1 flex items-center gap-2">
            <Activity size={16} className="text-primary/70" /> Manage clinical dossiers and membership tiers.
          </p>
        </div>
        
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:w-72 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
            <input type="text" placeholder="Search ID or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-surface border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-semibold text-text-main shadow-sm" />
          </div>
          <button onClick={() => { resetForm(); setIsFormOpen(true); }} className="p-3 sm:px-5 sm:py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
            <Plus size={18} /><span className="hidden sm:inline">New Patient</span>
          </button>
        </div>
      </motion.div>

      {/* The ID Card Grid */}
      <motion.div variants={pageVariants} initial="hidden" animate="show" className="flex-1 overflow-y-auto pb-8 pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredPatients.map((patient) => (
              <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} key={patient._id} className="bento-card p-6 flex flex-col justify-between group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden bg-white/60 backdrop-blur-md">
                
                {/* Status Glow */}
                <div className={`absolute top-0 left-0 w-1 h-full ${patient.status === 'Active' ? 'bg-status-success shadow-[0_0_15px_rgba(16,185,129,0.8)]' : 'bg-slate-300'}`}></div>

                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-2 shadow-sm ${patient.status === 'Active' ? 'bg-emerald-50 text-status-success border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {patient.name.charAt(0)}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${patient.status === 'Active' ? 'bg-status-success' : 'bg-slate-400'}`}></div>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-lg leading-tight truncate w-32">{patient.name}</h3>
                      <p className="text-xs font-bold text-slate-400 font-mono mt-0.5">{patient.mobile}</p>
                    </div>
                  </div>
                  
                  {/* Action Menu */}
                  <div className="relative group/menu">
                    <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary-light/20 rounded-lg transition-colors"><MoreVertical size={18} /></button>
                    <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20 overflow-hidden flex flex-col">
                      <button onClick={() => openEdit(patient)} className="px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary">Edit Info</button>
                      <button onClick={() => handleDelete(patient._id)} className="px-4 py-2 text-left text-xs font-bold text-status-danger hover:bg-red-50">Archive</button>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border shadow-sm ${getTierStyles(patient.membershipTier)}`}>
                    {patient.membershipTier}
                  </span>
                  {patient.bloodGroup !== 'Unknown' && (
                     <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-1">
                       <Droplet size={10} /> {patient.bloodGroup}
                     </span>
                  )}
                </div>

                <button onClick={() => setSelectedPatient(patient)} className="w-full py-2.5 bg-slate-50 border border-slate-200 hover:border-primary hover:text-primary text-slate-600 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 group-hover:bg-primary-light/5">
                   <FileText size={16} /> Open Dossier
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ========================================== */}
      {/* THE DOSSIER DRAWER (Slide from Right)      */}
      {/* ========================================== */}
      <AnimatePresence>
        {selectedPatient && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPatient(null)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" />
            <motion.div variants={slideIn} initial="hidden" animate="show" exit="exit" className="fixed top-0 right-0 w-full max-w-md h-full bg-surface border-l border-slate-200 shadow-2xl z-50 flex flex-col overflow-hidden">
              
              {/* Drawer Header */}
              <div className="px-8 py-6 bg-white border-b border-slate-100 flex justify-between items-start relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 ${getTierStyles(selectedPatient.membershipTier)}`}></div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">{selectedPatient.name}</h2>
                  <p className="text-sm font-bold text-slate-400 mt-1">{selectedPatient.mobile} • {selectedPatient.age || '--'} yrs • {selectedPatient.gender}</p>
                </div>
                <button onClick={() => setSelectedPatient(null)} className="p-2 text-slate-400 hover:text-status-danger hover:bg-red-50 rounded-xl transition-colors"><X size={24} /></button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50">
                
                {/* Clinical Block */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Activity size={14} className="text-primary"/> Clinical Profile</h3>
                  <div className="bento-card p-5 bg-white space-y-4 shadow-sm">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                      <span className="text-sm font-bold text-slate-500">Blood Group</span>
                      <span className="text-sm font-black text-rose-600 flex items-center gap-1"><Droplet size={14}/> {selectedPatient.bloodGroup}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase">Known Allergies</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedPatient.allergies?.length > 0 ? selectedPatient.allergies.map((a, i) => (
                          <span key={i} className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-bold">{a}</span>
                        )) : <span className="text-sm text-slate-400 font-medium">None recorded</span>}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase">Chronic Conditions</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedPatient.chronicConditions?.length > 0 ? selectedPatient.chronicConditions.map((c, i) => (
                          <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-xs font-bold">{c}</span>
                        )) : <span className="text-sm text-slate-400 font-medium">None recorded</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial/CRM Block */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Wallet size={14} className="text-emerald-500"/> Financial Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bento-card p-4 bg-white shadow-sm flex flex-col justify-center items-center text-center">
                      <span className="text-xs font-bold text-slate-400 uppercase mb-1">Lifetime Value</span>
                      <span className="text-xl font-black text-emerald-600">₹{selectedPatient.totalLifetimeSpent?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="bento-card p-4 bg-white shadow-sm flex flex-col justify-center items-center text-center">
                      <span className="text-xs font-bold text-slate-400 uppercase mb-1">Last Visit</span>
                      <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
                        <Calendar size={14} /> {new Date(selectedPatient.lastVisit).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                 {/* Notes Block */}
                 {selectedPatient.notes && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FileText size={14}/> Reception Notes</h3>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm font-medium text-yellow-800 italic">
                      "{selectedPatient.notes}"
                    </div>
                  </div>
                 )}
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Basic Create/Edit Form Modal (You can enhance this with Framer later) */}
      {isFormOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
               <h2 className="text-xl font-bold">{editingId ? 'Update Dossier' : 'Register Patient'}</h2>
               <button onClick={() => setIsFormOpen(false)}><X className="text-slate-400 hover:text-red-500"/></button>
             </div>
             <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-bold text-slate-500 uppercase">Full Name</label><input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full p-3 border rounded-xl mt-1 focus:ring-2 focus:ring-primary outline-none bg-slate-50" /></div>
                  <div><label className="text-xs font-bold text-slate-500 uppercase">Mobile</label><input required value={formData.mobile} onChange={e=>setFormData({...formData, mobile: e.target.value})} className="w-full p-3 border rounded-xl mt-1 focus:ring-2 focus:ring-primary outline-none bg-slate-50" /></div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="text-xs font-bold text-slate-500 uppercase">Age</label><input type="number" value={formData.age} onChange={e=>setFormData({...formData, age: e.target.value})} className="w-full p-3 border rounded-xl mt-1 bg-slate-50" /></div>
                  <div><label className="text-xs font-bold text-slate-500 uppercase">Gender</label><select value={formData.gender} onChange={e=>setFormData({...formData, gender: e.target.value})} className="w-full p-3 border rounded-xl mt-1 bg-slate-50"><option>Male</option><option>Female</option><option>Other</option></select></div>
                  <div><label className="text-xs font-bold text-slate-500 uppercase">Blood Group</label><select value={formData.bloodGroup} onChange={e=>setFormData({...formData, bloodGroup: e.target.value})} className="w-full p-3 border rounded-xl mt-1 bg-slate-50"><option>Unknown</option><option>A+</option><option>B+</option><option>O+</option><option>AB+</option><option>A-</option><option>B-</option><option>O-</option><option>AB-</option></select></div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                   <div><label className="text-xs font-bold text-slate-500 uppercase">Status</label><select value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})} className="w-full p-3 border rounded-xl mt-1 bg-slate-50"><option>Active</option><option>Discharged</option></select></div>
                   <div><label className="text-xs font-bold text-slate-500 uppercase">VIP Tier</label><select value={formData.membershipTier} onChange={e=>setFormData({...formData, membershipTier: e.target.value})} className="w-full p-3 border rounded-xl mt-1 bg-slate-50"><option>Standard</option><option>Silver</option><option>Gold</option><option>Platinum</option></select></div>
                </div>

                <div><label className="text-xs font-bold text-slate-500 uppercase">Allergies (Comma separated)</label><input placeholder="Peanuts, Penicillin" value={formData.allergies} onChange={e=>setFormData({...formData, allergies: e.target.value})} className="w-full p-3 border rounded-xl mt-1 bg-slate-50" /></div>
                <div><label className="text-xs font-bold text-slate-500 uppercase">Notes</label><textarea value={formData.notes} onChange={e=>setFormData({...formData, notes: e.target.value})} className="w-full p-3 border rounded-xl mt-1 bg-slate-50" rows="2" /></div>
                
                <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-colors">
                  {isSubmitting ? 'Processing...' : 'Save Dossier'}
                </button>
             </form>
           </div>
         </div>
      )}

    </div>
  );
}