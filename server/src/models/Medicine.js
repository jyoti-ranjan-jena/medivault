const mongoose = require('mongoose');

const batchSchema = mongoose.Schema({
  batchNumber: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  quantity: { type: Number, required: true, min: 0 },
  buyPrice: { type: Number, required: true }, // Cost to hospital
  sellPrice: { type: Number, required: true }, // Cost to patient
}, { _id: true }); // Each batch gets a unique ID

const medicineSchema = mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Please add medicine name'], 
    trim: true 
  },
  genericName: { type: String }, // e.g., Acetaminophen
  category: { 
    type: String, 
    enum: ['Tablet', 'Syrup', 'Injection', 'Surgical', 'Drops'],
    required: true 
  },
  manufacturer: { type: String, required: true },
  
  // Embedded Batches - The "Smart" Way
  batches: [batchSchema],
  
  // Total stock is calculated automatically
  totalStock: { 
    type: Number, 
    default: 0 
  },
  
  minLevel: { 
    type: Number, 
    default: 10 // Alert if stock goes below this
  },
  
  // Soft Delete (Never actually delete medical records)
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Middleware: Auto-calculate total stock before saving
medicineSchema.pre('save', function(next) {
  if (this.batches) {
    this.totalStock = this.batches.reduce((acc, batch) => acc + batch.quantity, 0);
  }
  next();
});

module.exports = mongoose.model('Medicine', medicineSchema);