/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Lock, Trash2, Edit3, Check, X } from "react-feather";
import { useTeachingRecord } from "../hooks/useTeachingRecord";
import { useClasses } from "../hooks/useClasses";
import { useSubjects } from "../hooks/useSubjects";
import { useTeacher } from "../hooks/useTeacher";
import { useWeeks } from "../hooks/useWeek";

const TeachingInputView = ({ initialTeachingRecords = [], schoolYear }) => {
  const { fetchTeachers } = useTeacher();
  const { fetchClasses } = useClasses();
  const { fetchSubjects } = useSubjects();
  const { fetchWeeks } = useWeeks();
  const { fetchTeachingRecords, addTeachingRecord, updateTeachingRecord, deleteTeachingRecord } = useTeachingRecord();

  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [teachingRecords, setTeachingRecords] = useState(initialTeachingRecords || []);

  const [selectedWeekId, setSelectedWeekId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [periods, setPeriods] = useState("");
  const [recordType, setRecordType] = useState("teaching");
  const [notes, setNotes] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);

  const rawUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  let parsedUser = null;
  try {
    parsedUser = rawUser ? JSON.parse(rawUser) : null;
  } catch (err) {
    parsedUser = null;
  }
  const currentUser = parsedUser || { role: "user" };
  const isAdmin = currentUser.role === "admin";

  const normalize = (arr = [], idField = "_id") =>
    (arr || []).map((x) => ({
      ...x,
      id: x[idField] ? (typeof x[idField] === "string" ? x[idField] : x[idField]._id || x[idField]) : x.id || "",
    }));

  // ✅ FIX: Giữ lại thông tin đã populate
  const normalizeRecord = (r) => {
    if (!r) return null;

    const getId = (val) => {
      if (!val) return "";
      if (typeof val === "string") return val;
      if (val._id) return val._id.toString();
      if (val.id) return val.id;
      return "";
    };

    return {
      id: r._id?.toString() || r.id || `TR${Date.now()}`,
      teacherId: getId(r.teacherId),
      weekId: getId(r.weekId),
      classId: getId(r.classId),
      subjectId: getId(r.subjectId),
      periods: r.periods,
      recordType: r.recordType || 'teaching',
      notes: r.notes || '',
      schoolYear: r.schoolYear,
      createdAt: r.createdAt,
      
      // ✅ LƯU THÔNG TIN ĐÃ POPULATE
      teacherData: r.teacherId && typeof r.teacherId === 'object' ? {
        name: r.teacherId.name,
        email: r.teacherId.email,
        phone: r.teacherId.phone
      } : null,
      weekData: r.weekId && typeof r.weekId === 'object' ? {
        weekNumber: r.weekId.weekNumber,
        startDate: r.weekId.startDate,
        endDate: r.weekId.endDate
      } : null,
      classData: r.classId && typeof r.classId === 'object' ? {
        name: r.classId.name,
        grade: r.classId.grade,
        studentCount: r.classId.studentCount
      } : null,
      subjectData: r.subjectId && typeof r.subjectId === 'object' ? {
        name: r.subjectId.name,
        code: r.subjectId.code
      } : null
    };
  };

  useEffect(() => {
    (async () => {
      try {
        const tRes = await fetchTeachers();
        const rawTeachers = tRes.success ? (tRes.teachers || (tRes.data && tRes.data.teachers) || []) : [];
        const normTeachers = normalize(rawTeachers);
        const normalizedTeachers = normTeachers.map((t) => {
          const sids = (t.subjectIds || []).map((s) =>
            s && (s._id || s.id) ? (s._id || s.id) : typeof s === "string" ? s : ""
          ).filter(Boolean);
          return { ...t, subjectIds: sids };
        });
        setTeachers(normalizedTeachers);

        if (!isAdmin) {
          const matched = normalizedTeachers.find((tt) => {
            if (!tt.userId) return false;
            if (typeof tt.userId === "string") {
              return tt.userId === currentUser._id || tt.userId === currentUser.id;
            }
            return (
              tt.userId._id === currentUser._id ||
              tt.userId._id === currentUser.id ||
              tt.userId.email === currentUser.email
            );
          });
          if (matched) setSelectedTeacherId(matched.id);
        }
      } catch (err) {
        setTeachers([]);
      }

      try {
        const cRes = await fetchClasses();
        const rawClasses = cRes.success ? (cRes.classes || (cRes.data && cRes.data.classes) || []) : [];
        setClasses(normalize(rawClasses));
      } catch {
        setClasses([]);
      }

      try {
        const sRes = await fetchSubjects();
        const rawSubjects = sRes.success ? (sRes.subjects || (sRes.data && sRes.data.subjects) || []) : [];
        setSubjects(normalize(rawSubjects));
      } catch {
        setSubjects([]);
      }

      try {
        const wRes = await fetchWeeks();
        const rawWeeks = wRes.success ? (wRes.weeks || (wRes.data && wRes.data.weeks) || []) : [];
        setWeeks(normalize(rawWeeks));
      } catch {
        setWeeks([]);
      }
    })();
  }, []);

  const loadTeachingRecords = async (teacherId) => {
    try {
      const res = await fetchTeachingRecords(teacherId);
      if (!res) return;
      let raw = [];
      if (res.success && Array.isArray(res.teachingRecords)) raw = res.teachingRecords;
      else if (res.success && Array.isArray(res.data)) raw = res.data;
      else if (res.success && res.data && Array.isArray(res.data.teachingRecords)) raw = res.data.teachingRecords;
      else if (Array.isArray(res)) raw = res;
      const norm = raw.map(normalizeRecord).filter(Boolean);
      
      console.log('✅ Normalized first record:', norm[0]); // Debug log
      
      setTeachingRecords(norm);
    } catch (err) {
      setTeachingRecords([]);
    }
  };

  useEffect(() => {
    const teacherIdToFetch = isAdmin ? (selectedTeacherId || undefined) : selectedTeacherId || undefined;
    loadTeachingRecords(teacherIdToFetch);
  }, [selectedTeacherId, isAdmin]);

  useEffect(() => {
    if (!selectedTeacherId) return;
    const t = teachers.find((x) => x.id === selectedTeacherId);
    const tSubjectIds = t?.subjectIds || [];
    if (tSubjectIds.length > 0) {
      if (!tSubjectIds.includes(selectedSubjectId)) {
        setSelectedSubjectId(tSubjectIds[0]);
      }
    } else {
      setSelectedSubjectId("");
    }
  }, [selectedTeacherId, teachers]);

  const allowedGrades = currentUser?.allowedGrades || [];
  const hasGradeRestriction = !isAdmin && Array.isArray(allowedGrades) && allowedGrades.length > 0;
  const availableClasses = hasGradeRestriction
    ? classes.filter((c) => allowedGrades.includes(c.grade))
    : classes;

  const myRecords = isAdmin ? teachingRecords : teachingRecords.filter((r) => r.teacherId === selectedTeacherId);

  const resetForm = (keepTeacher = false) => {
    setSelectedWeekId("");
    setSelectedClassId("");
    setPeriods("");
    setRecordType("teaching");
    setNotes("");
    setIsEditing(false);
    setEditingRecordId(null);
    if (!keepTeacher) setSelectedTeacherId("");
  };

  const startEdit = (record) => {
    setIsEditing(true);
    setEditingRecordId(record.id);
    setSelectedTeacherId(record.teacherId);
    setSelectedWeekId(record.weekId);
    setSelectedClassId(record.classId);
    setSelectedSubjectId(record.subjectId);
    setPeriods(record.periods);
    setRecordType(record.recordType || 'teaching');
    setNotes(record.notes || '');
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    resetForm(!isAdmin);
  };

  const handleSave = async () => {
    if (!editingRecordId) return;
    if (!selectedWeekId || !selectedClassId || !selectedSubjectId || !periods) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const payload = {
      teacherId: selectedTeacherId,
      weekId: selectedWeekId,
      subjectId: selectedSubjectId,
      classId: selectedClassId,
      periods: parseInt(periods, 10),
      recordType: recordType || 'teaching',
      notes: notes || '',
      schoolYear,
    };

    const res = await updateTeachingRecord(editingRecordId, payload);
    if (res.success) {
      const teacherIdToFetch = isAdmin ? (selectedTeacherId || undefined) : selectedTeacherId || undefined;
      await loadTeachingRecords(teacherIdToFetch);
      resetForm(!isAdmin);
      alert("✅ Đã cập nhật bản ghi!");
    } else {
      alert(res.message || "Cập nhật thất bại");
    }
  };

  const handleAdd = async () => {
    if (isEditing) {
      await handleSave();
      return;
    }
    if (!isAdmin && !selectedTeacherId) {
      alert("Không tìm thấy thông tin giáo viên!");
      return;
    }
    if (isAdmin && !selectedTeacherId) {
      alert("Vui lòng chọn giáo viên!");
      return;
    }
    if (!selectedWeekId || !selectedClassId || !selectedSubjectId || !periods) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (hasGradeRestriction) {
      const selectedClass = classes.find((c) => c.id === selectedClassId);
      if (selectedClass && !allowedGrades.includes(selectedClass.grade)) {
        alert(`❌ Bạn không có quyền nhập dữ liệu cho khối ${selectedClass.grade}!\nBạn chỉ được nhập khối: ${allowedGrades.join(", ")}`);
        return;
      }
    }

    const payload = {
      teacherId: selectedTeacherId,
      weekId: selectedWeekId,
      subjectId: selectedSubjectId,
      classId: selectedClassId,
      periods: parseInt(periods, 10),
      recordType: recordType || 'teaching',
      notes: notes || '',
      schoolYear,
    };

    const res = await addTeachingRecord(payload);
    if (res.success) {
      const teacherIdToFetch = isAdmin ? (selectedTeacherId || undefined) : selectedTeacherId || undefined;
      await loadTeachingRecords(teacherIdToFetch);
      resetForm(!isAdmin);
      alert("✅ Đã thêm bản ghi!");
    } else {
      alert(res.message || "Thêm bản ghi thất bại");
    }
  };

  const handleDelete = async (recordId) => {
    const record = teachingRecords.find((r) => r.id === recordId);
    if (!record) return;

    if (!confirm("Xác nhận xóa bản ghi này?")) return;

    const res = await deleteTeachingRecord(recordId);
    if (res.success) {
      const teacherIdToFetch = isAdmin ? (selectedTeacherId || undefined) : selectedTeacherId || undefined;
      await loadTeachingRecords(teacherIdToFetch);
      alert("✅ Đã xóa bản ghi!");
    } else {
      alert(res.message || "Xóa thất bại");
    }
  };

  const subjectBelongsToSelectedTeacher = (sid) => {
    if (!selectedTeacherId) return false;
    const t = teachers.find((tt) => tt.id === selectedTeacherId);
    if (!t) return false;
    return (t.subjectIds || []).includes(sid);
  };

  const recordTypeLabels = {
    'teaching': 'Giảng dạy',
    'tn-hn1': 'TN-HN 1',
    'tn-hn2': 'TN-HN 2',
    'tn-hn3': 'TN-HN 3',
    'extra': 'Kiêm nhiệm',
    'exam': 'Coi thi'
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{isEditing ? "Chỉnh sửa bản ghi" : "Nhập tiết dạy"}</h2>

      {hasGradeRestriction && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Lock size={20} className="text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Phân quyền của bạn</p>
              <p className="text-sm text-blue-700">
                Bạn chỉ được nhập dữ liệu cho các khối: <strong>{allowedGrades.join(", ")}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {!isAdmin && !selectedTeacherId && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <p className="text-yellow-800">Tài khoản của bạn chưa được liên kết với giáo viên. Vui lòng liên hệ Admin!</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">{isEditing ? "Sửa bản ghi" : "Thêm bản ghi mới"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giáo viên</label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn giáo viên --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tuần học</label>
            <select
              value={selectedWeekId}
              onChange={(e) => setSelectedWeekId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn tuần --</option>
              {weeks.map((w) => (
                <option key={w.id} value={w.id}>
                  Tuần {w.weekNumber} ({new Date(w.startDate).toLocaleDateString("vi-VN")} -{" "}
                  {new Date(w.endDate).toLocaleDateString("vi-VN")})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại tiết dạy
            </label>
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="teaching">Giảng dạy (Khối 10, 11, 12)</option>
              <option value="tn-hn1">TN-HN 1</option>
              <option value="tn-hn2">TN-HN 2</option>
              <option value="tn-hn3">TN-HN 3</option>
              <option value="extra">Kiêm nhiệm</option>
              <option value="exam">Coi thi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lớp {hasGradeRestriction && <span className="text-blue-600">(Khối: {allowedGrades.join(", ")})</span>}
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn lớp --</option>
              {availableClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Khối {c.grade})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Môn học</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {subjects.length === 0 && <div className="text-sm text-gray-500">Không có môn</div>}
              {subjects.map((s) => {
                const isTeacherSubject = subjectBelongsToSelectedTeacher(s.id);
                const isSelected = s.id === selectedSubjectId;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSubjectId(s.id)}
                    className={`px-3 py-2 border rounded-lg text-left transition-colors ${isSelected ? "bg-blue-50 border-blue-400" : isTeacherSubject ? "bg-white border-blue-200" : "bg-white border-gray-200"
                      }`}
                    title={isTeacherSubject ? "Môn thuộc giáo viên đã chọn" : ""}
                  >
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-gray-400">{s.code || ""}</div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-1">Khi chọn giáo viên, môn của giáo viên sẽ tự động sáng lên và auto chọn môn đầu tiên nếu có.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số tiết</label>
            <input
              type="number"
              min="1"
              value={periods}
              onChange={(e) => setPeriods(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú (tùy chọn)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Dạy thay, thi giữa kỳ..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              title={isEditing ? "Lưu thay đổi" : "Thêm bản ghi"}
            >
              <Check size={16} />
              <span className="text-sm">{isEditing ? "Lưu" : "Thêm"}</span>
            </button>
            {isEditing && (
              <button
                onClick={cancelEdit}
                className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                title="Hủy chỉnh sửa"
              >
                <X size={16} />
                <span className="text-sm">Hủy</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Danh sách bản ghi</h3>
            <p className="text-sm text-gray-500 mt-1">Tổng: {myRecords.length} bản ghi</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tuần</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giáo viên</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lớp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Môn</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiết</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {myRecords
                .sort((a, b) => {
                  const weekA = weeks.find((w) => w.id === a.weekId);
                  const weekB = weeks.find((w) => w.id === b.weekId);
                  return (weekB?.weekNumber || 0) - (weekA?.weekNumber || 0);
                })
                .map((record) => {
                  // ✅ FIX: Ưu tiên dùng data đã populate
                  const teacherName = record.teacherData?.name || 
                                     teachers.find((t) => t.id === record.teacherId)?.name || 
                                     "-";
                  
                  const weekNumber = record.weekData?.weekNumber || 
                                    weeks.find((w) => w.id === record.weekId)?.weekNumber || 
                                    "?";
                  
                  const className = record.classData?.name || 
                                   classes.find((c) => c.id === record.classId)?.name || 
                                   "-";
                  
                  const subjectName = record.subjectData?.name || 
                                     subjects.find((s) => s.id === record.subjectId)?.name || 
                                     "-";

                  const canEdit = isAdmin || (!isAdmin && record.teacherId === selectedTeacherId);

                  return (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">
                        Tuần {weekNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {teacherName}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.recordType === 'teaching' ? 'bg-blue-100 text-blue-700' :
                          record.recordType === 'extra' ? 'bg-purple-100 text-purple-700' :
                          record.recordType === 'exam' ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {recordTypeLabels[record.recordType] || 'Giảng dạy'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {className}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {subjectName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {record.periods}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400 italic">
                        {record.notes || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            onClick={() => startEdit(record)}
                            disabled={!canEdit}
                            className={`p-2 rounded-md ${
                              !canEdit 
                                ? "opacity-40 cursor-not-allowed" 
                                : "bg-gray-50 hover:bg-blue-50 text-blue-600"
                            } transition`}
                            title={canEdit ? "Sửa" : "Bạn không có quyền sửa"}
                          >
                            <Edit3 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeachingInputView;