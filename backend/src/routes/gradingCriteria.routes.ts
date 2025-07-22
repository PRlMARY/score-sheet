import { Router, type Request, type Response } from 'express';
import { GradingCriteria } from '../models/gradingCriteria.model';

const router = Router();

// Get all grading criteria
router.get('/', async (_req: Request, res: Response) => {
  const criteria = await GradingCriteria.find();
  res.json(criteria);
});

// Get grading criteria by ID
router.get('/:id', async (req: Request, res: Response) => {
  const criteria = await GradingCriteria.findById(req.params.id);
  if (!criteria) return res.status(404).json({ message: 'Grading criteria not found' });
  res.json(criteria);
});

// Create grading criteria
router.post('/', async (req: Request, res: Response) => {
  try {
    const criteria = new GradingCriteria(req.body);
    await criteria.save();
    res.status(201).json(criteria);
  } catch (e) {
    if (e instanceof Error) {
      res.status(400).json({ message: e.message });
    }
  }
});

// Update grading criteria
router.put('/:id', async (req: Request, res: Response) => {
  const criteria = await GradingCriteria.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!criteria) return res.status(404).json({ message: 'Grading criteria not found' });
  res.json(criteria);
});

// Delete grading criteria
router.delete('/:id', async (req: Request, res: Response) => {
  const criteria = await GradingCriteria.findByIdAndDelete(req.params.id);
  if (!criteria) return res.status(404).json({ message: 'Grading criteria not found' });
  res.json({ message: 'Grading criteria deleted' });
});

export default router;
