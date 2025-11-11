import React, { useState, useEffect } from 'react';
import { Lock, Trash2 } from 'react-feather';

// Teaching Input View (SỬA LẠI)
const TeachingInputView = ({
  teachers,
  classes,
  subjects,
  weeks,
  teachingRecords,
  setTeachingRecords,
  schoolYear,
  currentUser,
  users // THÊM users vào props
}) => {
  const [selectedWeekId, setSelectedWeekId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [periods, setPeriods] = useState('');

  const isAdmin = currentUser.role === 'admin';
  const teacher = teachers.find(t => t.userId === currentUser.username);

  // ===== THÊM MỚI: LẤY THÔNG TIN PHÂN QUYỀN KHỐI =====
  const userInfo = users.find(u => u.username === currentUser.username);
  const allowedGrades = userInfo?.allowedGrades || [];
  const hasGradeRestriction = !isAdmin && allowedGrades.length > 0;

  // ===== THÊM MỚI: LỌC LỚP THEO QUYỀN =====
  const availableClasses = hasGradeRestriction
    ? classes.filter(c => allowedGrades.includes(c.grade))
    : classes;

  useEffect(() => {
    if (!isAdmin && teacher) {
      setSelectedTeacherId(teacher.id);
    }
  }, [isAdmin, teacher]);

  const myRecords = isAdmin ? teachingRecords :
    teachingRecords.filter(r => r.teacherId === teacher?.id);

  const handleAdd = () => {
    if (!isAdmin && !teacher) {
      alert('Không tìm thấy thông tin giáo viên!');
      return;
    }

    if (isAdmin && !selectedTeacherId) {
      alert('Vui lòng chọn giáo viên!');
      return;
    }

    if (!selectedWeekId || !selectedClassId || !selectedSubjectId || !periods) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    // ===== THÊM MỚI: KIỂM TRA QUYỀN THEO KHỐI =====
    if (hasGradeRestriction) {
      const selectedClass = classes.find(c => c.id === selectedClassId);
      if (selectedClass && !allowedGrades.includes(selectedClass.grade)) {
        alert(`❌ Bạn không có quyền nhập dữ liệu cho khối ${selectedClass.grade}!\nBạn chỉ được nhập khối: ${allowedGrades.join(', ')}`);
        return;
      }
    }

    const newRecord = {
      id: `TR${Date.now()}`,
      teacherId: isAdmin ? selectedTeacherId : teacher.id,
      weekId: selectedWeekId,
      classId: selectedClassId,
      subjectId: selectedSubjectId,
      periods: parseInt(periods),
      schoolYear,
      createdBy: currentUser.username,
      createdAt: new Date().toISOString()
    };

    setTeachingRecords([...teachingRecords, newRecord]);
    setSelectedWeekId('');
    setSelectedClassId('');
    setSelectedSubjectId('');
    if (isAdmin) setSelectedTeacherId('');
    setPeriods('');
    alert('✅ Đã thêm bản ghi!');
  };

  // ===== THÊM MỚI: KIỂM TRA QUYỀN XÓA =====
  const handleDelete = (id) => {
    const record = teachingRecords.find(r => r.id === id);
    if (!record) return;

    // Chỉ cho phép xóa bản ghi của chính mình (trừ admin)
    if (!isAdmin && record.createdBy !== currentUser.username) {
      alert('❌ Bạn chỉ có thể xóa bản ghi do chính mình tạo!');
      return;
    }

    if (confirm('Xóa bản ghi này?')) {
      setTeachingRecords(teachingRecords.filter(r => r.id !== id));
    }
  };

  if (!teacher && !isAdmin) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
        <p className="text-yellow-800">Tài khoản của bạn chưa được liên kết với giáo viên. Vui lòng liên hệ Admin!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Nhập tiết dạy</h2>

      {/* ===== THÊM MỚI: HIỂN THỊ THÔNG BÁO PHÂN QUYỀN ===== */}
      {hasGradeRestriction && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Lock size={20} className="text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Phân quyền của bạn</p>
              <p className="text-sm text-blue-700">
                Bạn chỉ được nhập dữ liệu cho các khối: <strong>{allowedGrades.join(', ')}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {!isAdmin && teacher && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-600">Giáo viên</p>
              <p className="font-medium">{teacher.name}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Lớp chủ nhiệm</p>
              <p className="font-medium">{classes.find(c => c.id === teacher.mainClassId)?.name || 'Chưa có'}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Thêm bản ghi mới</h3>
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
                {teachers.map(t => {
                  const teacherSubjects = (t.subjectIds || [])
                    .map(sid => subjects.find(s => s.id === sid)?.name)
                    .filter(Boolean)
                    .join(', ') || 'Chưa có môn';
                  return (
                    <option key={t.id} value={t.id}>{t.name} - {teacherSubjects}</option>
                  );
                })}
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
              {weeks.map(w => (
                <option key={w.id} value={w.id}>
                  Tuần {w.weekNumber} ({new Date(w.startDate).toLocaleDateString('vi-VN')} - {new Date(w.endDate).toLocaleDateString('vi-VN')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lớp {hasGradeRestriction && <span className="text-blue-600">(Khối: {allowedGrades.join(', ')})</span>}
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn lớp --</option>
              {availableClasses.map(c => (
                <option key={c.id} value={c.id}>{c.name} (Khối {c.grade})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Môn học</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn môn --</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
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

          <div className="flex items-end">
            <button
              onClick={handleAdd}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Thêm
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold">Danh sách bản ghi</h3>
          <p className="text-sm text-gray-500 mt-1">Tổng: {myRecords.length} bản ghi</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tuần</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giáo viên</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lớp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Môn</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiết</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người tạo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {myRecords
                .sort((a, b) => {
                  const weekA = weeks.find(w => w.id === a.weekId);
                  const weekB = weeks.find(w => w.id === b.weekId);
                  return (weekB?.weekNumber || 0) - (weekA?.weekNumber || 0);
                })
                .map((record) => {
                  const recordTeacher = teachers.find(t => t.id === record.teacherId);
                  const week = weeks.find(w => w.id === record.weekId);
                  const cls = classes.find(c => c.id === record.classId);
                  const subject = subjects.find(s => s.id === record.subjectId);

                  return (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">
                        Tuần {week?.weekNumber || '?'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{recordTeacher?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{cls?.name || record.classId}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{subject?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{record.periods}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{record.createdBy}</td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-800"
                          title={!isAdmin && record.createdBy !== currentUser.username ? "Bạn không có quyền xóa" : "Xóa"}
                        >
                          <Trash2 size={16} />
                        </button>
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