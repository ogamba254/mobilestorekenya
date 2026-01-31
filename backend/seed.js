const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Import models from actual files
const User = require('./models/user');
const Product = require('./models/products');

const dbURI = process.env.MONGO_URI || 'mongodb+srv://ogambadedalius_db_user:Ogamba@cluster0.uuxfw1l.mongodb.net/mobistore?retryWrites=true&w=majority&appName=Cluster0';

const sampleProducts = [
    {
        name: "iPhone 15 Pro",
        price: 145000,
        oldPrice: 160000,
        category: "Smartphone",
        img: "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800",
        details: ["A17 Pro Chip", "Titanium Design", "48MP Camera"],
        inStock: true
    },
    {
        name: "Samsung Galaxy S24 Ultra",
        price: 135000,
        oldPrice: 150000,
        category: "Smartphone",
        img: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800",
        details: ["200MP Camera", "S-Pen Included", "Snapdragon 8 Gen 3"],
        inStock: true
    },
    {
        name: "MacBook Air M2",
        price: 125000,
        oldPrice: 140000,
        category: "Laptop",
        img: "https://images.unsplash.com/photo-1611186871348-b1ec696e52c9?auto=format&fit=crop&q=80&w=800",
        details: ["Apple M2 Chip", "8GB RAM", "256GB SSD"],
        inStock: true
    }
];

async function seedDB() {
    try {
        await mongoose.connect(dbURI);
        console.log('🔗 Connected to MongoDB');
        
        // Clear only products, not users
        await Product.deleteMany({});
        console.log('🧹 Cleared existing products');
        
        // Seed products
        await Product.insertMany(sampleProducts);
        console.log("✅ Products seeded successfully!");
        
        // Create admin user only if it doesn't exist
        const existingAdmin = await User.findOne({ email: 'mobilestorekenya@gmail.com' });
        if (!existingAdmin) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('mobile@store', salt);
            
            const adminUser = new User({
                username: 'AdminMSK',
                email: 'mobilestorekenya@gmail.com',
                password: hashedPassword,
                role: 'admin'
            });
            
            await adminUser.save();
            console.log("✅ Admin user created! (mobilestorekenya@gmail.com / mobile@store)");
        } else {
            console.log("✅ Admin user already exists!");
        }
        
        process.exit();
    } catch (err) {
        console.error("❌ Seeding Error:", err);
        process.exit(1);
    }
}

seedDB();