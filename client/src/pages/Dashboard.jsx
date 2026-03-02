import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Users, Pill, AlertTriangle, TrendingUp, Activity, IndianRupee, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- THE ANIMATION ENGINE ---
const AnimatedCounter = ({ value, prefix = "" }) => {
  const spring = useSpring(0, { stiffness: 70, damping: 25, restDelta: 0.01 });
  const display = useTransform(spring, (current) => `${prefix}${Math.round(current).toLocaleString()}`);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
};

// --- THE TIMEZONE-SAFE HELPER ---
const getLocalDateString = (dateObj) => {
  const d = new Date(dateObj);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

// --- THE ANALYTICS ENGINE ---
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
      // 🔴 FIX: Airtight math fallback 
      dayRecord.revenue += Number(bill.grandTotal || bill.totalAmount || 0);
      if (bill.patient) {
        dayRecord.uniquePatients.add(bill.patient._id || bill.patient);
      }
    }
  });

  return last7Days.map(d => ({
    name: d.name,
    revenue: d.revenue,
    patients: d.uniquePatients.size
  }));
};

// Reusable Stat Card Component
const StatCard = ({ title, value, icon: Icon, colorClass, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}
    className="bento-card flex flex-col justify-between group hover:shadow-xl transition-all duration-300"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 backdrop-blur-sm group-hover:scale-110 transition-transform`}>
        <Icon size={24} className={colorClass.replace('bg-', 'text-').split(' ')[0]} />
      </div>
    </div>
    <div>
      <h3 className="text-3xl font-extrabold text-text-main tracking-tight tabular-nums">{value}</h3>
      <p className="text-sm font-medium text-text-muted mt-1">{title}</p>
    </div>
  </motion.div>
);

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalMedicines: 0,
    lowStockItems: [],
    todayRevenue: 0,
    chartData: [],
    loading: true
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [patientsRes, medicinesRes, billsRes] = await Promise.all([
          api.get('/patients'),
          api.get('/medicines'),
          api.get('/bills') 
        ]);

        const patients = patientsRes.data.data;
        const medicines = medicinesRes.data.data;
        const bills = billsRes.data.data;

        // 1. Calculate Low Stock
        const lowStock = medicines.filter(med => med.totalStock < 50);

        // 2. TIMEZONE-SAFE & MATH-SAFE Revenue Calculation
        const todayStr = getLocalDateString(new Date());
        const todayBills = bills.filter(b => getLocalDateString(new Date(b.createdAt)) === todayStr);
        // 🔴 FIX: Exact same fallback math as the chart
        const revenueToday = todayBills.reduce((sum, bill) => sum + Number(bill.grandTotal || bill.totalAmount || 0), 0);

        // 3. Calculate 7-Day Chart Data
        const weeklyChartData = processWeeklyData(bills);

        setStats({
          totalPatients: patients.length,
          totalMedicines: medicines.length,
          lowStockItems: lowStock,
          todayRevenue: revenueToday,
          chartData: weeklyChartData,
          loading: false
        });
      } catch (error) {
        console.error("Failed to load dashboard data", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardData();
  }, []);

  if (stats.loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Header Section */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-text-main tracking-tight">System Overview</h1>
          <p className="text-text-muted font-medium mt-1 flex items-center gap-2">
            <Activity size={16} className="text-primary" />
            Live metrics for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </motion.div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Registered Patients" 
          value={<AnimatedCounter value={stats.totalPatients} />} 
          icon={Users} 
          colorClass="bg-blue-500 text-blue-600" 
          delay={0.1} 
        />
        <StatCard 
          title="Active Medicines" 
          value={<AnimatedCounter value={stats.totalMedicines} />} 
          icon={Pill} 
          colorClass="bg-indigo-500 text-indigo-600" 
          delay={0.2} 
        />
        <StatCard 
          title="Critical Low Stock" 
          value={<AnimatedCounter value={stats.lowStockItems.length} />} 
          icon={AlertTriangle} 
          colorClass={stats.lowStockItems.length > 0 ? "bg-status-danger text-status-danger" : "bg-status-success text-status-success"} 
          delay={0.3} 
        />
        <StatCard 
          title="Today's Revenue" 
          value={<AnimatedCounter value={stats.todayRevenue} prefix="₹" />} 
          icon={IndianRupee} 
          colorClass="bg-emerald-500 text-emerald-600" 
          delay={0.4} 
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }} className="bento-card lg:col-span-2 flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-text-main">Revenue Trend</h2>
            <p className="text-sm text-text-muted font-medium">7-day historical analysis</p>
          </div>
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-bento)' }}
                  labelStyle={{ fontWeight: 'bold', color: 'var(--color-text-main)' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Action Required Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }} className="bento-card flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-text-main">Action Required</h2>
              <p className="text-sm text-text-muted font-medium">Low stock alerts</p>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${stats.lowStockItems.length > 0 ? 'bg-red-50 text-status-danger' : 'bg-emerald-50 text-status-success'}`}>
              {stats.lowStockItems.length}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {stats.lowStockItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                <ShieldCheck size={48} className="text-status-success mb-3" />
                <p className="font-bold text-text-main">Inventory Healthy</p>
                <p className="text-sm text-text-muted">No low stock warnings.</p>
              </div>
            ) : (
              stats.lowStockItems.map((med) => (
                <div key={med._id} className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Pill size={16} className="text-status-danger" />
                    </div>
                    <div>
                      <p className="font-bold text-text-main text-sm">{med.name}</p>
                      <p className="text-xs font-medium text-status-danger">Only {med.totalStock} left</p>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-primary hover:text-primary-hover px-3 py-1.5 bg-white rounded-lg shadow-sm transition-all hover:shadow">
                    Restock
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}