const express = require('express');
const router = express.Router();
const Order = require('../orders');
const User = require('../models/user');
const { authMiddleware, adminOnly } = require('../authMiddleware');

// Create order (authenticated users)
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { items, totalAmount, paymentMethod } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'No items provided' });
        }

        const order = new Order({
            userId,
            items: items.map(i => ({
                productId: i._id || i.productId,
                quantity: i.quantity || 1,
                priceAtPurchase: i.price || i.priceAtPurchase || 0,
                name: i.name || i.title || ''
            })),
            totalAmount: totalAmount || items.reduce((s, it) => s + ((it.price || it.priceAtPurchase || 0) * (it.quantity || 1)), 0),
            paymentMethod: paymentMethod || 'M-Pesa'
        });

        await order.save();
        res.status(201).json(order);
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({ message: err.message });
    }
});

// Get orders for authenticated user
router.get('/my-orders', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.find({ userId }).sort({ orderDate: -1 }).lean();
        res.json(orders);
    } catch (err) {
        console.error('Fetch orders error:', err);
        res.status(500).json({ message: err.message });
    }
});

// Admin: get all orders with user info and product details
router.get('/all', authMiddleware, adminOnly, async (req, res) => {
    try {
        const orders = await Order.find().sort({ orderDate: -1 }).populate('userId', 'username email').populate('items.productId', 'name price img').lean();

        // Map items to include product details and priceAtPurchase
        const mapped = orders.map(o => ({
            _id: o._id,
            user: o.userId || null,
            items: (o.items || []).map(it => ({
                product: it.productId ? { _id: it.productId._id, name: it.productId.name, img: it.productId.img, price: it.productId.price } : null,
                quantity: it.quantity,
                priceAtPurchase: it.priceAtPurchase
            })),
            totalAmount: o.totalAmount,
            status: o.status,
            paymentMethod: o.paymentMethod,
            orderDate: o.orderDate
        }));

        res.json(mapped);
    } catch (err) {
        console.error('Fetch all orders error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

