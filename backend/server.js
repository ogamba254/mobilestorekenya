const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios'); 
const datetime = require('node-datetime'); 

dotenv.config();

const app = express();

// --- 1. FIXED CORS CONFIGURATION (EXPRESS 5 SAFE) ---
app.use(cors());

// We removed the '*' from here to stop the crash on line 20
app.options(/(.*)/, cors()); 

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- 2. STATIC FILE SERVING ---
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// --- M-PESA CONFIGURATION ---
const MPESA_KEYS = {
    consumer_key: "h1fGAwoZyWI69ds0U9PQYZ4F2zamiZRHN92Ao9z1FoOgpWdy",
    consumer_secret: "AdIJ4iHZCZdqOBpQvgA0JJkQqXeXILROG1thkzMfgaqfQii3YQHAaoui7rJ0ixlu",
    shortCode: "174379",
    passkey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919" 
};

// --- M-PESA HELPERS ---
const generateToken = async (req, res, next) => {
    const auth = Buffer.from(`${MPESA_KEYS.consumer_key}:${MPESA_KEYS.consumer_secret}`).toString('base64');
    try {
        const response = await axios.get(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            { headers: { Authorization: `Basic ${auth}` } }
        );
        req.token = response.data.access_token;
        next();
    } catch (error) {
        console.error("❌ Token Error:", error.message);
        res.status(401).json({ message: "M-Pesa Token generation failed" });
    }
};

// --- M-PESA ROUTES ---
app.post('/stkpush', generateToken, async (req, res) => {
    try {
        const { phone, amount } = req.body;
        const date = datetime.create();
        const timestamp = date.format('YmdHMS');
        const password = Buffer.from(MPESA_KEYS.shortCode + MPESA_KEYS.passkey + timestamp).toString('base64');

        const payload = {
            BusinessShortCode: MPESA_KEYS.shortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: Math.round(amount),
            PartyA: phone,
            PartyB: MPESA_KEYS.shortCode,
            PhoneNumber: phone,
            CallBackURL: "https://mydomain.com/mpesa-express-simulate/", 
            AccountReference: "MobileStoreKenya",
            TransactionDesc: "Payment for Order"
        };

        const response = await axios.post(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            payload,
            { headers: { Authorization: `Bearer ${req.token}` } }
        );
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Safaricom API Error" });
    }
});

// --- DATABASE CONNECTION ---
const dbURI = 'mongodb+srv://ogambadedalius_db_user:Ogamba@cluster0.uuxfw1l.mongodb.net/mobistore?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(dbURI)
    .then(() => console.log('✅ Connected to MongoDB ATLAS'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

// --- API ROUTES ---
try {
    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/products', require('./routes/productRoutes'));
    app.use('/api/orders', require('./routes/orderRoutes'));
    app.use('/api/cart', require('./routes/cartRoutes'));
} catch (e) {
    console.log("⚠️ Route files issue.");
}

// --- 3. THE FIXED FALLBACK (EXPRESS 5 SAFE) ---
// We use a regular expression (.*) instead of *
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});