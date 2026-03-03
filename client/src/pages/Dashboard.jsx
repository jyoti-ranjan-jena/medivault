import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Users, Pill, AlertTriangle, Activity, IndianRupee, 
  ShieldCheck, Clock, ShieldAlert, AlertOctagon 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- THE ANIMATION ENGINE ---
const AnimatedCounter = ({ value, prefix = "" }) => {
  const spring = useSpring(0, { stiffness: 70, damping: 25, restDelta: 0.01 });
  const display = useTransform(spring, (current) => `${prefix}${Math.round(current).toLocaleString()}`);
  useEffect(() => { spring.set(value); }, [value, spring]);
  return <motion.span>{display}</motion.span>;
};

const getLocalDateString = (dateObj) => {
  const d = new Date(dateObj);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

const processWeeklyData = (bills) => {
  const last7Days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    last7Days.push({
      dateStr: getLocalDateString(d), 
      name: d.toLocaleDateString('en-US', { weekday: 'short' }), 
      revenue: 0,
      uniquePatients: new Set()
    });
  }
  bills.forEach(bill => {
    const billDate = getLocalDateString(new Date(bill.createdAt));
    const dayRecord = last7Days.find(d => d.dateStr === billDate);
    if (dayRecord) {
      dayRecord.revenue += Number(bill.grandTotal || bill.totalAmount || 0);
      if (bill.patient) dayRecord.uniquePatients.add(bill.patient._id || bill.patient);
    }
  });
  return last7Days.map(d => ({ name: d.name, revenue: d.revenue, patients: d.uniquePatients.size }));
};

const StatCard = ({ title, value, icon: Icon, colorClass, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }} className="bento-card flex flex-col justify-between group hover:shadow-[0_0_30px_rgba(37,99,235,0.08)] transition-all duration-300 relative overflow-hidden">
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Icon size={64} /></div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 backdrop-blur-sm group-hover:scale-110 transition-transform shadow-sm`}>
        <Icon size={22} className={colorClass.replace('bg-', 'text-').split(' ')[0]} />
      </div>
    </div>
    <div className="relative z-10">
      <h3 className="text-3xl font-black text-text-main tracking-tight tabular-nums">{value}</h3>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{title}</p>
    </div>
  </motion.div>
);

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [activeAlertTab, setActiveAlertTab] = useState('stock'); // 'stock' or 'expiry'
  const [stats, setStats] = useState({
    totalPatients: 0, totalMedicines: 0, todayRevenue: 0,
    lowStockItems: [], expiringItems: [], chartData: [], loading: true
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [patientsRes, medicinesRes, billsRes] = await Promise.all([
          api.get('/patients'), api.get('/medicines'), api.get('/bills') 
        ]);

        const patients = patientsRes.data.data;
        const medicines = medicinesRes.data.data;
        const bills = billsRes.data.data;

        // 1. Calculate Low Stock
        const lowStock = medicines.filter(med => med.totalStock < 50);

        // 2. 🔴 THE THREAT DETECTION ENGINE (Expiry Engine)
        const expiring = [];
        const today = new Date();
        const ninetyDaysFromNow = new Date();
        ninetyDaysFromNow.setDate(today.getDate() + 90);

        medicines.forEach(med => {
          if (med.batches && !med.isDeleted) {
            med.batches.forEach(batch => {
              if (batch.quantity > 0 && batch.expiryDate) {
                const expDate = new Date(batch.expiryDate);
                if (expDate < today) {
                  // Critically Expired
                  expiring.push({ ...med, batchData: batch, daysLeft: 0, status: 'EXPIRED' });
                } else if (expDate <= ninetyDaysFromNow) {
                  // Expiring Soon (Warning)
                  const diffTime = Math.abs(expDate - today);
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  expiring.push({ ...med, batchData: batch, daysLeft: diffDays, status: 'WARNING' });
                }
              }
            });
          }
        });
        // Sort expiring by days left (most urgent first)
        expiring.sort((a, b) => a.daysLeft - b.daysLeft);

        // 3. Revenue & Charts
        const todayStr = getLocalDateString(new Date());
        const todayBills = bills.filter(b => getLocalDateString(new Date(b.createdAt)) === todayStr);
        const revenueToday = todayBills.reduce((sum, bill) => sum + Number(bill.grandTotal || bill.totalAmount || 0), 0);
        const weeklyChartData = processWeeklyData(bills);

        setStats({
          totalPatients: patients.length, totalMedicines: medicines.length,
          lowStockItems: lowStock, expiringItems: expiring,
          todayRevenue: revenueToday, chartData: weeklyChartData, loading: false
        });
      } catch (error) {
        console.error("Failed to load dashboard data", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };
    fetchDashboardData();
  }, []);

  if (stats.loading) return <div className="h-full flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  const totalAlerts = stats.lowStockItems.length + stats.expiringItems.length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-text-main tracking-tight flex items-center gap-3">
            <Activity className="text-primary" size={28} /> System Overview
          </h1>
          <p className="text-text-muted font-medium mt-1 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-status-success animate-pulse"></div>
            Live telemetry for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </motion.div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Registered Patients" value={<AnimatedCounter value={stats.totalPatients} />} icon={Users} colorClass="bg-blue-500 text-blue-600" delay={0.1} />
        <StatCard title="Active Medicines" value={<AnimatedCounter value={stats.totalMedicines} />} icon={Pill} colorClass="bg-indigo-500 text-indigo-600" delay={0.2} />
        <StatCard title="Total Alerts" value={<AnimatedCounter value={totalAlerts} />} icon={AlertTriangle} colorClass={totalAlerts > 0 ? "bg-status-danger text-status-danger" : "bg-slate-500 text-slate-600"} delay={0.3} />
        <StatCard title="Today's Revenue" value={<AnimatedCounter value={stats.todayRevenue} prefix="₹" />} icon={IndianRupee} colorClass="bg-emerald-500 text-emerald-600" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }} className="bento-card lg:col-span-2 flex flex-col p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
          <div className="mb-6 flex justify-between items-center z-10">
            <div>
              <h2 className="text-xl font-bold text-text-main tracking-tight">Revenue Trend</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">7-Day Historical Ledger</p>
            </div>
          </div>
          <div className="w-full h-[350px] z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} labelStyle={{ fontWeight: '900', color: '#1E293B', marginBottom: '4px' }} formatter={(value) => [`₹${value}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 🔴 THE THREAT RADAR (Action Required) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }} className="bento-card flex flex-col p-0 overflow-hidden border-slate-200/60 shadow-xl shadow-slate-200/40 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-status-danger via-status-warning to-status-danger animate-pulse z-20"></div>
          
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 z-10 relative">
            <h2 className="text-xl font-bold text-text-main tracking-tight flex items-center gap-2">
              <ShieldAlert size={20} className="text-status-danger" /> Action Required
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">System Warnings</p>
          </div>

          {/* Threat Radar Tabs */}
          <div className="flex border-b border-slate-100 bg-surface z-10 relative">
            <button onClick={() => setActiveAlertTab('stock')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors border-b-2 ${activeAlertTab === 'stock' ? 'border-primary text-primary bg-primary-light/5' : 'border-transparent text-slate-400 hover:bg-slate-50'}`}>
              Stock ({stats.lowStockItems.length})
            </button>
            <button onClick={() => setActiveAlertTab('expiry')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors border-b-2 ${activeAlertTab === 'expiry' ? 'border-status-danger text-status-danger bg-red-50/50' : 'border-transparent text-slate-400 hover:bg-slate-50'}`}>
              Expiry ({stats.expiringItems.length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface z-10 relative">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: LOW STOCK */}
              {activeAlertTab === 'stock' && (
                <motion.div key="stock" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
                  {stats.lowStockItems.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-center opacity-70">
                      <ShieldCheck size={40} className="text-status-success mb-3" />
                      <p className="font-bold text-text-main">Stock Levels Nominal</p>
                    </div>
                  ) : (
                    stats.lowStockItems.map((med) => (
                      <div key={med._id} className="flex items-center justify-between p-3.5 rounded-xl border border-amber-200/50 bg-amber-50/30 hover:bg-amber-50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform"><Pill size={16} className="text-status-warning" /></div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{med.name}</p>
                            <p className="text-xs font-black text-status-warning uppercase tracking-wider">Only {med.totalStock} left</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {/* TAB 2: EXPIRY RADAR */}
              {activeAlertTab === 'expiry' && (
                <motion.div key="expiry" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
                  {stats.expiringItems.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-center opacity-70">
                      <ShieldCheck size={40} className="text-status-success mb-3" />
                      <p className="font-bold text-text-main">No Expiry Threats Detected</p>
                    </div>
                  ) : (
                    stats.expiringItems.map((item, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors group ${item.status === 'EXPIRED' ? 'border-red-200 bg-red-50/80 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'border-amber-200/50 bg-amber-50/30'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform ${item.status === 'EXPIRED' ? 'animate-pulse' : ''}`}>
                            {item.status === 'EXPIRED' ? <AlertOctagon size={16} className="text-status-danger" /> : <Clock size={16} className="text-status-warning" />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm flex items-center gap-2">
                              {item.name}
                              <span className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-100">Batch {item.batchData.batchNumber}</span>
                            </p>
                            {item.status === 'EXPIRED' ? (
                              <p className="text-xs font-black text-status-danger uppercase tracking-wider mt-0.5">EXPIRED ({new Date(item.batchData.expiryDate).toLocaleDateString()})</p>
                            ) : (
                              <p className="text-xs font-black text-status-warning uppercase tracking-wider mt-0.5">Expires in {item.daysLeft} Days</p>
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