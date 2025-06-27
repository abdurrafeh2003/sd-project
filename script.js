let products = []; // In-memory storage

// CREATE
function addProduct(product) {
    product.id = Date.now();
    products.push(product);
    displayProducts();
}

// READ
function getProducts() {
    return products;
}

// UPDATE
function updateProduct(id, updatedProduct) {
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products[index] = { ...updatedProduct, id };
        displayProducts();
    }
}

// DELETE
function deleteProduct(id) {
    products = products.filter(p => p.id !== id);
    displayProducts();
}

// Display products in your existing HTML structure
function displayProducts() {
    const container = document.querySelector('.pro-container');
    container.innerHTML = '';
    
    products.forEach(product => {
        const productHTML = `
            <div class="pro" data-id="${product.id}">
                <img src="${product.image}" alt="">
                <div class="des">
                    <span>${product.brand}</span>
                    <h5>${product.name}</h5>
                    <div class="rating">
                        ${'★'.repeat(product.rating)}
                    </div>
                    <h4 class="lin-col">$${product.price}</h4>
                </div>
                <div class="cart">
                    <button onclick="editProduct(${product.id})">Edit</button>
                    <button onclick="deleteProduct(${product.id})">Delete</button>
                </div>
            </div>
        `;
        container.innerHTML += productHTML;
    });
}
class ProductManager {
    constructor() {
        this.products = this.loadFromStorage();
        this.init();
    }

    // Load products from localStorage
    loadFromStorage() {
        const stored = localStorage.getItem('veiro-products');
        return stored ? JSON.parse(stored) : [];
    }

    // Save products to localStorage
    saveToStorage() {
        localStorage.setItem('veiro-products', JSON.stringify(this.products));
    }

    // CREATE
    addProduct(productData) {
        const product = {
            id: Date.now(),
            ...productData,
            createdAt: new Date().toISOString()
        };
        this.products.push(product);
        this.saveToStorage();
        this.render();
        return product;
    }

    // READ
    getAllProducts() {
        return this.products;
    }

    getProduct(id) {
        return this.products.find(p => p.id === parseInt(id));
    }

    // UPDATE
    updateProduct(id, updates) {
        const index = this.products.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            this.products[index] = { 
                ...this.products[index], 
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveToStorage();
            this.render();
            return this.products[index];
        }
        return null;
    }

    // DELETE
    deleteProduct(id) {
        this.products = this.products.filter(p => p.id !== parseInt(id));
        this.saveToStorage();
        this.render();
    }

    // Render products in your existing HTML structure
    render() {
        const container = document.querySelector('.pro-container');
        if (!container) return;

        container.innerHTML = this.products.map(product => `
            <div class="pro" data-id="${product.id}">
                <img src="${product.image}" alt="${product.name}">
                <div class="des">
                    <span>${product.brand}</span>
                    <h5>${product.name}</h5>
                    <div class="rating">
                        ${'★'.repeat(product.rating)}
                    </div>
                    <h4 class="lin-col">$${product.price}</h4>
                </div>
                <div class="cart">
                    <img src="souces/icons/shopping-cart.png" alt="" onclick="addToCart(${product.id})">
                    ${this.isAdminMode() ? `
                        <button onclick="productManager.editProduct(${product.id})">Edit</button>
                        <button onclick="productManager.deleteProduct(${product.id})">Delete</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    isAdminMode() {
        return document.getElementById('admin-panel')?.style.display !== 'none';
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById('product-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(e);
            });
        }
    }

    handleFormSubmit(e) {
        const formData = new FormData(e.target);
        const productData = {
            name: formData.get('name'),
            brand: formData.get('brand'),
            price: parseFloat(formData.get('price')),
            image: formData.get('image'),
            rating: parseInt(formData.get('rating'))
        };

        const productId = document.getElementById('product-id').value;
        
        if (productId) {
            // Update existing product
            this.updateProduct(parseInt(productId), productData);
        } else {
            // Create new product
            this.addProduct(productData);
        }

        this.resetForm();
    }

    editProduct(id) {
        const product = this.getProduct(id);
        if (product) {
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-brand').value = product.brand;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-image').value = product.image;
            document.getElementById('product-rating').value = product.rating;
        }
    }

    resetForm() {
        document.getElementById('product-form').reset();
        document.getElementById('product-id').value = '';
    }
}

// Initialize the product manager
const productManager = new ProductManager();

// Admin panel toggle
function toggleAdmin() {
    const panel = document.getElementById('admin-panel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    productManager.render(); // Re-render to show/hide admin buttons
}