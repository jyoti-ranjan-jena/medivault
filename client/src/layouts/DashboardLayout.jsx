import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Pill, Users, Receipt, LogOut, Bell, Search, Settings, History } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, to }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
        isActive 
          ? 'bg-primary text-white shadow-md' 
          : 'text-text-muted hover:bg-slate-100 hover:text-text-main'
      }`
    }
  >
    <Icon size={20} />
    <span>{label}</span>
  </NavLink>
);

export default function DashboardLayout() {
  const { logout, user } = useContext(AuthContext);

  // Define routes and who is allowed to see them
  const navigationLinks = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard, roles: ['admin', 'attendant', 'pharmacist'] },
    { name: 'Inventory', to: '/inventory', icon: Pill, roles: ['admin', 'attendant', 'pharmacist'] },
    { name: 'Patients', to: '/patients', icon: Users, roles: ['admin', 'attendant'] },
    { name: 'Billing POS', to: '/billing', icon: Receipt, roles: ['admin', 'attendant'] },
    { name: 'Transaction History', to: '/transactions', icon: History, roles: ['admin', 'attendant'] },
    { name: 'System Settings', to: '/settings', icon: Settings, roles: ['admin'] }, // ONLY ADMIN
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* 1. SIDEBAR */}
      <aside className="w-64 bg-surface border-r border-slate-100 flex flex-col hidden md:flex">
        <div className="h-20 flex items-center px-8 border-b border-slate-50">
          <div className="flex items-center gap-2 text-primary">
            <Pill size={28} className="fill-primary-light" />
            <span className="text-xl font-bold tracking-tight text-text-main">MediVault</span>
          </div>
        </div>

        {/* Dynamic Navigation Links based on Role */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationLinks.map((link) => {
            // Check if user's role exists in the allowed roles array
            if (user && link.roles.includes(user.role)) {
              return <SidebarItem key={link.name} icon={link.icon} label={link.name} to={link.to} />;
            }
            return null; // Don't render if not allowed
          })}
        </nav>

        {/* User / Logout Area */}
        <div className="p-4 border-t border-slate-100">
          <div className="mb-4 px-4">
            <p className="text-sm font-bold text-text-main truncate">{user?.name}</p>
            <p className="text-xs font-medium text-text-muted capitalize">{user?.role} Account</p>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-status-danger hover:bg-red-50 transition-colors font-medium"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ... (Keep the rest of your Header and Main Content Outlet the same) ... */}
      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-surface border-b border-slate-100 flex items-center justify-between px-8 z-10">
          {/* Global Search */}
          <div className="relative w-96 hidden lg:block">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search medicines, patients... (Cmd+K)"
              className="w-full pl-10 pr-4 py-2.5 bg-background border-none rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-shadow"
            />
          </div>

          {/* Profile & Notifications */}
          <div className="flex items-center gap-4 ml-auto">
            <button className="relative p-2 text-text-muted hover:text-text-main hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-status-danger rounded-full border-2 border-surface"></span>
            </button>
            <div className="h-10 w-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold border-2 border-surface shadow-sm">
              AD
            </div>
          </div>
        </header>

        {/* 3. DYNAMIC PAGE CONTENT (The Outlet) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}