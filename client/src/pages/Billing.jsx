import { useState, useEffect } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import api from "../api/axios";
import toast from "react-hot-toast";
import {
  User, CreditCard, Banknote, Smartphone, Receipt, ScanLine, Plus, Minus, Trash2, X, Printer, CheckCircle2, UserCheck, Loader2
} from "lucide-react";
import Magnet from "../components/animations/Magnet";

// --- 1. DEBOUNCE HOOK ---
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
}

// --- 2. ANIMATED COUNTER ---
const AnimatedCounter = ({ value, prefix = "" }) => {
  const spring = useSpring(0, { stiffness: 150, damping: 25, restDelta: 0.01 });
  const display = useTransform(spring, (current) => `${prefix}${current.toFixed(2)}`);
  useEffect(() => { spring.set(value); }, [value, spring]);
  return <motion.span>{display}</motion.span>;
};

// --- CONSTANTS ---
const TIER_DISCOUNTS = { Standard: 0.05, Silver: 0.15, Gold: 0.25, Platinum: 0.40 };
const TIER_COLORS = {
  Standard: 'bg-blue-50 text-blue-700 border-blue-200',
  Silver: 'bg-slate-50 text-slate-700 border-slate-300',
  Gold: 'bg-yellow-50 text-yellow-700 border-yellow-300',
  Platinum: 'bg-slate-800 text-slate-100 border-slate-600'
};

// --- ANIMATION VARIANTS (The Secret Sauce) ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } } // The fast cascade
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Billing() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [cart, setCart] = useState([]);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [discount, setDiscount] = useState(0); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const [patientSearch, setPatientSearch] = useState("");
  const [patientResults, setPatientResults] = useState([]);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);
  const debouncedPatientSearch = useDebounce(patientSearch, 300);

  const [medicineSearch, setMedicineSearch] = useState("");
  const [medicineResults, setMedicineResults] = useState([]);
  const [isSearchingMedicines, setIsSearchingMedicines] = useState(false);
  const debouncedMedSearch = useDebounce(medicineSearch, 300);

  // --- SERVER FETCH ENGINES ---
  useEffect(() => {
    if (!debouncedPatientSearch) { setPatientResults([]); return; }
    const fetchP = async () => {
      setIsSearchingPatients(true);
      try {
        const res = await api.get("/patients", { params: { search: debouncedPatientSearch, limit: 5 } });
        setPatientResults(res.data.data);
      } catch (error) { toast.error("Patient search failed"); }
      finally { setIsSearchingPatients(false); }
    };
    fetchP();
  }, [debouncedPatientSearch]);

  useEffect(() => {
    if (!debouncedMedSearch) { setMedicineResults([]); return; }
    const fetchM = async () => {
      setIsSearchingMedicines(true);
      try {
        const res = await api.get("/medicines", { params: { search: debouncedMedSearch, limit: 8 } });
        setMedicineResults(res.data.data);
      } catch (error) { toast.error("Medicine search failed"); }
      finally { setIsSearchingMedicines(false); }
    };
    fetchM();
  }, [debouncedMedSearch]);

  // --- ACTIONS ---
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setPatientSearch("");
    setPatientResults([]);
  };

  const handleAddMedicine = (med) => {
    if (med.totalStock < 1 || !med.batches || med.batches.length === 0) {
      toast.error(`${med.name} is completely out of stock!`);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const validBatch = med.batches.find(b => b.quantity > 0 && new Date(b.expiryDate) >= today);

    if (!validBatch) {
      toast.error(`Stock for ${med.name} is EXPIRED!`, { icon: "🛑" });
      return;
    }

    const existingItem = cart.find((item) => item._id === med._id);
    if (existingItem) {
      if (existingItem.quantity >= validBatch.quantity) {
        toast.error(`Max stock reached for this batch`);
        return;
      }
      setCart(cart.map((item) => item._id === med._id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([{
        _id: med._id, batchId: validBatch._id, name: med.name,
        price: Number(validBatch.sellPrice) || Number(med.sellPrice) || 0,
        quantity: 1, maxStock: validBatch.quantity,
      }, ...cart]); // Adds new items to the TOP of the cart
    }
    setMedicineSearch("");
    setMedicineResults([]);
  };

  const handleMedicineKeyDown = (e) => {
    if (e.key === 'Enter' && medicineResults.length > 0) {
      handleAddMedicine(medicineResults[0]);
    }
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map((item) => {
      if (item._id === id) {
        const newQty = item.quantity + delta;
        if (newQty > item.maxStock || newQty < 1) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id) => setCart(cart.filter((item) => item._id !== id));

  // --- MATH ENGINE ---
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const currentTier = selectedPatient?.membershipTier || "Standard";
  const tierDiscountRate = selectedPatient ? TIER_DISCOUNTS[currentTier] : 0;
  const autoDiscountAmount = subtotal * tierDiscountRate;
  const manualDiscount = discount || 0;
  const totalDiscount = autoDiscountAmount + manualDiscount;
  const grandTotal = Math.max(0, subtotal - totalDiscount);

  // --- CHECKOUT ---
  const handleProcessTransaction = async () => {
    setIsProcessing(true);
    try {
      const payload = {
        patientId: selectedPatient?._id,
        items: cart.map((item) => ({ medicine: item._id, batchId: item.batchId, quantity: item.quantity })),
        discount: totalDiscount, paymentMode,
      };

      const res = await api.post("/bills", payload);
      toast.success("Transaction Completed!", { icon: "✅" });

      setReceiptData({
        invoiceId: res.data.data._id || Math.floor(Math.random() * 1000000),
        date: new Date().toLocaleString(),
        patient: selectedPatient || { name: "Guest Customer" },
        items: [...cart], subtotal, discount: totalDiscount, grandTotal, paymentMode,
      });

      setCart([]); setSelectedPatient(null); setDiscount(0); setPaymentMode("Cash");
    } catch (error) {
      toast.error(error.response?.data?.message || "Transaction Failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <motion.div 
        variants={containerVariants} initial="hidden" animate="show"
        className="max-w-[1500px] mx-auto h-auto lg:h-[calc(100vh-8rem)] min-h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6 print:hidden pb-10"
      >
        {/* ========================================================= */}
        {/* LEFT PANE: THE CART & TERMINAL                            */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col gap-6 h-full">
          
          <motion.div variants={itemVariants} className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">Terminal POS</h1>
              <p className="text-slate-500 font-semibold mt-1 flex items-center gap-2 text-sm">
                <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span></span> System Online
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 z-20">
            {/* Patient Search */}
            <motion.div variants={itemVariants} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">1. Select Patient</label>
              <div className="relative group">
                {isSearchingPatients ? <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-primary animate-spin" size={18} /> : <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />}
                <input
                  type="text" placeholder="Search phone or name..."
                  value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-semibold text-slate-800"
                />
                {selectedPatient && !patientSearch && (
                  <button onClick={() => setSelectedPatient(null)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"><X size={16} /></button>
                )}
              </div>
              
              <AnimatePresence>
                {patientResults.length > 0 && (
                  <motion.ul initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }} className="absolute top-[calc(100%+8px)] left-0 w-full bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-60 z-50 divide-y divide-slate-100">
                    {patientResults.map((p) => (
                      <li key={p._id} onClick={() => handleSelectPatient(p)} className="p-3 hover:bg-slate-50 cursor-pointer transition-colors flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${TIER_COLORS[p.membershipTier || 'Standard']}`}>{p.name.charAt(0)}</div>
                          <div><p className="font-bold text-slate-800 text-sm">{p.name}</p><p className="text-xs font-medium text-slate-500">{p.mobile}</p></div>
                        </div>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Medicine Search */}
            <motion.div variants={itemVariants} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">2. Scan Asset</label>
              <div className="relative group">
                {isSearchingMedicines ? <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-primary animate-spin" size={18} /> : <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />}
                <input
                  type="text" placeholder="Barcode scanner ready..."
                  value={medicineSearch} onChange={(e) => setMedicineSearch(e.target.value)} onKeyDown={handleMedicineKeyDown}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-semibold text-slate-800"
                />
              </div>

              <AnimatePresence>
                {medicineResults.length > 0 && (
                  <motion.ul initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }} className="absolute top-[calc(100%+8px)] left-0 w-full bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-60 z-50 divide-y divide-slate-100">
                    {medicineResults.map((m) => (
                      <li key={m._id} onClick={() => handleAddMedicine(m)} className="p-3 hover:bg-slate-50 cursor-pointer transition-colors flex justify-between items-center group">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{m.name}</p>
                          <p className="text-xs font-medium text-slate-500 mt-0.5">In Stock: {m.totalStock}</p>
                        </div>
                        <Plus size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* THE CART LEDGER */}
          <motion.div variants={itemVariants} className="bg-white flex-1 flex flex-col rounded-2xl border border-slate-200 shadow-sm relative z-0 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h2 className="font-bold text-slate-600 uppercase tracking-widest text-xs flex items-center gap-2"><Receipt size={16} /> Active Cart Ledger</h2>
              <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-md">{cart.length} Assets</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-white custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {cart.length === 0 ? (
                  <motion.div key="empty" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }} className="h-full flex flex-col items-center justify-center opacity-70">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-200"><ScanLine size={32} className="text-slate-400" /></div>
                    <p className="text-lg font-bold text-slate-700">Cart is empty</p>
                    <p className="text-sm font-medium text-slate-400 mt-1">Awaiting scanner input</p>
                  </motion.div>
                ) : (
                  cart.map((item) => (
                    <motion.div layout key={item._id} initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, x: -20 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl mb-3 shadow-sm hover:border-slate-300 transition-colors">
                      <div>
                        <p className="font-bold text-slate-800 text-base">{item.name}</p>
                        <p className="text-xs font-medium text-slate-500 mt-1">₹{item.price.toFixed(2)} / unit</p>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 p-1">
                          <Magnet padding={20} magnetStrength={2}>
                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateQuantity(item._id, -1)} className="p-1.5 text-slate-500 hover:text-primary hover:bg-white rounded-md transition-colors shadow-sm outline-none"><Minus size={14} strokeWidth={2.5} /></motion.button>
                          </Magnet>
                          <span className="w-10 text-center font-bold text-sm text-slate-800 tabular-nums">{item.quantity}</span>
                          <Magnet padding={20} magnetStrength={2}>
                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateQuantity(item._id, 1)} className="p-1.5 text-slate-500 hover:text-primary hover:bg-white rounded-md transition-colors shadow-sm outline-none"><Plus size={14} strokeWidth={2.5} /></motion.button>
                          </Magnet>
                        </div>
                        
                        <p className="font-bold text-slate-800 w-24 text-right tabular-nums text-lg">₹{(item.price * item.quantity).toFixed(2)}</p>
                        
                        <Magnet padding={20} magnetStrength={2}>
                          <motion.button whileTap={{ scale: 0.9 }} onClick={() => removeItem(item._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors outline-none"><Trash2 size={18} /></motion.button>
                        </Magnet>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT PANE: THE CHECKOUT CONSOLE                          */}
        {/* ========================================================= */}
        <motion.div variants={itemVariants} className="w-full lg:w-[400px] flex flex-col h-full gap-6 relative">
          
          <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            
            {/* Selected Patient */}
            <div className={`p-5 border-b transition-colors duration-300 shrink-0 ${selectedPatient ? "border-primary/20 bg-primary/5" : "border-slate-100 bg-slate-50/50"}`}>
              <AnimatePresence mode="wait">
                {selectedPatient ? (
                  <motion.div key="selected" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border ${TIER_COLORS[currentTier]}`}>{selectedPatient.name.charAt(0)}</div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{selectedPatient.name}</p>
                        <p className="text-xs font-semibold text-primary mt-0.5 flex items-center gap-1"><UserCheck size={12}/> Verified Member</p>
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${TIER_COLORS[currentTier]}`}>{currentTier}</div>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3 text-slate-500 h-10">
                    <User size={18} className="opacity-70" />
                    <p className="text-xs font-bold uppercase tracking-widest">Walk-In Customer</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Financial Ledger */}
            <div className="p-6 flex-1 overflow-y-auto space-y-5">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-slate-600 font-medium text-sm">
                  <span>Subtotal</span>
                  <span className="text-slate-800 font-bold tabular-nums">₹{subtotal.toFixed(2)}</span>
                </div>

                <AnimatePresence>
                  {selectedPatient && tierDiscountRate > 0 && subtotal > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex justify-between items-center text-emerald-600 font-bold bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 overflow-hidden text-sm">
                      <span className="flex items-center gap-2 text-xs">{currentTier} Disc ({tierDiscountRate * 100}%)</span>
                      <span className="tabular-nums">- ₹{autoDiscountAmount.toFixed(2)}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-600">Manual Adjust</span>
                  <div className="relative w-28 group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">₹</span>
                    <input type="number" min="0" value={discount || ""} onChange={(e) => setDiscount(Number(e.target.value))} placeholder="0.00" className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-right font-bold text-slate-800 transition-all text-sm tabular-nums" />
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Due</span>
                  <motion.div className="text-4xl font-black text-slate-900 tabular-nums">
                    <AnimatedCounter value={grandTotal} prefix="₹" />
                  </motion.div>
                </div>
                
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Tender Type</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[ { id: "Cash", icon: Banknote }, { id: "Card", icon: CreditCard }, { id: "UPI", icon: Smartphone } ].map((method) => (
                      <motion.button whileTap={{ scale: 0.95 }} key={method.id} onClick={() => setPaymentMode(method.id)} className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-colors font-bold text-xs ${paymentMode === method.id ? "border-primary bg-primary text-white shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"}`}>
                        <method.icon size={20} className={paymentMode === method.id ? "text-white" : "text-slate-400"} />
                        {method.id}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* The Checkout Button */}
            <div className="p-5 bg-slate-50 border-t border-slate-200 shrink-0">
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleProcessTransaction} disabled={cart.length === 0 || isProcessing} className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm">
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <><Receipt size={20} /><span>Process Payment</span></>}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ========================================================= */}
      {/* THERMAL RECEIPT MODAL                                     */}
      {/* ========================================================= */}
      <AnimatePresence>
        {receiptData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm print:bg-white print:backdrop-blur-none p-4">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full relative print:shadow-none print:p-0 max-h-[90vh] flex flex-col border border-slate-200">
              
              <div className="text-center mb-6 shrink-0">
                <div className="mx-auto w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3 print:hidden"><CheckCircle2 size={24} /></div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">MEDIVAULT</h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Official Receipt</p>
                <div className="text-xs text-slate-500 mt-2 font-mono bg-slate-50 p-2 rounded-md inline-block">
                  <p>Date: {receiptData.date}</p>
                  <p>INV #: {String(receiptData.invoiceId).slice(-8).toUpperCase()}</p>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-300 py-3 mb-3 shrink-0 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Billed To</p>
                  <p className="text-sm font-bold text-slate-800">{receiptData.patient.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Tender</p>
                  <p className="text-sm font-bold text-slate-800">{receiptData.paymentMode}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar print:overflow-visible print:max-h-none">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2 sticky top-0 bg-white pt-1">
                  <span>Item</span>
                  <span>Total</span>
                </div>
                {receiptData.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm font-medium text-slate-700 items-start">
                    <div>
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-[10px] text-slate-500">{item.quantity}x @ ₹{item.price.toFixed(2)}</p>
                    </div>
                    <p className="tabular-nums font-bold">₹{(item.quantity * item.price).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-slate-300 pt-4 space-y-2 shrink-0">
                <div className="flex justify-between text-sm font-medium text-slate-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums">₹{receiptData.subtotal.toFixed(2)}</span>
                </div>
                {receiptData.discount > 0 && (
                  <div className="flex justify-between text-sm font-medium text-emerald-600">
                    <span>Discount</span>
                    <span className="tabular-nums">-₹{receiptData.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-black text-slate-900 pt-3 border-t border-slate-200 mt-2">
                  <span>TOTAL</span>
                  <span className="tabular-nums">₹{receiptData.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0 print:block">
                <p>Thank you for choosing Medivault.</p>
              </div>

              <div className="mt-6 flex gap-3 shrink-0 print:hidden">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setReceiptData(null)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors">Close</motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => window.print()} className="w-full py-3 px-6 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                  <Printer size={18} /> Print Bill
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}