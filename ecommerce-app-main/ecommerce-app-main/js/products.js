// Products Service
const ProductsService = {
    // Get all products
    async getAllProducts() {
        try {
            return await ApiService.get('/products', false);
        } catch (error) {
            throw error;
        }
    },
    
    // Get product by ID
    async getProductById(id) {
        try {
            return await ApiService.get(`/products/${id}`, false);
        } catch (error) {
            throw error;
        }
    },
    
    // Create a new product (admin only)
    async createProduct(productData) {
        try {
            return await ApiService.post('/products', productData);
        } catch (error) {
            throw error;
        }
    },
    
    // Update a product (admin only)
    async updateProduct(id, productData) {
        try {
            return await ApiService.put(`/products/${id}`, productData);
        } catch (error) {
            throw error;
        }
    },
    
    // Partially update a product (admin only)
    async partialUpdateProduct(id, productData) {
        try {
            return await ApiService.patch(`/products/${id}`, productData);
        } catch (error) {
            throw error;
        }
    },
    
    // Delete a product (admin only)
    async deleteProduct(id) {
        try {
            return await ApiService.delete(`/products/${id}`);
        } catch (error) {
            throw error;
        }
    }
};

// Initialize products-related UI elements
document.addEventListener('DOMContentLoaded', () => {
    // Load featured products on home page
    loadFeaturedProducts();
    
    // Load all products on products page
    const productsPage = document.getElementById('products-page');
    if (productsPage) {
        document.querySelector('[data-page="products"]').addEventListener('click', () => {
            loadAllProducts();
        });
    }
    
    // Product detail page
    const productDetailPage = document.getElementById('product-detail-page');
    if (productDetailPage) {
        document.getElementById('back-to-products').addEventListener('click', () => {
            navigateTo('products');
        });
    }
    
    // Filter and sort products
    const applyFiltersBtn = document.getElementById('apply-filters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            loadAllProducts();
        });
    }
    
    const sortProductsSelect = document.getElementById('sort-products');
    if (sortProductsSelect) {
        sortProductsSelect.addEventListener('change', () => {
            loadAllProducts();
        });
    }
    
    const searchProducts = document.getElementById('search-products');
    if (searchProducts) {
        searchProducts.addEventListener('input', debounce(() => {
            loadAllProducts();
        }, 500));
    }
    
    // Admin product management
    const adminPage = document.getElementById('admin-page');
    if (adminPage) {
        document.querySelector('[data-page="admin"]').addEventListener('click', () => {
            if (AuthService.isAdmin()) {
                loadAdminProducts();
            } else {
                showToast('You do not have admin privileges', 'error');
                navigateTo('home');
            }
        });
    }
    
    // Add product button
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            openProductForm();
        });
    }
    
    // Product form submission
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveProduct();
        });
    }
});

// Load featured products on home page
async function loadFeaturedProducts() {
    const featuredProductsContainer = document.getElementById('featured-products');
    if (!featuredProductsContainer) return;
    
    try {
        const products = await ProductsService.getAllProducts();
        
        // Show only first 4 products as featured
        const featuredProducts = products.slice(0, 4);
        
        featuredProductsContainer.innerHTML = '';
        
        featuredProducts.forEach(product => {
            featuredProductsContainer.appendChild(createProductCard(product));
        });
    } catch (error) {
        console.error('Error loading featured products:', error);
        showToast('Failed to load featured products', 'error');
    }
}

// Load all products with filtering and sorting
async function loadAllProducts() {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;
    
    try {
        // Show loading state
        productsContainer.innerHTML = '<div class="col-span-full text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-indigo-600"></i></div>';
        
        // Get filter values
        const categoryFilter = document.getElementById('category-filter').value;
        const minPrice = document.getElementById('min-price').value;
        const maxPrice = document.getElementById('max-price').value;
        const searchQuery = document.getElementById('search-products').value;
        const sortBy = document.getElementById('sort-products').value;
        
        // Get all products
        let products = await ProductsService.getAllProducts();
        
        // Apply filters
        if (categoryFilter) {
            products = products.filter(product => product.category === categoryFilter);
        }
        
        if (minPrice) {
            products = products.filter(product => {
                const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
                return price >= parseFloat(minPrice);
            });
        }
        
        if (maxPrice) {
            products = products.filter(product => {
                const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
                return price <= parseFloat(maxPrice);
            });
        }
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            products = products.filter(product => 
                product.name.toLowerCase().includes(query) || 
                product.description.toLowerCase().includes(query)
            );
        }
        
        // Apply sorting
        if (sortBy) {
            switch (sortBy) {
                case 'price-asc':
                    products.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    products.sort((a, b) => b.price - a.price);
                    break;
                case 'name-asc':
                    products.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'name-desc':
                    products.sort((a, b) => b.name.localeCompare(a.name));
                    break;
            }
        }
        
        // Update category filter options if not already populated
        const categorySelect = document.getElementById('category-filter');
        if (categorySelect && categorySelect.options.length <= 1) {
            const categories = [...new Set(products.map(product => product.category))];
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        }
        
        // Display products
        productsContainer.innerHTML = '';
        
        if (products.length === 0) {
            productsContainer.innerHTML = '<div class="col-span-full text-center py-8"><p class="text-gray-500">No products found</p></div>';
            return;
        }
        
        products.forEach(product => {
            productsContainer.appendChild(createProductCard(product));
        });
    } catch (error) {
        console.error('Error loading products:', error);
        productsContainer.innerHTML = '<div class="col-span-full text-center py-8"><p class="text-red-500">Failed to load products</p></div>';
        showToast('Failed to load products', 'error');
    }
}

// Create a product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md overflow-hidden p-4';
    
    // Convert price to number if it's a string
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    
    card.innerHTML = `
        <div>
            <h3 class="text-lg font-semibold mb-2">${product.name}</h3>
            <p class="text-gray-600 text-sm mb-4 line-clamp-2">${product.description}</p>
            <div class="flex justify-between items-center">
                <span class="text-indigo-700 font-bold">$${price.toFixed(2)}</span>
                <button class="view-product-btn bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition" data-id="${product.id}">
                    View Details
                </button>
            </div>
        </div>
    `;
    
    // Add event listener to view product details
    card.querySelector('.view-product-btn').addEventListener('click', () => {
        viewProductDetail(product.id);
    });
    
    return card;
}

// View product detail
async function viewProductDetail(productId) {
    try {
        const product = await ProductsService.getProductById(productId);
        
        // Convert price to number if it's a string
        const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
        
        const productDetailContainer = document.getElementById('product-detail');
        productDetailContainer.innerHTML = `
            <div class="bg-gradient-to-r from-indigo-50 to-white p-8 rounded-lg shadow-lg border border-indigo-100">
                <div class="flex flex-col">
                    <div class="mb-6">
                        <span class="bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">${product.category}</span>
                        <h1 class="text-3xl font-bold mt-2 text-gray-800">${product.name}</h1>
                    </div>
                    
                    <div class="mb-8">
                        <div class="h-1 w-20 bg-indigo-500 mb-6"></div>
                        <p class="text-gray-600 leading-relaxed">${product.description}</p>
                    </div>
                    
                    <div class="flex flex-wrap items-center justify-between mb-8 pb-6 border-b border-gray-200">
                        <div class="flex items-baseline">
                            <span class="text-3xl font-bold text-indigo-700">$${price.toFixed(2)}</span>
                            <span class="ml-2 text-sm text-gray-500">${product.quantity > 10 ? 'Plenty in stock' : product.quantity > 0 ? 'Limited stock' : 'Out of stock'}</span>
                        </div>
                        
                        <div class="mt-4 sm:mt-0">
                            <span class="inline-flex items-center px-3 py-1 rounded-full ${product.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    ${product.quantity > 0 
                                        ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>'
                                        : '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>'
                                    }
                                </svg>
                                ${product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <h3 class="font-semibold text-gray-800 mb-2">Product Details</h3>
                            <ul class="space-y-2 text-sm">
                                <li class="flex justify-between">
                                    <span class="text-gray-600">Category:</span>
                                    <span class="font-medium">${product.category}</span>
                                </li>
                                <li class="flex justify-between">
                                    <span class="text-gray-600">SKU:</span>
                                    <span class="font-medium">PRD-${product.id}</span>
                                </li>
                                <li class="flex justify-between">
                                    <span class="text-gray-600">Quantity Available:</span>
                                    <span class="font-medium">${product.quantity}</span>
                                </li>
                            </ul>
                        </div>
                        
                        <div class="bg-indigo-50 p-4 rounded-lg shadow-sm border border-indigo-100">
                            <h3 class="font-semibold text-indigo-800 mb-2">Why Choose This Product</h3>
                            <ul class="space-y-2 text-sm">
                                <li class="flex items-start">
                                    <svg class="w-4 h-4 text-indigo-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                    </svg>
                                    <span>Premium quality</span>
                                </li>
                                <li class="flex items-start">
                                    <svg class="w-4 h-4 text-indigo-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                    </svg>
                                    <span>Fast shipping</span>
                                </li>
                                <li class="flex items-start">
                                    <svg class="w-4 h-4 text-indigo-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                    </svg>
                                    <span>30-day money-back guarantee</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        navigateTo('product-detail');
    } catch (error) {
        console.error('Error loading product detail:', error);
        showToast('Failed to load product detail', 'error');
    }
}



// Load admin products table
async function loadAdminProducts() {
    const adminProductsTable = document.getElementById('admin-products-table');
    if (!adminProductsTable) return;
    
    try {
        // Show loading state
        adminProductsTable.innerHTML = '<tr><td colspan="6" class="text-center py-4"><i class="fas fa-spinner fa-spin text-indigo-600"></i></td></tr>';
        
        // Get all products
        const products = await ProductsService.getAllProducts();
        
        // Display products in table
        adminProductsTable.innerHTML = '';
        
        if (products.length === 0) {
            adminProductsTable.innerHTML = '<tr><td colspan="6" class="text-center py-4">No products found</td></tr>';
            return;
        }
        
        products.forEach(product => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            
            row.innerHTML = `
    <td class="py-3 px-4 border-b">${product.id}</td>
    <td class="py-3 px-4 border-b">${product.name}</td>
    <td class="py-3 px-4 border-b">${product.category}</td>
    <td class="py-3 px-4 border-b">$${(typeof product.price === 'string' ? parseFloat(product.price) : product.price).toFixed(2)}</td>
    <td class="py-3 px-4 border-b">${product.quantity}</td>
    <td class="py-3 px-4 border-b">
        <button class="edit-product-btn text-indigo-600 hover:text-indigo-800 mr-2" data-id="${product.id}">
            <i class="fas fa-edit"></i>
        </button>
        <button class="delete-product-btn text-red-600 hover:text-red-800" data-id="${product.id}">
            <i class="fas fa-trash"></i>
        </button>
    </td>
`;
            
            adminProductsTable.appendChild(row);
        });
        
        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-product-btn').forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.getAttribute('data-id');
                openProductForm(productId);
            });
        });
        
        document.querySelectorAll('.delete-product-btn').forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.getAttribute('data-id');
                openDeleteConfirmation(productId);
            });
        });
    } catch (error) {
        console.error('Error loading admin products:', error);
        adminProductsTable.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-red-500">Failed to load products</td></tr>';
        showToast('Failed to load products', 'error');
    }
}

// Open product form for add/edit
async function openProductForm(productId = null) {
    const formTitle = document.getElementById('product-form-title');
    const productIdInput = document.getElementById('product-id');
    const productNameInput = document.getElementById('product-name');
    const productDescriptionInput = document.getElementById('product-description');
    const productPriceInput = document.getElementById('product-price');
    const productQuantityInput = document.getElementById('product-quantity');
    const productCategoryInput = document.getElementById('product-category');
    
    // Reset form
    document.getElementById('product-form').reset();
    
    if (productId) {
        // Edit existing product
        formTitle.textContent = 'Edit Product';
        
        try {
            const product = await ProductsService.getProductById(productId);
            
            productIdInput.value = product.id;
            productNameInput.value = product.name;
            productDescriptionInput.value = product.description;
            productPriceInput.value = product.price;
            productQuantityInput.value = product.quantity;
            productCategoryInput.value = product.category;
        } catch (error) {
            console.error('Error loading product for edit:', error);
            showToast('Failed to load product details', 'error');
            return;
        }
    } else {
        // Add new product
        formTitle.textContent = 'Add New Product';
        productIdInput.value = '';
    }
    
    // Show modal
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.getElementById('product-form-modal').classList.remove('hidden');
}

// Save product (create or update)
async function saveProduct() {
    const productId = document.getElementById('product-id').value;
    
    const productData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(document.getElementById('product-price').value),
        quantity: parseInt(document.getElementById('product-quantity').value),
        category: document.getElementById('product-category').value
    };
    
    try {
        if (productId) {
            // Update existing product
            await ProductsService.updateProduct(productId, productData);
            showToast('Product updated successfully', 'success');
        } else {
            // Create new product
            await ProductsService.createProduct(productData);
            showToast('Product created successfully', 'success');
        }
        
        // Close modal and refresh products
        closeModal();
        loadAdminProducts();
    } catch (error) {
        console.error('Error saving product:', error);
        showToast(error.message || 'Failed to save product', 'error');
    }
}

// Open delete confirmation modal
function openDeleteConfirmation(productId) {
    // Set product ID for delete action
    document.getElementById('confirm-action').setAttribute('data-id', productId);
    
    // Add event listener for confirm button
    document.getElementById('confirm-action').onclick = async () => {
        try {
            await ProductsService.deleteProduct(productId);
            showToast('Product deleted successfully', 'success');
            closeModal();
            loadAdminProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            showToast(error.message || 'Failed to delete product', 'error');
        }
    };
    
    // Show confirmation modal
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.getElementById('confirmation-modal').classList.remove('hidden');
    document.getElementById('product-form-modal').classList.add('hidden');
}

// Utility function for debouncing
function debounce(func, delay) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}
