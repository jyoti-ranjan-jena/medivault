// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import api from "../api/axios";
// import toast from "react-hot-toast";
// import {
//   Search,
//   User,
//   CreditCard,
//   Banknote,
//   Smartphone,
//   Receipt,
//   AlertCircle,
//   Pill,
//   ScanLine,
//   Plus,
//   Minus,
//   Trash2,
//   X,
// } from "lucide-react";

// const pageVariants = {
//   hidden: { opacity: 0 },
//   show: {
//     opacity: 1,
//     transition: { staggerChildren: 0.1, delayChildren: 0.1 },
//   },
// };

// const slideUp = {
//   hidden: { opacity: 0, y: 20 },
//   show: {
//     opacity: 1,
//     y: 0,
//     transition: { type: "spring", stiffness: 300, damping: 24 },
//   },
// };

// export default function Billing() {
//   // --- 1. STATE MANAGEMENT ---
//   const [dbPatients, setDbPatients] = useState([]);
//   const [dbMedicines, setDbMedicines] = useState([]);

//   const [selectedPatient, setSelectedPatient] = useState(null);
//   const [cart, setCart] = useState([]);
//   const [paymentMode, setPaymentMode] = useState("Cash");
//   const [discount, setDiscount] = useState(0);
//   const [isProcessing, setIsProcessing] = useState(false);

//   const [patientSearch, setPatientSearch] = useState("");
//   const [medicineSearch, setMedicineSearch] = useState("");

//   // --- 2. FETCH DATA ---
//   useEffect(() => {
//     const fetchSystemData = async () => {
//       try {
//         const [patientsRes, medicinesRes] = await Promise.all([
//           api.get("/patients"),
//           api.get("/medicines"),
//         ]);
//         setDbPatients(patientsRes.data.data);
//         setDbMedicines(medicinesRes.data.data);
//       } catch (error) {
//         toast.error("Failed to load POS data from server");
//       }
//     };
//     fetchSystemData();
//   }, []);

//   // --- 3. SEARCH FILTERS ---
//   const filteredPatients =
//     patientSearch.trim() === ""
//       ? []
//       : dbPatients.filter(
//           (p) =>
//             p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
//             p.mobile.includes(patientSearch),
//         );

//   const filteredMedicines =
//     medicineSearch.trim() === ""
//       ? []
//       : dbMedicines.filter((m) =>
//           m.name.toLowerCase().includes(medicineSearch.toLowerCase()),
//         );

//   // --- 4. CART ACTIONS ---
//   const handleSelectPatient = (patient) => {
//     setSelectedPatient(patient);
//     setPatientSearch(""); // Clear search to close dropdown
//   };

//   const handleAddMedicine = (med) => {
//     // 1. Ensure the medicine has batches and stock
//     if (med.totalStock < 1 || !med.batches || med.batches.length === 0) {
//       toast.error(`${med.name} is completely out of stock!`);
//       return;
//     }

//     // 2. Find the first batch that actually has items left in it
//     const validBatch = med.batches.find((b) => b.quantity > 0);

//     if (!validBatch) {
//       toast.error(`No valid stock batches found for ${med.name}`);
//       return;
//     }

//     const existingItem = cart.find((item) => item._id === med._id);

//     if (existingItem) {
//       if (existingItem.quantity >= validBatch.quantity) {
//         toast.error(`Maximum stock reached for this batch of ${med.name}`);
//         return;
//       }
//       setCart(
//         cart.map((item) =>
//           item._id === med._id
//             ? { ...item, quantity: item.quantity + 1 }
//             : item,
//         ),
//       );
//     } else {
//       // 3. ADD THE BATCH ID TO THE CART
//       setCart([
//         ...cart,
//         {
//           _id: med._id,
//           batchId: validBatch._id, // 🔴 THE MISSING PIECE!
//           name: med.name,
//           price: Number(validBatch.sellPrice) || Number(med.sellPrice) || 0,
//           quantity: 1,
//           maxStock: validBatch.quantity,
//         },
//       ]);
//     }
//     setMedicineSearch(""); // Clear search
//   };

//   const updateQuantity = (id, delta) => {
//     setCart(
//       cart.map((item) => {
//         if (item._id === id) {
//           const newQty = item.quantity + delta;
//           if (newQty > item.maxStock || newQty < 1) return item;
//           return { ...item, quantity: newQty };
//         }
//         return item;
//       }),
//     );
//   };

//   const removeItem = (id) => {
//     setCart(cart.filter((item) => item._id !== id));
//   };

//   // --- 5. CHECKOUT LOGIC ---
//   const subtotal = cart.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0,
//   );
//   const grandTotal = Math.max(0, subtotal - (discount || 0));

//   const handleProcessTransaction = async () => {
//     setIsProcessing(true);
//     try {
//       // Format payload to catch whatever the backend is expecting
//       // Format payload for your backend POST /api/bills route
//       const payload = {
//         patient: selectedPatient._id,
//         patientId: selectedPatient._id,

//         // 🔴 FIX: Send both the Medicine ID and the Batch ID
//         items: cart.map((item) => ({
//           medicine: item._id,
//           medicineId: item._id,
//           batch: item.batchId, // Send to backend
//           batchId: item.batchId, // Send to backend
//           quantity: item.quantity,
//         })),

//         // Also send under "medicines" array just in case your backend expects that word
//         discount: discount || 0,
//         totalAmount: grandTotal,
//         paymentMethod: paymentMode,
//       };

//       await api.post("/bills", payload);

//       toast.success("Transaction Completed Successfully!", {
//         icon: "✅",
//         style: { borderRadius: "10px", background: "#333", color: "#fff" },
//       });

//       // Reset POS Terminal
//       setCart([]);
//       setSelectedPatient(null);
//       setDiscount(0);
//       setPaymentMode("Cash");

//       // Optional: Re-fetch medicines to update live stock count
//       const res = await api.get("/medicines");
//       setDbMedicines(res.data.data);
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Transaction Failed");
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // --- 6. RENDER UI ---
//   return (
//     <motion.div
//       variants={pageVariants}
//       initial="hidden"
//       animate="show"
//       className="max-w-[1400px] mx-auto h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6"
//     >
//       {/* LEFT PANE: THE LEDGER */}
//       <div className="flex-1 flex flex-col gap-6 h-full">
//         <motion.div variants={slideUp}>
//           <h1 className="text-3xl font-extrabold text-text-main tracking-tight">
//             Point of Sale
//           </h1>
//           <p className="text-text-muted font-medium mt-1 flex items-center gap-2">
//             <ScanLine size={16} className="text-primary" /> Live terminal
//             active.
//           </p>
//         </motion.div>

//         {/* Search Modules */}
//         <motion.div
//           variants={slideUp}
//           className="grid grid-cols-1 md:grid-cols-2 gap-4"
//         >
//           {/* Patient Search */}
//           <div className="bento-card p-5 relative overflow-visible z-30 focus-within:shadow-[0_0_30px_rgba(37,99,235,0.15)] focus-within:border-primary/30">
//             <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
//               1. Select Patient
//             </label>
//             <div className="relative group">
//               <User
//                 className="absolute left-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform"
//                 size={20}
//               />
//               <input
//                 type="text"
//                 placeholder="Search name or mobile..."
//                 value={patientSearch}
//                 onChange={(e) => setPatientSearch(e.target.value)}
//                 className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all font-semibold text-text-main"
//               />
//               {selectedPatient && !patientSearch && (
//                 <button
//                   onClick={() => setSelectedPatient(null)}
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-status-danger transition-colors"
//                 >
//                   <X size={18} />
//                 </button>
//               )}
//             </div>

//             {/* Patient Dropdown */}
//             <AnimatePresence>
//               {filteredPatients.length > 0 && (
//                 <motion.ul
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: 10 }}
//                   className="absolute top-full left-0 w-full mt-2 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-xl shadow-2xl overflow-hidden max-h-60 z-50 divide-y divide-slate-100"
//                 >
//                   {filteredPatients.map((p) => (
//                     <li
//                       key={p._id}
//                       onClick={() => handleSelectPatient(p)}
//                       className="p-4 hover:bg-primary-light/30 cursor-pointer transition-colors flex justify-between items-center group"
//                     >
//                       <div>
//                         <p className="font-bold text-text-main group-hover:text-primary">
//                           {p.name}
//                         </p>
//                         <p className="text-xs font-medium text-slate-500">
//                           {p.mobile}
//                         </p>
//                       </div>
//                       <Plus
//                         size={18}
//                         className="text-primary opacity-0 group-hover:opacity-100 transition-opacity"
//                       />
//                     </li>
//                   ))}
//                 </motion.ul>
//               )}
//             </AnimatePresence>
//           </div>

//           {/* Medicine Search */}
//           <div className="bento-card p-5 relative overflow-visible z-20 focus-within:shadow-[0_0_30px_rgba(37,99,235,0.15)] focus-within:border-primary/30">
//             <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
//               2. Add Medicine
//             </label>
//             <div className="relative group">
//               <Pill
//                 className="absolute left-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform"
//                 size={20}
//               />
//               <input
//                 type="text"
//                 placeholder="Scan or type medicine..."
//                 value={medicineSearch}
//                 onChange={(e) => setMedicineSearch(e.target.value)}
//                 className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all font-semibold text-text-main"
//               />
//             </div>

//             {/* Medicine Dropdown */}
//             <AnimatePresence>
//               {filteredMedicines.length > 0 && (
//                 <motion.ul
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: 10 }}
//                   className="absolute top-full left-0 w-full mt-2 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-xl shadow-2xl overflow-hidden max-h-60 z-50 divide-y divide-slate-100"
//                 >
//                   {filteredMedicines.map((m) => (
//                     <li
//                       key={m._id}
//                       onClick={() => handleAddMedicine(m)}
//                       className="p-4 hover:bg-primary-light/30 cursor-pointer transition-colors flex justify-between items-center group"
//                     >
//                       <div>
//                         <p className="font-bold text-text-main group-hover:text-primary">
//                           {m.name}
//                         </p>
//                         <p className="text-xs font-medium text-slate-500">
//                           {m.category} • Stock: {m.totalStock}
//                         </p>
//                       </div>
//                       <Plus
//                         size={18}
//                         className="text-primary opacity-0 group-hover:opacity-100 transition-opacity"
//                       />
//                     </li>
//                   ))}
//                 </motion.ul>
//               )}
//             </AnimatePresence>
//           </div>
//         </motion.div>

//         {/* The Cart Table */}
//         <motion.div
//           variants={slideUp}
//           className="bento-card flex-1 p-0 overflow-hidden flex flex-col border-slate-200/60 shadow-sm relative z-0"
//         >
//           <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-pulse"></div>

//           <div className="bg-slate-50/80 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
//             <h2 className="font-bold text-slate-500 uppercase tracking-widest text-xs flex items-center gap-2">
//               <Receipt size={14} /> Current Invoice
//             </h2>
//             <span className="text-xs font-bold text-primary bg-primary-light/50 px-3 py-1 rounded-full">
//               {cart.length} Items
//             </span>
//           </div>

//           <div className="flex-1 overflow-y-auto p-4 bg-surface">
//             <AnimatePresence mode="popLayout">
//               {cart.length === 0 ? (
//                 <motion.div
//                   key="empty"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   exit={{ opacity: 0 }}
//                   className="h-full flex flex-col items-center justify-center opacity-70"
//                 >
//                   <motion.div
//                     animate={{ y: [0, -15, 0] }}
//                     transition={{
//                       repeat: Infinity,
//                       duration: 3,
//                       ease: "easeInOut",
//                     }}
//                     className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-100"
//                   >
//                     <Receipt size={40} className="text-slate-300" />
//                   </motion.div>
//                   <p className="text-2xl font-bold text-text-main tracking-tight">
//                     Cart is empty
//                   </p>
//                   <p className="text-sm font-medium text-text-muted mt-2">
//                     Search and add items to begin.
//                   </p>
//                 </motion.div>
//               ) : (
//                 cart.map((item) => (
//                   <motion.div
//                     layout
//                     key={item._id}
//                     initial={{ opacity: 0, scale: 0.95, y: 10 }}
//                     animate={{ opacity: 1, scale: 1, y: 0 }}
//                     exit={{ opacity: 0, scale: 0.9, x: -20 }}
//                     transition={{ type: "spring", stiffness: 400, damping: 25 }}
//                     className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl mb-3 shadow-sm hover:shadow-md transition-shadow group"
//                   >
//                     <div>
//                       <p className="font-extrabold text-text-main text-lg leading-tight">
//                         {item.name}
//                       </p>
//                       <p className="text-sm font-medium text-text-muted">
//                         ₹{item.price.toFixed(2)} / unit
//                       </p>
//                     </div>

//                     <div className="flex items-center gap-6">
//                       {/* Quantity Controls */}
//                       <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 p-0.5 shadow-inner">
//                         <button
//                           onClick={() => updateQuantity(item._id, -1)}
//                           className="p-1.5 text-slate-400 hover:text-primary transition-colors bg-white rounded-md shadow-sm active:scale-95"
//                         >
//                           <Minus size={14} />
//                         </button>
//                         <span className="w-10 text-center font-bold text-sm text-text-main tabular-nums">
//                           {item.quantity}
//                         </span>
//                         <button
//                           onClick={() => updateQuantity(item._id, 1)}
//                           className="p-1.5 text-slate-400 hover:text-primary transition-colors bg-white rounded-md shadow-sm active:scale-95"
//                         >
//                           <Plus size={14} />
//                         </button>
//                       </div>

//                       {/* Line Total */}
//                       <p className="font-extrabold text-text-main w-20 text-right tabular-nums text-lg">
//                         ₹{(item.price * item.quantity).toFixed(2)}
//                       </p>

//                       {/* Remove Button */}
//                       <button
//                         onClick={() => removeItem(item._id)}
//                         className="p-2 text-slate-300 hover:text-status-danger hover:bg-red-50 rounded-lg transition-colors active:scale-90"
//                       >
//                         <Trash2 size={18} />
//                       </button>
//                     </div>
//                   </motion.div>
//                 ))
//               )}
//             </AnimatePresence>
//           </div>
//         </motion.div>
//       </div>

//       {/* RIGHT PANE: CHECKOUT CONSOLE */}
//       <motion.div
//         variants={slideUp}
//         className="w-full lg:w-96 flex flex-col h-full gap-6"
//       >
//         {/* Patient Badge */}
//         <motion.div
//           layout
//           className={`bento-card p-6 border-2 transition-all duration-500 ${selectedPatient ? "border-status-success bg-emerald-50/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "border-dashed border-slate-300 bg-transparent"}`}
//         >
//           <AnimatePresence mode="wait">
//             {selectedPatient ? (
//               <motion.div
//                 key="selected"
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 className="flex items-center gap-4"
//               >
//                 <div className="relative">
//                   <div className="absolute inset-0 bg-status-success blur-md opacity-40 rounded-full"></div>
//                   <div className="relative w-12 h-12 rounded-full bg-status-success text-white flex items-center justify-center font-bold text-lg shadow-md border-2 border-white">
//                     {selectedPatient.name.charAt(0)}
//                   </div>
//                 </div>
//                 <div>
//                   <p className="font-extrabold text-text-main text-lg leading-tight">
//                     {selectedPatient.name}
//                   </p>
//                   <p className="text-sm font-medium text-status-success">
//                     Linked & Verified
//                   </p>
//                 </div>
//               </motion.div>
//             ) : (
//               <motion.div
//                 key="empty"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 className="flex items-center gap-3 text-slate-400"
//               >
//                 <AlertCircle size={24} className="animate-pulse opacity-50" />
//                 <p className="font-semibold tracking-wide">
//                   NO PATIENT SELECTED
//                 </p>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </motion.div>

//         {/* Checkout Mathematics */}
//         <div className="bento-card p-6 flex-1 flex flex-col justify-between border-slate-200/60 shadow-xl shadow-slate-200/40 relative overflow-hidden">
//           <div className="space-y-6 relative z-10">
//             <h3 className="font-bold text-text-main text-xl tracking-tight">
//               Payment Summary
//             </h3>

//             <div className="space-y-4">
//               <div className="flex justify-between items-center text-text-muted font-medium">
//                 <span>Subtotal</span>
//                 <span className="text-text-main font-bold tabular-nums text-lg">
//                   ₹{subtotal.toFixed(2)}
//                 </span>
//               </div>

//               <div className="flex justify-between items-center text-text-muted font-medium">
//                 <span className="flex items-center gap-2">Discount</span>
//                 <div className="relative w-28 group">
//                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-status-warning font-bold group-focus-within:scale-110 transition-transform">
//                     ₹
//                   </span>
//                   <input
//                     type="number"
//                     min="0"
//                     value={discount || ""}
//                     onChange={(e) => setDiscount(Number(e.target.value))}
//                     className="w-full pl-7 pr-3 py-2 bg-amber-50/50 border border-amber-200/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 outline-none text-right font-bold text-status-warning transition-all shadow-sm"
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-6"></div>

//             <div className="flex justify-between items-end">
//               <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">
//                 Total Due
//               </span>
//               <motion.span
//                 key={grandTotal}
//                 initial={{ scale: 1.1, color: "#1D4ED8" }}
//                 animate={{ scale: 1, color: "#2563EB" }}
//                 className="text-5xl font-extrabold text-primary tracking-tighter tabular-nums drop-shadow-sm"
//               >
//                 ₹{grandTotal.toFixed(2)}
//               </motion.span>
//             </div>

//             <div className="pt-2">
//               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
//                 Tender Type
//               </p>
//               <div className="grid grid-cols-3 gap-3">
//                 {[
//                   { id: "Cash", icon: Banknote },
//                   { id: "Card", icon: CreditCard },
//                   { id: "UPI", icon: Smartphone },
//                 ].map((method) => (
//                   <motion.button
//                     whileHover={{ scale: 1.03 }}
//                     whileTap={{ scale: 0.95 }}
//                     key={method.id}
//                     onClick={() => setPaymentMode(method.id)}
//                     className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border-2 transition-colors font-bold text-sm ${paymentMode === method.id ? "border-primary bg-primary shadow-[0_4px_15px_rgba(37,99,235,0.3)] text-white" : "border-slate-100 bg-surface text-slate-500 hover:border-slate-200 hover:bg-slate-50"}`}
//                   >
//                     <method.icon
//                       size={20}
//                       className={
//                         paymentMode === method.id
//                           ? "text-white"
//                           : "text-slate-400"
//                       }
//                     />
//                     {method.id}
//                   </motion.button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Action Button */}
//           <motion.button
//             onClick={handleProcessTransaction}
//             whileHover={
//               cart.length > 0 && selectedPatient && !isProcessing
//                 ? { scale: 1.02 }
//                 : {}
//             }
//             whileTap={
//               cart.length > 0 && selectedPatient && !isProcessing
//                 ? { scale: 0.98 }
//                 : {}
//             }
//             disabled={cart.length === 0 || !selectedPatient || isProcessing}
//             className="w-full py-4 mt-8 bg-primary text-white rounded-2xl font-bold text-lg shadow-[0_8px_25px_rgba(37,99,235,0.35)] transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group z-10"
//           >
//             <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite]"></div>

//             {isProcessing ? (
//               <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
//             ) : (
//               <>
//                 <Receipt size={24} className="relative z-10" />
//                 <span className="relative z-10">Process Transaction</span>
//               </>
//             )}
//           </motion.button>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }


import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
  User, CreditCard, Banknote, Smartphone, Receipt, 
  AlertCircle, Pill, ScanLine, Plus, Minus, Trash2, X, Printer, CheckCircle2
} from 'lucide-react';

const pageVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Billing() {
  const [dbPatients, setDbPatients] = useState([]);
  const [dbMedicines, setDbMedicines] = useState([]);
  
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [cart, setCart] = useState([]); 
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [patientSearch, setPatientSearch] = useState('');
  const [medicineSearch, setMedicineSearch] = useState('');

  // --- NEW: RECEIPT STATE ---
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        const [patientsRes, medicinesRes] = await Promise.all([
          api.get('/patients'),
          api.get('/medicines')
        ]);
        setDbPatients(patientsRes.data.data);
        setDbMedicines(medicinesRes.data.data);
      } catch (error) {
        toast.error("Failed to load POS data");
      }
    };
    fetchSystemData();
  }, []);

  const filteredPatients = patientSearch.trim() === '' ? [] : dbPatients.filter(p => 
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) || p.mobile.includes(patientSearch)
  );

  const filteredMedicines = medicineSearch.trim() === '' ? [] : dbMedicines.filter(m => 
    m.name.toLowerCase().includes(medicineSearch.toLowerCase()) && !m.isDeleted
  );

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setPatientSearch('');
  };

  const handleAddMedicine = (med) => {
    if (med.totalStock < 1 || !med.batches || med.batches.length === 0) {
      toast.error(`${med.name} is out of stock!`);
      return;
    }

    const validBatch = med.batches.find(b => b.quantity > 0);
    if (!validBatch) {
      toast.error(`No valid batches for ${med.name}`);
      return;
    }

    const existingItem = cart.find(item => item._id === med._id);
    if (existingItem) {
      if (existingItem.quantity >= validBatch.quantity) {
        toast.error(`Max stock reached for this batch`);
        return;
      }
      setCart(cart.map(item => item._id === med._id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { 
        _id: med._id, 
        batchId: validBatch._id, 
        name: med.name, 
        price: Number(validBatch.sellPrice) || Number(med.sellPrice) || 0, 
        quantity: 1, 
        maxStock: validBatch.quantity 
      }]);
    }
    setMedicineSearch('');
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item._id === id) {
        const newQty = item.quantity + delta;
        if (newQty > item.maxStock || newQty < 1) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id) => setCart(cart.filter(item => item._id !== id));

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const grandTotal = Math.max(0, subtotal - (discount || 0));

  const handleProcessTransaction = async () => {
    setIsProcessing(true);
    try {
      const payload = {
        patientId: selectedPatient._id,
        items: cart.map(item => ({
          medicine: item._id,
          batchId: item.batchId,
          quantity: item.quantity
        })),
        discount: discount || 0,
        paymentMode: paymentMode
      };

      const res = await api.post('/bills', payload);
      
      toast.success('Transaction Completed!', { icon: '✅' });

      // --- SNAPSHOT DATA FOR RECEIPT ---
      setReceiptData({
        invoiceId: res.data.data._id || Math.floor(Math.random() * 1000000),
        date: new Date().toLocaleString(),
        patient: selectedPatient,
        items: [...cart],
        subtotal,
        discount: discount || 0,
        grandTotal,
        paymentMode
      });

      // Reset POS Terminal
      setCart([]);
      setSelectedPatient(null);
      setDiscount(0);
      setPaymentMode('Cash');
      
      // Refresh inventory stock silently
      const invRes = await api.get('/medicines');
      setDbMedicines(invRes.data.data);

    } catch (error) {
      toast.error(error.response?.data?.message || 'Transaction Failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- PRINT HANDLER ---
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* ========================================== */}
      {/* MAIN POS UI (Hidden during printing)       */}
      {/* ========================================== */}
      <motion.div variants={pageVariants} initial="hidden" animate="show" className="max-w-[1400px] mx-auto h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6 print:hidden">
        
        {/* LEFT PANE: THE LEDGER */}
        <div className="flex-1 flex flex-col gap-6 h-full">
          <motion.div variants={slideUp}>
            <h1 className="text-3xl font-extrabold text-text-main tracking-tight">Point of Sale</h1>
            <p className="text-text-muted font-medium mt-1 flex items-center gap-2">
              <ScanLine size={16} className="text-primary" /> Live terminal active.
            </p>
          </motion.div>

          <motion.div variants={slideUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Patient Search */}
            <div className="bento-card p-5 relative overflow-visible z-30 focus-within:shadow-[0_0_30px_rgba(37,99,235,0.15)] focus-within:border-primary/30">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">1. Select Patient</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform" size={20} />
                <input type="text" placeholder="Search name or mobile..." value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all font-semibold text-text-main" />
                {selectedPatient && !patientSearch && (
                  <button onClick={() => setSelectedPatient(null)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-status-danger transition-colors"><X size={18} /></button>
                )}
              </div>
              <AnimatePresence>
                {filteredPatients.length > 0 && (
                  <motion.ul initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 w-full mt-2 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-xl shadow-2xl overflow-hidden max-h-60 z-50 divide-y divide-slate-100">
                    {filteredPatients.map(p => (
                      <li key={p._id} onClick={() => handleSelectPatient(p)} className="p-4 hover:bg-primary-light/30 cursor-pointer transition-colors flex justify-between items-center group">
                        <div><p className="font-bold text-text-main group-hover:text-primary">{p.name}</p><p className="text-xs font-medium text-slate-500">{p.mobile}</p></div>
                        <Plus size={18} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Medicine Search */}
            <div className="bento-card p-5 relative overflow-visible z-20 focus-within:shadow-[0_0_30px_rgba(37,99,235,0.15)] focus-within:border-primary/30">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">2. Add Medicine</label>
              <div className="relative group">
                <Pill className="absolute left-4 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform" size={20} />
                <input type="text" placeholder="Scan or type medicine..." value={medicineSearch} onChange={(e) => setMedicineSearch(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all font-semibold text-text-main" />
              </div>
              <AnimatePresence>
                {filteredMedicines.length > 0 && (
                  <motion.ul initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 w-full mt-2 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-xl shadow-2xl overflow-hidden max-h-60 z-50 divide-y divide-slate-100">
                    {filteredMedicines.map(m => (
                      <li key={m._id} onClick={() => handleAddMedicine(m)} className="p-4 hover:bg-primary-light/30 cursor-pointer transition-colors flex justify-between items-center group">
                        <div><p className="font-bold text-text-main group-hover:text-primary">{m.name}</p><p className="text-xs font-medium text-slate-500">Stock: {m.totalStock}</p></div>
                        <Plus size={18} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div variants={slideUp} className="bento-card flex-1 p-0 overflow-hidden flex flex-col border-slate-200/60 shadow-sm relative z-0">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-pulse"></div>
            <div className="bg-slate-50/80 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h2 className="font-bold text-slate-500 uppercase tracking-widest text-xs flex items-center gap-2"><Receipt size={14} /> Current Invoice</h2>
              <span className="text-xs font-bold text-primary bg-primary-light/50 px-3 py-1 rounded-full">{cart.length} Items</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-surface">
              <AnimatePresence mode="popLayout">
                {cart.length === 0 ? (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center opacity-70">
                    <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-100"><Receipt size={40} className="text-slate-300" /></motion.div>
                    <p className="text-2xl font-bold text-text-main tracking-tight">Cart is empty</p>
                    <p className="text-sm font-medium text-text-muted mt-2">Search and add items to begin.</p>
                  </motion.div>
                ) : (
                  cart.map(item => (
                    <motion.div layout key={item._id} initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, x: -20 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl mb-3 shadow-sm hover:shadow-md transition-shadow group">
                      <div><p className="font-extrabold text-text-main text-lg leading-tight">{item.name}</p><p className="text-sm font-medium text-text-muted">₹{item.price.toFixed(2)} / unit</p></div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 p-0.5 shadow-inner">
                          <button onClick={() => updateQuantity(item._id, -1)} className="p-1.5 text-slate-400 hover:text-primary transition-colors bg-white rounded-md shadow-sm active:scale-95"><Minus size={14} /></button>
                          <span className="w-10 text-center font-bold text-sm text-text-main tabular-nums">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, 1)} className="p-1.5 text-slate-400 hover:text-primary transition-colors bg-white rounded-md shadow-sm active:scale-95"><Plus size={14} /></button>
                        </div>
                        <p className="font-extrabold text-text-main w-20 text-right tabular-nums text-lg">₹{(item.price * item.quantity).toFixed(2)}</p>
                        <button onClick={() => removeItem(item._id)} className="p-2 text-slate-300 hover:text-status-danger hover:bg-red-50 rounded-lg transition-colors active:scale-90"><Trash2 size={18} /></button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* RIGHT PANE: CHECKOUT CONSOLE */}
        <motion.div variants={slideUp} className="w-full lg:w-96 flex flex-col h-full gap-6">
          <motion.div layout className={`bento-card p-6 border-2 transition-all duration-500 ${selectedPatient ? 'border-status-success bg-emerald-50/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-dashed border-slate-300 bg-transparent'}`}>
            <AnimatePresence mode="wait">
              {selectedPatient ? (
                <motion.div key="selected" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-status-success blur-md opacity-40 rounded-full"></div>
                    <div className="relative w-12 h-12 rounded-full bg-status-success text-white flex items-center justify-center font-bold text-lg shadow-md border-2 border-white">{selectedPatient.name.charAt(0)}</div>
                  </div>
                  <div><p className="font-extrabold text-text-main text-lg leading-tight">{selectedPatient.name}</p><p className="text-sm font-medium text-status-success">Linked & Verified</p></div>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-slate-400"><AlertCircle size={24} className="animate-pulse opacity-50" /><p className="font-semibold tracking-wide">NO PATIENT SELECTED</p></motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="bento-card p-6 flex-1 flex flex-col justify-between border-slate-200/60 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            <div className="space-y-6 relative z-10">
              <h3 className="font-bold text-text-main text-xl tracking-tight">Payment Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-text-muted font-medium"><span>Subtotal</span><span className="text-text-main font-bold tabular-nums text-lg">₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between items-center text-text-muted font-medium">
                  <span className="flex items-center gap-2">Discount</span>
                  <div className="relative w-28 group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-status-warning font-bold">₹</span>
                    <input type="number" min="0" value={discount || ''} onChange={(e) => setDiscount(Number(e.target.value))} className="w-full pl-7 pr-3 py-2 bg-amber-50/50 border border-amber-200/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 outline-none text-right font-bold text-status-warning transition-all shadow-sm" />
                  </div>
                </div>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-6"></div>
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Due</span>
                <motion.span key={grandTotal} initial={{ scale: 1.1, color: '#1D4ED8' }} animate={{ scale: 1, color: '#2563EB' }} className="text-5xl font-extrabold text-primary tracking-tighter tabular-nums drop-shadow-sm">₹{grandTotal.toFixed(2)}</motion.span>
              </div>
              <div className="pt-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Tender Type</p>
                <div className="grid grid-cols-3 gap-3">
                  {[{ id: 'Cash', icon: Banknote }, { id: 'Card', icon: CreditCard }, { id: 'UPI', icon: Smartphone }].map((method) => (
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }} key={method.id} onClick={() => setPaymentMode(method.id)} className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border-2 transition-colors font-bold text-sm ${paymentMode === method.id ? 'border-primary bg-primary shadow-[0_4px_15px_rgba(37,99,235,0.3)] text-white' : 'border-slate-100 bg-surface text-slate-500 hover:border-slate-200 hover:bg-slate-50'}`}>
                      <method.icon size={20} className={paymentMode === method.id ? 'text-white' : 'text-slate-400'} />{method.id}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            <motion.button onClick={handleProcessTransaction} disabled={cart.length === 0 || !selectedPatient || isProcessing} className="w-full py-4 mt-8 bg-primary text-white rounded-2xl font-bold text-lg shadow-[0_8px_25px_rgba(37,99,235,0.35)] transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group z-10">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
              {isProcessing ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <><Receipt size={24} className="relative z-10" /><span className="relative z-10">Process Transaction</span></>}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* ========================================== */}
      {/* RECEIPT MODAL & PRINT VIEW                 */}
      {/* ========================================== */}
      <AnimatePresence>
        {receiptData && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm print:bg-white print:backdrop-blur-none"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full relative print:shadow-none print:p-0"
            >
              {/* Receipt Content (Thermal Printer Style) */}
              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 bg-emerald-100 text-status-success rounded-full flex items-center justify-center mb-4 print:hidden">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tighter">MEDIVAULT</h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Official Receipt</p>
                <div className="text-xs text-slate-400 mt-2 font-mono">
                  <p>Date: {receiptData.date}</p>
                  <p>Invoice #: {String(receiptData.invoiceId).slice(-6).toUpperCase()}</p>
                </div>
              </div>

              <div className="border-t-2 border-dashed border-slate-200 py-4 mb-4">
                <p className="text-sm font-bold text-slate-700 mb-1">Patient: {receiptData.patient.name}</p>
                <p className="text-xs font-medium text-slate-500">Mode: {receiptData.paymentMode}</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                  <span>Item</span>
                  <span>Amount</span>
                </div>
                {receiptData.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm font-semibold text-slate-700">
                    <div>
                      <p>{item.name}</p>
                      <p className="text-xs text-slate-400">{item.quantity}x @ ₹{item.price.toFixed(2)}</p>
                    </div>
                    <p>₹{(item.quantity * item.price).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-dashed border-slate-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm font-bold text-slate-500">
                  <span>Subtotal</span>
                  <span>₹{receiptData.subtotal.toFixed(2)}</span>
                </div>
                {receiptData.discount > 0 && (
                  <div className="flex justify-between text-sm font-bold text-status-warning">
                    <span>Discount</span>
                    <span>-₹{receiptData.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-black text-slate-800 pt-2 border-t border-slate-100 mt-2">
                  <span>TOTAL</span>
                  <span>₹{receiptData.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-8 text-center text-xs font-bold text-slate-400 print:block">
                <p>Thank you for choosing Medivault.</p>
                <p>Get well soon!</p>
              </div>

              {/* Action Buttons (Hidden on Print) */}
              <div className="mt-8 flex gap-3 print:hidden">
                <button 
                  onClick={() => setReceiptData(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={handlePrint}
                  className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Printer size={18} /> Print Bill
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}