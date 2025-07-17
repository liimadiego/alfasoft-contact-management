const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const { initializeDatabase } = require('./config/database.js');
const contactsRoutes = require('./routes/contacts.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "img-src": ["'self'", "data:", "blob:"],
        },
    },
}));
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/contacts', contactsRoutes);
app.use('/api/auth', authRoutes);

app.use(express.static(path.join(__dirname, '../html')));

app.use((error, req, res, next) => {
    console.log(error)
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large' });
    }
    if (error.message === 'Only image files are allowed') {
        return res.status(400).json({ error: 'Only image files are allowed' });
    }
    res.status(500).json({ error: 'Something went wrong' });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../html/index.html'));
});

initializeDatabase();

module.exports = app;