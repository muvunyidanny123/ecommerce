// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    // Set up navigation
    setupNavigation();
    
    // Set up modals
    setupModals();
    
    // Update UI based on authentication status
    updateAuthUI();
    
    // Check if user is logged in and update UI accordingly
    if (AuthService.isLoggedIn()) {
        AuthService.getCurrentUserProfile()
            .then(() => {
                updateAuthUI();
            })
            .catch(error => {
                console.error('Error fetching user profile:', error);
                if (error.status === 401) {
                    AuthService.logout();
                    updateAuthUI();
                    showToast('Your session has expired. Please login again.', 'warning');
                    navigateTo('login');
                }
            });
    }
});

// Set up navigation
function setupNavigation() {
    // Handle navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            navigateTo(page);
        });
    });
    
    // Logo click navigates to home
    document.getElementById('logo').addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('home');
    });
}

// Navigate to a page
function navigateTo(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.add('hidden');
    });
    
    // Show the selected page
    const selectedPage = document.getElementById(`${page}-page`);
    if (selectedPage) {
        selectedPage.classList.remove('hidden');
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Set up modals
function setupModals() {
    // Close modal when clicking on close button or overlay
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', closeModal);
    });
    
    // Close modal when clicking outside the modal content
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modal-overlay')) {
            closeModal();
        }
    });
    
    // Close modal when pressing Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Close modal
function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.querySelectorAll('#modal-overlay > div').forEach(modal => {
        modal.classList.add('hidden');
    });
}

// Show toast notification
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `mb-3 p-4 rounded shadow-lg flex items-center justify-between max-w-md transition-opacity duration-500 ease-in-out opacity-0`;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            toast.classList.add('bg-green-500', 'text-white');
            break;
        case 'error':
            toast.classList.add('bg-red-500', 'text-white');
            break;
        case 'warning':
            toast.classList.add('bg-yellow-500', 'text-white');
            break;
        default:
            toast.classList.add('bg-indigo-500', 'text-white');
    }
    
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${getIconForToastType(type)} mr-3"></i>
            <span>${message}</span>
        </div>
        <button class="ml-4 text-white focus:outline-none">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add close button functionality
    toast.querySelector('button').addEventListener('click', () => {
        fadeOutToast(toast);
    });
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Fade in
    setTimeout(() => {
        toast.classList.replace('opacity-0', 'opacity-100');
    }, 10);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        fadeOutToast(toast);
    }, 5000);
}

// Helper function to get icon for toast type
function getIconForToastType(type) {
    switch (type) {
        case 'success':
            return 'fa-check-circle';
        case 'error':
            return 'fa-exclamation-circle';
        case 'warning':
            return 'fa-exclamation-triangle';
        default:
            return 'fa-info-circle';
    }
}

// Fade out and remove toast
function fadeOutToast(toast) {
    toast.classList.replace('opacity-100', 'opacity-0');
    
    // Remove after transition completes
    setTimeout(() => {
        toast.remove();
    }, 500);
}
