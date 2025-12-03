export const generateClassCode = (index) => `ML${String(index + 1).padStart(3, '0')}`;

export const normalizeClass = (cls) => ({
  ...cls,
  id: cls._id || cls.id,
});