const mongoose = require('mongoose');

const patientSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  // Useful for returning patients
  visits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);