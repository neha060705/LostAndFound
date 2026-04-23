const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const verifyToken = require('../middleware/auth');

// GET /api/items/search?name=xyz  (must be before /:id)
router.get('/search', verifyToken, async (req, res) => {
  try {
    const { name, category } = req.query;
    let query = {};

    if (name) {
      query.itemName = { $regex: name, $options: 'i' };
    }
    if (category) {
      query.type = category;
    }

    const items = await Item.find(query).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error while searching items.' });
  }
});

// POST /api/items → Add item
router.post('/', verifyToken, async (req, res) => {
  try {
    const { itemName, description, type, location, date, contactInfo } = req.body;

    if (!itemName || !description || !type || !location || !date || !contactInfo) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const item = new Item({
      itemName,
      description,
      type,
      location,
      date,
      contactInfo,
      postedBy: req.user.id,
      postedByName: req.user.name
    });

    await item.save();
    res.status(201).json({ message: 'Item reported successfully!', item });
  } catch (err) {
    res.status(500).json({ message: 'Server error while adding item.' });
  }
});

// GET /api/items → View all items
router.get('/', verifyToken, async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching items.' });
  }
});

// GET /api/items/:id → View item by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching item.' });
  }
});

// PUT /api/items/:id → Update item
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    // Only owner can update
    if (item.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized. You can only update your own items.' });
    }

    const { itemName, description, type, location, date, contactInfo } = req.body;

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { itemName, description, type, location, date, contactInfo },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Item updated successfully!', item: updatedItem });
  } catch (err) {
    res.status(500).json({ message: 'Server error while updating item.' });
  }
});

// DELETE /api/items/:id → Delete item
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    // Only owner can delete
    if (item.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized. You can only delete your own items.' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error while deleting item.' });
  }
});

module.exports = router;
