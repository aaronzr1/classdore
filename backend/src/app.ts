import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('ClassDore API');
});

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI || '')
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
  });