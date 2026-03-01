import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Users, Pill, AlertTriangle, TrendingUp, Activity, IndianRupee } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock Data for the Chart (We will replace this with real backend data later)
const weeklyData = [
  { name: 'Mon', revenue: 4000, patients: 24 },
  { name: 'Tue', revenue: 3000, patients: 18 },
  { name: 'Wed', revenue: 5500, patients: 35 },
  { name: 'Thu', revenue: 4500, patients: 28 },
  { name: 'Fri', revenue: 6000, patients: 42 },
  { name: 'Sat', revenue: 7000, patients: 50 },
  { name: 'Sun', revenue: 5000, patients: 30 },
];

// Reusable Stat Card Component
const StatCard = ({ title, value, icon: Icon, colorClass, trend, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bento-card flex flex-col justify-between"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 backdrop-blur-sm`}>
        <Icon size={24} className={colorClass.replace('bg-', 'text-').split(' ')[0]} />
      </div>
      {trend && (
        <span className="flex items-center gap-1 text-sm font-bold text-status-success bg-emerald-50 px-2 py-1 rounded-lg">
          <TrendingUp size={14} /> {trend}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-3xl font-extrabold text-text-main tracking-tight">{value}</h3>
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
    loading: true
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch real data from your backend!
        const [patientsRes, medicinesRes] = await Promise.all([
          api.get('/patients'),
          api.get('/medicines')
        ]);

        const patients = patientsRes.data.data;
        const medicines = medicinesRes.data.data;

        // Calculate Low Stock (Any medicine with total stock < 50)
        const lowStock = medicines.filter(med => med.totalStock < 50);

        setStats({
          totalPatients: patients.length,
          totalMedicines: medicines.length,
          lowStockItems: lowStock,
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
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex justify-between items-end"
      >
        <div>
          <h1 className="text-3xl font-bold text-text-main tracking-tight">System Overview</h1>
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
          value={stats.totalPatients} 
          icon={Users} 
          colorClass="bg-blue-500 text-blue-600" 
          trend="+12% this week"
          delay={0.1} 
        />
        <StatCard 
          title="Active Medicines" 
          value={stats.totalMedicines} 
          icon={Pill} 
          colorClass="bg-indigo-500 text-indigo-600" 
          delay={0.2} 
        />
        <StatCard 
          title="Critical Low Stock" 
          value={stats.lowStockItems.length} 
          icon={AlertTriangle} 
          colorClass={stats.lowStockItems.length > 0 ? "bg-red-500 text-red-600" : "bg-emerald-500 text-emerald-600"} 
          delay={0.3} 
        />
        <StatCard 
          title="Today's Revenue" 
          value="₹14,500" // Hardcoded until we build the backend analytics
          icon={IndianRupee} 
          colorClass="bg-emerald-500 text-emerald-600" 
          trend="+5%"
          delay={0.4} 
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Section (Takes up 2 columns) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bento-card lg:col-span-2 flex flex-col"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-text-main">Revenue vs Patient Traffic</h2>
            <p className="text-sm text-text-muted font-medium">7-day historical analysis</p>
          </div>
          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Action Required Section (Takes up 1 column) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bento-card flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-text-main">Action Required</h2>
              <p className="text-sm text-text-muted font-medium">Low stock alerts</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-red-50 text-status-danger flex items-center justify-center font-bold text-sm">
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