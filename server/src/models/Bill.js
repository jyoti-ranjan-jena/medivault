// const mongoose = require('mongoose');

// const billItemSchema = mongoose.Schema({
//   medicine: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Medicine',
//     required: true
//   },
//   name: { type: String, required: true }, // Store name snapshot in case Medicine is deleted
//   batchId: { type: String, required: true }, // Specific batch sold
//   quantity: { type: Number, required: true },
//   price: { type: Number, required: true }, // Price AT TIME OF SALE
//   amount: { type: Number, required: true } // qty * price
// });

// const billSchema = mongoose.Schema({
//   patient: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Patient',
//     required: true
//   },
//   soldBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User', // The attendant who made the bill
//     required: true
//   },
//   items: [billItemSchema],
  
//   totalAmount: { type: Number, required: true },
//   discount: { type: Number, default: 0 },
//   grandTotal: { type: Number, required: true },
  
//   paymentMode: {
//     type: String,
//     enum: ['Cash', 'Card', 'UPI', 'Insurance'],
//     default: 'Cash'
//   },
  
//   notes: String
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('Bill', billSchema);

const mongoose = require('mongoose');

const billSchema = mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  // Link to the staff member who created the bill
  soldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  // Array of medicines sold
  items: [{
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true
    },
    name: String, // Snapshot of name
    quantity: Number,
    price: Number, // Snapshot of price at time of sale
    amount: Number
  }],
  totalAmount: Number,
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

module.exports = mongoose.model('Bill', billSchema);