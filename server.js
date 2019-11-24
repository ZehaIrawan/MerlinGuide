const express = require('express');
require('dotenv').config();
const app = express();
const connectDB = require('./db');

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API Running'));

// Define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/tutors', require('./routes/api/tutors'));
app.use('/api/tutorauth', require('./routes/api/tutorAuth'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server Running on port ${PORT}`));
