const express = require('express');
const { Contact } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Get all contacts for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const contacts = await Contact.findAll({
      where: { user_id: req.user.id },
      order: [['name', 'ASC']]
    });

    res.json({ success: true, data: contacts });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create contact
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      position,
      group_ids,
      tags,
      notes,
      last_contact_date
    } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email and phone are required' });
    }

    const contact = await Contact.create({
      name,
      email,
      phone,
      company,
      position,
      group_ids: group_ids || [],
      tags: tags || [],
      notes,
      last_contact_date,
      user_id: req.user.id
    });

    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update contact
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      position,
      group_ids,
      tags,
      notes,
      last_contact_date
    } = req.body;

    const contact = await Contact.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    await contact.update({
      name,
      email,
      phone,
      company,
      position,
      group_ids: group_ids || [],
      tags: tags || [],
      notes,
      last_contact_date
    });

    res.json({ success: true, data: contact });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete contact
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const contact = await Contact.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    await contact.destroy();

    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search contacts
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const contacts = await Contact.findAll({
      where: {
        user_id: req.user.id,
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } },
          { phone: { [Op.like]: `%${q}%` } },
          { company: { [Op.like]: `%${q}%` } }
        ]
      },
      order: [['name', 'ASC']]
    });

    res.json({ success: true, data: contacts });
  } catch (error) {
    console.error('Search contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;