const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, phone, address } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ 
            firstName: firstName || '', 
            lastName: lastName || '', 
            username, 
            email, 
            password: hashedPassword,
            phone: phone || '',
            address: address || '',
            role: 'user'
        });
        await newUser.save();
        res.status(201).json({ message: "User Created" });
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json("User not found");

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json("Wrong password");

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
        res.status(200).json({ 
            token, 
            role: user.role,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                username: user.username
            }
        });
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
});

module.exports = router;

// Google OAuth sign-in (create or return existing user, then issue JWT)
router.post('/google-login', async (req, res) => {
    try {
        const { email, username } = req.body;
        if (!email) return res.status(400).json({ message: 'Email required' });

        let user = await User.findOne({ email });
        if (!user) {
            // create a random password for oauth users
            const randomPassword = crypto.randomBytes(16).toString('hex');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = new User({ username: username || email.split('@')[0], email, password: hashedPassword });
            await user.save();
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
        res.status(200).json({ token, role: user.role });
    } catch (err) {
        console.error('Google login error:', err);
        res.status(500).json({ message: err.message });
    }
});