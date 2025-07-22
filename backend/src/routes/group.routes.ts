import { Router, type Request, type Response } from 'express';
import { Group } from '../models/group.model';

const router = Router();

// Get all groups
router.get('/', async (_req: Request, res: Response) => {
  const groups = await Group.find().populate('learners').populate('columns');
  res.json(groups);
});

// Get group by ID
router.get('/:id', async (req: Request, res: Response) => {
  const group = await Group.findById(req.params.id).populate('learners').populate('columns');
  if (!group) return res.status(404).json({ message: 'Group not found' });
  res.json(group);
});

// Create group
router.post('/', async (req: Request, res: Response) => {
  try {
    const group = new Group(req.body);
    await group.save();
    res.status(201).json(group);
  } catch (e) {
    if (e instanceof Error) {
      res.status(400).json({ message: e.message });
    }
  }
});

// Update group
router.put('/:id', async (req: Request, res: Response) => {
  const group = await Group.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!group) return res.status(404).json({ message: 'Group not found' });
  res.json(group);
});

// Delete group
router.delete('/:id', async (req: Request, res: Response) => {
  const group = await Group.findByIdAndDelete(req.params.id);
  if (!group) return res.status(404).json({ message: 'Group not found' });
  res.json({ message: 'Group deleted' });
});

export default router;