import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Eye, Loader } from 'lucide-react';
import { useClasses } from '../../hooks/useClasses';
import ClassesTable from './ClassesTable';
import ClassModal from './ClassModal';
import Pagination from './Pagination';
import GradeFilter from './GradeFilter';
import generateClassCode from '../../utils/classesUtils';

// ✅ Cache tối ưu - lưu theo schoolYear + grade
const cache = new Map();

const getCacheKey = (schoolYear, grade) => `${schoolYear || 'current'}_${grade || 'all'}`;

const ClassesView = ({ currentUser, isReadOnly = false, schoolYear }) => {
  const cacheKey = getCacheKey(schoolYear, '');
  const cachedData = cache.get(cacheKey);

  const [classes, setClasses] = useState(cachedData?.classes || []);
  const [pagination, setPagination] = useState(cachedData?.pagination || null);
  const [availableGrades, setAvailableGrades] = useState(cachedData?.grades || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  const { loading, error, fetchClasses, fetchAvailableGrades, addClass, deleteClass, updateClass } = useClasses();

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingClass, setEditingClass] = useState(null);
  const [className, setClassName] = useState('');
  const [studentCount, setStudentCount] = useState('');

  const isAdmin = currentUser?.role === 'admin';
  const itemsPerPage = 10;

  // ✅ Load song song grades và classes
  const loadInitialData = useCallback(async () => {
    const key = getCacheKey(schoolYear, selectedGrade);
    
    // Nếu có cache thì dùng luôn
    if (cache.has(key)) {
      const cached = cache.get(key);
      setClasses(cached.classes);
      setPagination(cached.pagination);
      setAvailableGrades(cached.grades);
      return;
    }
    
    setIsLoadingData(true);
    try {
      // ✅ LOAD SONG SONG thay vì tuần tự
      const [gradesResult, classesResult] = await Promise.all([
        fetchAvailableGrades(schoolYear),
        fetchClasses(schoolYear, 1, itemsPerPage, selectedGrade)
      ]);

      let grades = [];
      let classesData = [];
      let paginationData = null;

      if (gradesResult.success) {
        grades = gradesResult.grades;
        setAvailableGrades(grades);
      }

      if (classesResult.success) {
        const normalized = classesResult.classes.map((cls, idx) => ({
          ...cls,
          id: cls._id || cls.id,
          classCode: generateClassCode(idx)
        }));
        classesData = normalized;
        paginationData = classesResult.pagination;
        setClasses(normalized);
        setPagination(paginationData);
      } else {
        setClasses([]);
        setPagination(null);
      }

      // Lưu vào cache
      cache.set(key, {
        classes: classesData,
        pagination: paginationData,
        grades
      });

    } catch (err) {
      console.error("Error loading initial data:", err);
      setClasses([]);
      setPagination(null);
    } finally {
      setIsLoadingData(false);
    }
  }, [schoolYear, selectedGrade]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const loadClasses = async (page = currentPage) => {
    setIsLoadingData(true);
    try {
      const result = await fetchClasses(schoolYear, page, itemsPerPage, selectedGrade);
      if (result.success) {
        const normalized = result.classes.map((cls, idx) => ({
          ...cls,
          id: cls._id || cls.id,
          classCode: generateClassCode((page - 1) * itemsPerPage + idx)
        }));
        setClasses(normalized);
        setPagination(result.pagination);
        setCurrentPage(page);
        
        // Cập nhật cache
        const key = getCacheKey(schoolYear, selectedGrade);
        cache.set(key, {
          classes: normalized,
          pagination: result.pagination,
          grades: availableGrades
        });
      } else {
        setClasses([]);
        setPagination(null);
        if (result.message && !result.message.includes('Không có')) {
          alert(result.message || 'Không thể tải danh sách lớp học');
        }
      }
    } catch (err) {
      setClasses([]);
      setPagination(null);
      console.error('Error loading classes:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleGradeChange = (grade) => {
    setSelectedGrade(grade);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      loadClasses(newPage);
    }
  };

  const handleOpenModal = () => {
    if (isReadOnly) {
      alert('Chế độ chỉ xem! Không thể thêm lớp học vào năm học cũ.');
      return;
    }
    setModalMode('add');
    setEditingClass(null);
    setClassName('');
    setStudentCount('');
    setShowModal(true);
  };

  const handleOpenEditModal = (cls) => {
    if (isReadOnly) {
      alert('Chế độ chỉ xem! Không thể chỉnh sửa lớp học của năm học cũ.');
      return;
    }
    setModalMode('edit');
    setEditingClass(cls);
    setClassName(cls.name || '');
    setStudentCount((cls.studentCount ?? '').toString());
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalMode('add');
    setEditingClass(null);
    setClassName('');
    setStudentCount('');
  };

  // ✅ Invalidate cache sau khi thêm/sửa/xóa
  const invalidateCache = () => {
    cache.clear(); // Clear toàn bộ cache
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    if (!className.trim()) {
      alert('Vui lòng nhập tên lớp');
      return;
    }

    if (modalMode === 'edit' && editingClass) {
      const result = await updateClass(editingClass.id, {
        name: className.trim(),
        studentCount: parseInt(studentCount, 10) || 0
      });

      if (result.success) {
        invalidateCache();
        await loadInitialData();
        handleCloseModal();
        alert('Cập nhật lớp học thành công!');
      } else {
        alert(result.message || 'Cập nhật lớp học thất bại');
      }
    } else {
      const result = await addClass({
        name: className.trim(),
        studentCount: parseInt(studentCount, 10) || 0
      });

      if (result.success) {
        invalidateCache();
        await loadInitialData();
        handleCloseModal();
        alert('Thêm lớp học thành công!');
      } else {
        alert(result.message || 'Thêm lớp học thất bại');
      }
    }
  };

  const handleDelete = async (classId) => {
    if (isReadOnly) {
      alert('Chế độ chỉ xem! Không thể xóa lớp học của năm học cũ.');
      return;
    }

    if (!classId) {
      alert('Không tìm thấy ID của lớp học');
      return;
    }

    if (!confirm('Bạn có chắc chắn muốn xóa lớp học này?')) return;

    const result = await deleteClass(classId);
    if (result.success) {
      invalidateCache();
      
      const shouldGoToPrevPage = classes.length === 1 && currentPage > 1;
      const newPage = shouldGoToPrevPage ? currentPage - 1 : currentPage;
      
      await loadClasses(newPage);
      alert('Xóa lớp học thành công!');
    } else {
      alert(result.message || 'Xóa lớp học thất bại');
    }
  };

  // ✅ Hiển thị cached data ngay lập tức, loading indicator nhỏ gọn hơn
  if (isLoadingData && classes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-blue-600" size={48} />
          <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Quản lý Lớp học
          {isReadOnly && (
            <span className="flex items-center gap-2 text-sm font-normal text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
              <Eye size={16} />
              Chế độ xem
            </span>
          )}
        </h2>

        <div className="flex items-center gap-3">
          <GradeFilter
            selectedGrade={selectedGrade}
            onGradeChange={handleGradeChange}
            availableGrades={availableGrades}
            loading={isLoadingData}
          />

          {isAdmin && !isReadOnly && (
            <button
              onClick={handleOpenModal}
              disabled={isLoadingData}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={20} />
              Thêm
            </button>
          )}
        </div>
      </div>

      {isReadOnly && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Eye size={20} className="text-orange-600" />
            <div>
              <p className="font-medium text-orange-900">Đang xem dữ liệu năm học cũ</p>
            </div>
          </div>
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
        {/* ✅ Loading indicator nhỏ khi đang load nhưng đã có data */}
        {isLoadingData && classes.length > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <Loader className="animate-spin text-blue-600" size={20} />
          </div>
        )}
        
        <ClassesTable
          classes={classes}
          isAdmin={isAdmin}
          isReadOnly={isReadOnly}
          loading={loading}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
        />

        {pagination && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            loading={isLoadingData}
          />
        )}
      </div>

      {showModal && !isReadOnly && (
        <ClassModal
          show={showModal}
          mode={modalMode}
          loading={loading}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          classNameValue={className}
          setClassName={setClassName}
          studentCountValue={studentCount}
          setStudentCount={setStudentCount}
        />
      )}
    </div>
  );
};

export default ClassesView;