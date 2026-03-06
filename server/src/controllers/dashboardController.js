const Patient = require('../models/Patient');
const Medicine = require('../models/Medicine');
const Bill = require('../models/Bill');

// Helper to get local YYYY-MM-DD safely
const getLocalDateString = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Get aggregated dashboard statistics
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(today.getDate() + 90);

    // Pad by 8 days to ensure we don't miss any UTC/IST boundary edge cases
    const queryStartDate = new Date(today);
    queryStartDate.setDate(today.getDate() - 8);

    // Run all database queries concurrently
    const [
      totalPatients,
      activePatients,
      totalMedicines,
      lowStockItems,
      expiringMedicinesData,
      tierDataAgg,
      topVIPs,
      weeklyBills
    ] = await Promise.all([
      Patient.countDocuments(),
      Patient.countDocuments({ status: 'Active' }),
      Medicine.countDocuments({ isDeleted: false }),
      Medicine.find({ totalStock: { $lt: 50 }, isDeleted: false }).select('name totalStock'),
      Medicine.find({
        isDeleted: false,
        batches: { $elemMatch: { quantity: { $gt: 0 }, expiryDate: { $lte: ninetyDaysFromNow } } }
      }).select('name batches'),
      Patient.aggregate([
        { $group: { _id: "$membershipTier", count: { $sum: 1 } } }
      ]),
      Patient.find().sort({ totalLifetimeSpent: -1 }).limit(5).select('name mobile membershipTier totalLifetimeSpent'),
      // FIX: Fetch both grandTotal AND legacy totalAmount
      Bill.find({ createdAt: { $gte: queryStartDate } }).select('createdAt grandTotal totalAmount patient')
    ]);

    // Format Expiry Radar
    const expiringItems = [];
    expiringMedicinesData.forEach(med => {
      med.batches.forEach(batch => {
        if (batch.quantity > 0 && batch.expiryDate) {
          const expDate = new Date(batch.expiryDate);
          if (expDate <= ninetyDaysFromNow) {
            const diffTime = Math.abs(expDate - today);
            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            expiringItems.push({
              _id: med._id,
              name: med.name,
              batchData: batch,
              daysLeft: expDate < today ? 0 : daysLeft,
              status: expDate < today ? 'EXPIRED' : 'WARNING'
            });
          }
        }
      });
    });
    expiringItems.sort((a, b) => a.daysLeft - b.daysLeft);

    // Format Weekly Chart Data exactly like the frontend did
    const chartMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = getLocalDateString(d); 
      chartMap[dateStr] = { 
        name: d.toLocaleDateString('en-US', { weekday: 'short' }), 
        revenue: 0 
      };
    }

    let todayRevenue = 0;
    const todayStr = getLocalDateString(today);

    weeklyBills.forEach(bill => {
      const billDate = new Date(bill.createdAt);
      const dateStr = getLocalDateString(billDate); 
      
      // FIX: The Failsafe. If grandTotal is missing on old records, use totalAmount!
      const billRevenue = Number(bill.grandTotal || bill.totalAmount || 0);
      
      if (chartMap[dateStr]) {
        chartMap[dateStr].revenue += billRevenue;
      }
      if (dateStr === todayStr) {
        todayRevenue += billRevenue;
      }
    });

    const tierData = tierDataAgg.map(t => ({ name: t._id || 'Standard', count: t.count }));

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        activePatients,
        totalMedicines,
        todayRevenue,
        lowStockItems,
        expiringItems,
        chartData: Object.values(chartMap),
        tierData,
        topVIPs
      }
    });

  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ success: false, message: 'Dashboard aggregation failed' });
  }
};

module.exports = { getDashboardStats };