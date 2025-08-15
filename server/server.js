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

// ✅ Connect to MongoDB
await connectDB();

// ✅ 1. CORS FIRST — allow all origins for now
app.use(cors({
  origin: '*', // allow all origins
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false // must be false with origin '*'
}));

// ✅ 2. Handle OPTIONS preflight for all routes
app.options('*', cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ✅ 3. Parse JSON
app.use(express.json());

// ✅ 4. Clerk auth AFTER CORS
app.use(clerkMiddleware());

// ✅ 5. Routes
app.get('/', (req, res) => res.send('Server is running'));

app.use('/api/inngest', serve({ client: inngest, functions }));
app.use('/api/user', userRouter);
app.use('/api/post', postRouter);
app.use('/api/story', storyRouter);
app.use('/api/message', messageRouter);

// ✅ 6. Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// ✅ 7. Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
