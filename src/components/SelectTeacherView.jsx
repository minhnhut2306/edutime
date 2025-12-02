import React, { useState, useEffect } from 'react';
import { Users, Loader, CheckCircle } from 'lucide-react';
import { useTeacher } from '../hooks/useTeacher';

const SelectTeacherView = ({ currentUser }) => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const { fetchTeachers, updateTeacherUserId, loading } = useTeacher();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    const result = await fetchTeachers();
    if (result.success) {

      const availableTeachers = result.teachers.filter(t => !t.userId);
      setTeachers(availableTeachers);
    } else {
      alert('Không thể tải danh sách giáo viên: ' + result.message);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTeacherId) {
      alert('Vui lòng chọn giáo viên!');
      return;
    }

    if (!confirm('Xác nhận bạn là giáo viên này? Bạn không thể thay đổi sau khi chọn.')) {
      return;
    }

    setSubmitting(true);
    const result = await updateTeacherUserId(selectedTeacherId, currentUser._id || currentUser.id);

    if (result.success) {
      alert(' Đã liên kết tài khoản với giáo viên thành công!');

      window.location.reload();
    } else {
      alert(' Lỗi: ' + result.message);
      setSubmitting(false);
    }
  };

  if (loading && teachers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600">Đang tải danh sách giáo viên...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Chọn hồ sơ giáo viên</h1>
          <p className="text-gray-500 mt-2">Vui lòng chọn hồ sơ giáo viên của bạn</p>
          <p className="text-sm text-orange-600 mt-2">️ Bạn chỉ có thể chọn một lần duy nhất</p>
        </div>

        {teachers.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800 font-medium">Không có giáo viên nào khả dụng</p>
            <p className="text-sm text-yellow-600 mt-2">
              Vui lòng liên hệ Admin để được thêm vào hệ thống
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
              {teachers.map((teacher) => (
                <button
                  key={teacher._id || teacher.id}
                  onClick={() => setSelectedTeacherId(teacher._id || teacher.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedTeacherId === (teacher._id || teacher.id)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">{teacher.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Môn dạy: {teacher.subjectIds?.map(s => s.name).join(', ') || 'Chưa có'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Lớp chủ nhiệm: {teacher.mainClassId?.name || 'Chưa có'}
                      </p>
                    </div>
                    {selectedTeacherId === (teacher._id || teacher.id) && (
                      <CheckCircle className="text-blue-600" size={24} />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selectedTeacherId || submitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Đang xác nhận...
                </>
              ) : (
                'Xác nhận'
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SelectTeacherView;