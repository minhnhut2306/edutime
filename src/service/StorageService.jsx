/* eslint-disable no-unused-vars */


// ==================== SERVICES ====================
const StorageService = {
  async loadData(key) {
    try {
      if (!window.storage) {
        console.warn('Storage API not available');
        return null;
      }
      const data = await window.storage.get(key, true);
      return data ? JSON.parse(data.value) : null;
    } catch (error) {
      return null;
    }
  },

  async saveData(key, value) {
    try {
      if (!window.storage) {
        console.warn('Storage API not available');
        return false;
      }
      await window.storage.set(key, JSON.stringify(value), true);
      return true;
    } catch (error) {
      console.error('Error saving:', error);
      return false;
    }
  },

  async getSchoolYearsList() {
    try {
      if (!window.storage) {
        return ['2024-2025']; // Trả về mặc định
      }
      const result = await window.storage.list('edutime_year_', true);
      if (!result || !result.keys) return ['2024-2025'];
      
      const years = result.keys
        .map(key => key.replace('edutime_year_', ''))
        .sort((a, b) => {
          const [yearA] = a.split('-').map(Number);
          const [yearB] = b.split('-').map(Number);
          return yearB - yearA;
        });
      
      return years.length > 0 ? years : ['2024-2025'];
    } catch (error) {
      return ['2024-2025'];
    }
  },

  async addSchoolYear(year) {
    if (!window.storage) {
      console.warn('Storage API not available');
      return;
    }
    const key = `edutime_year_${year}`;
    const existing = await this.loadData(key);
    if (!existing) {
      await this.saveData(key, {
        teachers: [],
        classes: [],
        subjects: [],
        weeks: [],
        teachingRecords: []
      });
    }
  }
};

export default StorageService;