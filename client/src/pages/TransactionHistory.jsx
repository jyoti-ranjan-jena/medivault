import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
  Search, Receipt, Calendar, CreditCard, Banknote, 
  Smartphone, Eye, Printer, X, CheckCircle2, History, Database
} from 'lucide-react';

const pageVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function TransactionHistory() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await api.get('/bills');
        setBills(res.data.data);
      } catch (error) {
        toast.error("Failed to load transaction history");
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, []);

  // Filter by Patient Name or Invoice ID
  const filteredBills = bills.filter(bill => {
    const searchLower = searchTerm.toLowerCase();
    const patientName = bill.patient?.name?.toLowerCase() || '';
    const billId = bill._id.toLowerCase();
    return patientName.includes(searchLower) || billId.includes(searchLower);
  });

  const getPaymentIcon = (mode) => {
    if (mode === 'Cash') return <Banknote size={14} className="text-emerald-600" />;
    if (mode === 'UPI') return <Smartphone size={14} className="text-blue-600" />;
    return <CreditCard size={14} className="text-purple-600" />;
  };

  const getPaymentBadge = (mode) => {
    if (mode === 'Cash') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (mode === 'UPI') return 'bg-blue-50 text-blue-700 border-blue-100';
    return 'bg-purple-50 text-purple-700 border-purple-100';
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="h-full flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <>
      {/* ========================================== */}
      {/* MAIN DASHBOARD UI (Hidden during printing) */}
      {/* ========================================== */}
      <div className="max-w-7xl mx-auto space-y-8 relative print:hidden">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-text-main tracking-tight flex items-center gap-3">
              <Database className="text-primary" size={28} />
              Transaction Ledger
            </h1>
            <p className="text-text-muted font-medium mt-1 flex items-center gap-2">
              <History size={16} className="text-primary/70" />
              Encrypted archive of all financial records and printed invoices.
            </p>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="relative w-full max-w-md group transition-all duration-300 focus-within:shadow-[0_0_30px_rgba(37,99,235,0.15)] focus-within:-translate-y-0.5 rounded-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by Patient Name or Invoice ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-surface border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-semibold text-text-main shadow-sm"
            />
          </div>
        </motion.div>

        {/* The Data Grid */}
        <motion.div variants={pageVariants} initial="hidden" animate="show" className="bento-card p-0 border-slate-200/60 shadow-xl shadow-slate-200/40 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-pulse z-20"></div>
          
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Invoice ID</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Patient</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Total</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Tender</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                <AnimatePresence mode="popLayout">
                  {filteredBills.length > 0 ? (
                    filteredBills.map((bill, index) => (
                      <motion.tr 
                        key={bill._id} 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                        className="group hover:bg-slate-50/80 transition-colors duration-300"
                      >
                        <td className="px-6 py-5">
                          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md group-hover:text-primary group-hover:bg-primary-light/10 transition-colors">
                            {bill._id.slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                            <Calendar size={14} className="text-slate-400" />
                            {new Date(bill.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            <span className="text-slate-400 text-xs ml-1">{new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="font-extrabold text-text-main text-base">{bill.patient?.name || 'Unknown Patient'}</p>
                          <p className="text-xs font-medium text-slate-400">{bill.patient?.mobile || 'No Phone'}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-base font-black text-text-main tabular-nums tracking-tight">₹{Number(bill.grandTotal || bill.totalAmount || 0).toFixed(2)}</p>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`flex items-center gap-1.5 w-max px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${getPaymentBadge(bill.paymentMode)}`}>
                            {getPaymentIcon(bill.paymentMode)} {bill.paymentMode}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button 
                            onClick={() => setSelectedReceipt(bill)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-lg hover:border-primary hover:text-primary hover:shadow-[0_0_15px_rgba(37,99,235,0.15)] transition-all active:scale-95"
                          >
                            <Eye size={16} /> View
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <td colSpan="6" className="px-6 py-24 text-center">
                        <div className="max-w-xs mx-auto flex flex-col items-center justify-center opacity-80">
                          <Search size={48} className="text-slate-300 mb-4" />
                          <p className="text-xl font-bold text-text-main mb-1">No records found</p>
                          <p className="text-sm font-medium text-text-muted text-center">We couldn't find any transactions matching your query.</p>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* ========================================== */}
      {/* DUPLICATE RECEIPT MODAL & PRINT VIEW       */}
      {/* ========================================== */}
      <AnimatePresence>
        {selectedReceipt && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md print:bg-white print:backdrop-blur-none"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.3)] max-w-sm w-full relative print:shadow-none print:p-0"
            >
              {/* Receipt Content (Thermal Printer Style) */}
              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mb-4 print:hidden">
                  <Receipt size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tighter">MEDIVAULT</h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Duplicate Receipt</p>
                <div className="text-xs text-slate-400 mt-2 font-mono">
                  <p>Date: {new Date(selectedReceipt.createdAt).toLocaleString()}</p>
                  <p>Invoice #: {selectedReceipt._id.slice(-8).toUpperCase()}</p>
                </div>
              </div>

              <div className="border-t-2 border-dashed border-slate-200 py-4 mb-4">
                <p className="text-sm font-bold text-slate-700 mb-1">Patient: {selectedReceipt.patient?.name || 'Walk-in Patient'}</p>
                <p className="text-xs font-medium text-slate-500">Mode: {selectedReceipt.paymentMode}</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                  <span>Item</span>
                  <span>Amount</span>
                </div>
                {selectedReceipt.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm font-semibold text-slate-700">
                    <div>
                      <p>{item.medicine?.name || item.name || 'Unknown Item'}</p>
                      <p className="text-xs text-slate-400">{item.quantity}x @ ₹{item.price?.toFixed(2) || '0.00'}</p>
                    </div>
                    <p>₹{((item.quantity || 0) * (item.price || 0)).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-dashed border-slate-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm font-bold text-slate-500">
                  <span>Subtotal</span>
                  <span>₹{Number(selectedReceipt.totalAmount || 0).toFixed(2)}</span>
                </div>
                {selectedReceipt.discount > 0 && (
                  <div className="flex justify-between text-sm font-bold text-status-warning">
                    <span>Discount</span>
                    <span>-₹{Number(selectedReceipt.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-black text-slate-800 pt-2 border-t border-slate-100 mt-2">
                  <span>TOTAL</span>
                  <span>₹{Number(selectedReceipt.grandTotal || selectedReceipt.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-8 text-center text-xs font-bold text-slate-400 print:block">
                <p>Thank you for choosing Medivault.</p>
                <p>Duplicate Copy - Issued {new Date().toLocaleDateString()}</p>
              </div>

              {/* Action Buttons (Hidden on Print) */}
              <div className="mt-8 flex gap-3 print:hidden">
                <button 
                  onClick={() => setSelectedReceipt(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={handlePrint}
                  className="flex-1 py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Printer size={18} /> Print Copy
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}