const express = require('express');
const router = express.Router();
const Product = require('../models/products');
const { authMiddleware, adminOnly } = require('../authMiddleware');

// GET all products (Public)
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});

// POST a new product (Admin Only)
router.post('/add', authMiddleware, adminOnly, async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(400).json({ msg: "Failed to add product", error: err.message });
    }
});

// PUT update a product (Admin Only)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedProduct) {
            return res.status(404).json({ msg: "Product not found" });
        }
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ msg: "Failed to update product", error: err.message });
    }
});

// DELETE a product (Admin Only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }
        res.json({ msg: "Product deleted successfully" });
    } catch (err) {
        res.status(400).json({ msg: "Failed to delete product", error: err.message });
    }
});

module.exports = router;