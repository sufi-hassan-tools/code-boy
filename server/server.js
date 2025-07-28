const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config(); // Load .env before using process.env
connectDB();

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Moohaar backend running \u2705');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
