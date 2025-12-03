export const normalizeTeachers = (rawTeachers = []) =>
  (rawTeachers || []).map((teacher, idx) => {
    const subjectIdsList = Array.isArray(teacher.subjectIds)
      ? teacher.subjectIds.map(s => (typeof s === 'object' && s !== null ? (s._id || s.id) : s))
      : [];
    return {
      idxNum: idx,
      id: teacher._id || teacher.id,
      name: teacher.name,
      email: teacher.userId?.email || teacher.email || '',
      phone: teacher.phone || '',
      mainClassId: teacher.mainClassId?._id || teacher.mainClassId || '',
      mainClassName: teacher.mainClassId?.name || teacher.mainClassName || '',
      subjectIds: subjectIdsList,
      userId: teacher.userId?._id || teacher.userId || '',
      teacherCode: teacher.teacherCode || teacher.code || null,
    };
  });

export const maskEmail = (email) => {
  if (!email) return '-';
  const [user, domain] = String(email).split('@');
  if (!domain) return '***';
  return `${user.charAt(0)}***@${domain}`;
};

export const maskPhone = (phone) => {
  if (!phone) return '-';
  const s = String(phone);
  return s.length <= 4 ? '***' : `***${s.slice(-3)}`;
};