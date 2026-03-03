// const mongoose = require('mongoose');

// const patientSchema = mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   age: {
//     type: Number,
//     required: true
//   },
//   gender: {
//     type: String,
//     enum: ['Male', 'Female', 'Other'],
//     required: true
//   },
//   mobile: {
//     type: String,
//     required: true
//   },
//   // Useful for returning patients
//   visits: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Bill'
//   }]
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('Patient', patientSchema);

const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    // --- 1. BASIC IDENTITY ---
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      trim: true,
    },
    age: { type: Number },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    address: { type: String },

    // --- 2. CLINICAL PROFILE (Premium Additions) ---
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown'
    },
    allergies: {
      type: [String], // Array of strings (e.g., ["Penicillin", "Peanuts"])
      default: []
    },
    chronicConditions: {
      type: [String], // Array of strings (e.g., ["Diabetes Type 2", "Hypertension"])
      default: []
    },
    notes: {
      type: String, // Front desk remarks
    },

    // --- 3. CRM & FINANCIAL METRICS ---
    status: {
      type: String,
      enum: ['Active', 'Discharged'],
      default: 'Active',
    },
    membershipTier: {
      type: String,
      enum: ['Standard', 'Silver', 'Gold', 'Platinum'],
      default: 'Standard',
    },
    totalLifetimeSpent: {
      type: Number,
      default: 0, // This will auto-increment when they buy things!
    },
    lastVisit: {
      type: Date,
      default: Date.now,
    },
    
    // --- 4. SYSTEM CONTROL ---
    isDeleted: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Patient', patientSchema);