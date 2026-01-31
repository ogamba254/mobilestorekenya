const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../authMiddleware');
const Cart = require('../models/carts');
const Product = require('../models/products');

// Get the current user's cart (populate product details)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id }).populate('products.productId', 'name price img');
        if (!cart) return res.json({ products: [] });

        const mapped = cart.products.map(p => ({
            _id: p.productId ? p.productId._id : p.productId,
            name: p.productId ? p.productId.name : 'Unknown',
            price: p.productId ? p.productId.price : 0,
            img: p.productId ? p.productId.img : '',
            quantity: p.quantity
        }));

        res.json({ products: mapped, updatedAt: cart.updatedAt });
    } catch (err) {
        console.error('Get cart error:', err);
        res.status(500).json({ msg: 'Failed to load cart' });
    }
});

// Replace or save the entire cart for the current user
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { products } = req.body; // expect [{ _id, quantity }, ...] or [{ productId, quantity }]

        const mongoProducts = (products || []).map(p => ({
            productId: p._id || p.productId,
            quantity: p.quantity || 1
        }));

        const updated = await Cart.findOneAndUpdate(
            { userId: req.user.id },
            { products: mongoProducts, updatedAt: Date.now() },
            { upsert: true, new: true }
        ).populate('products.productId', 'name price img');

        const mapped = updated.products.map(p => ({
            _id: p.productId ? p.productId._id : p.productId,
            name: p.productId ? p.productId.name : 'Unknown',
            price: p.productId ? p.productId.price : 0,
            img: p.productId ? p.productId.img : '',
            quantity: p.quantity
        }));

        res.json({ products: mapped, updatedAt: updated.updatedAt });
    } catch (err) {
        console.error('Save cart error:', err);
        res.status(500).json({ msg: 'Failed to save cart' });
    }
});

// Update a single item (add/update/remove)
router.put('/item', authMiddleware, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        if (!productId) return res.status(400).json({ msg: 'productId required' });

        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            if (quantity <= 0) return res.json({ products: [] });
            cart = new Cart({ userId: req.user.id, products: [{ productId, quantity }] });
            await cart.save();
        } else {
            const idx = cart.products.findIndex(p => p.productId.toString() === productId.toString());
            if (idx === -1 && quantity > 0) {
                cart.products.push({ productId, quantity });
            } else if (idx !== -1) {
                if (quantity > 0) cart.products[idx].quantity = quantity;
                else cart.products.splice(idx, 1);
            }
            cart.updatedAt = Date.now();
            await cart.save();
        }

        const fresh = await Cart.findOne({ userId: req.user.id }).populate('products.productId', 'name price img');
        const mapped = (fresh.products || []).map(p => ({
            _id: p.productId ? p.productId._id : p.productId,
            name: p.productId ? p.productId.name : 'Unknown',
            price: p.productId ? p.productId.price : 0,
            img: p.productId ? p.productId.img : '',
            quantity: p.quantity
        }));

        res.json({ products: mapped });
    } catch (err) {
        console.error('Update cart item error:', err);
        res.status(500).json({ msg: 'Failed to update cart item' });
    }
});

// Clear the cart
router.delete('/clear', authMiddleware, async (req, res) => {
    try {
        await Cart.findOneAndUpdate({ userId: req.user.id }, { products: [], updatedAt: Date.now() }, { new: true, upsert: true });
        res.json({ msg: 'Cart cleared' });
    } catch (err) {
        console.error('Clear cart error:', err);
        res.status(500).json({ msg: 'Failed to clear cart' });
    }
});

module.exports = router;