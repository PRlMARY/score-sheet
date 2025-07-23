import mongoose from "mongoose";
import express from 'express';

const MONGO_URI = 'mongodb://localhost:27017/score-sheet';

export const connect = (app: express.Application) => mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });