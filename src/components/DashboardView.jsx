import React from 'react';
import { Users, BookOpen, FileText, BarChart2, Mail } from 'react-feather';
import { BarChart3, FileSpreadsheet, CheckCircle } from 'lucide-react';

const DashboardView = ({
  teachers = [],
  classes = [],
  subjects = [],
  teachingRecords = [],
  users = [],
  schoolYear,
  setSchoolYear,
  currentUser,
  onFinishYear,
  archivedYears = [],
  onChangeYear
}) => {
  const pendingUsers = users.filter(u => u.status === 'pending');
  const totalRecords = teachingRecords.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Giáo viên</p>
              <p className="text-3xl font-bold mt-1">{teachers.length}</p>
            </div>
            <Users size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Lớp học</p>
              <p className="text-3xl font-bold mt-1">{classes.length}</p>
            </div>
            <BookOpen size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Môn học</p>
              <p className="text-3xl font-bold mt-1">{subjects.length}</p>
            </div>
            <FileSpreadsheet size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {pendingUsers.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-center">
            <Mail className="text-yellow-600 mr-3" size={24} />
            <div>
              <p className="font-medium text-yellow-800">Có {pendingUsers.length} tài khoản chờ duyệt</p>
              <p className="text-sm text-yellow-700">Vui lòng kiểm tra mục "Người dùng" để duyệt</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4">Thông tin năm học</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Năm học</label>
            <input
              type="text"
              value={schoolYear || ''}
              onChange={(e) => setSchoolYear && setSchoolYear(e.target.value)}
              disabled={!currentUser || currentUser.role !== 'admin'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tổng số bản ghi</label>
            <div className="text-2xl font-bold text-blue-600 py-2">{totalRecords}</div>
          </div>
        </div>

        {currentUser && currentUser.role === 'admin' && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <button
              onClick={onFinishYear}
              className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-medium"
            >
              <CheckCircle size={20} />
              Kết thúc năm học {schoolYear}
            </button>

            {archivedYears.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Xem lại dữ liệu năm học trước</label>
                <select
                  onChange={(e) => onChangeYear && onChangeYear(e.target.value)}
                  value=""
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn năm học --</option>
                  {archivedYears.filter(y => y !== schoolYear).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Lưu ý: Dữ liệu năm cũ chỉ được xem, không thể chỉnh sửa
                </p>
              </div>
            )}

            <p className="text-sm text-gray-500">
              Lưu ý: Sau khi kết thúc, dữ liệu năm học này sẽ được lưu trữ và bạn có thể bắt đầu năm học mới.
            </p>
          </div>
        )}

        {}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4"> Thống kê theo khối</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...new Set(classes.map(c => c.grade))].sort().map(grade => {
              const gradeClasses = classes.filter(c => c.grade === grade);
              const gradeRecords = teachingRecords.filter(r =>
                gradeClasses.some(c => c.id === r.classId)
              );
              const gradePeriods = gradeRecords.reduce((sum, r) => sum + (r.periods || 0), 0);

              return (
                <div key={grade} className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-4 text-white">
                  <p className="text-sm opacity-90">Khối {grade}</p>
                  <p className="text-2xl font-bold mt-1">{gradePeriods} tiết</p>
                  <p className="text-xs opacity-75 mt-1">{gradeClasses.length} lớp • {gradeRecords.length} bản ghi</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;