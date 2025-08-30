import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../config/database';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all contacts for user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const db = Database.getInstance();
    const contacts = await db.all(
      'SELECT * FROM contacts WHERE user_id = ? ORDER BY name',
      [req.user!.id]
    );

    // Parse JSON fields
    const parsedContacts = contacts.map(contact => ({
      ...contact,
      group_ids: JSON.parse(contact.group_ids || '[]'),
      tags: JSON.parse(contact.tags || '[]')
    }));

    res.json({ success: true, data: parsedContacts });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create contact
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
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

    const db = Database.getInstance();
    const contactId = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO contacts (
        id, name, email, phone, company, position, group_ids,
        tags, notes, last_contact_date, user_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        contactId,
        name,
        email,
        phone,
        company || null,
        position || null,
        JSON.stringify(group_ids || []),
        JSON.stringify(tags || []),
        notes || null,
        last_contact_date || null,
        req.user!.id,
        now,
        now
      ]
    );

    const contact = await db.get('SELECT * FROM contacts WHERE id = ?', [contactId]);
    
    res.status(201).json({ 
      success: true, 
      data: {
        ...contact,
        group_ids: JSON.parse(contact.group_ids || '[]'),
        tags: JSON.parse(contact.tags || '[]')
      }
    });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update contact
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
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

    const db = Database.getInstance();
    const now = new Date().toISOString();

    await db.run(
      `UPDATE contacts SET 
        name = ?, email = ?, phone = ?, company = ?, position = ?,
        group_ids = ?, tags = ?, notes = ?, last_contact_date = ?, updated_at = ?
      WHERE id = ? AND user_id = ?`,
      [
        name,
        email,
        phone,
        company,
        position,
        JSON.stringify(group_ids || []),
        JSON.stringify(tags || []),
        notes,
        last_contact_date,
        now,
        req.params.id,
        req.user!.id
      ]
    );

    const contact = await db.get('SELECT * FROM contacts WHERE id = ?', [req.params.id]);
    
    res.json({ 
      success: true, 
      data: {
        ...contact,
        group_ids: JSON.parse(contact.group_ids || '[]'),
        tags: JSON.parse(contact.tags || '[]')
      }
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete contact
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const db = Database.getInstance();
    
    await db.run(
      'DELETE FROM contacts WHERE id = ? AND user_id = ?',
      [req.params.id, req.user!.id]
    );

    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search contacts
router.get('/search', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const db = Database.getInstance();
    const contacts = await db.all(
      `SELECT * FROM contacts 
       WHERE user_id = ? AND (
         name LIKE ? OR email LIKE ? OR phone LIKE ? OR company LIKE ?
       )
       ORDER BY name`,
      [req.user!.id, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`]
    );

    // Parse JSON fields
    const parsedContacts = contacts.map(contact => ({
      ...contact,
      group_ids: JSON.parse(contact.group_ids || '[]'),
      tags: JSON.parse(contact.tags || '[]')
    }));

    res.json({ success: true, data: parsedContacts });
  } catch (error) {
    console.error('Search contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;