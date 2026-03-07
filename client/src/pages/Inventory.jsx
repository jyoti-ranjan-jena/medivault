import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import toast from "react-hot-toast";
import {
  Search,
  Plus,
  MoreVertical,
  Package,
  X,
  Save,
  Edit3,
  Trash2,
} from "lucide-react";

// Shadcn UI Imports
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Magnet from "../components/animations/Magnet";

// --- 1. THE DEBOUNCE HOOK (The Server Saver) ---
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

export default function Inventory() {
  // Data & Pagination State
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false); // Subtle loading state for pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalRecords: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // Waits 300ms after typing stops

  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    genericName: "",
    manufacturer: "",
    category: "Tablet",
    batchNumber: "",
    quantity: "",
    expiryDate: "",
    buyPrice: "",
    sellPrice: "",
  });

  // --- 2. THE SERVER-SIDE FETCH ENGINE ---
  const fetchMedicines = async (currentPage, searchQuery) => {
    setIsFetching(true);
    try {
      // We pass the exact page and search query to our optimized backend
      const res = await api.get("/medicines", {
        params: { page: currentPage, limit: 10, search: searchQuery },
      });
      setMedicines(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error("Failed to fetch inventory");
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  // Triggers when Page changes OR when the user finishes typing (Debounced)
  useEffect(() => {
    fetchMedicines(page, debouncedSearchTerm);
  }, [page, debouncedSearchTerm]);

  // Reset to page 1 if they start a new search
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  // --- DRAWER CONTROLS ---
  const openNewDrawer = () => {
    setEditingId(null);
    setFormData({
      name: "",
      genericName: "",
      manufacturer: "",
      category: "Tablet",
      batchNumber: "",
      quantity: "",
      expiryDate: "",
      buyPrice: "",
      sellPrice: "",
    });
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (med) => {
    setEditingId(med._id);
    const primaryBatch =
      med.batches && med.batches.length > 0 ? med.batches[0] : {};
    setFormData({
      name: med.name,
      genericName: med.genericName || "",
      manufacturer: med.manufacturer || "",
      category: med.category || "Tablet",
      batchNumber: primaryBatch.batchNumber || "",
      quantity: primaryBatch.quantity || "",
      expiryDate: primaryBatch.expiryDate
        ? primaryBatch.expiryDate.split("T")[0]
        : "",
      buyPrice: primaryBatch.buyPrice || "",
      sellPrice: primaryBatch.sellPrice || "",
    });
    setIsDrawerOpen(true);
  };

  // --- SUBMIT HANDLER ---
  const handleSaveMedicine = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        genericName: formData.genericName,
        manufacturer: formData.manufacturer,
        category: formData.category,
        batches: [
          {
            batchNumber: formData.batchNumber,
            quantity: Number(formData.quantity),
            expiryDate: formData.expiryDate,
            buyPrice: Number(formData.buyPrice),
            sellPrice: Number(formData.sellPrice),
          },
        ],
      };

      if (editingId) {
        await api.put(`/medicines/${editingId}`, payload);
        toast.success(`${formData.name} updated successfully!`);
      } else {
        await api.post("/medicines", payload);
        toast.success(`${formData.name} added to vault!`);
      }
      setIsDrawerOpen(false);
      fetchMedicines(page, debouncedSearchTerm); // Refresh current view
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save medicine");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- DELETE HANDLER ---
  const handleDeleteMedicine = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${name}?`))
      return;
    try {
      await api.delete(`/medicines/${id}`);
      toast.success(`${name} deleted permanently.`);
      fetchMedicines(page, debouncedSearchTerm); // Refresh current view
    } catch (error) {
      toast.error("Failed to delete medicine");
    }
  };

  const getStatusIndicator = (stock) => {
    if (stock === 0)
      return (
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-40"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <span className="text-sm font-semibold text-red-500">
            Out of Stock
          </span>
        </div>
      );
    if (stock < 50)
      return (
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
          <span className="text-sm font-semibold text-amber-500">
            Low Stock
          </span>
        </div>
      );
    return (
      <div className="flex items-center gap-2.5">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
        <span className="text-sm font-semibold text-slate-400">In Stock</span>
      </div>
    );
  };

  if (loading)
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative pb-10">
      {/* 1. Header Area */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            Inventory Control
          </h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">
            Manage {pagination.totalRecords} medical assets.
          </p>
        </div>
        <Magnet padding={50} magnetStrength={3}>
          <button
            onClick={openNewDrawer}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-[0_8px_20px_rgba(37,99,235,0.25)] active:scale-95"
          >
            <Plus size={18} />
            <span>New Medicine</span>
          </button>
        </Magnet>
      </motion.div>

      {/* 2. Controls Bar (Server-Side Debounced Search) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-4 items-center z-20 relative"
      >
        <div className="relative w-full sm:max-w-md group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search catalog by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-semibold text-slate-800 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]"
          />
        </div>
      </motion.div>

      {/* 3. The Data Table (Outcrowd Premium Style) */}
      <div className="bg-white rounded-3xl border border-slate-50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] relative flex flex-col">
        {/* Subtle loading overlay when fetching next page */}
        {isFetching && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 rounded-3xl transition-all duration-300"></div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest rounded-tl-3xl">
                  Product
                </th>
                <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Category
                </th>
                <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Stock Level
                </th>
                <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right rounded-tr-3xl">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="wait">
                {medicines.length > 0 ? (
                  medicines.map((med, index) => (
                    <motion.tr
                      key={med._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      className="group hover:bg-slate-50/80 transition-colors duration-300"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-slate-100 text-slate-400 rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                            <Package size={20} />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-800 text-base">
                              {med.name}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                              {med.genericName || "No Generic"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest px-3 py-1 bg-slate-100 rounded-full">
                          {med.category}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-lg font-black text-slate-800 tabular-nums">
                          {med.totalStock}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {med.batches?.length || 0} Batch(es)
                        </p>
                      </td>
                      <td className="px-8 py-5">
                        {getStatusIndicator(med.totalStock)}
                      </td>
                      <td className="px-8 py-5 text-right relative">
                        {/* 🔴 NEW: SHADCN DROPDOWN MENU */}
                        {/* 🔴 SHADCN DROPDOWN + REACT BITS MAGNET */}
                        <DropdownMenu>
                          <Magnet padding={30} magnetStrength={1.5}>
                            <DropdownMenuTrigger asChild>
                              <button className="p-2 text-slate-300 hover:text-primary hover:bg-primary-light/10 rounded-xl transition-all outline-none">
                                <MoreVertical size={20} />
                              </button>
                            </DropdownMenuTrigger>
                          </Magnet>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 p-2 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border-slate-100"
                          >
                            <DropdownMenuItem
                              onClick={() => openEditDrawer(med)}
                              className="px-4 py-3 text-sm font-bold text-slate-700 hover:text-primary cursor-pointer rounded-xl transition-colors focus:bg-slate-50"
                            >
                              <Edit3
                                size={16}
                                className="mr-3 text-slate-400"
                              />{" "}
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleDeleteMedicine(med._id, med.name)
                              }
                              className="px-4 py-3 text-sm font-bold text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer rounded-xl transition-colors mt-1"
                            >
                              <Trash2 size={16} className="mr-3 text-red-400" />{" "}
                              Delete Asset
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-24 text-center">
                      <div className="max-w-xs mx-auto flex flex-col items-center justify-center opacity-70">
                        <Search size={48} className="text-slate-300 mb-4" />
                        <p className="text-xl font-bold text-slate-800 mb-1">
                          No assets found
                        </p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Adjust your search parameters
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* --- 4. SHADCN PAGINATION FOOTER --- */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-8 py-4 border-t border-slate-50 bg-slate-50/30 rounded-b-3xl">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Showing Page {page} of {pagination.totalPages}
            </p>
            <Pagination className="justify-end w-auto mx-0">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      pagination.hasPrevPage && setPage((p) => p - 1)
                    }
                    className={`rounded-xl font-bold text-xs px-4 py-2 transition-all ${!pagination.hasPrevPage ? "opacity-50 cursor-not-allowed hover:bg-transparent" : "cursor-pointer hover:bg-white shadow-sm border border-slate-200"}`}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      pagination.hasNextPage && setPage((p) => p + 1)
                    }
                    className={`rounded-xl font-bold text-xs px-4 py-2 transition-all ${!pagination.hasNextPage ? "opacity-50 cursor-not-allowed hover:bg-transparent" : "cursor-pointer hover:bg-white shadow-sm border border-slate-200"}`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* THE SMART SLIDE-OUT DRAWER                 */}
      {/* ========================================== */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "100%", boxShadow: "-20px 0 40px rgba(0,0,0,0)" }}
              animate={{ x: 0, boxShadow: "-20px 0 40px rgba(0,0,0,0.1)" }}
              exit={{ x: "100%", boxShadow: "-20px 0 40px rgba(0,0,0,0)" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col border-l border-slate-100"
            >
              <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                    {editingId ? "Edit Asset" : "New Asset"}
                  </h2>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
                    {editingId
                      ? "Update product details"
                      : "Register a new product."}
                  </p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <form
                  id="medicineForm"
                  onSubmit={handleSaveMedicine}
                  className="space-y-8"
                >
                  {/* Form fields remain exactly the same as your code... */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 mb-4">
                      <Package size={14} /> Product Profile
                    </h3>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                        Brand Name *
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                        Generic Name
                      </label>
                      <input
                        type="text"
                        value={formData.genericName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            genericName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-800"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                          Category *
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-800"
                        >
                          <option>Tablet</option>
                          <option>Syrup</option>
                          <option>Injection</option>
                          <option>Ointment</option>
                          <option>Drops</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                          Manufacturer
                        </label>
                        <input
                          type="text"
                          value={formData.manufacturer}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              manufacturer: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-50 my-8"></div>

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 mb-4">
                      <Package size={14} /> Batch Tracking
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                          Batch Number *
                        </label>
                        <input
                          required
                          type="text"
                          value={formData.batchNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              batchNumber: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-mono font-bold text-slate-800 uppercase"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                          Expiry Date *
                        </label>
                        <input
                          required
                          type="date"
                          value={formData.expiryDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              expiryDate: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                        Quantity (Units) *
                      </label>
                      <input
                        required
                        type="number"
                        min="0"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({ ...formData, quantity: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-black text-slate-800 tabular-nums text-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 mt-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                          Buy Price (₹) *
                        </label>
                        <input
                          required
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.buyPrice}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              buyPrice: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-black text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">
                          Sell Price (₹) *
                        </label>
                        <input
                          required
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.sellPrice}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sellPrice: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 bg-white border border-emerald-500/30 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-black text-emerald-600"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="px-8 py-6 border-t border-slate-50 bg-white flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 py-3.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="medicineForm"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 px-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold shadow-[0_8px_20px_rgba(37,99,235,0.25)] transition-all active:scale-95 flex justify-center items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={18} />{" "}
                      {editingId ? "Update Vault" : "Save Asset"}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
