import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import toast from "react-hot-toast";
import {
  Search,
  Plus,
  User,
  Phone,
  MapPin,
  Calendar,
  Activity,
  X,
} from "lucide-react";

const pageVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Patient Form State
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    age: "",
    gender: "Male",
    address: "",
  });

  // Fetch Patients
  const fetchPatients = async () => {
    try {
      const res = await api.get("/patients");
      setPatients(res.data.data);
    } catch (error) {
      toast.error("Failed to load patient directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Handle Search
  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mobile.includes(searchTerm),
  );

  // Handle Form Submit
  //   const handleAddPatient = async (e) => {
  //     e.preventDefault();
  //     setIsSubmitting(true);
  //     try {
  //       await api.post('/patients', {
  //         ...formData,
  //         age: Number(formData.age)
  //       });
  //       toast.success('Patient Registered Successfully!');
  //       setIsModalOpen(false);
  //       setFormData({ name: '', mobile: '', age: '', gender: 'Male', address: '' }); // Reset form
  //       fetchPatients(); // Refresh list
  //     } catch (error) {
  //       toast.error(error.response?.data?.message || 'Registration Failed');
  //     } finally {
  //       setIsSubmitting(false);
  //     }
  //   };
  // Handle Form Submit
  const handleAddPatient = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Send to backend
      const res = await api.post("/patients", {
        ...formData,
        age: Number(formData.age),
      });

      const newPatient = res.data.data; // The fresh patient from the database

      // 2. INSTANT UI UPDATE: Inject at the top of the array
      // This triggers Framer Motion's layout animations instantly!
      setPatients((prevPatients) => [newPatient, ...prevPatients]);

      toast.success("Patient Registered Successfully!");
      setIsModalOpen(false);
      setFormData({
        name: "",
        mobile: "",
        age: "",
        gender: "Male",
        address: "",
      }); // Reset form
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      {/* 1. Header Area */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-text-main tracking-tight">
            Patient Directory
          </h1>
          <p className="text-text-muted font-medium mt-1">
            Manage hospital records and patient details.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95"
        >
          <Plus size={18} />
          <span>Register Patient</span>
        </button>
      </motion.div>

      {/* 2. Controls Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative w-full max-w-md group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name or mobile number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-surface border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-text-main shadow-sm"
          />
        </div>
      </motion.div>

      {/* 3. Patients Grid */}
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <motion.div
                layout
                variants={itemVariants}
                key={patient._id}
                className="bento-card group hover:shadow-xl transition-all duration-300 border-slate-200/60 relative overflow-hidden"
              >
                {/* Decorative Top Accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary-light/30 text-primary flex items-center justify-center font-bold text-lg border border-primary/10">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-text-main text-lg leading-tight group-hover:text-primary transition-colors">
                      {patient.name}
                    </h3>
                    <p className="text-sm font-medium text-slate-400">
                      ID:{" "}
                      {patient._id
                        .substring(patient._id.length - 6)
                        .toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-sm font-medium text-text-muted">
                    <Phone size={16} className="text-slate-400" />
                    {patient.mobile}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-text-muted">
                    <Calendar size={16} className="text-slate-400" />
                    {patient.age} years • {patient.gender}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-text-muted">
                    <MapPin
                      size={16}
                      className="text-slate-400 flex-shrink-0"
                    />
                    <span className="truncate">
                      {patient.address || "No address provided"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-status-success bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                    <Activity size={14} /> Active
                  </span>
                  <button className="text-sm font-bold text-primary hover:text-primary-hover transition-colors">
                    View History
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 flex flex-col items-center justify-center opacity-70"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <User size={32} className="text-slate-400" />
              </div>
              <p className="text-xl font-bold text-text-main">
                No patients found
              </p>
              <p className="text-sm font-medium text-text-muted mt-1">
                Try adjusting your search or register a new patient.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 4. Glassmorphism Registration Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-surface rounded-2xl shadow-2xl z-50 overflow-hidden border border-slate-100"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                  <User size={20} className="text-primary" /> New Patient
                  Registration
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-status-danger hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddPatient} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-text-main"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Mobile Number
                    </label>
                    <input
                      required
                      type="tel"
                      pattern="[0-9]{10}"
                      value={formData.mobile}
                      onChange={(e) =>
                        setFormData({ ...formData, mobile: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-text-main"
                      placeholder="10-digit number"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">
                        Age
                      </label>
                      <input
                        required
                        type="number"
                        min="0"
                        max="120"
                        value={formData.age}
                        onChange={(e) =>
                          setFormData({ ...formData, age: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-text-main"
                        placeholder="Years"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">
                        Gender
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) =>
                          setFormData({ ...formData, gender: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-text-main cursor-pointer"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    rows="2"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-text-main resize-none"
                    placeholder="Residential address..."
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-lg shadow-primary/30 transition-all active:scale-95 flex justify-center items-center"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Save Patient"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
