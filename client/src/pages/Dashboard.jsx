import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import {
  motion,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  Users,
  Pill,
  AlertTriangle,
  Activity,
  IndianRupee,
  ShieldCheck,
  Clock,
  ShieldAlert,
  AlertOctagon,
  Award,
  HeartPulse,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// --- TIER COLORS FOR DONUT ---
const TIER_COLORS = {
  Standard: "#3B82F6", // blue-500
  Silver: "#94A3B8", // slate-400
  Gold: "#EAB308", // yellow-500
  Platinum: "#1E293B", // slate-800
};

// --- THE ANIMATION ENGINE ---
const AnimatedCounter = ({ value, prefix = "" }) => {
  const spring = useSpring(0, { stiffness: 70, damping: 25, restDelta: 0.01 });
  const display = useTransform(
    spring,
    (current) => `${prefix}${Math.round(current).toLocaleString()}`,
  );
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);
  return <motion.span>{display}</motion.span>;
};

// --- OUTCROWD AESTHETIC: CUSTOM GLASS TOOLTIP ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <p className="text-xl font-black text-slate-800 tabular-nums">
          ₹{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

// --- OUTCROWD AESTHETIC: FLOATING STAT CARD ---
const StatCard = ({ title, value, icon: Icon, colorClass, bgLight, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white rounded-3xl p-6 border border-slate-50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.08)] transition-all duration-500 relative overflow-hidden group"
  >
    {/* Ambient Glowing Orb */}
    <div
      className={`absolute -right-6 -top-6 w-32 h-32 rounded-full ${bgLight} blur-3xl opacity-40 group-hover:opacity-80 transition-opacity duration-700`}
    ></div>

    <div className="flex justify-between items-start mb-6 relative z-10">
      <div
        className={`p-3.5 rounded-2xl ${bgLight} ${colorClass} group-hover:scale-110 transition-transform duration-500 shadow-sm`}
      >
        <Icon size={24} strokeWidth={2.5} />
      </div>
    </div>

    <div className="relative z-10">
      <h3 className="text-4xl lg:text-5xl font-black text-slate-800 tracking-tighter tabular-nums mb-1">
        {value}
      </h3>
      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
        {title}
      </p>
    </div>
  </motion.div>
);

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [activeAlertTab, setActiveAlertTab] = useState("stock");
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalMedicines: 0,
    todayRevenue: 0,
    lowStockItems: [],
    expiringItems: [],
    chartData: [],
    tierData: [],
    topVIPs: [],
    activePatients: 0,
    loading: true,
  });

  useEffect(() => {
    // --- TRACK C UPDATE: FETCHING PRE-AGGREGATED DATA ---
    const fetchDashboardData = async () => {
      try {
        const res = await api.get("/dashboard");

        // Destructure the pre-crunched data directly from our new MongoDB aggregation endpoint!
        const {
          totalPatients,
          activePatients,
          totalMedicines,
          todayRevenue,
          lowStockItems,
          expiringItems,
          chartData,
          tierData,
          topVIPs,
        } = res.data.data;

        setStats({
          totalPatients,
          totalMedicines,
          todayRevenue,
          lowStockItems,
          expiringItems,
          chartData,
          tierData,
          topVIPs,
          activePatients,
          loading: false,
        });
      } catch (error) {
        console.error("Failed to load dashboard data", error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };
    fetchDashboardData();
  }, []);

  if (stats.loading)
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );

  const totalAlerts = stats.lowStockItems.length + stats.expiringItems.length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Header - Sleek & Minimal */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end mb-10"
      >
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
            Overview
          </h1>
          <p className="text-sm font-semibold text-slate-400 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            System Live •{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </motion.div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Registered Patients"
          value={<AnimatedCounter value={stats.totalPatients} />}
          icon={Users}
          bgLight="bg-blue-50"
          colorClass="text-blue-600"
          delay={0.1}
        />
        <StatCard
          title="Active Medicines"
          value={<AnimatedCounter value={stats.totalMedicines} />}
          icon={Pill}
          bgLight="bg-indigo-50"
          colorClass="text-indigo-600"
          delay={0.2}
        />
        <StatCard
          title="Critical Alerts"
          value={<AnimatedCounter value={totalAlerts} />}
          icon={AlertTriangle}
          bgLight={totalAlerts > 0 ? "bg-red-50" : "bg-slate-50"}
          colorClass={totalAlerts > 0 ? "text-red-500" : "text-slate-400"}
          delay={0.3}
        />
        <StatCard
          title="Today's Revenue"
          value={<AnimatedCounter value={stats.todayRevenue} prefix="₹" />}
          icon={IndianRupee}
          bgLight="bg-emerald-50"
          colorClass="text-emerald-500"
          delay={0.4}
        />
      </div>

      {/* --- ROW 3: CRM TELEMETRY --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier Distribution Donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="bg-white rounded-3xl p-8 border border-slate-50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col group"
        >
          <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-blue-500/5 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>

          <div className="mb-2 z-10 relative">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Award size={24} className="text-primary" /> Subscriptions
            </h2>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
              Tier Distribution
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative z-10 min-h-[220px]">
            {stats.tierData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={stats.tierData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="name"
                      stroke="none"
                      isAnimationActive={true}
                    >
                      {stats.tierData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={TIER_COLORS[entry.name] || "#CBD5E1"}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "1px solid rgba(255,255,255,0.5)",
                        background: "rgba(255,255,255,0.8)",
                        backdropFilter: "blur(12px)",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                      }}
                      itemStyle={{ fontWeight: "900", color: "#1E293B" }}
                      formatter={(value, name) => [value, `${name} Tier`]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="flex justify-center gap-5 mt-4 flex-wrap w-full">
                  {stats.tierData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: TIER_COLORS[entry.name] }}
                      ></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {entry.name}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center opacity-50">
                <Users size={32} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-bold text-slate-500">
                  No Patient Data
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Top VIP Spenders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="bg-white rounded-3xl lg:col-span-2 p-0 relative overflow-hidden flex flex-col border border-slate-50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]"
        >
          <div className="px-8 py-6 border-b border-slate-50 bg-white relative z-10 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <HeartPulse size={24} className="text-emerald-500" /> High-Value
                Patients
              </h2>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
                Top 5 Lifetime LTV
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-slate-800 tabular-nums leading-none block">
                {stats.activePatients}
              </span>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
                Active Total
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto relative z-10 bg-slate-50/30">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <tbody className="divide-y divide-slate-100/50">
                {stats.topVIPs.map((vip, idx) => (
                  <tr
                    key={vip._id}
                    className="hover:bg-white transition-colors duration-300 group"
                  >
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <span className="text-slate-300 font-black text-lg w-4 text-center">
                          {idx + 1}
                        </span>
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 shadow-sm group-hover:scale-110 transition-transform
                          ${
                            vip.membershipTier === "Platinum"
                              ? "bg-slate-800 text-slate-100 border-slate-600"
                              : vip.membershipTier === "Gold"
                                ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                                : vip.membershipTier === "Silver"
                                  ? "bg-slate-100 text-slate-700 border-slate-300"
                                  : "bg-blue-100 text-blue-700 border-blue-200"
                          }`}
                        >
                          {vip.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 text-base">
                            {vip.name}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {vip.mobile}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <span
                        className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm
                        ${
                          vip.membershipTier === "Platinum"
                            ? "bg-slate-800 text-slate-100 border-slate-600"
                            : vip.membershipTier === "Gold"
                              ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                              : vip.membershipTier === "Silver"
                                ? "bg-slate-100 text-slate-700 border-slate-300"
                                : "bg-blue-100 text-blue-700 border-blue-200"
                        }`}
                      >
                        {vip.membershipTier || "Standard"}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <p className="text-lg font-black text-emerald-600 tabular-nums">
                        ₹{Number(vip.totalLifetimeSpent || 0).toLocaleString()}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* --- ROW 2: REVENUE CHART & THREAT RADAR --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outcrowd Style Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-white rounded-3xl lg:col-span-2 flex flex-col p-8 border border-slate-50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden group"
        >
          <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>

          <div className="mb-8 z-10 relative">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Revenue Trend
            </h2>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
              7-Day Historical Ledger
            </p>
          </div>
          <div className="w-full h-[320px] z-10 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0.01}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#F1F5F9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 700 }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <RechartsTooltip
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: "#E2E8F0",
                    strokeWidth: 2,
                    strokeDasharray: "4 4",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-primary)"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  activeDot={{
                    r: 6,
                    strokeWidth: 0,
                    fill: "var(--color-primary)",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 🔴 THE THREAT RADAR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-white rounded-3xl flex flex-col p-0 overflow-hidden border border-slate-50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] relative group"
        >
          <div className="px-8 py-6 border-b border-slate-50 bg-white z-10 relative">
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <ShieldAlert size={20} className="text-red-500" /> Action Required
            </h2>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
              System Warnings
            </p>
          </div>

          <div className="flex border-b border-slate-50 bg-slate-50/50 z-10 relative">
            <button
              onClick={() => setActiveAlertTab("stock")}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-colors border-b-2 ${activeAlertTab === "stock" ? "border-primary text-primary bg-white" : "border-transparent text-slate-400 hover:bg-slate-100/50"}`}
            >
              Stock ({stats.lowStockItems.length})
            </button>
            <button
              onClick={() => setActiveAlertTab("expiry")}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-colors border-b-2 ${activeAlertTab === "expiry" ? "border-red-500 text-red-500 bg-white" : "border-transparent text-slate-400 hover:bg-slate-100/50"}`}
            >
              Expiry ({stats.expiringItems.length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 z-10 relative custom-scrollbar h-[270px]">
            <AnimatePresence mode="wait">
              {activeAlertTab === "stock" && (
                <motion.div
                  key="stock"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  {stats.lowStockItems.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-center opacity-70">
                      <ShieldCheck
                        size={40}
                        className="text-emerald-400 mb-3"
                      />
                      <p className="font-bold text-slate-800">
                        Stock Levels Nominal
                      </p>
                    </div>
                  ) : (
                    stats.lowStockItems.map((med) => (
                      <div
                        key={med._id}
                        className="flex items-center justify-between p-4 rounded-2xl bg-white border border-amber-100 shadow-sm hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-amber-50 rounded-xl group-hover:scale-110 transition-transform">
                            <Pill size={18} className="text-amber-500" />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-800 text-sm">
                              {med.name}
                            </p>
                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-wider mt-0.5">
                              Only {med.totalStock} left
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {activeAlertTab === "expiry" && (
                <motion.div
                  key="expiry"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  {stats.expiringItems.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-center opacity-70">
                      <ShieldCheck
                        size={40}
                        className="text-emerald-400 mb-3"
                      />
                      <p className="font-bold text-slate-800">
                        No Expiry Threats Detected
                      </p>
                    </div>
                  ) : (
                    stats.expiringItems.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-4 rounded-2xl bg-white border transition-all group ${item.status === "EXPIRED" ? "border-red-200 shadow-[0_0_20px_rgba(239,68,68,0.15)]" : "border-amber-100 shadow-sm"}`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-2.5 rounded-xl group-hover:scale-110 transition-transform ${item.status === "EXPIRED" ? "bg-red-50 text-red-500 animate-pulse" : "bg-amber-50 text-amber-500"}`}
                          >
                            {item.status === "EXPIRED" ? (
                              <AlertOctagon size={18} />
                            ) : (
                              <Clock size={18} />
                            )}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                              {item.name}
                              <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                Batch {item.batchData.batchNumber}
                              </span>
                            </p>
                            {item.status === "EXPIRED" ? (
                              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1">
                                EXPIRED (
                                {new Date(
                                  item.batchData.expiryDate,
                                ).toLocaleDateString()}
                                )
                              </p>
                            ) : (
                              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-1">
                                Expires in {item.daysLeft} Days
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
