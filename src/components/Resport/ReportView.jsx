import React, { useState, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);

  const currentSchoolYear = typeof schoolYear === 'object' ? schoolYear?.year : schoolYear;

  const linkedTeacher = teachers.find(t => {
    if (!t.userId) return false;
    const teacherUserId = t.userId?._id || t.userId;
    const currentUserId = currentUser?._id || currentUser?.id;
    return teacherUserId === currentUserId || teacherUserId?.toString() === currentUserId?.toString();
  });

  const availableTeachers = isAdmin ? teachers : (linkedTeacher ? [linkedTeacher] : []);

  const { exportReport, loading: reportLoading, error: reportError } = useReports();
  const { fetchTeachingRecords } = useTeachingRecord();

  const [selectedTeacherId, setSelectedTeacherId] = useState(isAdmin ? '' : (linkedTeacher?.id || linkedTeacher?._id || ''));
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);
  const [exportMode, setExportMode] = useState('single');

  const [exportType, setExportType] = useState('bc');
  const [exportParams, setExportParams] = useState({
    bcNumber: null,
    weekId: '',
    weekIds: [],
    semester: 1,
  });

  useEffect(() => {
    if (teachers.length > 0 && weeks.length > 0) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [teachers, weeks]);

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
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setTeachingRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    if (!isAdmin && linkedTeacher && !selectedTeacherId) {
      setSelectedTeacherId(linkedTeacher.id || linkedTeacher._id);
    }
  }, [linkedTeacher, isAdmin, selectedTeacherId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

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
        teacherIds: isAdmin && exportMode === 'multiple' ? teacherIdsToExport : teacherIdsToExport[0],
        schoolYear: currentSchoolYear,
        type: exportType,
      };

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
        const count = isAdmin && exportMode === 'multiple' ? teacherIdsToExport.length : 1;
        const teacherName = linkedTeacher ? linkedTeacher.name : '';
        
        alert(
          `Xuất báo cáo Excel thành công!\n\n` +
          `Năm học: ${currentSchoolYear}\n` +
          `${isAdmin ? `Số giáo viên: ${count}` : `Giáo viên: ${teacherName}`}\n` +
          `File đã được tải về!`
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

      {selectedTeacherId && !loadingRecords && (
        <StatCards
          totalPeriods={totalPeriods}
          recordsCount={myRecords.length}
          teacherName={teachers.find(t => (t.id || t._id) === selectedTeacherId)?.name}
        />
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