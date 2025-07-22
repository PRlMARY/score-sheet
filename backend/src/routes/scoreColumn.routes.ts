import { Router, type Request, type Response } from 'express';
import { ScoreColumn } from '../models/scoreColumn.model';

const router = Router();

// Get all score columns
router.get('/', async (_req: Request, res: Response) => {
  const columns = await ScoreColumn.find();
  res.json(columns);
});

// Get score column by ID
router.get('/:id', async (req: Request, res: Response) => {
  const column = await ScoreColumn.findById(req.params.id);
  if (!column) return res.status(404).json({ message: 'Score column not found' });
  res.json(column);
});

// Create score column
router.post('/', async (req: Request, res: Response) => {
  try {
    const column = new ScoreColumn(req.body);
    await column.save();
    res.status(201).json(column);
  } catch (e) {
    if (e instanceof Error) {
      res.status(400).json({ message: e.message });
    }
  }
});

// Update score column
router.put('/:id', async (req: Request, res: Response) => {
  const column = await ScoreColumn.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!column) return res.status(404).json({ message: 'Score column not found' });
  res.json(column);
});

// Delete score column
router.delete('/:id', async (req: Request, res: Response) => {
  const column = await ScoreColumn.findByIdAndDelete(req.params.id);
  if (!column) return res.status(404).json({ message: 'Score column not found' });
  res.json({ message: 'Score column deleted' });
});

export default router;
