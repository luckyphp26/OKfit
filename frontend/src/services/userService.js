import api from './api';

const PROFILE_KEY = 'okfit_user_profile';
const PREFS_KEY = 'okfit_user_prefs';
const WEIGHTS_KEY = 'okfit_user_weights';

function getStoredProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw
      ? JSON.parse(raw)
      : {
          age: 26,
          gender: 'male',
          height: 175,
          weight: 72,
          activity: 1.375,
          goal: 'loss',
        };
  } catch {
    return {
      age: 26,
      gender: 'male',
      height: 175,
      weight: 72,
      activity: 1.375,
      goal: 'loss',
    };
  }
}

function getStoredWeights() {
  try {
    const raw = localStorage.getItem(WEIGHTS_KEY);
    return raw
      ? JSON.parse(raw)
      : [
          { date: '2026-10-17', kg: 74.2 },
          { date: '2026-10-19', kg: 73.6 },
          { date: '2026-10-21', kg: 72.8 },
          { date: new Date().toISOString().slice(0, 10), kg: 72.0 },
        ];
  } catch {
    return [];
  }
}

export const userService = {
  async getProfile() {
    try {
      const response = await api.get('/user/profile');
      return response.data;
    } catch (err) {
      if (!err.response) {
        return {
          success: true,
          profile: getStoredProfile(),
          weights: getStoredWeights(),
        };
      }
      throw err;
    }
  },

  async updateProfile(data) {
    try {
      const response = await api.put('/user/profile', data);
      return response.data;
    } catch (err) {
      if (!err.response) {
        const current = getStoredProfile();
        const updated = { ...current, ...data };
        localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));

        // If weight changed, log to weights table if not already today
        if (data.weight) {
          const weights = getStoredWeights();
          const today = new Date().toISOString().slice(0, 10);
          const filtered = weights.filter((w) => w.date !== today);
          filtered.push({ date: today, kg: Number(data.weight) });
          filtered.sort((a, b) => (a.date < b.date ? -1 : 1));
          localStorage.setItem(WEIGHTS_KEY, JSON.stringify(filtered));
        }

        return { success: true, profile: updated };
      }
      throw err;
    }
  },

  async getWeights() {
    try {
      const response = await api.get('/user/weights');
      return response.data;
    } catch (err) {
      if (!err.response) {
        return { success: true, weights: getStoredWeights() };
      }
      throw err;
    }
  },

  async addWeight(kg) {
    try {
      const response = await api.post('/user/weights', { kg });
      return response.data;
    } catch (err) {
      if (!err.response) {
        const weights = getStoredWeights();
        const today = new Date().toISOString().slice(0, 10);
        const filtered = weights.filter((w) => w.date !== today);
        filtered.push({ date: today, kg: Number(kg) });
        filtered.sort((a, b) => (a.date < b.date ? -1 : 1));
        localStorage.setItem(WEIGHTS_KEY, JSON.stringify(filtered));

        const profile = getStoredProfile();
        profile.weight = Number(kg);
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

        return { success: true, weights: filtered, currentWeight: Number(kg) };
      }
      throw err;
    }
  },

  async updatePreferences(data) {
    try {
      const response = await api.put('/user/preferences', data);
      return response.data;
    } catch (err) {
      if (!err.response) {
        try {
          const current = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');
          const updated = { ...current, ...data };
          localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
          return { success: true, preferences: updated };
        } catch {
          return { success: true, preferences: data };
        }
      }
      throw err;
    }
  },
};

export default userService;
