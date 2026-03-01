import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

// Placeholder Pages (Temporary)
// const Dashboard = () => <div className="bento-card"><h1 className="text-2xl font-bold">Dashboard</h1></div>;
const Inventory = () => <div className="bento-card"><h1 className="text-2xl font-bold">Inventory</h1></div>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" /> {/* Notifications */}
        
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="inventory" element={<Inventory />} />
              {/* Add patients and billing here later */}
            </Route>
          </Route>
        </Routes>
        
      </BrowserRouter>
    </AuthProvider>
  );
}