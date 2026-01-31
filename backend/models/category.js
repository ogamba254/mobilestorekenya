const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true 
    },
    // The slug is used for URLs (e.g., "smart-phones")
    slug: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true 
    },
    description: { 
        type: String 
    },
    // Optional: link to a parent category for sub-categories
    parentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category',
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);