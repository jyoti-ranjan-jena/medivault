const mongoose = require('mongoose');

const billSchema = mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  soldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  items: [{
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: String,
    quantity: Number,
    price: Number,
    amount: Number
  }],
  // --- NEW FINANCIAL ARCHITECTURE ---
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    required: true,
    default: 0
  },
  // ----------------------------------
  paymentMode: {
    type: String,
    enum: ['Cash', 'Card', 'UPI'],
    default: 'Cash'
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// --- TRACK C: ENTERPRISE INDEXING ---
billSchema.index({ createdAt: -1 }); // Critical for fast Dashboard chart rendering
billSchema.index({ patient: 1 });

module.exports = mongoose.model('Bill', billSchema);