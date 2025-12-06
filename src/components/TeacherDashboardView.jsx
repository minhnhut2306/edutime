import React, { useState, useEffect } from 'react';
import { Edit2, Phone, BookOpen, School, Save, X, AlertCircle, CheckCircle, Calendar, TrendingUp } from 'lucide-react';

const SubjectSelector = ({ subjects, selectedSubjectIds = [], onToggle, disabled }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Các môn dạy <span className="text-red-500">*</span>
    </label>
    <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
      {subjects.length === 0 ? (
        <p className="text-sm text-gray-500">Chưa có môn học nào</p>
      ) : (
        subjects.map(s => {
          const subjectId = s._id || s.id;
          const isSelected = selectedSubjectIds.includes(subjectId);
          return (
            <button
              key={subjectId}
              type="button"
              onClick={() => !disabled && onToggle(subjectId)}
              disabled={disabled}
              className={`px-3 py-1.5 rounded-lg border-2 transition-all font-medium ${isSelected
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {s.name}
            </button>
          );
        })
      )}
    </div>

  </div>
);

const TeacherDashboardView = ({ teacher, teachingRecords = [], classes = [], subjects = [] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subjectIds: [],
    mainClassId: ''
  });


  useEffect(() => {
    if (teacher) {

      let normalizedSubjectIds = [];
      if (Array.isArray(teacher.subjectIds)) {
        normalizedSubjectIds = teacher.subjectIds.map(s => {
          if (typeof s === 'object' && s !== null) {
            return s._id || s.id;
          }
          return s;
        }).filter(Boolean);
      }

      setFormData({
        name: teacher.name || '',
        phone: teacher.phone || '',
        subjectIds: normalizedSubjectIds,
        mainClassId: teacher.mainClassId?._id || teacher.mainClassId || ''
      });
    }
  }, [teacher]);

  if (!teacher) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-900">Tài khoản chưa được liên kết</p>
              <p className="text-sm text-yellow-700 mt-1">
                Tài khoản của bạn chưa được liên kết với giáo viên nào trong hệ thống.
                Vui lòng liên hệ Admin để được phân quyền!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const teacherId = teacher._id || teacher.id;
  const myRecords = (teachingRecords || []).filter(r => {
    const recordTeacherId = r.teacherId?._id || r.teacherId;
    return recordTeacherId === teacherId || recordTeacherId?.toString() === teacherId?.toString();
  });
  const totalPeriods = myRecords.reduce((sum, r) => sum + (r.periods || 0), 0);

  const today = new Date();
  const currentMonth = today.getMonth();
  const monthRecords = myRecords.filter(r => {
    const recordDate = new Date(r.date || r.createdAt);
    return recordDate.getMonth() === currentMonth;
  });
  const monthPeriods = monthRecords.reduce((sum, r) => sum + (r.periods || 0), 0);


  const mainClassId = teacher.mainClassId?._id || teacher.mainClassId;
  const mainClass = (classes || []).find(c => {
    const classId = c._id || c.id;
    return classId === mainClassId || classId?.toString() === mainClassId?.toString();
  });


  const teacherSubjects = [];
  if (Array.isArray(teacher.subjectIds)) {
    teacher.subjectIds.forEach(sid => {

      if (typeof sid === 'object' && sid !== null && sid.name) {
        teacherSubjects.push(sid);
      } else {

        const subjectId = typeof sid === 'object' ? (sid._id || sid.id) : sid;
        const subject = (subjects || []).find(s => {
          const sId = s._id || s.id;
          return sId === subjectId || sId?.toString() === subjectId?.toString();
        });
        if (subject) {
          teacherSubjects.push(subject);
        }
      }
    });
  }


  const availableClasses = classes.filter(cls => {
    const clsId = cls._id || cls.id;
    const currentMainClassId = teacher.mainClassId?._id || teacher.mainClassId;


    const hasOtherHomeRoomTeacher = false;


    const isCurrentClass = currentMainClassId === clsId || currentMainClassId?.toString() === clsId?.toString();

    return isCurrentClass || !hasOtherHomeRoomTeacher;
  });

  const handleSubjectToggle = (subjectId) => {
    const isSelected = formData.subjectIds.includes(subjectId);
    setFormData(prev => ({
      ...prev,
      subjectIds: isSelected
        ? prev.subjectIds.filter(id => id !== subjectId)
        : [...prev.subjectIds, subjectId]
    }));
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');


    if (!formData.name.trim()) {
      setError('Vui lòng nhập họ tên!');
      return;
    }

    if (formData.subjectIds.length === 0) {
      setError('Vui lòng chọn ít nhất một môn học!');
      return;
    }


    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        setError('Số điện thoại không hợp lệ (10-11 chữ số)!');
        return;
      }
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://edutime-server.vercel.app/api/teachers/${teacherId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim() || '',
          subjectIds: formData.subjectIds,
          mainClassId: formData.mainClassId || ''
        })
      });

      const data = await response.json();

      if (data.code === 200) {
        setSuccess('Cập nhật thông tin thành công!');
        setIsEditing(false);


        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error(data.msg || 'Cập nhật thất bại');
      }
    } catch (err) {
      console.error('Error updating teacher:', err);
      setError(err.message || 'Có lỗi xảy ra khi cập nhật thông tin!');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');


    if (teacher) {
      let normalizedSubjectIds = [];
      if (Array.isArray(teacher.subjectIds)) {
        normalizedSubjectIds = teacher.subjectIds.map(s => {
          if (typeof s === 'object' && s !== null) {
            return s._id || s.id;
          }
          return s;
        }).filter(Boolean);
      }

      setFormData({
        name: teacher.name || '',
        phone: teacher.phone || '',
        subjectIds: normalizedSubjectIds,
        mainClassId: teacher.mainClassId?._id || teacher.mainClassId || ''
      });
    }
  };

  return (
    <div className="space-y-6">
      { }
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Xin chào, {teacher.name || 'Giáo viên'}!</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit2 size={20} />
            Chỉnh sửa thông tin
          </button>
        )}
      </div>

      { }
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} className="text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}

      {!isEditing ? (

        <>
          { }
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 text-blue-100">
                  <School size={18} />
                  <p className="text-sm">Lớp chủ nhiệm</p>
                </div>
                <p className="text-xl font-bold">{mainClass?.name || 'Chưa có'}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2 text-blue-100">
                  <BookOpen size={18} />
                  <p className="text-sm">Môn dạy</p>
                </div>
                <p className="text-xl font-bold">
                  {teacherSubjects.length > 0
                    ? teacherSubjects.map(s => s.name).join(', ')
                    : 'Chưa có'}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2 text-blue-100">
                  <Phone size={18} />
                  <p className="text-sm">Số điện thoại</p>
                </div>
                <p className="text-xl font-bold">{teacher.phone || 'Chưa cập nhật'}</p>
              </div>
            </div>
          </div>

          { }
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-blue-500" size={20} />
                <p className="text-gray-500 text-sm">Tổng tiết đã dạy</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">{totalPeriods}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-green-500" size={20} />
                <p className="text-gray-500 text-sm">Tiết tháng này</p>
              </div>
              <p className="text-3xl font-bold text-green-600">{monthPeriods}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="text-purple-500" size={20} />
                <p className="text-gray-500 text-sm">Số bản ghi</p>
              </div>
              <p className="text-3xl font-bold text-purple-600">{myRecords.length}</p>
            </div>
          </div>
        </>
      ) : (

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-6">Chỉnh sửa thông tin cá nhân</h3>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  placeholder="0123456789"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lớp chủ nhiệm
              </label>
              <select
                value={formData.mainClassId}
                onChange={(e) => setFormData({ ...formData, mainClassId: e.target.value })}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="">-- Không chủ nhiệm lớp nào --</option>
                {availableClasses.map(c => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.name} (Khối {c.grade})
                  </option>
                ))}
              </select>
            </div>

            <SubjectSelector
              subjects={subjects}
              selectedSubjectIds={formData.subjectIds}
              onToggle={handleSubjectToggle}
              disabled={loading}
            />

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Lưu thay đổi
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors font-medium"
              >
                <X size={20} />
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboardView;
