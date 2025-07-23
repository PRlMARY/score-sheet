import express from 'express';
import cookieParser from 'cookie-parser';
import indexRouter from './src/routes/index.route.js';
import { connect } from './src/database/connect.js';
import cors from 'cors';

const PORT = 3000;
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Enable credentials for cookies
  optionsSuccessStatus: 200
}));

app.use(cookieParser()); // Add cookie parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', indexRouter);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    connect(app);
});