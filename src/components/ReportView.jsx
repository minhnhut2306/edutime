import React, { useState, useEffect } from 'react';
import { Download, BarChart3, Mail, Users, RefreshCw } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { useTeachingRecord } from '../hooks/useTeachingRecord';

const ReportView = ({ teachers = [], classes = [], subjects = [], teachingRecords: initialRecords = [], weeks = [], schoolYear, currentUser }) => {
  const isAdmin = currentUser?.role === 'admin';
  
  // ✅ FIX: Thêm state để lưu teaching records từ API
  const [teachingRecords, setTeachingRecords] = useState(initialRecords || []);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Tìm giáo viên được liên kết với user hiện tại
  const linkedTeacher = teachers.find(t => {
    if (!t.userId) return false;
    const teacherUserId = t.userId?._id || t.userId;
    const currentUserId = currentUser?._id || currentUser?.id;
    return teacherUserId === currentUserId || teacherUserId?.toString() === currentUserId?.toString();
  });
  
  const availableTeachers = isAdmin ? teachers : (linkedTeacher ? [linkedTeacher] : []);

  const {
    exportMonthReport,
    exportWeekReport,
    exportSemesterReport,
    exportYearReport,
    loading: reportLoading,
    error: reportError
  } = useReports();

  const { fetchTeachingRecords } = useTeachingRecord();

  const [selectedTeacherId, setSelectedTeacherId] = useState(
    isAdmin ? '' : (linkedTeacher?.id || linkedTeacher?._id || '')
  );
  const [reportType, setReportType] = useState('teacher');
  const [exportType, setExportType] = useState('month');
  const [exportParams, setExportParams] = useState({
    month: new Date().getMonth() + 1,
    bcNumber: null,
    weekId: '',
    weekIds: [],
    semester: 1,
    allBC: false,
    useBCMode: false
  });

  // ✅ FIX: Load teaching records khi teacher thay đổi
  useEffect(() => {
    if (!selectedTeacherId) {
      setTeachingRecords([]);
      return;
    }

    loadTeacherRecords();
  }, [selectedTeacherId, isAdmin]);

  const loadTeacherRecords = async () => {
    setLoadingRecords(true);
    try {
      const result = await fetchTeachingRecords(selectedTeacherId);
      
      if (result.success) {
        const records = result.teachingRecords || [];
        console.log(`✅ Loaded ${records.length} records for teacher ${selectedTeacherId}`);
        setTeachingRecords(records);
      } else {
        console.warn('⚠️ Failed to load records:', result.message);
        setTeachingRecords([]);
      }
    } catch (error) {
      console.error('❌ Error loading records:', error);
      setTeachingRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  // Auto-select teacher nếu là user thường
  useEffect(() => {
    if (!isAdmin && linkedTeacher && !selectedTeacherId) {
      setSelectedTeacherId(linkedTeacher.id || linkedTeacher._id);
    }
  }, [linkedTeacher, isAdmin, selectedTeacherId]);

  // Cảnh báo nếu user chưa được liên kết
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

  const handleExport = async () => {
    try {
      if (!isAdmin) {
        alert('⛔ Chỉ Admin mới có quyền xuất báo cáo Excel!');
        return;
      }

      if (!selectedTeacherId) {
        alert('Vui lòng chọn giáo viên!');
        return;
      }

      // ✅ FIX: Lấy schoolYear.year nếu schoolYear là object
      const schoolYearValue = typeof schoolYear === 'object' ? schoolYear?.year : schoolYear;
      
      if (!schoolYearValue) {
        alert('Không tìm thấy năm học hiện tại!');
        return;
      }

      const selectedTeacher = teachers.find(t => (t.id || t._id) === selectedTeacherId);
      if (!selectedTeacher) {
        alert('Không tìm thấy thông tin giáo viên!');
        return;
      }

      const teacherRecordsData = teachingRecords.filter(r => {
        const rTeacherId = r.teacherId?._id || r.teacherId;
        return rTeacherId === selectedTeacherId || rTeacherId?.toString() === selectedTeacherId?.toString();
      });
      
      if (teacherRecordsData.length === 0) {
        alert('Chưa có dữ liệu để xuất báo cáo!');
        return;
      }

      let result;
      switch (exportType) {
        case 'month':
          if (exportParams.useBCMode && exportParams.bcNumber) {
            result = await exportMonthReport(selectedTeacherId, schoolYearValue, null, exportParams.bcNumber);
          } else {
            result = await exportMonthReport(selectedTeacherId, schoolYearValue, exportParams.month, null);
          }
          break;

        case 'week':
          if (exportParams.weekIds.length > 0) {
            result = await exportWeekReport(selectedTeacherId, null, exportParams.weekIds);
          } else if (exportParams.weekId) {
            result = await exportWeekReport(selectedTeacherId, exportParams.weekId, null);
          } else {
            alert('Vui lòng chọn tuần!');
            return;
          }
          break;

        case 'semester':
          result = await exportSemesterReport(selectedTeacherId, schoolYearValue, exportParams.semester);
          break;

        case 'year':
          result = await exportYearReport(selectedTeacherId, schoolYearValue, exportParams.allBC);
          break;

        default:
          alert('Loại báo cáo không hợp lệ!');
          return;
      }

      if (result.success) {
        alert('✅ Đã xuất báo cáo Excel thành công!');
      } else {
        alert(`❌ Lỗi: ${result.message}`);
      }
    } catch (err) {
      console.error('Export error:', err);
      alert(`❌ Có lỗi xảy ra: ${err.message || 'Lỗi không xác định'}`);
    }
  };

  // Helper function để lấy tên môn học
  const getSubjectNames = (subjectIds) => {
    if (!subjectIds || subjectIds.length === 0) return 'Chưa có môn';
    return subjectIds
      .map(sid => {
        const subjectId = typeof sid === 'object' ? (sid._id || sid.id) : sid;
        return subjects.find(s => (s._id || s.id) === subjectId)?.name;
      })
      .filter(Boolean)
      .join(', ') || 'Chưa có môn';
  };

  // ✅ FIX: Calculate statistics từ teachingRecords (state được load từ API)
  const myRecords = selectedTeacherId ? teachingRecords.filter(r => {
    const rTeacherId = r.teacherId?._id || r.teacherId;
    return rTeacherId === selectedTeacherId || rTeacherId?.toString() === selectedTeacherId?.toString();
  }) : [];
  
  console.log('📊 myRecords:', myRecords.length, 'teachingRecords:', teachingRecords.length);
  
  const totalPeriods = myRecords.reduce((sum, r) => sum + (r.periods || 0), 0);

  const today = new Date();
  const currentMonth = today.getMonth();
  const monthRecords = myRecords.filter(r => {
    const week = weeks.find(w => (w.id || w._id) === (r.weekId?._id || r.weekId));
    if (!week) return false;
    const weekDate = new Date(week.startDate);
    return weekDate.getMonth() === currentMonth;
  });
  const monthPeriods = monthRecords.reduce((sum, r) => sum + (r.periods || 0), 0);

  const selectedTeacher = teachers.find(t => (t.id || t._id) === selectedTeacherId);

  const gradeStats = () => {
    if (!selectedTeacherId) return [];
    const grades = [...new Set(classes.map(c => c.grade))].sort();
    return grades.map(grade => {
      const gradeClasses = classes.filter(c => c.grade === grade);
      const gradeRecords = myRecords.filter(r => {
        const rClassId = r.classId?._id || r.classId;
        return gradeClasses.some(c => (c.id || c._id) === rClassId);
      });
      const gradePeriods = gradeRecords.reduce((sum, r) => sum + (r.periods || 0), 0);
      return { grade, classes: gradeClasses.length, records: gradeRecords.length, periods: gradePeriods };
    }).filter(g => g.periods > 0);
  };

  const semesterStats = () => {
    if (!selectedTeacherId || weeks.length === 0) return [];
    const semester1Weeks = weeks.filter(w => (w.weekNumber || 0) <= 18);
    const semester2Weeks = weeks.filter(w => (w.weekNumber || 0) > 18 && (w.weekNumber || 0) <= 35);
    
    const sem1Records = myRecords.filter(r => {
      const rWeekId = r.weekId?._id || r.weekId;
      return semester1Weeks.some(w => (w.id || w._id) === rWeekId);
    });
    
    const sem2Records = myRecords.filter(r => {
      const rWeekId = r.weekId?._id || r.weekId;
      return semester2Weeks.some(w => (w.id || w._id) === rWeekId);
    });
    
    return [
      { semester: 'Học kỳ 1', weeks: 'Tuần 1-18', records: sem1Records.length, periods: sem1Records.reduce((sum, r) => sum + (r.periods || 0), 0) },
      { semester: 'Học kỳ 2', weeks: 'Tuần 19-35', records: sem2Records.length, periods: sem2Records.reduce((sum, r) => sum + (r.periods || 0), 0) }
    ];
  };

  const weeklyStats = () => {
    if (!selectedTeacherId || myRecords.length === 0) return [];
    
    return weeks.sort((a, b) => (b.weekNumber || 0) - (a.weekNumber || 0)).map(week => {
      const weekRecords = myRecords.filter(r => {
        const rWeekId = r.weekId?._id || r.weekId;
        const wId = week.id || week._id;
        return rWeekId === wId || rWeekId?.toString() === wId?.toString();
      });
      const weekPeriods = weekRecords.reduce((sum, r) => sum + (r.periods || 0), 0);
      if (weekPeriods === 0) return null;
      return { 
        weekNumber: week.weekNumber, 
        startDate: week.startDate, 
        endDate: week.endDate, 
        records: weekRecords.length, 
        periods: weekPeriods 
      };
    }).filter(w => w !== null);
  };

  // Render export parameters
  const renderExportParams = () => {
    switch (exportType) {
      case 'month':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input 
                type="radio" 
                id="byMonth" 
                checked={!exportParams.useBCMode} 
                onChange={() => setExportParams({ ...exportParams, useBCMode: false, bcNumber: null })} 
              />
              <label htmlFor="byMonth" className="text-sm font-medium">Theo tháng</label>
            </div>
            {!exportParams.useBCMode && (
              <select 
                value={exportParams.month} 
                onChange={(e) => setExportParams({ ...exportParams, month: parseInt(e.target.value) })} 
                className="w-full px-3 py-2 border rounded-lg"
              >
                {[...Array(12)].map((_, i) => <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>)}
              </select>
            )}
            <div className="flex items-center gap-2">
              <input 
                type="radio" 
                id="byBC" 
                checked={exportParams.useBCMode} 
                onChange={() => setExportParams({ ...exportParams, useBCMode: true, bcNumber: 1 })} 
              />
              <label htmlFor="byBC" className="text-sm font-medium">Theo BC</label>
            </div>
            {exportParams.useBCMode && (
              <select 
                value={exportParams.bcNumber || 1} 
                onChange={(e) => setExportParams({ ...exportParams, bcNumber: parseInt(e.target.value) })} 
                className="w-full px-3 py-2 border rounded-lg"
              >
                {[...Array(12)].map((_, i) => <option key={i + 1} value={i + 1}>BC {i + 1}</option>)}
              </select>
            )}
          </div>
        );

      case 'week':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input 
                type="radio" 
                id="singleWeek" 
                checked={exportParams.weekIds.length === 0} 
                onChange={() => setExportParams({ ...exportParams, weekIds: [] })} 
              />
              <label htmlFor="singleWeek" className="text-sm font-medium">Một tuần</label>
            </div>
            {exportParams.weekIds.length === 0 && (
              <select 
                value={exportParams.weekId} 
                onChange={(e) => setExportParams({ ...exportParams, weekId: e.target.value })} 
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">-- Chọn tuần --</option>
                {weeks.map(w => (
                  <option key={w.id || w._id} value={w.id || w._id}>
                    Tuần {w.weekNumber} ({new Date(w.startDate).toLocaleDateString('vi-VN')} - {new Date(w.endDate).toLocaleDateString('vi-VN')})
                  </option>
                ))}
              </select>
            )}
            <div className="flex items-center gap-2">
              <input 
                type="radio" 
                id="multiWeeks" 
                checked={exportParams.weekIds.length > 0} 
                onChange={() => setExportParams({ ...exportParams, weekIds: weeks.slice(0, 2).map(w => w.id || w._id) })} 
              />
              <label htmlFor="multiWeeks" className="text-sm font-medium">Nhiều tuần</label>
            </div>
            {exportParams.weekIds.length > 0 && (
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                {weeks.map(w => (
                  <label key={w.id || w._id} className="flex items-center gap-2 py-1 hover:bg-gray-50">
                    <input 
                      type="checkbox" 
                      checked={exportParams.weekIds.includes(w.id || w._id)} 
                      onChange={(e) => {
                        const wId = w.id || w._id;
                        if (e.target.checked) {
                          setExportParams({ ...exportParams, weekIds: [...exportParams.weekIds, wId] });
                        } else {
                          setExportParams({ ...exportParams, weekIds: exportParams.weekIds.filter(id => id !== wId) });
                        }
                      }} 
                    />
                    <span className="text-sm">Tuần {w.weekNumber}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );

      case 'semester':
        return (
          <select 
            value={exportParams.semester} 
            onChange={(e) => setExportParams({ ...exportParams, semester: parseInt(e.target.value) })} 
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value={1}>Học kỳ 1</option>
            <option value={2}>Học kỳ 2</option>
          </select>
        );

      case 'year':
        return (
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={exportParams.allBC} 
              onChange={(e) => setExportParams({ ...exportParams, allBC: e.target.checked })} 
            />
            <span className="text-sm font-medium">Xuất tất cả BC trong năm</span>
          </label>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Báo cáo & Xuất Excel</h2>
        {isAdmin && selectedTeacherId && (
          <button 
            onClick={handleExport} 
            disabled={reportLoading || loadingRecords} 
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Download size={20} />
            {reportLoading ? 'Đang xuất...' : 'Xuất Excel'}
          </button>
        )}
      </div>

      {reportError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <p className="text-red-700">{reportError}</p>
        </div>
      )}

      {isAdmin ? (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Chọn giáo viên & Loại báo cáo</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giáo viên</label>
              <select 
                value={selectedTeacherId} 
                onChange={(e) => setSelectedTeacherId(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn giáo viên --</option>
                {availableTeachers.map(t => (
                  <option key={t.id || t._id} value={t.id || t._id}>
                    {t.name}
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
                <option value="month">Theo tháng/BC</option>
                <option value="week">Theo tuần</option>
                <option value="semester">Theo học kỳ</option>
                <option value="year">Cả năm</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tham số</label>
              {renderExportParams()}
            </div>
          </div>
          
          {/* ✅ FIX: Hiển thị loading state */}
          {loadingRecords && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
              <RefreshCw className="animate-spin" size={20} />
              <p className="text-sm text-blue-700">Đang tải dữ liệu...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-full p-2">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-900">Báo cáo của bạn</p>
              <p className="text-sm text-blue-700">Bạn đang xem báo cáo của: <strong>{linkedTeacher?.name}</strong></p>
            </div>
          </div>
        </div>
      )}

      {selectedTeacherId && !loadingRecords && (
        <>
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
                  <p className="font-medium text-lg">{getSubjectNames(selectedTeacher.subjectIds)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lớp chủ nhiệm</p>
                  <p className="font-medium text-lg">{classes.find(c => (c.id || c._id) === (selectedTeacher.mainClassId?._id || selectedTeacher.mainClassId))?.name || 'Chưa có'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-lg">{selectedTeacher.email || 'Chưa có'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex gap-2 mb-4 border-b">
              <button 
                onClick={() => setReportType('teacher')} 
                className={`px-4 py-2 font-medium transition-all ${reportType === 'teacher' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                📊 Theo tháng
              </button>
              <button 
                onClick={() => setReportType('week')} 
                className={`px-4 py-2 font-medium transition-all ${reportType === 'week' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                📅 Theo tuần
              </button>
              <button 
                onClick={() => setReportType('grade')} 
                className={`px-4 py-2 font-medium transition-all ${reportType === 'grade' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                🎓 Theo khối
              </button>
              <button 
                onClick={() => setReportType('semester')} 
                className={`px-4 py-2 font-medium transition-all ${reportType === 'semester' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                📚 Theo học kỳ
              </button>
            </div>

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
                        const week = weeks.find(w => (w.id || w._id) === (r.weekId?._id || r.weekId));
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

      {selectedTeacherId && loadingRecords && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <RefreshCw size={48} className="mx-auto text-gray-400 mb-4 animate-spin" />
          <p className="text-gray-500 text-lg">Đang tải dữ liệu báo cáo...</p>
        </div>
      )}

      {selectedTeacherId && !loadingRecords && myRecords.length === 0 && (
        <div className="bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-xl p-12 text-center">
          <BarChart3 size={48} className="mx-auto text-yellow-400 mb-4" />
          <p className="text-yellow-700 text-lg">Chưa có dữ liệu giảng dạy cho giáo viên này</p>
        </div>
      )}
    </div>
  );
};

export default ReportView;