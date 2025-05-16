import express from 'express';
import cors from 'cors';
import courseRoutes from './routes/course-routes';

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', courseRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

export default app; 