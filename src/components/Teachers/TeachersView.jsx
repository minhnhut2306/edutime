import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { useTeacher } from '../../hooks/useTeacher';
import { useClasses } from '../../hooks/useClasses';
import { useSubjects } from '../../hooks/useSubjects';
import { TeacherHeader, ReadOnlyBanner, ImportResultPanel } from './TeachersHeader';
import { AddTeacherModal, EditTeacherForm } from './TeacherForm';
import TeacherTable from './TeachersTable';
import Pagination from './Pagination';

// Cache data ở ngoài component
let cachedData = {
  teachers: null,
  classes: null,
  subjects: null,
  pagination: null,
  schoolYear: null
};

const TeachersView = ({ currentUser, isReadOnly = false, schoolYear }) => {
  const isAdmin = currentUser?.role === 'admin';
  
  // Khởi tạo từ cache nếu có
  const [teachers, setTeachers] = useState(
    cachedData.schoolYear === schoolYear && cachedData.teachers ? cachedData.teachers : []
  );
  const [classes, setClasses] = useState(
    cachedData.schoolYear === schoolYear && cachedData.classes ? cachedData.classes : []
  );
  const [subjects, setSubjects] = useState(
    cachedData.schoolYear === schoolYear && cachedData.subjects ? cachedData.subjects : []
  );
  const [pagination, setPagination] = useState(
    cachedData.schoolYear === schoolYear && cachedData.pagination ? cachedData.pagination : null
  );
  
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

  const loadAllData = async () => {
    // Nếu có cache thì không load
    if (cachedData.schoolYear === schoolYear && cachedData.teachers && cachedData.classes && cachedData.subjects) {
      return;
    }

    setIsLoadingData(true);
    try {
      await Promise.all([
        loadTeachers(currentPage),
        loadClasses(),
        loadSubjects()
      ]);
    } catch (err) {
      console.error("Error loading all data:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadTeachers = async (page = currentPage) => {
    // Nếu có cache thì không hiển thị loading
    if (!cachedData.teachers) {
      setIsLoadingData(true);
    }
    
    try {
      const result = await fetchTeachers(schoolYear, page, 10);
      if (result.success) {
        const teachersArr = Array.isArray(result.teachers) ? result.teachers : [];
        const transformedTeachers = teachersArr.map((teacher, idx) => {
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
        setTeachers(transformedTeachers);
        setPagination(result.pagination);
        
        // Lưu cache
        cachedData.teachers = transformedTeachers;
        cachedData.pagination = result.pagination;
        cachedData.schoolYear = schoolYear;
      } else {
        setTeachers([]);
        setPagination(null);
      }
    } catch (err) {
      console.error('Error loading teachers:', err);
      setTeachers([]);
      setPagination(null);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadClasses = async () => {
    const result = await fetchClasses();
    if (result.success) {
      const classList = result.classes || [];
      setClasses(classList);
      cachedData.classes = classList;
    }
  };

  const loadSubjects = async () => {
    const result = await fetchSubjects();
    if (result.success) {
      const subjectsList = result.subjects || [];
      setSubjects(subjectsList);
      cachedData.subjects = subjectsList;
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [schoolYear]);

  useEffect(() => {
    loadAllData();
  }, [schoolYear, currentPage]);

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
      // Xóa cache để load lại
      cachedData = { teachers: null, classes: null, subjects: null, pagination: null, schoolYear: null };
      setCurrentPage(1);
      loadTeachers(1);
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
      // Xóa cache để load lại
      cachedData = { teachers: null, classes: null, subjects: null, pagination: null, schoolYear: null };
      loadTeachers(currentPage);
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
        // Xóa cache để load lại
        cachedData = { teachers: null, classes: null, subjects: null, pagination: null, schoolYear: null };
        
        if (teachers.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          loadTeachers(currentPage);
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
      // Xóa cache để load lại
      cachedData = { teachers: null, classes: null, subjects: null, pagination: null, schoolYear: null };
      setCurrentPage(1);
      loadTeachers(1);
    } else {
      alert('Lỗi: ' + response.message);
    }

    e.target.value = '';
  };

  const handleRefresh = () => {
    // Xóa cache và load lại
    cachedData = { teachers: null, classes: null, subjects: null, pagination: null, schoolYear: null };
    loadAllData();
  };

  // Hiển thị loader chỉ khi loading lần đầu và chưa có data
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

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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