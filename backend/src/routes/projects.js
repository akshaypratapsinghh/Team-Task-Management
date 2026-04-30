const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const projects = await Project.findAll();
    const filtered = req.user.role === 'admin'
      ? projects
      : projects.filter((project) => project.ownerId === req.user.id || project.memberIds.includes(req.user.id));
    return res.json({ projects: filtered });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to fetch projects' });
  }
});

router.post('/', authorize('admin'), async (req, res) => {
  const { name, description, memberEmails = [] } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  try {
    const members = await User.findAll({ where: { email: memberEmails } });
    const memberIds = members.map((user) => user.id);

    const project = await Project.create({
      name,
      description,
      ownerId: req.user.id,
      memberIds
    });

    return res.status(201).json({ project });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to create project' });
  }
});

router.get('/:projectId', async (req, res) => {
  const { projectId } = req.params;
  try {
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const members = await User.findAll({ where: { id: project.memberIds } });
    const tasks = await Task.findAll({ where: { projectId }, include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }] });

    if (req.user.role !== 'admin' && project.ownerId !== req.user.id && !project.memberIds.includes(req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    return res.json({ project, members, tasks });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to retrieve project' });
  }
});

router.patch('/:projectId/members', authorize('admin'), async (req, res) => {
  const { projectId } = req.params;
  const { memberEmails = [] } = req.body;
  try {
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const members = await User.findAll({ where: { email: memberEmails } });
    const memberIds = Array.from(new Set([...project.memberIds, ...members.map((user) => user.id)]));
    project.memberIds = memberIds;
    await project.save();
    return res.json({ project });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to update member list' });
  }
});

module.exports = router;
