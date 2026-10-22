import api from './api';

const FOOD_LOG_KEY = 'okfit_food_logs';

function getStoredLogs() {
  try {
    const raw = localStorage.getItem(FOOD_LOG_KEY);
    return raw ? JSON.parse(raw) : [
      {
        id: 'log_seed_1',
        date: new Date().toISOString().slice(0, 10),
        meal: 'Breakfast',
        name: 'Oats, dry (40 g)',
        quantity: 1.5,
        calories: 225,
        protein: 7.5,
        carbs: 40.5,
        fat: 3.75,
      },
      {
        id: 'log_seed_2',
        date: new Date().toISOString().slice(0, 10),
        meal: 'Breakfast',
        name: 'Whole milk (1 cup)',
        quantity: 1,
        calories: 150,
        protein: 8,
        carbs: 12,
        fat: 8,
      },
      {
        id: 'log_seed_3',
        date: new Date().toISOString().slice(0, 10),
        meal: 'Lunch',
        name: 'Chicken breast, cooked (100 g)',
        quantity: 1.5,
        calories: 247,
        protein: 46.5,
        carbs: 0,
        fat: 5.4,
      },
      {
        id: 'log_seed_4',
        date: new Date().toISOString().slice(0, 10),
        meal: 'Lunch',
        name: 'White rice, cooked (1 cup)',
        quantity: 1.25,
        calories: 256,
        protein: 5.4,
        carbs: 56.2,
        fat: 0.5,
      },
    ];
  } catch {
    return [];
  }
}

function saveStoredLogs(logs) {
  localStorage.setItem(FOOD_LOG_KEY, JSON.stringify(logs));
}

export const foodLogService = {
  async addEntry(data) {
    try {
      const response = await api.post('/food-logs', data);
      return response.data;
    } catch (err) {
      if (!err.response) {
        const logs = getStoredLogs();
        const entry = {
          id: 'log_' + Date.now(),
          date: data.date || new Date().toISOString().slice(0, 10),
          meal: data.meal || 'Lunch',
          name: data.name,
          quantity: Number(data.quantity) || 1,
          calories: Math.round(Number(data.calories) || 0),
          protein: Math.round((Number(data.protein) || 0) * 10) / 10,
          carbs: Math.round((Number(data.carbs) || 0) * 10) / 10,
          fat: Math.round((Number(data.fat) || 0) * 10) / 10,
        };
        logs.push(entry);
        saveStoredLogs(logs);
        return { success: true, entry };
      }
      throw err;
    }
  },

  async getEntries(startDate, endDate) {
    try {
      const response = await api.get('/food-logs', {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (err) {
      if (!err.response) {
        let logs = getStoredLogs();
        if (startDate) logs = logs.filter((l) => l.date >= startDate);
        if (endDate) logs = logs.filter((l) => l.date <= endDate);
        return { success: true, entries: logs };
      }
      throw err;
    }
  },

  async deleteEntry(id) {
    try {
      const response = await api.delete(`/food-logs/${id}`);
      return response.data;
    } catch (err) {
      if (!err.response) {
        let logs = getStoredLogs();
        logs = logs.filter((l) => String(l.id) !== String(id));
        saveStoredLogs(logs);
        return { success: true, message: 'Entry deleted' };
      }
      throw err;
    }
  },

  async getDailySummary(date) {
    try {
      const response = await api.get('/food-logs/summary', { params: { date } });
      return response.data;
    } catch (err) {
      if (!err.response) {
        const targetDate = date || new Date().toISOString().slice(0, 10);
        const logs = getStoredLogs().filter((l) => l.date === targetDate);
        const summary = logs.reduce(
          (acc, item) => ({
            calories: acc.calories + (item.calories || 0),
            protein: acc.protein + (item.protein || 0),
            carbs: acc.carbs + (item.carbs || 0),
            fat: acc.fat + (item.fat || 0),
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );
        return { success: true, date: targetDate, summary, entries: logs };
      }
      throw err;
    }
  },
};

export default foodLogService;
