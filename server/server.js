import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { inngest, functions } from './inngest/index.js';
import { serve } from 'inngest/express';
import { clerkMiddleware } from '@clerk/express';
import userRouter from './routes/userRotes.js';
import postRouter from './routes/postRoutes.js';
import storyRouter from './routes/storyRoutes.js';
import messageRouter from './routes/messageRoutes.js';

const app = express();

// Connect to MongoDB
await connectDB();

// ✅ Automatically allow localhost, Netlify, and Vercel in dev
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://sociuss.netlify.app',
  'https://sociuss.vercel.app',
  'https://socius-one.vercel.app'
];

// ✅ CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow requests with no origin (mobile apps, curl)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`❌ CORS blocked request from: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(express.json());
app.use(clerkMiddleware());

// ✅ Routes
app.get('/', (req, res) => res.send('Server is running'));

app.use('/api/inngest', serve({ client: inngest, functions }));
app.use('/api/user', userRouter);
app.use('/api/post', postRouter);
app.use('/api/story', storyRouter);
app.use('/api/message', messageRouter);

// ✅ Handle errors gracefully
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
