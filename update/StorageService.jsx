
const StorageService = {
  async loadData() {
    try {
      const teachersData = await window.storage.get('teachers');
      const classesData = await window.storage.get('classes');
      const subjectsData = await window.storage.get('subjects');
      
      return {
        teachers: teachersData ? JSON.parse(teachersData.value) : [],
        classes: classesData ? JSON.parse(classesData.value) : [],
        subjects: subjectsData ? JSON.parse(subjectsData.value) : []
      };
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      console.log('Initializing new data');
      return { teachers: [], classes: [], subjects: [] };
    }
  },

  async saveData(teachers, classes, subjects) {
    try {
      await window.storage.set('teachers', JSON.stringify(teachers));
      await window.storage.set('classes', JSON.stringify(classes));
      await window.storage.set('subjects', JSON.stringify(subjects));
      alert('Dữ liệu đã được lưu thành công!');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Có lỗi khi lưu dữ liệu!');
    }
  }
};
export default StorageService;