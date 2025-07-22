import express from 'express';
import indexRouter from './src/routes/index.route.js';
import { connect } from './src/database/connect.js';

const app = express();

app.use(express.json());
app.use('/api', indexRouter);

connect(app);