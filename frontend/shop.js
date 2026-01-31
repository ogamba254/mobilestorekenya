// shop.js

// 1. Point this to your actual Backend URL
const API_URL = "https://mobilestorekenya.onrender.com/api/products";

let allProducts = [];
let currentProduct = null;
let isEditMode = false;

// 2. Fetch products from the database
async function loadProducts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to connect to server");

        allProducts = await response.json();
        displayProducts(allProducts);
    } catch (error) {
        console.error("Error loading products:", error);
                document.getElementById('shop-container').innerHTML = `
            <div style="text-align:center; width:100%; color:red;">
                <h3>Server Offline</h3>
                <p>Make sure your backend is reachable at https://mobilestorekenya.onrender.com.</p>
            </div>`;
    }
}

// 3. Build the cards for each product added in Admin
function displayProducts(products) {
    const shopContainer = document.getElementById('shop-container');
    shopContainer.innerHTML = ""; // Clear the "Loading..." message

    if (products.length === 0) {
        shopContainer.innerHTML = "<p>No products available. Add some in the Admin Panel!</p>";
        return;
    }

    products.forEach(item => {
        const productCard = `
            <div class="product-card" onclick="viewProductDetails('${item._id}')">
                <img src="${item.img || item.images?.[0] || 'https://via.placeholder.com/200'}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p class="price">KSh ${item.price.toLocaleString()}</p>
                <button onclick="event.stopPropagation(); addToCart('${item._id}', '${item.name}', ${item.price})">Add to Cart</button>
            </div>
        `;
        shopContainer.innerHTML += productCard;
    });
}

// View product details
function viewProductDetails(productId) {
    currentProduct = allProducts.find(p => p._id === productId);
    if (!currentProduct) return;

    document.getElementById('modal-title').textContent = currentProduct.name;
    document.getElementById('modal-image').src = currentProduct.img || 'https://via.placeholder.com/300';
    document.getElementById('modal-name').value = currentProduct.name;
    document.getElementById('modal-category').value = currentProduct.category;
    document.getElementById('modal-price').value = currentProduct.price;
    document.getElementById('modal-oldprice').value = currentProduct.oldPrice || '';
    document.getElementById('modal-details').value = (currentProduct.details || []).join('\n');

    makeFieldsReadonly();
    document.getElementById('product-detail-modal').classList.add('active');
}

// Close modal
function closeProductModal() {
    document.getElementById('product-detail-modal').classList.remove('active');
    cancelEdit();
}

// Enable edit mode
function enableEditMode() {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');

    if (!token || role !== 'admin') {
        alert('Only admins can edit products');
        return;
    }

    isEditMode = true;
    makeFieldsEditable();

    document.getElementById('edit-btn').classList.add('hidden');
    document.getElementById('save-btn').classList.remove('hidden');
    document.getElementById('cancel-btn').classList.remove('hidden');
}

// Cancel edit
function cancelEdit() {
    isEditMode = false;
    makeFieldsReadonly();
    
    document.getElementById('edit-btn').classList.remove('hidden');
    document.getElementById('save-btn').classList.add('hidden');
    document.getElementById('cancel-btn').classList.add('hidden');
}

// Make fields editable
function makeFieldsEditable() {
    document.getElementById('modal-name').removeAttribute('readonly');
    document.getElementById('modal-category').removeAttribute('readonly');
    document.getElementById('modal-price').removeAttribute('readonly');
    document.getElementById('modal-oldprice').removeAttribute('readonly');
    document.getElementById('modal-details').removeAttribute('readonly');
}

// Make fields readonly
function makeFieldsReadonly() {
    document.getElementById('modal-name').setAttribute('readonly', 'true');
    document.getElementById('modal-category').setAttribute('readonly', 'true');
    document.getElementById('modal-price').setAttribute('readonly', 'true');
    document.getElementById('modal-oldprice').setAttribute('readonly', 'true');
    document.getElementById('modal-details').setAttribute('readonly', 'true');
}

// Save product changes
async function saveProductChanges() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('You must be logged in to edit products');
        return;
    }

    const updatedProduct = {
        name: document.getElementById('modal-name').value,
        category: document.getElementById('modal-category').value,
        price: parseInt(document.getElementById('modal-price').value),
        oldPrice: document.getElementById('modal-oldprice').value ? parseInt(document.getElementById('modal-oldprice').value) : null,
        details: document.getElementById('modal-details').value.split('\n').filter(d => d.trim()),
        img: currentProduct.img // Keep existing image
    };

    try {
        const response = await fetch(`${API_URL}/${currentProduct._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedProduct)
        });

        if (response.ok) {
            alert('Product updated successfully! 🎉');
            loadProducts();
            closeProductModal();
        } else {
            const data = await response.json();
            alert('Failed to update product: ' + (data.msg || data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error. Make sure backend is running.');
    }
}

// Delete product
async function deleteProduct() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('You must be logged in to delete products');
        return;
    }

    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const response = await fetch(`${API_URL}/${currentProduct._id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok || response.status === 404) {
            alert('Product deleted successfully!');
            loadProducts();
            closeProductModal();
        } else {
            alert('Failed to delete product');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Connection error');
    }
}

// 4. Add to cart function
async function addToCart(productId, productName, price) {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        alert('Please log in to add items to cart');
        window.location.href = 'login.html';
        return;
    }

    try {
        // Get current cart from localStorage
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Check if item already in cart
        const existingItem = cart.find(item => item._id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                _id: productId,
                name: productName,
                price: price,
                quantity: 1
            });
        }
        
        // Save cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        alert(`Added "${productName}" to cart! 🛒`);
        
        // Update cart count if exists
        updateCartCount();
        
        // Try to sync cart to server for signed-in users
        try {
            await syncCartToServer(cart);
        } catch (e) {
            console.warn('Failed to sync cart to server', e);
        }
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert("Error adding to cart.");
    }
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartBadge = document.getElementById('cart-count');
    if (cartBadge) {
        cartBadge.textContent = cartCount;
    }
}

// Sync cart to server when user is authenticated
async function syncCartToServer(cart) {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const payload = (cart || JSON.parse(localStorage.getItem('cart') || '[]')).map(i => ({ _id: i._id, quantity: i.quantity }));

    try {
        await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ products: payload })
        });
    } catch (e) {
        throw e;
    }
}

// Search functionality
function handleSearch(query) {
    const resultsBox = document.getElementById('search-results');
    
    if (!query.trim()) {
        resultsBox.style.display = 'none';
        displayProducts(allProducts);
        return;
    }
    
    // Filter products based on search query
    const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
    );
    
    if (filtered.length === 0) {
        resultsBox.style.display = 'block';
        resultsBox.innerHTML = '<div style="padding: 16px; text-align: center; color: #64748b;">No products found</div>';
    } else {
        // Show dropdown results
        resultsBox.style.display = 'block';
        resultsBox.innerHTML = filtered.slice(0, 6).map(p => `
            <div onclick="selectSearchResult('${p._id}'); handleSearch('');" class="search-item" style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                <img src="${p.img || 'https://via.placeholder.com/40'}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #1e293b; font-size: 0.95rem;">${p.name}</div>
                    <div style="color: #2563eb; font-weight: 700; font-size: 0.9rem;">KSh ${p.price.toLocaleString()}</div>
                </div>
            </div>
        `).join('');
        
        // Also filter displayed products
        displayProducts(filtered);
    }
}

function selectSearchResult(productId) {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    viewProductDetails(productId);
}

// Google UI helpers
function initGoogleUI() {
    const g = localStorage.getItem('googleUser');
    const gp = document.getElementById('google-profile');
    const avatar = document.getElementById('google-avatar');
    const nameEl = document.getElementById('google-name');
    const logoutBtn = document.getElementById('google-logout');
    if (g) {
        try {
            const obj = JSON.parse(g);
            if (avatar) avatar.src = obj.imageUrl || obj.picture || obj.photo || '';
            if (nameEl) nameEl.textContent = obj.name || obj.email || '';
            if (gp) gp.style.display = 'flex';
            if (logoutBtn) logoutBtn.style.display = 'inline-block';
            if (nameEl) nameEl.style.display = 'inline-block';
        } catch (e) { console.error('Invalid googleUser', e); }
    } else {
        if (gp) gp.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

function handleGoogleSignOut() {
    localStorage.removeItem('googleUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    window.location.href = 'shop.html';
}

// Add CSS for hidden class
const style = document.createElement('style');
style.textContent = '.hidden { display: none !important; }';
document.head.appendChild(style);

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartCount();
    initGoogleUI();
});