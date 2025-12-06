const generateClassCode = (index) => {
  return `ML${String(index + 1).padStart(3, '0')}`;
};

export default generateClassCode;
