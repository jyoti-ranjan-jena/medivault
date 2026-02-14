require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load Models
const User = require('./src/models/User');
const Medicine = require('./src/models/Medicine');
const Patient = require('./src/models/Patient');

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// --- DUMMY DATA ---

const users = [
  {
    name: 'Staff Attendant',
    email: 'staff@medivault.com',
    password: 'password123', // Will be hashed below
    role: 'attendant'
  }
];

const patients = [
  { name: 'John Doe', age: 34, gender: 'Male', mobile: '9876543210', address: '123 Main St' },
  { name: 'Jane Smith', age: 28, gender: 'Female', mobile: '9876543211', address: '456 Elm St' },
  { name: 'Robert Brown', age: 45, gender: 'Male', mobile: '9876543212', address: '789 Oak St' },
  { name: 'Emily White', age: 60, gender: 'Female', mobile: '9876543213', address: '321 Pine St' },
  { name: 'Michael Green', age: 50, gender: 'Male', mobile: '9876543214', address: '654 Maple St' }
];

const medicines = [
  {
    name: 'Paracetamol 500mg',
    genericName: 'Acetaminophen',
    category: 'Tablet',
    manufacturer: 'GSK',
    batches: [
      { batchNumber: 'B1001', expiryDate: '2025-12-31', quantity: 100, buyPrice: 1.5, sellPrice: 2.0 },
      { batchNumber: 'B1002', expiryDate: '2026-06-30', quantity: 50, buyPrice: 1.6, sellPrice: 2.2 }
    ]
  },
  {
    name: 'Amoxicillin 250mg',
    genericName: 'Amoxicillin',
    category: 'Capsule',
    manufacturer: 'Sun Pharma',
    batches: [
      { batchNumber: 'A2020', expiryDate: '2024-10-15', quantity: 200, buyPrice: 3.0, sellPrice: 5.0 }
    ]
  },
  {
    name: 'Ibuprofen 400mg',
    genericName: 'Ibuprofen',
    category: 'Tablet',
    manufacturer: 'Abbott',
    batches: [
      { batchNumber: 'I3005', expiryDate: '2025-05-20', quantity: 150, buyPrice: 2.0, sellPrice: 3.5 }
    ]
  },
  {
    name: 'Cetirizine 10mg',
    genericName: 'Cetirizine',
    category: 'Tablet',
    manufacturer: 'Cipla',
    batches: [
      { batchNumber: 'C4010', expiryDate: '2026-01-10', quantity: 300, buyPrice: 1.0, sellPrice: 1.5 }
    ]
  },
  {
    name: 'Cough Syrup 100ml',
    genericName: 'Dextromethorphan',
    category: 'Syrup',
    manufacturer: 'Dr. Reddy',
    batches: [
      { batchNumber: 'S5050', expiryDate: '2025-08-01', quantity: 50, buyPrice: 45.0, sellPrice: 60.0 }
    ]
  },
  {
    name: 'Vitamin C 500mg',
    genericName: 'Ascorbic Acid',
    category: 'Tablet',
    manufacturer: 'Limcee',
    batches: [
      { batchNumber: 'V6001', expiryDate: '2025-11-11', quantity: 500, buyPrice: 1.2, sellPrice: 1.8 }
    ]
  },
  {
    name: 'Azithromycin 500mg',
    genericName: 'Azithromycin',
    category: 'Tablet',
    manufacturer: 'Zydus',
    batches: [
      { batchNumber: 'AZ700', expiryDate: '2025-03-15', quantity: 80, buyPrice: 10.0, sellPrice: 15.0 }
    ]
  },
  {
    name: 'Metformin 500mg',
    genericName: 'Metformin',
    category: 'Tablet',
    manufacturer: 'USV',
    batches: [
      { batchNumber: 'M8008', expiryDate: '2027-01-01', quantity: 400, buyPrice: 2.0, sellPrice: 3.0 }
    ]
  },
  {
    name: 'Pantoprazole 40mg',
    genericName: 'Pantoprazole',
    category: 'Tablet',
    manufacturer: 'Alkem',
    batches: [
      { batchNumber: 'P9009', expiryDate: '2025-09-30', quantity: 250, buyPrice: 4.0, sellPrice: 6.0 }
    ]
  },
  {
    name: 'Insulin Injection',
    genericName: 'Insulin Human',
    category: 'Injection',
    manufacturer: 'Biocon',
    batches: [
      { batchNumber: 'IN101', expiryDate: '2024-12-31', quantity: 20, buyPrice: 150.0, sellPrice: 200.0 }
    ]
  }
];

// --- EXECUTION ---

const importData = async () => {
  try {
    // 1. Clear existing data
    await User.deleteMany({ role: 'attendant' }); // Keep admin, delete staff
    await Medicine.deleteMany();
    await Patient.deleteMany();
    
    console.log('🧹 Data Cleared...');

    // 2. Insert Users (Hash password first)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(users[0].password, salt);
    users[0].password = hashedPassword;
    
    await User.insertMany(users);
    console.log('👤 Staff User Added...');

    // 3. Insert Patients
    await Patient.insertMany(patients);
    console.log('xh Patients Added...');

    // 4. Insert Medicines
    // Note: totalStock is auto-calculated by pre-save hook, 
    // but insertMany skips hooks. We calculate it manually here.
    const medicinesWithStock = medicines.map(med => {
      const total = med.batches.reduce((acc, b) => acc + b.quantity, 0);
      return { ...med, totalStock: total };
    });

    await Medicine.insertMany(medicinesWithStock);
    console.log('💊 Medicines Added...');

    console.log('✅ Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Medicine.deleteMany();
    await Patient.deleteMany();
    console.log('🧨 Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// Check command line argument
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}