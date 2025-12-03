// helper / utility for ReportView
export const getCurrentSchoolYear = (schoolYear) => {
  if (!schoolYear) return null;
  return typeof schoolYear === 'object' ? schoolYear?.year : schoolYear;
};

export const findLinkedTeacher = (teachers = [], currentUser = {}) => {
  if (!currentUser) return null;
  const currentUserId = currentUser?._id || currentUser?.id;
  return teachers.find(t => {
    if (!t.userId) return false;
    const teacherUserId = t.userId?._id || t.userId;
    return teacherUserId === currentUserId || teacherUserId?.toString() === currentUserId?.toString();
  }) || null;
};

export const normalizeId = (item) => item?.id || item?._id || item;

export const filterRecordsByTeacherAndYear = (records = [], teacherId, schoolYear) => {
  if (!teacherId) return [];
  return records.filter(r => {
    const rTeacherId = r.teacherId?._id || r.teacherId;
    const recordSchoolYear = r.schoolYear?.year || r.schoolYear;
    const matchesTeacher = rTeacherId === teacherId || rTeacherId?.toString() === teacherId?.toString();
    const matchesYear = schoolYear ? recordSchoolYear === schoolYear : true;
    return matchesTeacher && matchesYear;
  });
};

export const sumPeriods = (records = []) => records.reduce((s, r) => s + (Number(r.periods) || 0), 0);