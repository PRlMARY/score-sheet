import { Router, type Request, type Response } from 'express';
import { Learner } from '../models/learner.model';

const router = Router();

// Get all learners
router.get('/', async (_req: Request, res: Response) => {
  const learners = await Learner.find();
  res.json(learners);
});

// Get learner by ID
router.get('/:id', async (req: Request, res: Response) => {
  const learner = await Learner.findById(req.params.id);
  if (!learner) return res.status(404).json({ message: 'Learner not found' });
  res.json(learner);
});

// Create learner
router.post('/', async (req: Request, res: Response) => {
  try {
    const learner = new Learner(req.body);
    await learner.save();
    res.status(201).json(learner);
  } catch (e) {
    if (e instanceof Error) {
      res.status(400).json({ message: e.message });
    }
  }
});

// Update learner
router.put('/:id', async (req: Request, res: Response) => {
  const learner = await Learner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!learner) return res.status(404).json({ message: 'Learner not found' });
  res.json(learner);
});

// Delete learner
router.delete('/:id', async (req: Request, res: Response) => {
  const learner = await Learner.findByIdAndDelete(req.params.id);
  if (!learner) return res.status(404).json({ message: 'Learner not found' });
  res.json({ message: 'Learner deleted' });
});

export default router;
