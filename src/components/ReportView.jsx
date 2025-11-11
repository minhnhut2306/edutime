
import React, { useState } from 'react';
import { Download, BarChart3 } from 'lucide-react';
import ExcelService from '../service/ExcelService';


// Report View
const ReportView = ({ teachers, classes, subjects, teachingRecords, weeks, schoolYear, currentUser }) => {
  const isAdmin = currentUser.role === 'admin';
  
  // ===== THÊM MỚI: Lấy giáo viên được liên kết =====
  const linkedTeacher = teachers.find(t => t.userId === currentUser.username);
  
  // ===== THÊM MỚI: Giới hạn danh sách GV theo quyền =====
  const availableTeachers = isAdmin ? teachers : 
    (linkedTeacher ? [linkedTeacher] : []);

  const [selectedTeacherId, setSelectedTeacherId] = useState(
    isAdmin ? '' : (linkedTeacher?.id || '')
  );
  const [reportType, setReportType] = useState('teacher');
  const [exportType, setExportType] = useState('month');

  // ===== THÊM MỚI: Cảnh báo nếu user chưa được liên kết =====
  if (!isAdmin && !linkedTeacher) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Báo cáo & Xuất Excel</h2>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
          <div className="flex items-center gap-3">
            <Mail size={24} className="text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-900">Tài khoản chưa được liên kết</p>
              <p className="text-sm text-yellow-700 mt-1">
                Tài khoản của bạn chưa được liên kết với giáo viên. 
                Vui lòng liên hệ Admin để được phân quyền!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleExport = () => {
    if (!isAdmin) {
      alert('⛔ Chỉ Admin mới có quyền xuất báo cáo Excel!');
      return;
    }

    if (!selectedTeacherId) {
      alert('Vui lòng chọn giáo viên!');
      return;
    }

    const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
    if (!selectedTeacher) {
      alert('Không tìm thấy thông tin giáo viên!');
      return;
    }

    const teacherRecords = teachingRecords.filter(r => r.teacherId === selectedTeacherId);
    if (teacherRecords.length === 0) {
      alert('Chưa có dữ liệu để xuất báo cáo!');
      return;
    }

    switch (exportType) {
      case 'month':
        ExcelService.exportTeacherReport(selectedTeacher, teacherRecords, schoolYear, classes, subjects, weeks);
        break;
      case 'week':
        ExcelService.exportWeeklyReport(selectedTeacher, teacherRecords, schoolYear, classes, subjects, weeks);
        break;
      case 'semester':
        ExcelService.exportSemesterReport(selectedTeacher, teacherRecords, schoolYear, classes, subjects, weeks);
        break;
      case 'year':
        ExcelService.exportYearReport(selectedTeacher, teacherRecords, schoolYear, classes, subjects, weeks);
        break;
    }

    alert('✅ Đã xuất báo cáo Excel!');
  };

  const myRecords = selectedTeacherId ?
    teachingRecords.filter(r => r.teacherId === selectedTeacherId) : [];
  const totalPeriods = myRecords.reduce((sum, r) => sum + (r.periods || 0), 0);

  const today = new Date();
  const currentMonth = today.getMonth();
  const monthRecords = myRecords.filter(r => {
    const week = weeks.find(w => w.id === r.weekId);
    if (!week) return false;
    const weekDate = new Date(week.startDate);
    return weekDate.getMonth() === currentMonth;
  });
  const monthPeriods = monthRecords.reduce((sum, r) => sum + (r.periods || 0), 0);

  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);

  const gradeStats = () => {
    if (!selectedTeacherId) return [];

    const grades = [...new Set(classes.map(c => c.grade))].sort();
    return grades.map(grade => {
      const gradeClasses = classes.filter(c => c.grade === grade);
      const gradeRecords = myRecords.filter(r =>
        gradeClasses.some(c => c.id === r.classId)
      );
      const gradePeriods = gradeRecords.reduce((sum, r) => sum + (r.periods || 0), 0);

      return {
        grade,
        classes: gradeClasses.length,
        records: gradeRecords.length,
        periods: gradePeriods
      };
    }).filter(g => g.periods > 0);
  };

  const semesterStats = () => {
    if (!selectedTeacherId || weeks.length === 0) return [];

    const semester1Weeks = weeks.filter(w => w.weekNumber <= 18);
    const semester2Weeks = weeks.filter(w => w.weekNumber > 18 && w.weekNumber <= 35);

    const sem1Records = myRecords.filter(r =>
      semester1Weeks.some(w => w.id === r.weekId)
    );
    const sem2Records = myRecords.filter(r =>
      semester2Weeks.some(w => w.id === r.weekId)
    );

    return [
      {
        semester: 'Học kỳ 1',
        weeks: 'Tuần 1-18',
        records: sem1Records.length,
        periods: sem1Records.reduce((sum, r) => sum + (r.periods || 0), 0)
      },
      {
        semester: 'Học kỳ 2',
        weeks: 'Tuần 19-35',
        records: sem2Records.length,
        periods: sem2Records.reduce((sum, r) => sum + (r.periods || 0), 0)
      }
    ];
  };

  const weeklyStats = () => {
    if (!selectedTeacherId) return [];

    return weeks
      .sort((a, b) => b.weekNumber - a.weekNumber)
      .map(week => {
        const weekRecords = myRecords.filter(r => r.weekId === week.id);
        const weekPeriods = weekRecords.reduce((sum, r) => sum + (r.periods || 0), 0);

        if (weekPeriods === 0) return null;

        return {
          weekNumber: week.weekNumber,
          startDate: week.startDate,
          endDate: week.endDate,
          records: weekRecords.length,
          periods: weekPeriods
        };
      })
      .filter(w => w !== null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Báo cáo & Xuất Excel</h2>
        <div className="flex gap-2">
          {isAdmin && selectedTeacherId && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Download size={20} />
              Xuất Excel
            </button>
          )}
        </div>
      </div>

      {/* ===== SỬA: Hiển thị thông tin khác nhau cho Admin và User ===== */}
      {isAdmin ? (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Chọn giáo viên & Loại báo cáo</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giáo viên</label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn giáo viên --</option>
                {availableTeachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} - {(t.subjectIds || []).map(sid => subjects.find(s => s.id === sid)?.name).filter(Boolean).join(', ') || 'Chưa có môn'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại báo cáo</label>
              <select
                value={exportType}
                onChange={(e) => setExportType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="month">Theo tháng</option>
                <option value="week">Theo tuần</option>
                <option value="semester">Theo học kỳ</option>
                <option value="year">Cả năm</option>
              </select>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-full p-2">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-900">Báo cáo của bạn</p>
              <p className="text-sm text-blue-700">
                Bạn đang xem báo cáo của: <strong>{linkedTeacher?.name}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedTeacherId && (
        <>
          {/* Tổng quan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <p className="text-blue-100 text-sm">Tổng số tiết</p>
              <p className="text-3xl font-bold mt-1">{totalPeriods}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <p className="text-green-100 text-sm">Tiết tháng này</p>
              <p className="text-3xl font-bold mt-1">{monthPeriods}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <p className="text-purple-100 text-sm">Số bản ghi</p>
              <p className="text-3xl font-bold mt-1">{myRecords.length}</p>
            </div>
          </div>

          {/* Thông tin giáo viên */}
          {selectedTeacher && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Thông tin giáo viên</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Họ và tên</p>
                  <p className="font-medium text-lg">{selectedTeacher.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Môn dạy</p>
                  <p className="font-medium text-lg">
                    {(selectedTeacher.subjectIds || [])
                      .map(sid => subjects.find(s => s.id === sid)?.name)
                      .filter(Boolean)
                      .join(', ') || 'Chưa có'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lớp chủ nhiệm</p>
                  <p className="font-medium text-lg">
                    {classes.find(c => c.id === selectedTeacher.mainClassId)?.name || 'Chưa có'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-lg">{selectedTeacher.email || 'Chưa có'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs báo cáo */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex gap-2 mb-4 border-b">
              <button
                onClick={() => setReportType('teacher')}
                className={`px-4 py-2 font-medium transition-all ${reportType === 'teacher'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                📊 Theo tháng
              </button>
              <button
                onClick={() => setReportType('week')}
                className={`px-4 py-2 font-medium transition-all ${reportType === 'week'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                📅 Theo tuần
              </button>
              <button
                onClick={() => setReportType('grade')}
                className={`px-4 py-2 font-medium transition-all ${reportType === 'grade'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                🎓 Theo khối
              </button>
              <button
                onClick={() => setReportType('semester')}
                className={`px-4 py-2 font-medium transition-all ${reportType === 'semester'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                📚 Theo học kỳ
              </button>
            </div>

            {/* Báo cáo theo tháng */}
            {reportType === 'teacher' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Tháng</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Số bản ghi</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Tổng tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(month => {
                      const monthData = myRecords.filter(r => {
                        const week = weeks.find(w => w.id === r.weekId);
                        if (!week) return false;
                        const weekDate = new Date(week.startDate);
                        return weekDate.getMonth() === month;
                      });
                      const monthTotal = monthData.reduce((sum, r) => sum + (r.periods || 0), 0);

                      if (monthData.length === 0) return null;

                      return (
                        <tr key={month} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm font-medium">Tháng {month + 1}</td>
                          <td className="px-4 py-2 text-sm">{monthData.length}</td>
                          <td className="px-4 py-2 text-sm font-medium text-blue-600">{monthTotal}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Báo cáo theo tuần */}
            {reportType === 'week' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Tuần</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Thời gian</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Số bản ghi</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Tổng tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {weeklyStats().map((week) => (
                      <tr key={week.weekNumber} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm font-medium text-blue-600">Tuần {week.weekNumber}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {new Date(week.startDate).toLocaleDateString('vi-VN')} - {new Date(week.endDate).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-4 py-2 text-sm">{week.records}</td>
                        <td className="px-4 py-2 text-sm font-medium text-green-600">{week.periods}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Báo cáo theo khối */}
            {reportType === 'grade' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Khối</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Số lớp</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Số bản ghi</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Tổng tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {gradeStats().map((grade) => (
                      <tr key={grade.grade} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm font-medium text-purple-600">Khối {grade.grade}</td>
                        <td className="px-4 py-2 text-sm">{grade.classes}</td>
                        <td className="px-4 py-2 text-sm">{grade.records}</td>
                        <td className="px-4 py-2 text-sm font-medium text-blue-600">{grade.periods}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Báo cáo theo học kỳ */}
            {reportType === 'semester' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Học kỳ</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Tuần học</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Số bản ghi</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Tổng tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {semesterStats().map((sem) => (
                      <tr key={sem.semester} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm font-medium text-orange-600">{sem.semester}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{sem.weeks}</td>
                        <td className="px-4 py-2 text-sm">{sem.records}</td>
                        <td className="px-4 py-2 text-sm font-medium text-green-600">{sem.periods}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {!selectedTeacherId && isAdmin && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">Vui lòng chọn giáo viên để xem báo cáo</p>
        </div>
      )}
    </div>
  );
};

export default ReportView;