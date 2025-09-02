const API_BASE_URL = 'https://mehndi-back-y9vo.vercel.app/api';

// API utility functions
const handleResponse = async (response) => {
  try {
    const data = await response.json();
    
    if (!response.ok) {
      console.error('API error response:', data);
      
      // For validation errors, include detailed error information
      if (data.errors && Array.isArray(data.errors)) {
        const errorMessages = data.errors.map(err => err.msg || err.message).join(', ');
        throw new Error(`Validation errors: ${errorMessages}`);
      }
      
      throw new Error(data.message || `Server error: ${response.status} ${response.statusText}`);
    }
    
    console.log('API success response:', data);
    return data;
  } catch (error) {
    if (error.name === 'SyntaxError') {
      // Response is not valid JSON
      throw new Error(`Server returned invalid response: ${response.status} ${response.statusText}`);
    }
    throw error;
  }
};

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Include credentials for cookies
  config.credentials = 'include';

  try {
    console.log('Making API request to:', url);
    console.log('Request config:', config);
    
    const response = await fetch(url, config);
    console.log('Response received:', response.status, response.statusText);
    
    return handleResponse(response);
  } catch (error) {
    console.error('API request failed:', error);
    
    // More specific error messages
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check if the backend server is running.');
    }
    
    throw error;
  }
};

// Authentication API functions
export const authAPI = {
  // Register a new user
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Login user
  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Logout user
  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  // Get current user profile
  getProfile: async () => {
    return apiRequest('/auth/me');
  },

  // Update user details
  updateProfile: async (userData) => {
    return apiRequest('/auth/update-details', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Update password
  updatePassword: async (passwordData) => {
    return apiRequest('/auth/update-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  },

  // Forgot password
  forgotPassword: async (email) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Reset password
  resetPassword: async (token, password) => {
    return apiRequest('/auth/reset-password', {
      method: 'PUT',
      body: JSON.stringify({ token, password }),
    });
  },
};

// Jobs API functions
export const jobsAPI = {
  // Get all jobs
  getAllJobs: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/jobs?${queryParams}` : '/jobs';
    return apiRequest(endpoint);
  },

  // Get single job
  getJob: async (jobId) => {
    return apiRequest(`/jobs/${jobId}`);
  },

  // Create new job (clients only)
  createJob: async (jobData) => {
    return apiRequest('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  },

  // Update job
  updateJob: async (jobId, jobData) => {
    return apiRequest(`/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  },

  // Delete job
  deleteJob: async (jobId) => {
    return apiRequest(`/jobs/${jobId}`, {
      method: 'DELETE',
    });
  },

  // Get client's jobs
  getMyJobs: async () => {
    return apiRequest('/jobs/client/me');
  },
};

// Proposals API functions will be defined later

// Messages API functions
export const messagesAPI = {
  // Get conversations
  getConversations: async () => {
    return apiRequest('/messages/conversations');
  },

  // Get messages with a specific user
  getMessages: async (userId) => {
    return apiRequest(`/messages/conversation/${userId}`);
  },

  // Send message
  sendMessage: async (messageData) => {
    return apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },

  // Get unread count
  getUnreadCount: async () => {
    return apiRequest('/messages/unread-count');
  },
};

// Reviews API functions
export const reviewsAPI = {
  // Create review (clients only)
  createReview: async (reviewData) => {
    return apiRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  // Get artist reviews
  getArtistReviews: async (artistId) => {
    return apiRequest(`/reviews/artist/${artistId}`);
  },
};

// Users API functions
export const usersAPI = {
  // Get all artists
  getArtists: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/users/artists?${queryParams}` : '/users/artists';
    return apiRequest(endpoint);
  },

  // Get single artist
  getArtist: async (artistId) => {
    return apiRequest(`/users/artist/${artistId}`);
  },
};

// Upload API functions
export const uploadAPI = {
  // Upload single image
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    return apiRequest('/upload/image', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type header to let browser set it for FormData
    });
  },

  // Upload multiple images
  uploadImages: async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    return apiRequest('/upload/images', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type header to let browser set it for FormData
    });
  },

  // Upload document
  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('document', file);
    
    return apiRequest('/upload/document', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type header to let browser set it for FormData
    });
  },
};

// Notifications API functions
export const notificationsAPI = {
  // Get user notifications
  getNotifications: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = queryParams ? `/notifications?${queryParams}` : '/notifications';
    return apiRequest(endpoint);
  },

  // Get unread notification count
  getUnreadCount: async () => {
    return apiRequest('/notifications/unread-count');
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    return apiRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return apiRequest('/notifications/mark-all-read', {
      method: 'PUT',
    });
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    return apiRequest(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },

  // Clear all read notifications
  clearReadNotifications: async () => {
    return apiRequest('/notifications/clear-read', {
      method: 'DELETE',
    });
  },
};

// Proposals API
export const proposalsAPI = {
  // Create new proposal
  createProposal: async (proposalData) => {
    return apiRequest('/proposals', {
      method: 'POST',
      body: JSON.stringify(proposalData),
    });
  },

  // Get artist's proposals
  getMyProposals: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/proposals/my-proposals?${queryParams}` : '/proposals/my-proposals';
    return apiRequest(endpoint);
  },

  // Get proposals for a job (for clients)
  getJobProposals: async (jobId, filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/proposals/job/${jobId}?${queryParams}` : `/proposals/job/${jobId}`;
    return apiRequest(endpoint);
  },

  // Get single proposal
  getProposal: async (proposalId) => {
    return apiRequest(`/proposals/${proposalId}`);
  },

  // Update proposal
  updateProposal: async (proposalId, proposalData) => {
    return apiRequest(`/proposals/${proposalId}`, {
      method: 'PUT',
      body: JSON.stringify(proposalData),
    });
  },

  // Accept proposal (for clients)
  acceptProposal: async (proposalId) => {
    return apiRequest(`/proposals/${proposalId}/accept`, {
      method: 'PUT',
    });
  },

  // Reject proposal (for clients)
  rejectProposal: async (proposalId, message = '') => {
    return apiRequest(`/proposals/${proposalId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ message }),
    });
  },

  // Withdraw proposal (for artists)
  withdrawProposal: async (proposalId) => {
    return apiRequest(`/proposals/${proposalId}/withdraw`, {
      method: 'PUT',
    });
  },

  // Get proposal statistics (for artists)
  getStats: async () => {
    return apiRequest('/proposals/stats');
  },
};

const apiExports = {
  authAPI,
  jobsAPI,
  proposalsAPI,
  messagesAPI,
  reviewsAPI,
  usersAPI,
  uploadAPI,
  notificationsAPI,
};

export default apiExports; 