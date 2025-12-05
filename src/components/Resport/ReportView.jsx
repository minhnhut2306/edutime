import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Download, BarChart3, Mail, Loader } from 'lucide-react';
import { useReports } from '../../hooks/useReports';
import { useTeachingRecord } from '../../hooks/useTeachingRecord';
import { AdminExportSettings } from './AdminExportSettings';
import { TeacherExportSettings } from './TeacherExportSettings';
import { StatCards } from './StatCards';

const ReportView = ({ teachers = [], teachingRecords: initialRecords = [], weeks = [], schoolYear, currentUser }) => {
  const isAdmin = currentUser?.role === 'admin';
  const [teachingRecords, setTeachingRecords] = useState(initialRecords || []);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const currentSchoolYear = typeof schoolYear === 'object' ? schoolYear?.year : schoolYear;

  const linkedTeacher = useMemo(() => {
    return teachers.find(t => {
      if (!t.userId) return false;
      const teacherUserId = t.userId?._id || t.userId;
      const currentUserId = currentUser?._id || currentUser?.id;
      return teacherUserId === currentUserId || teacherUserId?.toString() === currentUserId?.toString();
    });
  }, [teachers, currentUser]);

  const availableTeachers = isAdmin ? teachers : (linkedTeacher ? [linkedTeacher] : []);

  const { exportReport, exportMultipleReports, loading: reportLoading, error: reportError } = useReports();
  const { fetchTeachingRecords } = useTeachingRecord();

  const [selectedTeacherId, setSelectedTeacherId] = useState(() => {
    if (isAdmin) return '';
    const teacherId = linkedTeacher?.id || linkedTeacher?._id;
    return teacherId || '';
  });
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);
  const [exportMode, setExportMode] = useState('single');

  const [exportType, setExportType] = useState('bc');
  const [exportParams, setExportParams] = useState({
    bcNumber: null,
    bcNumbers: [],
    weekId: '',
    weekIds: [],
    semester: 1,
  });


  const loadTeacherRecords = useCallback(async () => {
    if (!selectedTeacherId) {
      setTeachingRecords([]);
      setLoadingRecords(false);
      return;
    }
    setLoadingRecords(true);
    try {
      const result = await fetchTeachingRecords(selectedTeacherId, currentSchoolYear);
      if (result && result.success) {
        setTeachingRecords(result.teachingRecords || []);
      } else {
        setTeachingRecords([]);
      }
    } catch (error) {
      console.error("Error loading teacher records:", error);
      setTeachingRecords([]);
    } finally {
      setLoadingRecords(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeacherId, currentSchoolYear]);

  useEffect(() => {
    loadTeacherRecords();
  }, [loadTeacherRecords]);

  // Chỉ set selectedTeacherId một lần khi linkedTeacher thay đổi và chưa có selectedTeacherId
  const linkedTeacherId = useMemo(() => {
    return linkedTeacher?.id || linkedTeacher?._id || null;
  }, [linkedTeacher?.id, linkedTeacher?._id]);

  useEffect(() => {
    if (!isAdmin && linkedTeacherId && linkedTeacherId !== selectedTeacherId) {
      setSelectedTeacherId(linkedTeacherId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkedTeacherId, isAdmin]);

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

  const toggleTeacherSelection = (teacherId) => {
    setSelectedTeacherIds(prev =>
      prev.includes(teacherId) ? prev.filter(id => id !== teacherId) : [...prev, teacherId]
    );
  };

  const selectAllTeachers = () => setSelectedTeacherIds(availableTeachers.map(t => t.id || t._id));
  const deselectAllTeachers = () => setSelectedTeacherIds([]);

  const handleExport = async () => {
    try {
      if (!isAdmin && !linkedTeacher) {
        alert('Tài khoản của bạn chưa được liên kết với giáo viên!\n\nVui lòng liên hệ Admin để được phân quyền.');
        return;
      }

      let teacherIdsToExport;
      
      if (isAdmin) {
        teacherIdsToExport = exportMode === 'multiple' ? selectedTeacherIds : [selectedTeacherId];
        
        if (teacherIdsToExport.length === 0 || (exportMode === 'single' && !selectedTeacherId)) {
          alert('Vui lòng chọn giáo viên!');
          return;
        }
      } else {
        teacherIdsToExport = [linkedTeacher.id || linkedTeacher._id];
      }

      if (!currentSchoolYear) {
        alert('Không tìm thấy năm học hiện tại!\n\nVui lòng kiểm tra lại hệ thống.');
        return;
      }

      const options = {
        schoolYear: currentSchoolYear,
        type: exportType,
      };

      // Xử lý tham số BC
      if (exportType === 'bc') {
        if (exportParams.bcNumbers && exportParams.bcNumbers.length > 0) {
          options.bcNumbers = exportParams.bcNumbers;
        } else if (exportParams.bcNumber) {
          options.bcNumber = exportParams.bcNumber;
        }
      }
      
      if (exportType === 'week') {
        if (exportParams.weekIds && exportParams.weekIds.length > 0) {
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

      let result;

      // KIỂM TRA: Nếu chọn nhiều GV (exportMode='multiple') => dùng exportMultipleReports
      if (isAdmin && exportMode === 'multiple' && teacherIdsToExport.length > 1) {
        options.teacherIds = teacherIdsToExport;
        result = await exportMultipleReports(options);
      } else {
        // Chỉ 1 GV => dùng exportReport như cũ
        options.teacherId = teacherIdsToExport[0];
        result = await exportReport(options);
      }

      if (result.success) {
        const count = teacherIdsToExport.length;
        const teacherName = linkedTeacher ? linkedTeacher.name : '';
        
        let typeText = '';
        if (exportType === 'bc') {
          if (exportParams.bcNumbers && exportParams.bcNumbers.length > 0) {
            typeText = `Tháng ${exportParams.bcNumbers.join(', ')}`;
          } else if (exportParams.bcNumber) {
            typeText = `Tháng ${exportParams.bcNumber}`;
          } else {
            typeText = 'Tất cả tháng';
          }
        } else if (exportType === 'week') {
          typeText = exportParams.weekIds?.length > 0 ? `${exportParams.weekIds.length} tuần` : '1 tuần';
        } else if (exportType === 'semester') {
          typeText = `Học kỳ ${exportParams.semester}`;
        } else if (exportType === 'year') {
          typeText = 'Cả năm học';
        }
        
        const fileTypeText = isAdmin && exportMode === 'multiple' && count > 1 
          ? `File ZIP chứa ${count} file Excel (mỗi GV 1 file)`
          : 'File Excel';
        
        alert(
          `Xuất báo cáo thành công!\n\n` +
          `Năm học: ${currentSchoolYear}\n` +
          `Loại: ${typeText}\n` +
          `${isAdmin ? `Số giáo viên: ${count}` : `Giáo viên: ${teacherName}`}\n` +
          `${fileTypeText} đã được tải về!`
        );
      } else {
        alert(`${result.message || 'Không thể xuất báo cáo'}`);
      }
    } catch (err) {
      console.error("Export error:", err);
      alert(`Có lỗi xảy ra khi xuất báo cáo!\n\n${err.message || 'Vui lòng thử lại sau.'}`);
    }
  };

  const myRecords = selectedTeacherId ? teachingRecords.filter(r => {
    const rTeacherId = r.teacherId?._id || r.teacherId;
    const matchesTeacher = rTeacherId === selectedTeacherId || rTeacherId?.toString() === selectedTeacherId?.toString();
    const recordSchoolYear = r.schoolYear?.year || r.schoolYear;
    const matchesSchoolYear = !recordSchoolYear || recordSchoolYear === currentSchoolYear;

    return matchesTeacher && matchesSchoolYear;
  }) : [];

  const totalPeriods = myRecords.reduce((sum, r) => sum + (r.periods || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Báo cáo & Xuất Excel</h2>
          <p className="text-sm text-gray-500 mt-1">
            Năm học: <span className="font-semibold text-blue-600">{currentSchoolYear || 'Chưa xác định'}</span>
            {!isAdmin && linkedTeacher && (
              <span className="ml-3 text-gray-600">
                • Giáo viên: <span className="font-semibold text-green-600">{linkedTeacher.name}</span>
              </span>
            )}
          </p>
        </div>
        
        {((isAdmin && (selectedTeacherId || selectedTeacherIds.length > 0)) || 
          (!isAdmin && linkedTeacher)) && (
          <button
            onClick={handleExport}
            disabled={reportLoading || loadingRecords}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Download size={20} />
            {reportLoading ? 'Đang xuất...' : 
              isAdmin && exportMode === 'multiple' && selectedTeacherIds.length > 0 
                ? `Xuất Excel (${selectedTeacherIds.length} GV)` 
                : 'Xuất Excel'}
          </button>
        )}
      </div>

      {reportError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <p className="text-red-700">{reportError}</p>
        </div>
      )}

      {!isAdmin && linkedTeacher && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Download size={20} className="text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Xuất báo cáo cá nhân</p>
              <p className="text-sm text-blue-700 mt-1">
                Bạn chỉ có thể xuất báo cáo của riêng mình. Chọn loại báo cáo và thông số bên dưới, sau đó nhấn "Xuất Excel".
              </p>
            </div>
          </div>
        </div>
      )}

      {isAdmin ? (
        <AdminExportSettings
          exportMode={exportMode}
          setExportMode={setExportMode}
          selectedTeacherId={selectedTeacherId}
          setSelectedTeacherId={setSelectedTeacherId}
          selectedTeacherIds={selectedTeacherIds}
          toggleTeacherSelection={toggleTeacherSelection}
          selectAllTeachers={selectAllTeachers}
          deselectAllTeachers={deselectAllTeachers}
          teachers={availableTeachers}
          exportType={exportType}
          setExportType={setExportType}
          exportParams={exportParams}
          setExportParams={setExportParams}
          weeks={weeks}
          loadingRecords={loadingRecords}
        />
      ) : linkedTeacher && (
        <TeacherExportSettings
          exportType={exportType}
          setExportType={setExportType}
          exportParams={exportParams}
          setExportParams={setExportParams}
          weeks={weeks}
          loadingRecords={loadingRecords}
        />
      )}

      {loadingRecords && teachingRecords.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Loader className="animate-spin text-blue-600" size={48} />
            <p className="text-gray-600">Đang tải dữ liệu báo cáo...</p>
          </div>
        </div>
      )}

      {selectedTeacherId && !loadingRecords && (
        <StatCards
          totalPeriods={totalPeriods}
          recordsCount={myRecords.length}
          teacherName={teachers.find(t => (t.id || t._id) === selectedTeacherId)?.name}
        />
      )}

      {loadingRecords && teachingRecords.length > 0 && (
        <div className="relative">
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
            <Loader className="animate-spin text-blue-600" size={32} />
          </div>
          <StatCards
            totalPeriods={totalPeriods}
            recordsCount={myRecords.length}
            teacherName={teachers.find(t => (t.id || t._id) === selectedTeacherId)?.name}
          />
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
  