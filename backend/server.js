const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Set JWT_SECRET from environment or use a default
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// --- ADDED: STATIC FILE SERVING ---
const frontendPath = path.join(__dirname, '../frontend');
console.log('📁 Serving frontend from:', frontendPath);
app.use(express.static(frontendPath));

// 1. Connect to MongoDB Atlas
const dbURI = process.env.MONGO_URI || 'mongodb+srv://ogambadedalius_db_user:Ogamba@cluster0.uuxfw1l.mongodb.net/mobistore?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(dbURI)
    .then(() => console.log('✅ Connected to MongoDB ATLAS (Cloud)'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
    });

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);

// --- FALLBACK: SERVE INDEX.HTML FOR ALL ROUTES ---
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));