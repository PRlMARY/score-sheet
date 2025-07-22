import type { Request, Response } from 'express';
import { Subject } from '../models/subject.model';

export const getAllSubjects = async (_req: Request, res: Response) => {
  const subjects = await Subject.find().populate('gradingCriteria').populate('groups');
  res.json(subjects);
};

export const getSubjectById = async (req: Request, res: Response) => {
  const subject = await Subject.findById(req.params.id).populate('gradingCriteria').populate('groups');
  if (!subject) return res.status(404).json({ message: 'Subject not found' });
  res.json(subject);
};

export const createSubject = async (req: Request, res: Response) => {
  try {
    const subject = new Subject(req.body);
    await subject.save();
    res.status(201).json(subject);
  } catch (e) {
    if (e instanceof Error) {
      res.status(400).json({ message: e.message });
    }
  }
};

export const updateSubject = async (req: Request, res: Response) => {
  const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!subject) return res.status(404).json({ message: 'Subject not found' });
  res.json(subject);
};

export const deleteSubject = async (req: Request, res: Response) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject) return res.status(404).json({ message: 'Subject not found' });
  res.json({ message: 'Subject deleted' });
};
