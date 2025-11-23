import React, { useState, useEffect } from 'react';
import { Download, BarChart3, Mail, Users, RefreshCw } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { useTeachingRecord } from '../hooks/useTeachingRecord';

const ReportView = ({ teachers = [], classes = [], subjects = [], teachingRecords: initialRecords = [], weeks = [], schoolYear, currentUser }) => {
  const isAdmin = currentUser?.role === 'admin';
  
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

  const { exportReport, loading: reportLoading, error: reportError } = useReports();
  const { fetchTeachingRecords } = useTeachingRecord();

  // State
  const [selectedTeacherId, setSelectedTeacherId] = useState(isAdmin ? '' : (linkedTeacher?.id || linkedTeacher?._id || ''));
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);
  const [exportMode, setExportMode] = useState('single');
  
  const [exportType, setExportType] = useState('bc'); // bc, week, semester, year
  const [exportParams, setExportParams] = useState({
    bcNumber: null, // null = tự động xác định từ dữ liệu
    weekId: '',
    weekIds: [],
    semester: 1,
  });

  // Load teaching records
  useEffect(() => {
    if (!selectedTeacherId) {
      setTeachingRecords([]);
      return;
    }
    loadTeacherRecords();
  }, [selectedTeacherId]);

  const loadTeacherRecords = async () => {
    setLoadingRecords(true);
    try {
      const result = await fetchTeachingRecords(selectedTeacherId);
      if (result.success) {
        setTeachingRecords(result.teachingRecords || []);
      } else {
        setTeachingRecords([]);
      }
    } catch (error) {
      setTeachingRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  // Auto-select teacher
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
                Vui lòng liên hệ Admin để được phân quyền!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Toggle chọn nhiều GV
  const toggleTeacherSelection = (teacherId) => {
    setSelectedTeacherIds(prev => 
      prev.includes(teacherId) ? prev.filter(id => id !== teacherId) : [...prev, teacherId]
    );
  };

  const selectAllTeachers = () => setSelectedTeacherIds(availableTeachers.map(t => t.id || t._id));
  const deselectAllTeachers = () => setSelectedTeacherIds([]);

  const handleExport = async () => {
    if (!isAdmin) {
      alert('⛔ Chỉ Admin mới có quyền xuất báo cáo Excel!');
      return;
    }

    const teacherIdsToExport = exportMode === 'multiple' ? selectedTeacherIds : [selectedTeacherId];
    
    if (teacherIdsToExport.length === 0 || (exportMode === 'single' && !selectedTeacherId)) {
      alert('Vui lòng chọn giáo viên!');
      return;
    }

    const schoolYearValue = typeof schoolYear === 'object' ? schoolYear?.year : schoolYear;
    
    if (!schoolYearValue) {
      alert('Không tìm thấy năm học hiện tại!');
      return;
    }

    // Build options
    const options = {
      teacherIds: exportMode === 'multiple' ? teacherIdsToExport : selectedTeacherId,
      schoolYear: schoolYearValue,
      type: exportType,
    };

    // Thêm params theo type
    if (exportType === 'bc' && exportParams.bcNumber) {
      options.bcNumber = exportParams.bcNumber;
    }
    if (exportType === 'week') {
      if (exportParams.weekIds.length > 0) {
        options.weekIds = exportParams.weekIds;
      } else if (exportParams.weekId) {
        options.weekId = exportParams.weekId;
      } else {
        alert('Vui lòng chọn tuần!');
        return;
      }
    }
    if (exportType === 'semester') {
      options.semester = exportParams.semester;
    }

    const result = await exportReport(options);

    if (result.success) {
      const count = exportMode === 'multiple' ? teacherIdsToExport.length : 1;
      alert(`✅ Đã xuất báo cáo Excel thành công! (${count} giáo viên)`);
    } else {
      alert(`❌ Lỗi: ${result.message}`);
    }
  };

  // Render export params
  const renderExportParams = () => {
    switch (exportType) {
      case 'bc':
        return (
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={!exportParams.bcNumber}
                onChange={(e) => setExportParams({ ...exportParams, bcNumber: e.target.checked ? null : 9 })}
              />
              <span className="text-sm">Tự động xác định BC từ dữ liệu</span>
            </label>
            {exportParams.bcNumber && (
              <select 
                value={exportParams.bcNumber} 
                onChange={(e) => setExportParams({ ...exportParams, bcNumber: parseInt(e.target.value) })} 
                className="w-full px-3 py-2 border rounded-lg"
              >
                {[9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8].map(bc => (
                  <option key={bc} value={bc}>BC {bc} (Tháng {bc})</option>
                ))}
              </select>
            )}
            <p className="text-xs text-gray-500">
              💡 Nếu chọn "Tự động", hệ thống sẽ xuất tất cả BC có dữ liệu (mỗi BC = 1 sheet)
            </p>
          </div>
        );

      case 'week':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  checked={exportParams.weekIds.length === 0} 
                  onChange={() => setExportParams({ ...exportParams, weekIds: [] })} 
                />
                <span className="text-sm">Một tuần</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  checked={exportParams.weekIds.length > 0} 
                  onChange={() => setExportParams({ ...exportParams, weekIds: [weeks[0]?.id || weeks[0]?._id].filter(Boolean) })} 
                />
                <span className="text-sm">Nhiều tuần</span>
              </label>
            </div>
            
            {exportParams.weekIds.length === 0 ? (
              <select 
                value={exportParams.weekId} 
                onChange={(e) => setExportParams({ ...exportParams, weekId: e.target.value })} 
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">-- Chọn tuần --</option>
                {weeks.map(w => (
                  <option key={w.id || w._id} value={w.id || w._id}>
                    Tuần {w.weekNumber} ({new Date(w.startDate).toLocaleDateString('vi-VN')})
                  </option>
                ))}
              </select>
            ) : (
              <div className="border rounded-lg p-2 max-h-40 overflow-y-auto">
                {weeks.map(w => {
                  const wId = w.id || w._id;
                  return (
                    <label key={wId} className="flex items-center gap-2 py-1 hover:bg-gray-50 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={exportParams.weekIds.includes(wId)} 
                        onChange={(e) => {
                          if (e.target.checked) {
                            setExportParams({ ...exportParams, weekIds: [...exportParams.weekIds, wId] });
                          } else {
                            setExportParams({ ...exportParams, weekIds: exportParams.weekIds.filter(id => id !== wId) });
                          }
                        }} 
                      />
                      <span className="text-sm">Tuần {w.weekNumber}</span>
                    </label>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-gray-500">
              💡 Tuần thuộc tháng nào sẽ tự động xuất BC tháng đó
            </p>
          </div>
        );

      case 'semester':
        return (
          <div>
            <select 
              value={exportParams.semester} 
              onChange={(e) => setExportParams({ ...exportParams, semester: parseInt(e.target.value) })} 
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value={1}>Học kỳ 1 (Tuần 1-18)</option>
              <option value={2}>Học kỳ 2 (Tuần 19-35)</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">
              💡 Xuất tất cả BC trong học kỳ (mỗi tháng = 1 sheet)
            </p>
          </div>
        );

      case 'year':
        return (
          <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
            💡 Xuất tất cả BC trong năm học (mỗi tháng có dữ liệu = 1 sheet)
          </p>
        );

      default:
        return null;
    }
  };

  // Stats
  const myRecords = selectedTeacherId ? teachingRecords.filter(r => {
    const rTeacherId = r.teacherId?._id || r.teacherId;
    return rTeacherId === selectedTeacherId || rTeacherId?.toString() === selectedTeacherId?.toString();
  }) : [];
  
  const totalPeriods = myRecords.reduce((sum, r) => sum + (r.periods || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Báo cáo & Xuất Excel</h2>
        {isAdmin && (selectedTeacherId || selectedTeacherIds.length > 0) && (
          <button 
            onClick={handleExport} 
            disabled={reportLoading || loadingRecords} 
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Download size={20} />
            {reportLoading ? 'Đang xuất...' : `Xuất Excel ${exportMode === 'multiple' && selectedTeacherIds.length > 0 ? `(${selectedTeacherIds.length} GV)` : ''}`}
          </button>
        )}
      </div>

      {reportError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <p className="text-red-700">{reportError}</p>
        </div>
      )}

      {isAdmin && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Cài đặt xuất báo cáo</h3>
          
          {/* Chế độ xuất */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Chế độ xuất</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={exportMode === 'single'} onChange={() => setExportMode('single')} className="w-4 h-4" />
                <span className="text-sm">Một giáo viên</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={exportMode === 'multiple'} onChange={() => setExportMode('multiple')} className="w-4 h-4" />
                <span className="text-sm">Nhiều giáo viên (mỗi GV = sheet riêng)</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Chọn giáo viên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giáo viên</label>
              
              {exportMode === 'single' ? (
                <select 
                  value={selectedTeacherId} 
                  onChange={(e) => setSelectedTeacherId(e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">-- Chọn giáo viên --</option>
                  {availableTeachers.map(t => (
                    <option key={t.id || t._id} value={t.id || t._id}>{t.name}</option>
                  ))}
                </select>
              ) : (
                <div className="border rounded-lg max-h-48 overflow-y-auto">
                  <div className="sticky top-0 bg-gray-50 p-2 border-b flex gap-2">
                    <button onClick={selectAllTeachers} className="text-xs text-blue-600 hover:underline">Chọn tất cả</button>
                    <button onClick={deselectAllTeachers} className="text-xs text-red-600 hover:underline">Bỏ chọn</button>
                    <span className="text-xs text-gray-500 ml-auto">{selectedTeacherIds.length}/{availableTeachers.length}</span>
                  </div>
                  {availableTeachers.map(t => {
                    const tId = t.id || t._id;
                    return (
                      <label key={tId} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox" checked={selectedTeacherIds.includes(tId)} onChange={() => toggleTeacherSelection(tId)} />
                        <span className="text-sm">{t.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Loại báo cáo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại báo cáo</label>
              <select 
                value={exportType} 
                onChange={(e) => setExportType(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="bc">Theo BC (Biên chế/Tháng)</option>
                <option value="week">Theo Tuần</option>
                <option value="semester">Theo Học kỳ</option>
                <option value="year">Cả năm học</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                📋 Tất cả đều xuất theo mẫu BC chuẩn
              </p>
            </div>

            {/* Tham số */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tham số</label>
              {renderExportParams()}
            </div>
          </div>
          
          {loadingRecords && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
              <RefreshCw className="animate-spin" size={20} />
              <p className="text-sm text-blue-700">Đang tải dữ liệu...</p>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      {selectedTeacherId && !loadingRecords && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <p className="text-blue-100 text-sm">Tổng số tiết</p>
            <p className="text-3xl font-bold mt-1">{totalPeriods}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <p className="text-green-100 text-sm">Số bản ghi</p>
            <p className="text-3xl font-bold mt-1">{myRecords.length}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <p className="text-purple-100 text-sm">Giáo viên</p>
            <p className="text-xl font-bold mt-1">{teachers.find(t => (t.id || t._id) === selectedTeacherId)?.name || '-'}</p>
          </div>
        </div>
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