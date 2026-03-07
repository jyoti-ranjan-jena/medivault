import { useState, useEffect } from "react";
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
  IndianRupee,
  Clock,
  ShieldAlert,
  AlertOctagon,
  Award,
  HeartPulse,
  TrendingUp,
  Package,
  ShieldCheck
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

// --- TIER COLORS FOR DONUT ---
const TIER_COLORS = {
  Standard: "#3B82F6", // blue-500
  Silver: "#94A3B8", // slate-400
  Gold: "#EAB308", // yellow-500
  Platinum: "#1E293B", // slate-800
};

// --- THE ANIMATION ENGINE ---
const AnimatedCounter = ({ value, prefix = "", suffix = "" }) => {
  const spring = useSpring(0, { stiffness: 70, damping: 25, restDelta: 0.01 });
  const display = useTransform(
    spring,
    (current) => `${prefix}${Math.round(current).toLocaleString()}${suffix}`
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
      <div className="bg-white/90 backdrop-blur-xl border border-slate-100 p-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)]">
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <p className="text-2xl font-black text-primary tabular-nums">
          ₹{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

// --- OUTCROWD AESTHETIC: FLOATING STAT CARD ---
const StatCard = ({ title, value, icon: Icon, colorClass, bgLight, delay, subtext }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}
    className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.08)] transition-all duration-500 relative overflow-hidden group"
  >
    <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full ${bgLight} blur-[40px] opacity-40 group-hover:opacity-80 transition-opacity duration-700`}></div>
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className={`p-4 rounded-2xl ${bgLight} ${colorClass} group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      {subtext && (
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">{subtext}</span>
      )}
    </div>
    <div className="relative z-10">
      <h3 className="text-4xl xl:text-5xl font-black text-slate-800 tracking-tighter tabular-nums mb-1">
        {value}
      </h3>
      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
        {title}
      </p>
    </div>
  </motion.div>
);

export default function Dashboard() {
  const [activeAlertTab, setActiveAlertTab] = useState("stock");
  const [stats, setStats] = useState({
    totalPatients: 0, totalMedicines: 0, todayRevenue: 0, monthlyRevenue: 0, allTimeRevenue: 0,
    lowStockItems: [], expiringItems: [], chartData: [], tierData: [], topVIPs: [], topAssets: [], activePatients: 0, loading: true,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get("/dashboard");
        setStats({ ...res.data.data, loading: false });
      } catch (error) {
        console.error("Failed to load dashboard data", error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };
    fetchDashboardData();
  }, []);

  if (stats.loading) return <div className="h-full flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  const totalAlerts = stats.lowStockItems.length + stats.expiringItems.length;

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-10">
      
      {/* ================= HEADER ================= */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Command Center</h1>
          <p className="text-sm font-semibold text-slate-400 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span></span>
            Live Telemetry • {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">30-Day Revenue</p>
            <p className="text-xl font-black text-emerald-500 tabular-nums leading-none">₹{stats.monthlyRevenue.toLocaleString()}</p>
          </div>
          <div className="w-px h-8 bg-slate-100"></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">All-Time LTV</p>
            <p className="text-xl font-black text-slate-800 tabular-nums leading-none">₹{stats.allTimeRevenue.toLocaleString()}</p>
          </div>
        </div>
      </motion.div>

      {/* ================= ROW 1: TOP STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active DB" value={<AnimatedCounter value={stats.activePatients} />} icon={Users} bgLight="bg-blue-50" colorClass="text-blue-600" delay={0.1} subtext="Patients" />
        <StatCard title="Total Assets" value={<AnimatedCounter value={stats.totalMedicines} />} icon={Pill} bgLight="bg-indigo-50" colorClass="text-indigo-600" delay={0.2} subtext="Medicines" />
        <StatCard title="Critical Alerts" value={<AnimatedCounter value={totalAlerts} />} icon={AlertTriangle} bgLight={totalAlerts > 0 ? "bg-red-50" : "bg-slate-50"} colorClass={totalAlerts > 0 ? "text-red-500" : "text-slate-400"} delay={0.3} subtext="Action Req" />
        <StatCard title="Today's Revenue" value={<AnimatedCounter value={stats.todayRevenue} prefix="₹" />} icon={IndianRupee} bgLight="bg-emerald-50" colorClass="text-emerald-500" delay={0.4} subtext="24h Window" />
      </div>

      {/* ================= ROW 2: MAIN METRICS ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* REVENUE AREA CHART */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }} className="bg-white rounded-3xl xl:col-span-2 flex flex-col p-8 border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden group">
          <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-primary/5 blur-[60px] opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="mb-8 z-10 relative flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2"><TrendingUp size={24} className="text-primary"/> Financial Trajectory</h2>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">7-Day Historical Ledger</p>
            </div>
          </div>
          <div className="w-full h-[320px] z-10 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F8FAFC" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 700 }} tickFormatter={(val) => `₹${val}`} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: "#E2E8F0", strokeWidth: 2, strokeDasharray: "4 4" }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 6, strokeWidth: 0, fill: "var(--color-primary)" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* THREAT RADAR */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }} className="bg-white rounded-3xl flex flex-col p-0 overflow-hidden border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] relative group">
          <div className="px-8 py-6 border-b border-slate-50 bg-white z-10 relative">
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <ShieldAlert size={20} className="text-red-500" /> Action Required
            </h2>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">System Warnings</p>
          </div>
          <div className="flex border-b border-slate-50 bg-slate-50/50 z-10 relative">
            <button onClick={() => setActiveAlertTab("stock")} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-colors border-b-2 ${activeAlertTab === "stock" ? "border-primary text-primary bg-white shadow-sm" : "border-transparent text-slate-400 hover:bg-slate-100/50"}`}>
              Stock ({stats.lowStockItems.length})
            </button>
            <button onClick={() => setActiveAlertTab("expiry")} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-colors border-b-2 ${activeAlertTab === "expiry" ? "border-red-500 text-red-500 bg-white shadow-sm" : "border-transparent text-slate-400 hover:bg-slate-100/50"}`}>
              Expiry ({stats.expiringItems.length})
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/30 z-10 relative custom-scrollbar h-[310px]">
            <AnimatePresence mode="wait">
              {activeAlertTab === "stock" && (
                <motion.div key="stock" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
                  {stats.lowStockItems.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-center opacity-70"><ShieldCheck size={40} className="text-emerald-400 mb-3" /><p className="font-bold text-slate-800">Stock Levels Nominal</p></div>
                  ) : (
                    stats.lowStockItems.map((med) => (
                      <div key={med._id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-amber-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="p-2.5 bg-amber-50 rounded-xl group-hover:scale-110 transition-transform"><Pill size={18} className="text-amber-500" /></div>
                        <div>
                          <p className="font-extrabold text-slate-800 text-sm">{med.name}</p>
                          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-0.5">Only {med.totalStock} left</p>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
              {activeAlertTab === "expiry" && (
                <motion.div key="expiry" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
                  {stats.expiringItems.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-center opacity-70"><ShieldCheck size={40} className="text-emerald-400 mb-3" /><p className="font-bold text-slate-800">No Expiry Threats</p></div>
                  ) : (
                    stats.expiringItems.map((item, idx) => (
                      <div key={idx} className={`flex items-center gap-4 p-4 rounded-2xl bg-white border transition-all group ${item.status === "EXPIRED" ? "border-red-200 shadow-[0_0_20px_rgba(239,68,68,0.15)]" : "border-amber-100 shadow-sm"}`}>
                        <div className={`p-2.5 rounded-xl group-hover:scale-110 transition-transform ${item.status === "EXPIRED" ? "bg-red-50 text-red-500 animate-pulse" : "bg-amber-50 text-amber-500"}`}>
                          {item.status === "EXPIRED" ? <AlertOctagon size={18} /> : <Clock size={18} />}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 text-sm">{item.name}</p>
                          {item.status === "EXPIRED" ? (
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-0.5">EXPIRED</p>
                          ) : (
                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-0.5">Expires in {item.daysLeft} Days</p>
                          )}
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

      {/* ================= ROW 3: DEEP INSIGHTS ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* TOP ASSETS (THE NEW FEATURE) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5 }} className="bg-white rounded-3xl xl:col-span-2 p-0 relative overflow-hidden flex flex-col border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
          <div className="px-8 py-6 border-b border-slate-50 bg-white relative z-10 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2"><Package size={24} className="text-primary" /> Top Moving Assets</h2>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">Highest Volume by Sales</p>
            </div>
          </div>
          <div className="flex-1 overflow-x-auto relative z-10 bg-slate-50/30 p-6">
            <div className="space-y-3">
              {stats.topAssets && stats.topAssets.length > 0 ? (
                stats.topAssets.map((asset, idx) => (
                  <div key={asset._id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-shadow group">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center font-black text-lg border border-primary/10 group-hover:scale-110 transition-transform">#{idx + 1}</div>
                      <div>
                        <p className="font-extrabold text-slate-800 text-lg leading-tight">{asset.name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{asset.category || 'Medicine'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-emerald-600 tabular-nums">₹{asset.revenueGenerated.toLocaleString()}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{asset.totalSold} Units Sold</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center opacity-50 py-10"><Package size={32} className="mx-auto text-slate-400 mb-2" /><p className="text-sm font-bold text-slate-500">No sales data available yet.</p></div>
              )}
            </div>
          </div>
        </motion.div>

        {/* TIER DONUT */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.5 }} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col group">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-blue-500/5 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="mb-2 z-10 relative">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2"><Award size={24} className="text-primary" /> Subscriptions</h2>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">Tier Distribution</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center relative z-10 min-h-[220px]">
            {stats.tierData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={stats.tierData} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={5} dataKey="count" nameKey="name" stroke="none" isAnimationActive={true}>
                      {stats.tierData.map((entry, index) => (<Cell key={`cell-${index}`} fill={TIER_COLORS[entry.name] || "#CBD5E1"} />))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: "16px", border: "1px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }} itemStyle={{ fontWeight: "900", color: "#1E293B" }} formatter={(value, name) => [value, `${name} Tier`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2 flex-wrap w-full">
                  {stats.tierData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TIER_COLORS[entry.name] }}></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center opacity-50"><Users size={32} className="mx-auto text-slate-400 mb-2" /><p className="text-sm font-bold text-slate-500">No Patient Data</p></div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}