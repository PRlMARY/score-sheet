import express from 'express';
import mongoose from 'mongoose';
import indexRouter from './src/routes/index.route.js';

const app = express();
const PORT = 3000;
const MONGO_URI = 'mongodb://localhost:27017/score-sheet';

app.use(express.json());

app.use('/api', indexRouter);

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });