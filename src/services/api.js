// src/services/api.js
const API_BASE_URL = 'http://localhost:8080/api';

// Helper to get JWT token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Helper for authenticated API calls
const authFetch = async (url, options = {}) => {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `HTTP ${response.status}`);
    }
    
    return response.json();
};

export const api = {
    // ========== AUTHENTICATION ==========
    login: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }
        
        const data = await response.json();
        // Store token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('email', data.email);
        localStorage.setItem('userName', data.name || email.split('@')[0]);
        return data;
    },
    
    register: async (name, email, password, role) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name, 
                email, 
                password, 
                role: role.toUpperCase() 
            })
        });
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
        }
        
        return response.text();
    },
    
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('email');
        window.location.href = '/';
    },
    
    // ========== ADMIN ENDPOINTS ==========
    getPendingUsers: () => authFetch('/admin/pending'),
    approveUser: (userId) => authFetch(`/admin/approve/${userId}`, { method: 'PUT' }),
    rejectUser: (userId) => authFetch(`/admin/reject/${userId}`, { method: 'PUT' }),
    getAllUsers: () => authFetch('/admin/users'),
    deleteUser: (userId) => authFetch(`/admin/users/${userId}`, { method: 'DELETE' }),
    getOverallMetrics: () => authFetch('/admin/metrics/overall'),
    getMetricsByRegion: () => authFetch('/admin/metrics/by-region'),
    getTrainingSummary: () => authFetch('/admin/metrics/training-summary'),
    // ========== DOCTOR ENDPOINTS ==========
    
    runSegmentation: (scanId) => authFetch(`/doctor/scan/${scanId}/segment`, { method: 'POST' }),
    getSegmentationResult: (scanId) => authFetch(`/doctor/scan/${scanId}/result`),
    validateResult: (resultId) => authFetch(`/doctor/results/${resultId}/validate`, { method: 'PUT' }),
    invalidateResult: (resultId) => authFetch(`/doctor/results/${resultId}/invalidate`, { 
        method: 'PUT' 
    }),
    // ========== TECHNICIAN ENDPOINTS ==========
    recordParameters: (scanId, parameters) => authFetch(`/technician/scan/${scanId}/parameters`, {
        method: 'POST',
        body: JSON.stringify(parameters)
    }),
    getParameters: (scanId) => authFetch(`/technician/scan/${scanId}/parameters`),
    // ========== SHARED ENDPOINTS ==========
    createPatient: (patient) => authFetch('/shared/patient', {
        method: 'POST',
        body: JSON.stringify(patient)
    }),
    
    getAllPatients: () => authFetch('/shared/patients'),
    getScanById: (id) => authFetch(`/shared/scans/${id}`),
    uploadScan: async (patientId, doctorId, files) => {
        const formData = new FormData();
        formData.append('patientId', patientId);
        formData.append('doctorId', doctorId);
        formData.append('t1', files.t1);
        formData.append('t2', files.t2);
        formData.append('flair', files.flair);
        formData.append('t1ce', files.t1ce);
        
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/shared/scan/upload`, {
            method: 'POST',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }
        
        return response.json();
    },
    
    getScans: () => authFetch('/shared/scans'),
    getScanById: (id) => authFetch(`/shared/scans/${id}`),
};