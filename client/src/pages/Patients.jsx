import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import toast from "react-hot-toast";
import {
  Search,
  Users,
  Award,
  Filter,
  UserPlus,
  Phone,
  MapPin,
  Calendar,
  HeartPulse,
  AlertTriangle,
  Droplet,
  Activity,
  X,
  ShieldAlert,
  CheckCircle2,
  Save,
  Edit2,
  UserPlus2,
  Loader2,
} from "lucide-react";
import Magnet from "../components/animations/Magnet";

// Shadcn UI Imports
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

// --- 2. REACT BITS: SPOTLIGHT CARD COMPONENT ---
const SpotlightCard = ({
  children,
  className = "",
  spotlightColor = "rgba(37, 99, 235, 0.15)",
  onClick,
}) => {
  const divRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current || isFocused) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };
  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };
  const handleMouseEnter = () => {
    setOpacity(1);
  };
  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer group ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
};

// Simplified Config
const MEMBERSHIP_CONFIG = {
  Standard: {
    discountPct: 5,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    glow: "rgba(37, 99, 235, 0.15)",
  },
  Silver: {
    discountPct: 15,
    color: "bg-slate-100 text-slate-700 border-slate-300",
    glow: "rgba(148, 163, 184, 0.2)",
  },
  Gold: {
    discountPct: 25,
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    glow: "rgba(234, 179, 8, 0.2)",
  },
  Platinum: {
    discountPct: 40,
    color: "bg-slate-800 text-slate-100 border-slate-600",
    glow: "rgba(30, 41, 59, 0.2)",
  },
};

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    amount,
  );

const initialFormState = {
  name: "",
  mobile: "",
  address: "",
  bloodGroup: "Unknown",
  status: "Active",
  allergies: "",
  chronicConditions: "",
  membershipTier: "Standard",
};

export default function Patients() {
  // Data & Pagination State
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalRecords: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // High-Level Stats
  const [stats, setStats] = useState({
    totalActive: 0,
    totalPlatinum: 0,
    totalValue: 0,
  });

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [tierFilter, setTierFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Drawer & Form States
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState(initialFormState);

  // --- 3. THE SERVER-SIDE FETCH ENGINE ---
  // 🔴 FIXED: Added currentStatus parameter
  const fetchPatients = async (
    currentPage,
    searchQuery,
    currentTier,
    currentStatus,
  ) => {
    setIsFetching(true);
    try {
      const params = { page: currentPage, limit: 12, search: searchQuery };
      if (currentTier !== "All") params.membershipTier = currentTier;
      if (currentStatus !== "All") params.status = currentStatus;

      const res = await api.get("/patients", { params });

      setPatients(res.data.data);
      setPagination(res.data.pagination);

      if (res.data.globalStats) {
        setStats({
          totalActive: res.data.globalStats.totalActive,
          totalPlatinum: res.data.globalStats.totalPlatinum,
          totalValue: res.data.globalStats.totalLTV,
        });
      }
    } catch (error) {
      toast.error("Failed to load CRM data");
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  // 🔴 FIXED: Removed duplicate useEffects. This is the single source of truth.
  useEffect(() => {
    fetchPatients(page, debouncedSearchTerm, tierFilter, statusFilter);
  }, [page, debouncedSearchTerm, tierFilter, statusFilter]);

  // Reset page if search or filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, tierFilter, statusFilter]);

  // --- FORM HANDLERS ---
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleOpenCreate = () => {
    setSelectedPatient(null);
    setIsEditing(false);
    setFormData(initialFormState);
    setIsCreating(true);
  };

  const handleEditClick = () => {
    setFormData({
      ...selectedPatient,
      allergies: selectedPatient.allergies?.join(", ") || "",
      chronicConditions: selectedPatient.chronicConditions?.join(", ") || "",
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!formData.name || !formData.mobile)
      return toast.error("Name and Mobile are required!");
    setIsFetching(true);
    try {
      const payload = {
        ...formData,
        allergies:
          typeof formData.allergies === "string"
            ? formData.allergies
                .split(",")
                .map((a) => a.trim())
                .filter((a) => a)
            : formData.allergies,
        chronicConditions:
          typeof formData.chronicConditions === "string"
            ? formData.chronicConditions
                .split(",")
                .map((a) => a.trim())
                .filter((a) => a)
            : formData.chronicConditions,
      };

      if (isCreating) {
        await api.post("/patients", payload);
        toast.success("New Patient Registered!");
      } else {
        await api.put(`/patients/${selectedPatient._id}`, payload);
        toast.success("Patient Profile Updated!");
      }
      setIsCreating(false);
      setIsEditing(false);
      setSelectedPatient(null);

      // 🔴 FIXED: Include statusFilter when refreshing after save
      fetchPatients(page, debouncedSearchTerm, tierFilter, statusFilter);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save profile");
    } finally {
      setIsFetching(false);
    }
  };

  const closeDrawer = () => {
    setSelectedPatient(null);
    setIsEditing(false);
    setIsCreating(false);
  };

  if (loading)
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="max-w-[1600px] mx-auto h-auto min-h-[calc(100vh-8rem)] relative flex flex-col pb-10">
      {/* 1. Header Area */}
      <div className="flex flex-col xl:flex-row gap-6 justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Users className="text-primary" size={32} />
            Patient CRM
          </h1>
          <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
            <Activity size={16} /> Managing {pagination.totalRecords} total
            subscriptions.
          </p>
        </div>
        <div className="flex gap-4 w-full xl:w-auto overflow-x-auto pb-2 custom-scrollbar">
          <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm min-w-[160px] flex-shrink-0 flex flex-col justify-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              Active DB
            </p>
            <p className="text-3xl font-black text-slate-800 tabular-nums">
              {stats.totalActive}
            </p>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-5 rounded-3xl shadow-xl min-w-[160px] flex-shrink-0 flex flex-col justify-center relative overflow-hidden">
            <Award
              className="absolute -right-4 -bottom-4 text-slate-700/50"
              size={64}
            />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 relative z-10">
              Platinum VIPs
            </p>
            <p className="text-3xl font-black text-white relative z-10 tabular-nums">
              {stats.totalPlatinum}
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl shadow-sm min-w-[200px] flex-shrink-0 flex flex-col justify-center">
            <p className="text-xs font-bold text-emerald-600/70 uppercase tracking-widest mb-1">
              View LTV
            </p>
            <p className="text-3xl font-black text-emerald-700 tabular-nums">
              {formatINR(stats.totalValue)}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Controls Bar (Debounced Search & Filters) */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-3 rounded-3xl border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] mb-8 z-20 relative">
        {/* --- LEFT SIDE: Search Bar --- */}
        <div className="relative flex-1 group">
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
            placeholder="Search patients by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-semibold text-slate-800"
          />

          <AnimatePresence>
            {searchTerm.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.2, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.2, rotate: 90 }}
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.8, rotate: -45 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 bg-white hover:bg-red-500 hover:text-white rounded-full transition-colors outline-none shadow-sm hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-slate-200 hover:border-red-400"
                title="Clear search"
              >
                <X size={14} strokeWidth={3} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* --- RIGHT SIDE: Filters & Actions --- */}
        <div className="flex flex-wrap items-center gap-3 px-2 pb-2 md:pb-0">
          <Filter size={18} className="text-slate-400 ml-2 hidden sm:block" />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-100 text-slate-700 text-sm font-bold rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary block p-3 outline-none cursor-pointer transition-colors"
          >
            <option value="All">All Status</option>
            <option value="Active">Active Only</option>
            <option value="Discharged">Discharged Only</option>
          </select>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-slate-50 border border-slate-100 text-slate-700 text-sm font-bold rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary block p-3 outline-none cursor-pointer transition-colors"
          >
            <option value="All">All Tiers</option>
            <option value="Standard">Standard</option>
            <option value="Silver">Silver</option>
            <option value="Gold">Gold</option>
            <option value="Platinum">Platinum</option>
          </select>

          <button
            onClick={handleOpenCreate}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-2xl font-bold shadow-[0_8px_20px_rgba(37,99,235,0.25)] transition-all active:scale-95 flex items-center gap-2"
          >
            <UserPlus size={18} /> New Patient
          </button>
        </div>
      </div>

      {/* 3. The Grid (React Bits Spotlight Cards) */}
      <div className="relative flex-1">
        {isFetching && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 rounded-3xl transition-all duration-300"></div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 relative z-0">
          <AnimatePresence>
            {patients.map((patient, index) => {
              const tier =
                MEMBERSHIP_CONFIG[patient.membershipTier || "Standard"];
              return (
                <SpotlightCard
                  key={patient._id}
                  spotlightColor={tier.glow}
                  onClick={() => {
                    setSelectedPatient(patient);
                    setIsEditing(false);
                    setIsCreating(false);
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex flex-col h-full justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-5">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-xl border-2 shadow-sm ${tier.color}`}
                          >
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-800 text-lg group-hover:text-primary transition-colors leading-tight">
                              {patient.name}
                            </h3>
                            <p className="text-xs font-bold text-slate-400 mt-1">
                              {patient.mobile}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${tier.color}`}
                        >
                          {patient.membershipTier || "Standard"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {patient.bloodGroup &&
                          patient.bloodGroup !== "Unknown" && (
                            <span className="flex items-center gap-1.5 text-[10px] font-bold bg-rose-50 text-rose-600 px-2.5 py-1.5 rounded-lg border border-rose-100">
                              <Droplet size={12} /> {patient.bloodGroup}
                            </span>
                          )}
                        {patient.allergies?.length > 0 && (
                          <span className="flex items-center gap-1.5 text-[10px] font-bold bg-amber-50 text-amber-600 px-2.5 py-1.5 rounded-lg border border-amber-100">
                            <AlertTriangle size={12} />{" "}
                            {patient.allergies.length} Allergies
                          </span>
                        )}
                        {/* Status Badge */}
                        <span
                          className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border ${patient.status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-500 border-slate-200"}`}
                        >
                          {patient.status}
                        </span>
                      </div>
                    </div>
                    <div className="pt-5 border-t border-slate-50 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                          Lifetime Spend
                        </p>
                        <p className="text-primary font-black text-xl leading-none tabular-nums">
                          {formatINR(patient.totalLifetimeSpent || 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                          Discount
                        </p>
                        <p className="text-slate-800 font-bold leading-none">
                          {tier.discountPct}% Off
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </SpotlightCard>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* --- 4. SHADCN PAGINATION FOOTER --- */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-8 py-5 mt-8 border border-slate-100 bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
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
                  className={`rounded-xl font-bold text-xs px-4 py-2 transition-all ${!pagination.hasPrevPage ? "opacity-50 cursor-not-allowed hover:bg-transparent" : "cursor-pointer hover:bg-slate-50 border border-slate-100 shadow-sm"}`}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    pagination.hasNextPage && setPage((p) => p + 1)
                  }
                  className={`rounded-xl font-bold text-xs px-4 py-2 transition-all ${!pagination.hasNextPage ? "opacity-50 cursor-not-allowed hover:bg-transparent" : "cursor-pointer hover:bg-slate-50 border border-slate-100 shadow-sm"}`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* --- SIDE DRAWER (CREATE / EDIT / DOSSIER) --- */}
      <AnimatePresence>
        {(selectedPatient || isCreating) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 cursor-pointer"
            />
            <motion.div
              initial={{ x: "100%", boxShadow: "-20px 0 40px rgba(0,0,0,0)" }}
              animate={{ x: 0, boxShadow: "-20px 0 40px rgba(0,0,0,0.1)" }}
              exit={{ x: "100%", boxShadow: "-20px 0 40px rgba(0,0,0,0)" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 overflow-y-auto border-l border-slate-100 flex flex-col cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 border-b border-slate-50 flex justify-between items-start sticky top-0 bg-white/95 backdrop-blur-xl z-10 shadow-sm">
                <div className="flex items-center gap-5">
                  {isCreating ? (
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary text-white border-4 border-primary-light shadow-md">
                      <UserPlus2 size={28} />
                    </div>
                  ) : (
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl border-4 shadow-md ${MEMBERSHIP_CONFIG[selectedPatient.membershipTier || "Standard"].color}`}
                    >
                      {selectedPatient.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">
                      {isCreating ? "New Patient" : selectedPatient.name}
                    </h2>
                    {!isCreating && (
                      <span
                        className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${MEMBERSHIP_CONFIG[selectedPatient.membershipTier || "Standard"].color}`}
                      >
                        {selectedPatient.membershipTier || "Standard"} Sub
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={closeDrawer}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-8 flex-1 custom-scrollbar">
                {isEditing || isCreating ? (
                  // --- FORM MODE ---
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-bold text-slate-800 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                        Mobile Number *
                      </label>
                      <input
                        type="text"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-bold text-slate-800 transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 block">
                        Subscription Tier
                      </label>
                      <select
                        name="membershipTier"
                        value={formData.membershipTier}
                        onChange={handleInputChange}
                        className="w-full p-4 bg-primary/5 border border-primary/20 text-primary rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none font-black transition-all"
                      >
                        <option value="Standard">Standard (5% Off)</option>
                        <option value="Silver">Silver (15% Off)</option>
                        <option value="Gold">Gold (25% Off)</option>
                        <option value="Platinum">Platinum (40% Off)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-bold text-slate-800 transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                          Blood Group
                        </label>
                        <select
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleInputChange}
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-bold text-slate-800 transition-all"
                        >
                          <option>Unknown</option>
                          <option>A+</option>
                          <option>A-</option>
                          <option>B+</option>
                          <option>B-</option>
                          <option>O+</option>
                          <option>O-</option>
                          <option>AB+</option>
                          <option>AB-</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                          Status
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-bold text-slate-800 transition-all"
                        >
                          <option>Active</option>
                          <option>Discharged</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                        Allergies (comma separated)
                      </label>
                      <textarea
                        name="allergies"
                        value={formData.allergies}
                        onChange={handleInputChange}
                        placeholder="Peanuts, Penicillin..."
                        className="w-full p-4 bg-amber-50/50 border border-amber-100 rounded-2xl focus:bg-amber-50 focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 outline-none font-bold text-slate-800 min-h-[100px] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                        Chronic Conditions (comma sep.)
                      </label>
                      <textarea
                        name="chronicConditions"
                        value={formData.chronicConditions}
                        onChange={handleInputChange}
                        placeholder="Asthma, Diabetes..."
                        className="w-full p-4 bg-purple-50/50 border border-purple-100 rounded-2xl focus:bg-purple-50 focus:ring-4 focus:ring-purple-400/20 focus:border-purple-400 outline-none font-bold text-slate-800 min-h-[100px] transition-all"
                      />
                    </div>
                  </div>
                ) : (
                  // --- VIEW DOSSIER MODE ---
                  <>
                    <section>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                        Contact Details
                      </h3>
                      <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <div className="flex items-center gap-4 text-base font-bold text-slate-700">
                          <div className="p-2 bg-white rounded-xl shadow-sm">
                            <Phone size={18} className="text-primary" />
                          </div>{" "}
                          {selectedPatient.mobile}
                        </div>
                        {selectedPatient.address && (
                          <div className="flex items-center gap-4 text-base font-bold text-slate-700">
                            <div className="p-2 bg-white rounded-xl shadow-sm">
                              <MapPin
                                size={18}
                                className="text-primary shrink-0"
                              />
                            </div>{" "}
                            {selectedPatient.address}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-base font-bold text-slate-700">
                          <div className="p-2 bg-white rounded-xl shadow-sm">
                            <Calendar
                              size={18}
                              className="text-primary shrink-0"
                            />
                          </div>{" "}
                          Last Visit:{" "}
                          {new Date(
                            selectedPatient.lastVisit || Date.now(),
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </section>
                    <section>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 mt-8 flex items-center gap-2">
                        <HeartPulse size={14} className="text-rose-500" />{" "}
                        Clinical Profile
                      </h3>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-rose-50 border border-rose-100 p-5 rounded-3xl">
                          <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">
                            Blood Group
                          </p>
                          <p className="font-black text-xl text-rose-700 flex items-center gap-2">
                            <Droplet size={20} />{" "}
                            {selectedPatient.bloodGroup || "Unknown"}
                          </p>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Status
                          </p>
                          <p className="font-black text-xl text-slate-700 flex items-center gap-2">
                            {selectedPatient.status === "Active" ? (
                              <CheckCircle2
                                size={20}
                                className="text-emerald-500"
                              />
                            ) : (
                              <X size={20} className="text-slate-400" />
                            )}{" "}
                            {selectedPatient.status}
                          </p>
                        </div>
                      </div>
                      <div className="mb-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                          Known Allergies
                        </p>
                        {selectedPatient.allergies?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedPatient.allergies.map((allergy, i) => (
                              <span
                                key={i}
                                className="flex items-center gap-1.5 text-xs font-black bg-amber-50 text-amber-700 px-3 py-2 rounded-xl border border-amber-200"
                              >
                                <ShieldAlert size={14} /> {allergy}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm font-bold text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                            No known allergies recorded.
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                          Chronic Conditions
                        </p>
                        {selectedPatient.chronicConditions?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedPatient.chronicConditions.map(
                              (condition, i) => (
                                <span
                                  key={i}
                                  className="flex items-center gap-1.5 text-xs font-black bg-purple-50 text-purple-700 px-3 py-2 rounded-xl border border-purple-200"
                                >
                                  <Activity size={14} /> {condition}
                                </span>
                              ),
                            )}
                          </div>
                        ) : (
                          <p className="text-sm font-bold text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                            No chronic conditions recorded.
                          </p>
                        )}
                      </div>
                    </section>
                    <section className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden mt-8 shadow-2xl">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/30 blur-[64px] rounded-full"></div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 relative z-10">
                        Financial Overview
                      </h3>
                      <div className="flex justify-between items-end relative z-10">
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">
                            Lifetime Spend
                          </p>
                          <p className="text-4xl font-black tracking-tighter tabular-nums">
                            {formatINR(selectedPatient.totalLifetimeSpent || 0)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-primary bg-primary/20 px-4 py-2 rounded-xl border border-primary/30 uppercase tracking-widest shadow-inner">
                            {
                              MEMBERSHIP_CONFIG[
                                selectedPatient.membershipTier || "Standard"
                              ].discountPct
                            }
                            % Base Discount
                          </p>
                        </div>
                      </div>
                    </section>
                  </>
                )}
              </div>

              <div className="p-8 border-t border-slate-50 bg-white mt-auto">
                {isEditing || isCreating ? (
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setIsCreating(false);
                      }}
                      className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-bold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="flex-1 py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black transition-all shadow-[0_8px_20px_rgba(37,99,235,0.25)] active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Save size={18} />{" "}
                      {isCreating ? "Register Patient" : "Save Changes"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEditClick}
                    className="w-full py-4 bg-white border-2 border-slate-100 hover:border-primary hover:bg-primary/5 hover:text-primary text-slate-700 rounded-2xl font-black transition-all shadow-sm flex items-center justify-center gap-2 group"
                  >
                    <Edit2
                      size={18}
                      className="group-hover:scale-110 transition-transform"
                    />{" "}
                    Edit Patient Profile
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
