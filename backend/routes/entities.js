const express = require('express');
const { Source, Situation, Group } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Generic CRUD for sources, situations, and groups
const createEntityRoutes = (Model, entityName) => {
  const entityRouter = express.Router();

  // Get all entities
  entityRouter.get('/', authenticateToken, async (req, res) => {
    try {
      const entities = await Model.findAll({
        where: { user_id: req.user.id },
        order: [['name', 'ASC']]
      });

      res.json({ success: true, data: entities });
    } catch (error) {
      console.error(`Get ${entityName} error:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create entity
  entityRouter.post('/', authenticateToken, async (req, res) => {
    try {
      const { name, description, color } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const entityData = {
        name,
        user_id: req.user.id
      };

      if (description !== undefined) {
        entityData.description = description;
      }

      if (color !== undefined) {
        entityData.color = color;
      }

      const entity = await Model.create(entityData);
      
      res.status(201).json({ success: true, data: entity });
    } catch (error) {
      console.error(`Create ${entityName} error:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update entity
  entityRouter.put('/:id', authenticateToken, async (req, res) => {
    try {
      const { name, description, color } = req.body;

      const entity = await Model.findOne({
        where: { id: req.params.id, user_id: req.user.id }
      });

      if (!entity) {
        return res.status(404).json({ error: `${entityName} not found` });
      }

      const updateData = { name };

      if (description !== undefined) {
        updateData.description = description;
      }

      if (color !== undefined) {
        updateData.color = color;
      }

      await entity.update(updateData);
      
      res.json({ success: true, data: entity });
    } catch (error) {
      console.error(`Update ${entityName} error:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete entity
  entityRouter.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const entity = await Model.findOne({
        where: { id: req.params.id, user_id: req.user.id }
      });

      if (!entity) {
        return res.status(404).json({ error: `${entityName} not found` });
      }

      await entity.destroy();

      res.json({ success: true, message: `${entityName} deleted successfully` });
    } catch (error) {
      console.error(`Delete ${entityName} error:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return entityRouter;
};

// Mount entity routes
router.use('/sources', createEntityRoutes(Source, 'Source'));
router.use('/situations', createEntityRoutes(Situation, 'Situation'));
router.use('/groups', createEntityRoutes(Group, 'Group'));

module.exports = router;