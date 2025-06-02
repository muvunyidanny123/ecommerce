// Base API URL
const API_BASE_URL = 'https://ecommerce-api-node-js-yvxk.onrender.com/api';

const ApiService = {
    // Get the authentication token from localStorage
    getToken() {
        return localStorage.getItem('token');
    },
    
    // Set headers for API requests
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (includeAuth) {
            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        
        return headers;
    },
    
    // Handle API responses and errors
    async handleResponse(response) {
        const data = await response.json();
        
        if (!response.ok) {
            throw {
                status: response.status,
                message: data.message || 'An error occurred',
                data
            };
        }
        
        return data;
    },
    
    // GET request
    async get(endpoint, requireAuth = true) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: this.getHeaders(requireAuth)
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('GET Error:', error);
            throw error;
        }
    },
    
    // POST request
    async post(endpoint, data, requireAuth = true) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(requireAuth),
                body: JSON.stringify(data)
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('POST Error:', error);
            throw error;
        }
    },
    
    // PUT request
    async put(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('PUT Error:', error);
            throw error;
        }
    },
    
    // PATCH request
    async patch(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('PATCH Error:', error);
            throw error;
        }
    },
    
    // DELETE request
    async delete(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('DELETE Error:', error);
            throw error;
        }
    }
};
