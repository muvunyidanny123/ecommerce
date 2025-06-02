// Authentication Service
const AuthService = {
    // Current user data
    currentUser: null,
    
    // Check if user is logged in
    isLoggedIn() {
        return !!localStorage.getItem('token');
    },
    
    // Check if user is admin
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.isAdmin;
    },
    
    // Get current user from localStorage
    getCurrentUser() {
        if (this.currentUser) {
            return this.currentUser;
        }
        
        const userJson = localStorage.getItem('user');
        if (userJson) {
            this.currentUser = JSON.parse(userJson);
            return this.currentUser;
        }
        
        return null;
    },
    
    // Set current user and token in localStorage
    setCurrentUser(userData, token) {
        this.currentUser = userData;
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
    },
    
    // Clear user data on logout
    clearCurrentUser() {
        this.currentUser = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    },
    
    // Register a new user
    async register(name, email, password) {
        try {
            const data = await ApiService.post('/auth/register', {
                name,
                email,
                password
            }, false);
            
            return data;
        } catch (error) {
            throw error;
        }
    },
    
    // Login user
    async login(email, password) {
        try {
            const data = await ApiService.post('/auth/login', {
                email,
                password
            }, false);
            
            this.setCurrentUser(data.user, data.token);
            return data;
        } catch (error) {
            throw error;
        }
    },
    
    // Logout user
    logout() {
        this.clearCurrentUser();
    },
    
    // Get current user profile
    async getCurrentUserProfile() {
        try {
            const data = await ApiService.get('/users/me');
            this.currentUser = data;
            localStorage.setItem('user', JSON.stringify(data));
            return data;
        } catch (error) {
            if (error.status === 401) {
                this.clearCurrentUser();
            }
            throw error;
        }
    }
};

// Initialize auth-related UI elements
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const logoutLink = document.getElementById('logout-link');
    
    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorElement = document.getElementById('login-error');
            
            try {
                errorElement.classList.add('hidden');
                await AuthService.login(email, password);
                showToast('Login successful!', 'success');
                updateAuthUI();
                navigateTo('home');
            } catch (error) {
                errorElement.textContent = error.message || 'Login failed. Please check your credentials.';
                errorElement.classList.remove('hidden');
            }
        });
    }
    
    // Handle register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const errorElement = document.getElementById('register-error');
            
            try {
                errorElement.classList.add('hidden');
                await AuthService.register(name, email, password);
                showToast('Registration successful! Please login.', 'success');
                navigateTo('login');
            } catch (error) {
                errorElement.textContent = error.message || 'Registration failed. Please try again.';
                errorElement.classList.remove('hidden');
            }
        });
    }
    
    // Handle logout
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            AuthService.logout();
            updateAuthUI();
            showToast('You have been logged out.', 'info');
            navigateTo('home');
        });
    }
});

// Update UI based on authentication status
function updateAuthUI() {
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const logoutLink = document.getElementById('logout-link');
    const userGreeting = document.getElementById('user-greeting');
    const adminLink = document.getElementById('admin-link');
    
    if (AuthService.isLoggedIn()) {
        // User is logged in
        loginLink.classList.add('hidden');
        registerLink.classList.add('hidden');
        logoutLink.classList.remove('hidden');
        
        const user = AuthService.getCurrentUser();
        if (user) {
            userGreeting.textContent = `Hello, ${user.name}`;
            userGreeting.classList.remove('hidden');
            
            // Show admin link if user is admin
            if (user.isAdmin) {
                adminLink.classList.remove('hidden');
            } else {
                adminLink.classList.add('hidden');
            }
        }
    } else {
        // User is logged out
        loginLink.classList.remove('hidden');
        registerLink.classList.remove('hidden');
        logoutLink.classList.add('hidden');
        userGreeting.classList.add('hidden');
        adminLink.classList.add('hidden');
    }
}
