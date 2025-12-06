export const recordTypeLabels = {
  teaching: "Giảng dạy",
  "tn-hn1": "TN-HN 1",
  "tn-hn2": "TN-HN 2",
  "tn-hn3": "TN-HN 3",
  extra: "Kiêm nhiệm",
  exam: "Coi thi",
};

export const normalize = (arr = [], idField = "_id") =>
  (arr || []).map((x) => ({
    ...x,
    id: x[idField] ? (typeof x[idField] === "string" ? x[idField] : x[idField]._id || x[idField]) : x.id || "",
  }));

export const normalizeRecord = (r) => {
  if (!r) return null;
  return {
    id: r._id?.toString() || r.id || `TR${Date.now()}`,
    teacherId: (r.teacherId && (typeof r.teacherId === "string" ? r.teacherId : r.teacherId._id || r.teacherId.id)) || "",
    weekId: (r.weekId && (typeof r.weekId === "string" ? r.weekId : r.weekId._id || r.weekId.id)) || "",
    classId: (r.classId && (typeof r.classId === "string" ? r.classId : r.classId._id || r.classId.id)) || "",
    subjectId: (r.subjectId && (typeof r.subjectId === "string" ? r.subjectId : r.subjectId._id || r.subjectId.id)) || "",
    periods: r.periods,
    recordType: r.recordType || "teaching",
    notes: r.notes || "",
    schoolYear: r.schoolYear,
    createdAt: r.createdAt,
    teacherData: r.teacherId && typeof r.teacherId === "object" ? {
      name: r.teacherId.name,
      email: r.teacherId.email,
      phone: r.teacherId.phone
    } : null,
    weekData: r.weekId && typeof r.weekId === "object" ? {
      weekNumber: r.weekId.weekNumber,
      startDate: r.weekId.startDate,
      endDate: r.weekId.endDate
    } : null,
    classData: r.classId && typeof r.classId === "object" ? {
      name: r.classId.name,
      grade: r.classId.grade,
      studentCount: r.classId.studentCount
    } : null,
    subjectData: r.subjectId && typeof r.subjectId === "object" ? {
      name: r.subjectId.name,
      code: r.subjectId.code
    } : null
  };
};
