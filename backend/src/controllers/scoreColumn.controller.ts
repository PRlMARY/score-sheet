import type { Request, Response } from 'express';
import { ScoreColumn } from '../models/scoreColumn.model';

export const getAllScoreColumns = async (_req: Request, res: Response) => {
  const columns = await ScoreColumn.find();
  res.json(columns);
};

export const getScoreColumnById = async (req: Request, res: Response) => {
  const column = await ScoreColumn.findById(req.params.id);
  if (!column) return res.status(404).json({ message: 'Score column not found' });
  res.json(column);
};

export const createScoreColumn = async (req: Request, res: Response) => {
  try {
    const column = new ScoreColumn(req.body);
    await column.save();
    res.status(201).json(column);
  } catch (e) {
    if (e instanceof Error) {
      res.status(400).json({ message: e.message });
    }
  }
};

export const updateScoreColumn = async (req: Request, res: Response) => {
  const column = await ScoreColumn.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!column) return res.status(404).json({ message: 'Score column not found' });
  res.json(column);
};

export const deleteScoreColumn = async (req: Request, res: Response) => {
  const column = await ScoreColumn.findByIdAndDelete(req.params.id);
  if (!column) return res.status(404).json({ message: 'Score column not found' });
  res.json({ message: 'Score column deleted' });
};
