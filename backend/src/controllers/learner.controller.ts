import type { Request, Response } from 'express';
import { Learner } from '../models/learner.model';

export const getAllLearners = async (_req: Request, res: Response) => {
  const learners = await Learner.find();
  res.json(learners);
};

export const getLearnerById = async (req: Request, res: Response) => {
  const learner = await Learner.findById(req.params.id);
  if (!learner) return res.status(404).json({ message: 'Learner not found' });
  res.json(learner);
};

export const createLearner = async (req: Request, res: Response) => {
  try {
    const learner = new Learner(req.body);
    await learner.save();
    res.status(201).json(learner);
  } catch (e) {
    if (e instanceof Error) {
      res.status(400).json({ message: e.message });
    }
  }
};

export const updateLearner = async (req: Request, res: Response) => {
  const learner = await Learner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!learner) return res.status(404).json({ message: 'Learner not found' });
  res.json(learner);
};

export const deleteLearner = async (req: Request, res: Response) => {
  const learner = await Learner.findByIdAndDelete(req.params.id);
  if (!learner) return res.status(404).json({ message: 'Learner not found' });
  res.json({ message: 'Learner deleted' });
};
