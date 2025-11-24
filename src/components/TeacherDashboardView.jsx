import React from 'react';
import { Edit2, Download, AlertCircle } from 'react-feather';

const TeacherDashboardView = ({ teacher, teachingRecords = [], classes = [], subjects = [] }) => {

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


  const teacherSubjects = ((teacher.subjectIds || [])
    .map(sid => {

      if (typeof sid === 'object' && sid !== null && sid.name) {
        return sid.name;
      }


      const subjectId = typeof sid === 'object' ? (sid._id || sid.id) : sid;
      const subject = (subjects || []).find(s => {
        const sId = s._id || s.id;
        return sId === subjectId || sId?.toString() === subjectId?.toString();
      });
      return subject?.name;
    })
    .filter(Boolean)
    .join(', ')) || 'Chưa có';

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Xin chào, {teacher.name || 'Giáo viên'}!</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-blue-100 text-sm">Lớp chủ nhiệm</p>
            <p className="text-xl font-bold mt-1">{mainClass?.name || 'Chưa có'}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Môn dạy</p>
            <p className="text-xl font-bold mt-1">{teacherSubjects}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <p className="text-gray-500 text-sm">Tổng tiết đã dạy</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{totalPeriods}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <p className="text-gray-500 text-sm">Tiết tháng này</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{monthPeriods}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <p className="text-gray-500 text-sm">Số bản ghi</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{myRecords.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4">Hướng dẫn sử dụng</h3>
        <div className="space-y-3 text-gray-700">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-2 mt-1">
              <Edit2 size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Nhập tiết dạy hàng ngày</p>
              <p className="text-sm text-gray-600">Vào mục "Nhập tiết dạy" để ghi lại số tiết dạy mỗi ngày</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-green-100 rounded-full p-2 mt-1">
              <Download size={16} className="text-green-600" />
            </div>
            <div>
              <p className="font-medium">Xem báo cáo</p>
              <p className="text-sm text-gray-600">Vào mục "Báo cáo" để xem thống kê tiết dạy của bạn</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboardView;