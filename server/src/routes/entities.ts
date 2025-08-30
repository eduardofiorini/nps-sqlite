import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../config/database';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = express.Router();

// Generic CRUD for sources, situations, and groups
const createEntityRoutes = (tableName: string) => {
  const entityRouter = express.Router();

  // Get all entities
  entityRouter.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const db = Database.getInstance();
      const entities = await db.all(
        `SELECT * FROM ${tableName} WHERE user_id = ? ORDER BY name`,
        [req.user!.id]
      );

      res.json({ success: true, data: entities });
    } catch (error) {
      console.error(`Get ${tableName} error:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create entity
  entityRouter.post('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { name, description, color } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const db = Database.getInstance();
      const entityId = uuidv4();
      const now = new Date().toISOString();

      const columns = ['id', 'name', 'user_id', 'created_at', 'updated_at'];
      const values = [entityId, name, req.user!.id, now, now];

      if (description !== undefined) {
        columns.push('description');
        values.push(description);
      }

      if (color !== undefined) {
        columns.push('color');
        values.push(color);
      }

      const placeholders = columns.map(() => '?').join(', ');

      await db.run(
        `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`,
        values
      );

      const entity = await db.get(`SELECT * FROM ${tableName} WHERE id = ?`, [entityId]);
      
      res.status(201).json({ success: true, data: entity });
    } catch (error) {
      console.error(`Create ${tableName} error:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update entity
  entityRouter.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { name, description, color } = req.body;

      const db = Database.getInstance();
      const now = new Date().toISOString();

      const updates = ['name = ?', 'updated_at = ?'];
      const values = [name, now];

      if (description !== undefined) {
        updates.push('description = ?');
        values.push(description);
      }

      if (color !== undefined) {
        updates.push('color = ?');
        values.push(color);
      }

      values.push(req.params.id, req.user!.id);

      await db.run(
        `UPDATE ${tableName} SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
        values
      );

      const entity = await db.get(`SELECT * FROM ${tableName} WHERE id = ?`, [req.params.id]);
      
      res.json({ success: true, data: entity });
    } catch (error) {
      console.error(`Update ${tableName} error:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete entity
  entityRouter.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const db = Database.getInstance();
      
      await db.run(
        `DELETE FROM ${tableName} WHERE id = ? AND user_id = ?`,
        [req.params.id, req.user!.id]
      );

      res.json({ success: true, message: `${tableName.slice(0, -1)} deleted successfully` });
    } catch (error) {
      console.error(`Delete ${tableName} error:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return entityRouter;
};

// Mount entity routes
router.use('/sources', createEntityRoutes('sources'));
router.use('/situations', createEntityRoutes('situations'));
router.use('/groups', createEntityRoutes('groups'));

export default router;