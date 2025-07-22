import { Router, type Request, type Response } from 'express';
import { Subject } from '../models/subject.model';

const router = Router();

// Get all subjects
router.get('/', async (_req: Request, res: Response) => {
  const subjects = await Subject.find().populate('gradingCriteria').populate('groups');
  res.json(subjects);
});

// Get subject by ID
router.get('/:id', async (req: Request, res: Response) => {
  const subject = await Subject.findById(req.params.id).populate('gradingCriteria').populate('groups');
  if (!subject) return res.status(404).json({ message: 'Subject not found' });
  res.json(subject);
});

// Create subject
router.post('/', async (req: Request, res: Response) => {
  try {
    const subject = new Subject(req.body);
    await subject.save();
    res.status(201).json(subject);
  } catch (e) {
    if (e instanceof Error) {
      res.status(400).json({ message: e.message });
    }
  }
});

// Update subject
router.put('/:id', async (req: Request, res: Response) => {
  const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!subject) return res.status(404).json({ message: 'Subject not found' });
  res.json(subject);
});

// Delete subject
router.delete('/:id', async (req: Request, res: Response) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject) return res.status(404).json({ message: 'Subject not found' });
  res.json({ message: 'Subject deleted' });
});

export default router;
