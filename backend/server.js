const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// DB Config
const db = 'mongodb://localhost:27017/recipe-app';

// Connect to MongoDB
mongoose
  .connect(db) // No options needed here anymore
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// Use Routes
app.use('/api', require('./routes/auth'));
app.use('/api/recipes', require('./routes/recipes'));

app.get('/', (req, res) => {
  res.send('API is running...');
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
