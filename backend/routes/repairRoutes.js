const express = require('express');
const Repair = require('../models/Repair');
s
const router = express.Router();

// POST - Create repair request
router.post('/', async (req, res) => {
  try {
    const newRepair = new Repair(req.body);
    await newRepair.save();
    res.status(201).json({ success: true, message: 'Repair request submitted', data: newRepair });
  } catch (error) {
    console.error('Repair request error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to submit repair request' });
  }
});

// GET - All repair requests
router.get('/api/v1/repairs', async (req, res) => {
  try {
    const repairs = await Repair.find().sort({ createdAt: -1 });
    res.status(200).json({ data: repairs });
  } catch (err) {
    console.error('Failed to fetch repairs:', err);
    res.status(500).json({ error: 'Failed to fetch repairs' });
  }
});

// GET - Single repair by ID
router.get('/:id', async (req, res) => {
  try {
    const repair = await Repair.findById(req.params.id);
    if (!repair) return res.status(404).json({ error: 'Repair request not found' });
    res.json(repair);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch repair request' });
  }
});

// PUT - Update repair status
router.put('/:id', async (req, res) => {
  try {
    const updated = await Repair.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Repair request not found' });
    res.json({ message: 'Repair updated', data: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update repair request' });
  }
});

// DELETE - Remove repair
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Repair.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Repair request not found' });
    res.json({ message: 'Repair request deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete repair request' });
  }
});

// PATCH - Update repair status
router.patch('/api/v1/repairs/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Repair.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Repair not found' });
    res.status(200).json({ message: 'Status updated', data: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});


module.exports = router;
