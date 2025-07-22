import type { Request, Response } from 'express';
import { GradingCriteria } from '../models/gradingCriteria.model';

export const getAllGradingCriteria = async (_req: Request, res: Response) => {
  const criteria = await GradingCriteria.find();
  res.json(criteria);
};

export const getGradingCriteriaById = async (req: Request, res: Response) => {
  const criteria = await GradingCriteria.findById(req.params.id);
  if (!criteria) return res.status(404).json({ message: 'Grading criteria not found' });
  res.json(criteria);
};

export const createGradingCriteria = async (req: Request, res: Response) => {
  try {
    const criteria = new GradingCriteria(req.body);
    await criteria.save();
    res.status(201).json(criteria);
  } catch (e) {
    if (e instanceof Error) {
      res.status(400).json({ message: e.message });
    }
  }
};

export const updateGradingCriteria = async (req: Request, res: Response) => {
  const criteria = await GradingCriteria.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!criteria) return res.status(404).json({ message: 'Grading criteria not found' });
  res.json(criteria);
};

export const deleteGradingCriteria = async (req: Request, res: Response) => {
  const criteria = await GradingCriteria.findByIdAndDelete(req.params.id);
  if (!criteria) return res.status(404).json({ message: 'Grading criteria not found' });
  res.json({ message: 'Grading criteria deleted' });
};
