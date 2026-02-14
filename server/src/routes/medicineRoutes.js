const express = require('express');
const router = express.Router();
const { getMedicines, addMedicine, addBatch } = require('../controllers/medicineController');
// We will need a middleware to protect these routes soon!

router.route('/')
  .get(getMedicines)
  .post(addMedicine); // TODO: Protect this

router.route('/:id/batch')
  .put(addBatch);     // TODO: Protect this

module.exports = router;