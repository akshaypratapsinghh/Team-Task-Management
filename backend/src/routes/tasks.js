const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

const router = express.Router();
router.use(authenticate);

router.post('/project/:projectId', authorize('admin'), async (req, res) => {
  const { projectId } = req.params;
  const { title, description, dueDate, assigneeEmail } = req.body;
  if (!title || !assigneeEmail) {
    return res.status(400).json({ error: 'Task title and assignee email are required' });
  }

  try {
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const assignee = await User.findOne({ where: { email: assigneeEmail } });
    if (!assignee) {
      return res.status(404).json({ error: 'Assignee user not found' });
    }
    if (!project.memberIds.includes(assignee.id) && project.ownerId !== assignee.id) {
      return res.status(400).json({ error: 'Assignee must be part of the project team' });
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      projectId,
      assigneeId: assignee.id
    });
    return res.status(201).json({ task });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to create task' });
  }
});

router.get('/project/:projectId', async (req, res) => {
  const { projectId } = req.params;
  try {
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    if (req.user.role !== 'admin' && project.ownerId !== req.user.id && !project.memberIds.includes(req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const tasks = await Task.findAll({ where: { projectId }, include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }] });
    return res.json({ tasks });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to fetch tasks' });
  }
});

router.patch('/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { status, title, description, dueDate } = req.body;
  try {
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const project = await Project.findByPk(task.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const canEdit = req.user.role === 'admin' || req.user.id === task.assigneeId;
    if (!canEdit) {
      return res.status(403).json({ error: 'Not allowed to update this task' });
    }
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate) task.dueDate = dueDate;
    if (status) task.status = status;
    await task.save();
    return res.json({ task });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to update task' });
  }
});

module.exports = router;
