import React, { useMemo } from 'react';
import { Users, BookOpen, Mail } from 'react-feather';
import { FileSpreadsheet, CheckCircle, Eye } from 'lucide-react';

const DashboardView = ({
  teachers = [],
  classes = [],
  subjects = [],
  teachingRecords = [],
  users = [],
  schoolYear,
  activeSchoolYear,
  currentUser,
  onFinishYear,
  archivedYears = [],
  onChangeYear
}) => {
  const pendingUsers = useMemo(() => 
    users.filter(u => u.status === 'pending'), 
    [users]
  );

  const filteredRecords = useMemo(() => 
    teachingRecords.filter(record => {
      if (!record.schoolYear) return true;
      return record.schoolYear === schoolYear;
    }), 
    [teachingRecords, schoolYear]
  );

  const isViewingOldYear = useMemo(() => 
    schoolYear !== activeSchoolYear, 
    [schoolYear, activeSchoolYear]
  );

  const isAdmin = useMemo(() => 
    currentUser?.role === 'admin', 
    [currentUser?.role]
  );

  const grades = useMemo(() => 
    [...new Set(classes.map(c => c.grade))].sort(), 
    [classes]
  );

  const getGradeStats = useMemo(() => {
    return grades.map(grade => {
      const gradeClasses = classes.filter(c => c.grade === grade);
      const gradeRecords = filteredRecords.filter(r => {
        const recordClassId = r.classId?._id || r.classId?.id || r.classId;
        return gradeClasses.some(c => {
          const classId = c._id || c.id;
          return classId === recordClassId || classId?.toString() === recordClassId?.toString();
        });
      });
      const gradePeriods = gradeRecords.reduce((sum, r) => sum + (r.periods || 0), 0);

      return {
        grade,
        periods: gradePeriods,
        classCount: gradeClasses.length,
        recordCount: gradeRecords.length
      };
    });
  }, [grades, classes, filteredRecords]);

  return (
    <div className="space-y-6">
      {isViewingOldYear && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <Eye className="text-orange-600 flex-shrink-0" size={24} />
            <div>
              <p className="text-sm font-medium text-orange-800">
                Đang xem dữ liệu năm học: <strong>{schoolYear}</strong> (Đã kết thúc)
              </p>
              <p className="text-xs text-orange-700 mt-1">
                Dữ liệu chỉ được xem, không thể chỉnh sửa. Năm học hiện tại: <strong>{activeSchoolYear}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

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

      {pendingUsers.length > 0 && !isViewingOldYear && (
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Năm học đang xem
            </label>
            <input
              type="text"
              value={schoolYear || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 font-semibold text-blue-600"
            />
            {isViewingOldYear && (
              <p className="text-xs text-orange-600 mt-1">
                Đang xem dữ liệu năm cũ (chỉ đọc)
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Danh sách tiết dạy</label>
            <div className="text-2xl font-bold text-blue-600 py-2">{filteredRecords.length} bản ghi</div>
          </div>
        </div>

        {isAdmin && (
          <div className="mt-4 pt-4 border-t space-y-3">
            {!isViewingOldYear && (
              <button
                onClick={onFinishYear}
                className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-medium"
              >
                <CheckCircle size={20} />
                Kết thúc năm học {schoolYear}
              </button>
            )}

            {archivedYears.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xem lại dữ liệu năm học trước
                </label>
                <select
                  onChange={(e) => onChangeYear && onChangeYear(e.target.value)}
                  value={schoolYear}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {archivedYears.map(year => (
                    <option key={year} value={year}>
                      {year} {year === activeSchoolYear ? '(Hiện tại)' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Lưu ý: Dữ liệu năm cũ chỉ được xem, không thể chỉnh sửa
                </p>
              </div>
            )}

            {!isViewingOldYear && (
              <p className="text-sm text-gray-500">
                Lưu ý: Sau khi kết thúc, không thể chỉnh sửa lại năm học đã kết thúc chỉ có thể kết thúc 1 lần
              </p>
            )}
          </div>
        )}

        <div className="mt-6 pt-6 border-t">
          <h3 className="text-xl font-bold mb-4">📊 Thống kê theo khối (Năm học: {schoolYear})</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getGradeStats.map(({ grade, periods, classCount, recordCount }) => (
              <div key={grade} className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90">Khối {grade}</p>
                <p className="text-2xl font-bold mt-1">{periods} tiết</p>
                <p className="text-xs opacity-75 mt-1">
                  {classCount} lớp • {recordCount} bản ghi
                </p>
              </div>
            ))}
          </div>

          {classes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Chưa có dữ liệu lớp học cho năm học {schoolYear}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;