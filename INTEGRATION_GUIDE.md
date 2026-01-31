# MOBISTORE KENYA - Frontend & Backend Integration Guide

## ✅ Integration Complete!

Your frontend and backend are now fully connected and synced with MongoDB database.

---

## 🚀 **Getting Started**

### 1. **Start the Backend Server**
```bash
cd backend
npm install  # Install dependencies (already done)
node server.js
```
The server will run on `http://localhost:5000`

### 2. **Access the Application**
Open your browser and go to:
```
http://localhost:5000
```

---

## 🔐 **Admin Credentials**

**Email:** `admin@mobistore.com`  
**Password:** `admin123`

Use these credentials to login and access the admin dashboard where you can add/manage products.

---

## 📝 **Features Implemented**

### ✅ User Registration
- **File:** `/frontend/register.html`
- **API Endpoint:** `POST /api/auth/register`
- Users can create new accounts
- Passwords are hashed with bcryptjs
- Data saved to MongoDB

### ✅ User Login
- **File:** `/frontend/login.html`
- **API Endpoint:** `POST /api/auth/login`
- Users receive JWT authentication token
- Token stored in `localStorage` for persistent sessions
- Admin users redirected to admin dashboard
- Regular users redirected to account page

### ✅ Product Management (Admin)
- **File:** `/frontend/admin.html`
- **API Endpoint:** `POST /api/products/add` (Admin Only)
- Add new products with:
  - Product name, price, category
  - Image preview
  - Product details
- Products instantly appear in shop
- Sync with MongoDB database in real-time

### ✅ Shop/Product Display
- **File:** `/frontend/shop.js`
- **API Endpoint:** `GET /api/products`
- Fetches all products from database
- Displays products in product cards
- Add to cart functionality
- Cart stored in `localStorage`

### ✅ Authentication Middleware
- **File:** `/backend/authMiddleware.js`
- Verifies JWT tokens from requests
- Checks user role (admin/user)
- Protects admin-only routes

---

## 🗄️ **MongoDB Collections**

### Users Collection
```json
{
  "username": "John Doe",
  "email": "john@example.com",
  "password": "hashed_password",
  "role": "user",  // "admin" or "user"
  "createdAt": "2024-01-31T12:00:00Z"
}
```

### Products Collection
```json
{
  "name": "iPhone 15 Pro",
  "price": 145000,
  "oldPrice": 160000,
  "category": "Smartphone",
  "img": "image_url",
  "details": ["A17 Pro Chip", "Titanium Design"],
  "inStock": true,
  "createdAt": "2024-01-31T12:00:00Z"
}
```

---

## 🔗 **API Endpoints**

### Authentication Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ No |
| POST | `/api/auth/login` | Login user, get token | ❌ No |

### Product Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | Get all products | ❌ No |
| POST | `/api/products/add` | Add new product | ✅ Yes (Admin Only) |
| DELETE | `/api/products/:id` | Delete product | ✅ Yes (Admin Only) |

---

## 🔑 **How Authentication Works**

1. **Registration:**
   - User submits form → Frontend sends to `/api/auth/register`
   - Backend hashes password with bcryptjs
   - User saved to MongoDB

2. **Login:**
   - User submits credentials → Frontend sends to `/api/auth/login`
   - Backend verifies password
   - JWT token generated and sent back
   - Frontend stores token in `localStorage`

3. **Protected Routes:**
   - Frontend includes token in Authorization header: `Bearer <token>`
   - Backend validates token with JWT
   - Admin operations only allowed if role === 'admin'

---

## 📱 **Frontend Files Updated**

### `/frontend/register.html`
- Added form IDs for input capture
- Added `handleRegister()` function
- Sends POST request to `/api/auth/register`
- Redirects to login on success

### `/frontend/login.html`
- Updated login form with proper IDs
- Replaced hardcoded credentials with API call
- Saves token & role to localStorage
- Validates user role for admin redirect

### `/frontend/admin.html`
- Fetches products from `/api/products` on load
- `handleProductSubmit()` sends products to backend
- Uses JWT token for authentication
- Products sync in real-time with MongoDB

### `/frontend/shop.js`
- Fetches products from `/api/products`
- Displays all products from database
- `addToCart()` requires user to be logged in
- Cart stored in localStorage

---

## ⚙️ **Backend Files Updated**

### `/backend/server.js`
- Mounted auth routes
- Mounted product routes
- Set JWT_SECRET from environment
- Serves static frontend files

### `/backend/routes/authRoutes.js`
- Register endpoint with duplicate email check
- Login endpoint with JWT token generation
- Password hashing with bcryptjs

### `/backend/routes/productRoutes.js`
- GET all products (public)
- POST new product (admin only)
- DELETE product (admin only)
- Auth middleware protection

### `/backend/authMiddleware.js`
- Validates JWT tokens
- Extracts user ID and role
- Checks admin permissions

### `/backend/seed.js`
- Creates admin user: `admin@mobistore.com` / `admin123`
- Seeds 3 sample products
- Clears old data before seeding

---

## 🧪 **Testing the Integration**

### 1. **Test Registration**
1. Go to `http://localhost:5000/register.html`
2. Fill in the form
3. Click "Create My Account"
4. Should redirect to login page

### 2. **Test Admin Login**
1. Go to `http://localhost:5000/login.html`
2. Email: `admin@mobistore.com`
3. Password: `admin123`
4. Should redirect to admin dashboard

### 3. **Test Adding Products**
1. Login as admin
2. Go to "Inventory" section
3. Click "Add Product"
4. Fill in product details
5. Click "Save & Sync to Store"
6. Product appears in shop immediately

### 4. **Test Shop Display**
1. Go to `http://localhost:5000/shop.html`
2. All products from MongoDB should display
3. Click "Add to Cart" (must be logged in)
4. Cart updates in localStorage

---

## 🐛 **Troubleshooting**

### "Connection error. Make sure the backend is running on port 5000"
- Ensure backend server is running: `node server.js`
- Check no other app is using port 5000
- Verify MongoDB connection is working

### "Access denied. Admin login required"
- You must login as admin to access admin panel
- Use credentials: `admin@mobistore.com` / `admin123`

### "Token is not valid"
- Token may have expired
- Clear localStorage and login again
- Check JWT_SECRET matches in backend

### Products not appearing
- Ensure backend is running and connected to MongoDB
- Run `node seed.js` to populate sample products
- Check browser console for API errors

---

## 📦 **Dependencies Installed**

```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.6",
    "dotenv": "^17.2.3",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.1.2",
    "mongoose": "^9.1.5"
  }
}
```

---

## 🎯 **What's Connected Now**

| Feature | Frontend | Backend | Database |
|---------|----------|---------|----------|
| Registration | ✅ Form | ✅ API | ✅ MongoDB |
| Login | ✅ Form | ✅ API | ✅ JWT Tokens |
| Add Products | ✅ Form | ✅ API | ✅ MongoDB |
| View Products | ✅ Display | ✅ API | ✅ MongoDB |
| Add to Cart | ✅ Action | 💾 localStorage | ✅ Ready |

---

## 🚀 **Next Steps (Optional Enhancements)**

1. **Email Verification:** Add email confirmation on registration
2. **Cart API:** Create backend cart endpoints instead of localStorage
3. **Orders:** Build order management system
4. **Payments:** Integrate M-Pesa for payments
5. **Notifications:** Add email/SMS notifications
6. **User Profile:** Let users view/edit their profiles
7. **Reviews:** Add product reviews and ratings

---

**Built with:** Node.js, Express, MongoDB, JWT, bcryptjs  
**Last Updated:** January 31, 2026
