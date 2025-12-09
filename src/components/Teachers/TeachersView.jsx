import React, { useState, useEffect, useCallback } from 'react';
import { Loader } from 'lucide-react';
import { useTeacher } from '../../hooks/useTeacher';
import { useClasses } from '../../hooks/useClasses';
import { useSubjects } from '../../hooks/useSubjects';
import { TeacherHeader, ReadOnlyBanner, ImportResultPanel } from './TeachersHeader';
import { AddTeacherModal, EditTeacherForm } from './TeacherForm';
import TeacherTable from './TeachersTable';
import Pagination from './Pagination';

// ✅ Cache tối ưu với Map
const cache = new Map();

const getCacheKey = (schoolYear, page) => `teachers_${schoolYear || 'current'}_page${page}`;

const TeachersView = ({ currentUser, isReadOnly = false, schoolYear }) => {
  const isAdmin = currentUser?.role === 'admin';
  
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [visibleInfo, setVisibleInfo] = useState({});
  const [importResult, setImportResult] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    phone: '',
    subjectIds: [],
    mainClassId: '',
  });

  const { fetchTeachers, addTeacher, updateTeacher, deleteTeacher, importTeachers, error: errorTeachers } = useTeacher();
  const { fetchClasses } = useClasses();
  const { fetchSubjects } = useSubjects();

  // ✅ Load tất cả data song song
  const loadAllData = useCallback(async (page = currentPage) => {
    const cacheKey = getCacheKey(schoolYear, page);
    
    // Kiểm tra cache
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      setTeachers(cached.teachers);
      setPagination(cached.pagination);
      setClasses(cached.classes);
      setSubjects(cached.subjects);
      return;
    }
    
    setIsLoadingData(true);
    try {
      // ✅ LOAD SONG SONG - 3 API cùng lúc thay vì tuần tự
      const [teachersResult, classesResult, subjectsResult] = await Promise.all([
        fetchTeachers(schoolYear, page, 10),
        fetchClasses(schoolYear),
        fetchSubjects(schoolYear)
      ]);

      let teachersData = [];
      let paginationData = null;
      let classesData = [];
      let subjectsData = [];

      // Process teachers
      if (teachersResult.success) {
        const teachersArr = Array.isArray(teachersResult.teachers) ? teachersResult.teachers : [];
        teachersData = teachersArr.map((teacher, idx) => {
          let subjectIdsList = [];
          if (Array.isArray(teacher.subjectIds)) {
            subjectIdsList = teacher.subjectIds.map(s =>
              typeof s === 'object' && s !== null ? (s._id || s.id) : s
            );
          }

          return {
            idxNum: idx,
            id: teacher._id || teacher.id,
            name: teacher.name,
            email: teacher.userId?.email || teacher.email || '',
            phone: teacher.phone || '',
            mainClassId: teacher.mainClassId?._id || teacher.mainClassId || '',
            mainClassName: teacher.mainClassId?.name || teacher.mainClassName || '',
            subjectIds: subjectIdsList,
            userId: teacher.userId?._id || teacher.userId || ''
          };
        });
        paginationData = teachersResult.pagination;
        setTeachers(teachersData);
        setPagination(paginationData);
      } else {
        setTeachers([]);
        setPagination(null);
      }

      // Process classes
      if (classesResult.success) {
        classesData = classesResult.classes || [];
        setClasses(classesData);
      }

      // Process subjects
      if (subjectsResult.success) {
        subjectsData = subjectsResult.subjects || [];
        setSubjects(subjectsData);
      }

      // Lưu vào cache
      cache.set(cacheKey, {
        teachers: teachersData,
        pagination: paginationData,
        classes: classesData,
        subjects: subjectsData
      });

    } catch (err) {
      console.error('Error loading all data:', err);
      setTeachers([]);
      setPagination(null);
    } finally {
      setIsLoadingData(false);
    }
  }, [schoolYear, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [schoolYear]);

  useEffect(() => {
    loadAllData(currentPage);
  }, [loadAllData]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const maskEmail = (email) => {
    if (!email) return '-';
    const [user, domain] = email.split('@');
    if (!domain) return '***';
    return `${user.charAt(0)}***@${domain}`;
  };

  const maskPhone = (phone) => {
    if (!phone) return '-';
    return phone.length <= 4 ? '***' : `***${phone.slice(-3)}`;
  };

  const toggleVisibility = (teacherId, field) => {
    setVisibleInfo(prev => ({
      ...prev,
      [teacherId]: prev[teacherId] === field ? null : field
    }));
  };

  const handleOpenAddModal = () => {
    if (isReadOnly) {
      alert('Năm học đã kết thúc, không thể thêm giáo viên!');
      return;
    }
    setNewTeacher({ name: '', phone: '', subjectIds: [], mainClassId: '' });
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewTeacher({ name: '', phone: '', subjectIds: [], mainClassId: '' });
  };

  // ✅ Invalidate cache sau khi thêm/sửa/xóa
  const invalidateCache = () => {
    cache.clear();
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();

    if (!newTeacher.name.trim()) {
      alert('Vui lòng nhập họ tên giáo viên!');
      return;
    }

    const validSubjectIds = newTeacher.subjectIds.filter(id => id && id.trim() !== '');
    if (validSubjectIds.length === 0) {
      alert('Vui lòng chọn ít nhất một môn học!');
      return;
    }

    const teacherData = {
      name: newTeacher.name.trim(),
      phone: newTeacher.phone && newTeacher.phone.trim() !== '' ? newTeacher.phone.trim() : undefined,
      subjectIds: validSubjectIds,
      mainClassId: newTeacher.mainClassId && newTeacher.mainClassId.trim() !== '' ? newTeacher.mainClassId.trim() : undefined,
    };

    const result = await addTeacher(teacherData);

    if (result.success) {
      alert('Thêm giáo viên thành công!');
      handleCloseAddModal();
      invalidateCache();
      setCurrentPage(1);
      await loadAllData(1);
    } else {
      alert('Lỗi: ' + (result.message || 'Không thể thêm giáo viên'));
    }
  };

  const handleEdit = (teacher) => {
    if (isReadOnly) {
      alert('Năm học đã kết thúc, không thể chỉnh sửa giáo viên!');
      return;
    }
    setEditingTeacher({ ...teacher });
  };

  const handleSaveEdit = async () => {
    if (!editingTeacher) return;

    if (!editingTeacher.name || editingTeacher.name.trim() === '') {
      alert('Họ tên giáo viên không được để trống!');
      return;
    }

    if (!editingTeacher.subjectIds || editingTeacher.subjectIds.length === 0) {
      alert('Vui lòng chọn ít nhất một môn học!');
      return;
    }

    const result = await updateTeacher(editingTeacher.id, {
      name: editingTeacher.name.trim(),
      phone: editingTeacher.phone && editingTeacher.phone.trim() !== '' ? editingTeacher.phone.trim() : '',
      subjectIds: editingTeacher.subjectIds,
      mainClassId: editingTeacher.mainClassId && editingTeacher.mainClassId.trim() !== '' ? editingTeacher.mainClassId.trim() : '',
    });

    if (result.success) {
      alert('Đã cập nhật thông tin giáo viên!');
      setEditingTeacher(null);
      invalidateCache();
      await loadAllData(currentPage);
    } else {
      alert('Lỗi: ' + result.message);
    }
  };

  const handleDelete = async (id) => {
    if (isReadOnly) {
      alert('Năm học đã kết thúc, không thể xóa giáo viên!');
      return;
    }
    if (window.confirm('Xóa giáo viên này?')) {
      const result = await deleteTeacher(id);
      if (result.success) {
        alert('Xóa giáo viên thành công!');
        invalidateCache();
        
        if (teachers.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          await loadAllData(currentPage);
        }
      } else {
        alert('Lỗi: ' + result.message);
      }
    }
  };

  const handleImport = async (e) => {
    if (isReadOnly) {
      alert('Năm học đã kết thúc, không thể import giáo viên!');
      e.target.value = '';
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    const response = await importTeachers(file);
    if (response.success) {
      const { successCount, failedCount, failed } = response.data || {};
      setImportResult({
        successCount: successCount || 0,
        failedCount: failedCount || 0,
        failed: failed || []
      });
      invalidateCache();
      setCurrentPage(1);
      await loadAllData(1);
    } else {
      alert('Lỗi: ' + response.message);
    }

    e.target.value = '';
  };

  const handleRefresh = () => {
    invalidateCache();
    loadAllData(currentPage);
  };

  // ✅ Hiển thị cached data ngay lập tức
  if (isLoadingData && teachers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-blue-600" size={48} />
          <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (errorTeachers) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Lỗi: {errorTeachers}</p>
        <button onClick={handleRefresh} className="mt-2 text-red-600 hover:text-red-800 underline">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TeacherHeader
        isAdmin={isAdmin}
        isReadOnly={isReadOnly}
        onRefresh={handleRefresh}
        onImport={handleImport}
        onAdd={handleOpenAddModal}
      />

      {isReadOnly && <ReadOnlyBanner />}

      <ImportResultPanel result={importResult} onClose={() => setImportResult(null)} />

      <AddTeacherModal
        isOpen={showAddModal && !isReadOnly}
        onClose={handleCloseAddModal}
        teacher={newTeacher}
        onChange={setNewTeacher}
        onSubmit={handleSubmitAdd}
        classes={classes}
        subjects={subjects}
      />

      <EditTeacherForm
        teacher={!isReadOnly ? editingTeacher : null}
        onChange={setEditingTeacher}
        onSave={handleSaveEdit}
        onCancel={() => setEditingTeacher(null)}
        classes={classes}
        subjects={subjects}
      />

      <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
        {/* ✅ Loading indicator nhỏ khi đang load nhưng đã có data */}
        {isLoadingData && teachers.length > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <Loader className="animate-spin text-blue-600" size={20} />
          </div>
        )}
        
        <TeacherTable
          teachers={teachers}
          classes={classes}
          subjects={subjects}
          visibleInfo={visibleInfo}
          isAdmin={isAdmin}
          isReadOnly={isReadOnly}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleVisibility={toggleVisibility}
          maskEmail={maskEmail}
          maskPhone={maskPhone}
        />

        {pagination && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default TeachersView;