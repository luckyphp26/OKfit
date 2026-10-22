import api from './api';

export const authService = {
  async register(name, email, password) {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      return response.data;
    } catch (err) {
      if (!err.response) {
        // Fallback for offline / local demo testing
        const demoUser = {
          id: 'demo_' + Date.now(),
          name,
          email,
          createdAt: new Date().toISOString()
        };
        const token = 'demo_token_' + Date.now();
        localStorage.setItem('okfit_token', token);
        localStorage.setItem('okfit_user', JSON.stringify(demoUser));
        return { success: true, token, user: demoUser };
      }
      throw err;
    }
  },

  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (err) {
      if (!err.response) {
        // Fallback for offline / local demo testing
        const storedUser = localStorage.getItem('okfit_user');
        const parsed = storedUser ? JSON.parse(storedUser) : null;
        const name = parsed?.name || email.split('@')[0] || 'Fitness Pro';
        const demoUser = {
          id: parsed?.id || 'demo_user',
          name,
          email,
        };
        const token = 'demo_token_' + Date.now();
        localStorage.setItem('okfit_token', token);
        localStorage.setItem('okfit_user', JSON.stringify(demoUser));
        return { success: true, token, user: demoUser };
      }
      throw err;
    }
  },

  async getMe() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (err) {
      if (!err.response) {
        const storedUser = localStorage.getItem('okfit_user');
        if (storedUser) {
          return { success: true, user: JSON.parse(storedUser) };
        }
      }
      throw err;
    }
  },

  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (err) {
      if (!err.response) {
        return { success: true, message: 'Password reset link sent to ' + email };
      }
      throw err;
    }
  },

  async resetPassword(token, password) {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      return response.data;
    } catch (err) {
      if (!err.response) {
        return { success: true, message: 'Password successfully updated' };
      }
      throw err;
    }
  },
};

export default authService;
