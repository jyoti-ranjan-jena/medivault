import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import toast from "react-hot-toast";
import {
  Search,
  Receipt,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  Eye,
  Printer,
  X,
  History,
  Database,
  Loader2,
  Download,
} from "lucide-react";

// Shadcn UI & Custom Animations
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Magnet from "../components/animations/Magnet";

// --- 1. THE DEBOUNCE HOOK ---
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function TransactionHistory() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // Pagination State
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalRecords: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Modal State
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Export State
  const [isExporting, setIsExporting] = useState(false); // 🔴 NEW

  // --- 2. THE SERVER-SIDE ENGINE ---
  const fetchBills = async (currentPage, searchQuery) => {
    setIsFetching(true);
    try {
      const res = await api.get("/bills", {
        params: { page: currentPage, limit: 10, search: searchQuery },
      });
      setBills(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error("Failed to load transaction ledger");
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchBills(page, debouncedSearchTerm);
  }, [page, debouncedSearchTerm]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  // --- 3. THE CSV EXPORT ENGINE ---
  const handleExportCSV = async () => {
    setIsExporting(true);
    const toastId = toast.loading("Generating Excel file...");
    try {
      const res = await api.get("/bills/export", {
        params: { search: debouncedSearchTerm },
      });

      const data = res.data.data;
      if (data.length === 0) {
        toast.error("No records found to export.", { id: toastId });
        return;
      }

      // Convert JSON array to CSV string
      const headers = Object.keys(data[0]).join(",");
      const rows = data.map((obj) =>
        Object.values(obj)
          .map((val) => `"${val}"`)
          .join(","),
      );
      const csvString = [headers, ...rows].join("\n");

      // Create a blob and trigger browser download
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Medivault_Ledger_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Ledger exported successfully!", {
        id: toastId,
        icon: "📊",
      });
    } catch (error) {
      toast.error("Failed to generate export", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  // --- HELPERS ---
  const getPaymentIcon = (mode) => {
    if (mode === "Cash")
      return <Banknote size={14} className="text-emerald-600" />;
    if (mode === "UPI")
      return <Smartphone size={14} className="text-blue-600" />;
    return <CreditCard size={14} className="text-purple-600" />;
  };

  const getPaymentBadge = (mode) => {
    if (mode === "Cash")
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (mode === "UPI") return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-purple-50 text-purple-700 border-purple-200";
  };

  if (loading)
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto space-y-8 relative print:hidden pb-10"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <Database className="text-primary" size={28} />
              Transaction Ledger
            </h1>
            <p className="text-slate-500 font-medium mt-1 flex items-center gap-2 text-sm">
              <History size={16} className="text-slate-400" />
              Tracking {pagination.totalRecords} total financial records.
            </p>
          </div>
        </motion.div>

        {/* Controls - Debounced Search & Export */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center z-20 relative"
        >
          <div className="relative w-full max-w-md group">
            {isFetching && debouncedSearchTerm !== searchTerm ? (
              <Loader2
                className="absolute left-4 top-1/2 -translate-y-1/2 text-primary animate-spin"
                size={18}
              />
            ) : (
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                size={18}
              />
            )}

            <input
              type="text"
              placeholder="Search by Patient Name or Invoice ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              // 🔴 FIXED: Increased pr-12 to make room for the 'X' button so text doesn't overlap it
              className="w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-semibold text-slate-800 shadow-sm"
            />

            {/* 🔴 NEW: ANIMATED CLEAR BUTTON */}
            {/* 🔴 UPGRADED: HYPER-LIVELY GLOWING CLEAR BUTTON */}
            <AnimatePresence>
              {searchTerm.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.2, rotate: -90 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.2, rotate: 90 }}
                  whileHover={{ scale: 1.15, rotate: 90 }}
                  whileTap={{ scale: 0.8, rotate: -45 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 bg-slate-100 hover:bg-red-500 hover:text-white rounded-full transition-colors outline-none hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-transparent hover:border-red-400"
                  title="Clear search"
                >
                  <X size={14} strokeWidth={3} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <Magnet padding={20} magnetStrength={3} disabled={isExporting}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleExportCSV}
              disabled={isExporting || bills.length === 0}
              className="w-full sm:w-auto px-6 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_8px_20px_rgba(37,99,235,0.25)] active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Download size={18} />
              )}
              <span>Export CSV</span>
            </motion.button>
          </Magnet>
        </motion.div>

        {/* The Data Grid */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm relative flex flex-col z-0 overflow-hidden"
        >
          {/* Subtle loading overlay during pagination */}
          {isFetching && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-20 transition-all duration-300"></div>
          )}

          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Invoice ID
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Total
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Tender
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                <AnimatePresence mode="popLayout">
                  {bills.length > 0 ? (
                    bills.map((bill, index) => (
                      <motion.tr
                        key={bill._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.2 }}
                        className="group hover:bg-slate-50/80 transition-colors duration-200"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md group-hover:border-primary/30 group-hover:text-primary transition-colors">
                            {bill._id.slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                            <Calendar size={14} className="text-slate-400" />
                            {new Date(bill.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                            <span className="text-slate-400 text-xs ml-1">
                              {new Date(bill.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800 text-sm group-hover:text-primary transition-colors">
                            {bill.patient?.name || "Walk-In Customer"}
                          </p>
                          <p className="text-xs font-medium text-slate-400 mt-0.5">
                            {bill.patient?.mobile || "N/A"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-bold text-slate-800 tabular-nums">
                              ₹
                              {Number(
                                bill.grandTotal || bill.totalAmount || 0,
                              ).toFixed(2)}
                            </span>
                            {bill.discount > 0 && (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] font-medium text-slate-400 line-through tabular-nums">
                                  ₹{Number(bill.totalAmount || 0).toFixed(2)}
                                </span>
                                <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                  -₹{Number(bill.discount).toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`flex items-center gap-1.5 w-max px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border shadow-sm ${getPaymentBadge(bill.paymentMode)}`}
                          >
                            {getPaymentIcon(bill.paymentMode)}{" "}
                            {bill.paymentMode}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Magnet padding={20} magnetStrength={2}>
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedReceipt(bill)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:border-primary hover:text-primary hover:shadow-[0_4px_10px_rgba(37,99,235,0.1)] transition-all outline-none"
                            >
                              <Eye size={16} /> View
                            </motion.button>
                          </Magnet>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan="6" className="px-6 py-20 text-center">
                        <div className="max-w-xs mx-auto flex flex-col items-center justify-center opacity-70">
                          <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{
                              repeat: Infinity,
                              duration: 3,
                              ease: "easeInOut",
                            }}
                            className="mb-4 text-slate-300"
                          >
                            <Receipt size={48} />
                          </motion.div>
                          <p className="text-xl font-bold text-slate-800 mb-1">
                            No records found
                          </p>
                          <p className="text-sm font-medium text-slate-400 text-center">
                            Adjust your search parameters.
                          </p>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* --- SHADCN PAGINATION FOOTER --- */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 z-10">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Page {page} of {pagination.totalPages}
              </p>
              <Pagination className="justify-end w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        pagination.hasPrevPage && setPage((p) => p - 1)
                      }
                      className={`rounded-xl font-bold text-xs px-4 py-2 transition-all ${!pagination.hasPrevPage ? "opacity-50 cursor-not-allowed hover:bg-transparent" : "cursor-pointer hover:bg-white shadow-sm border border-slate-200 bg-white"}`}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        pagination.hasNextPage && setPage((p) => p + 1)
                      }
                      className={`rounded-xl font-bold text-xs px-4 py-2 transition-all ${!pagination.hasNextPage ? "opacity-50 cursor-not-allowed hover:bg-transparent" : "cursor-pointer hover:bg-white shadow-sm border border-slate-200 bg-white"}`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* ========================================== */}
      {/* DUPLICATE RECEIPT MODAL (THE FLOATING FIX) */}
      {/* ========================================== */}
      <AnimatePresence>
        {selectedReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm print:bg-white print:backdrop-blur-none p-4"
            onClick={() =>
              setSelectedReceipt(null)
            } /* 🔴 NEW: Click background to close */
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              // FIX: Slightly tighter padding (p-6), strict flex-col, and max-h-[90vh]
              className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl max-w-sm w-full relative print:shadow-none print:p-0 max-h-[90vh] flex flex-col"
              onClick={(e) =>
                e.stopPropagation()
              } /* 🔴 NEW: Prevent clicks inside the white box from closing it */
            >
              {/* Receipt Header */}
              <div className="text-center mb-4 shrink-0">
                <div className="mx-auto w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-3 print:hidden border border-slate-100">
                  <Receipt size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">
                  MEDIVAULT
                </h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                  Duplicate Copy
                </p>
                <div className="text-[10px] text-slate-400 mt-2 font-mono font-bold">
                  <p>
                    Date: {new Date(selectedReceipt.createdAt).toLocaleString()}
                  </p>
                  <p>INV #: {selectedReceipt._id.slice(-8).toUpperCase()}</p>
                </div>
              </div>

              {/* Billed To / Tender */}
              <div className="border-t-2 border-dashed border-slate-200 py-3 mb-3 shrink-0 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
                    Billed To
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {selectedReceipt.patient?.name || "Walk-in Patient"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
                    Tender
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {selectedReceipt.paymentMode}
                  </p>
                </div>
              </div>

              {/* THE SHOCK ABSORBER: flex-1 allows it to take up middle space, min-h ensures it doesn't vanish */}
              <div className="flex-1 min-h-[80px] overflow-y-auto pr-2 custom-scrollbar print:overflow-visible print:max-h-none mb-4">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 sticky top-0 bg-white z-10 pt-1">
                  <span>Item</span>
                  <span>Amount</span>
                </div>
                <div className="pt-2 space-y-3">
                  {selectedReceipt.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-sm font-medium text-slate-700 items-start"
                    >
                      <div>
                        <p className="font-bold text-slate-800">
                          {item.medicine?.name || item.name || "Unknown Item"}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {item.quantity}x @ ₹{item.price?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                      <p className="tabular-nums font-bold">
                        ₹{((item.quantity || 0) * (item.price || 0)).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t-2 border-dashed border-slate-200 pt-4 space-y-2 shrink-0">
                <div className="flex justify-between text-sm font-bold text-slate-500">
                  <span>Subtotal</span>
                  <span className="tabular-nums">
                    ₹{Number(selectedReceipt.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
                {selectedReceipt.discount > 0 && (
                  <div className="flex justify-between text-sm font-bold text-status-warning">
                    <span>Discount</span>
                    <span className="tabular-nums">
                      -₹{Number(selectedReceipt.discount).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-black text-slate-900 pt-2 border-t border-slate-200 mt-2">
                  <span>TOTAL</span>
                  <span className="tabular-nums">
                    ₹
                    {Number(
                      selectedReceipt.grandTotal ||
                        selectedReceipt.totalAmount ||
                        0,
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0 print:block">
                <p>Thank you for choosing Medivault.</p>
                <p className="mt-1">
                  Re-Issued {new Date().toLocaleDateString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex gap-3 shrink-0 print:hidden">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedReceipt(null)}
                  className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold transition-colors"
                >
                  Close
                </motion.button>
                <Magnet padding={20} magnetStrength={3}>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.print()}
                    className="w-full py-3 px-6 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Printer size={18} /> Print Copy
                  </motion.button>
                </Magnet>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
