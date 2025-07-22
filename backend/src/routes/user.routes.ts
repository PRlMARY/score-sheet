import e, { Router, type Request, type Response } from 'express';
import { User } from '../models/user.model';

const router = Router();

// Get all users
router.get('/', async (_req: Request, res: Response) => {
    const users = await User.find();
    res.json(users);
});

// Get user by ID
router.get('/:id', async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
});

// Create user
router.post('/', async (req: Request, res: Response) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (e) {
        if (e instanceof Error) {
            res.status(400).json({ message: e.message });
        }
    }
});

// Update user
router.put('/:id', async (req: Request, res: Response) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
});

// Delete user
router.delete('/:id', async (req: Request, res: Response) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
});

export default router;
