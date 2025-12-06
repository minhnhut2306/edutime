import React, { useEffect, useState } from 'react';
import { Plus, Eye } from 'lucide-react';
import { useClasses } from '../../hooks/useClasses';
import ClassesTable from './ClassesTable';
import ClassModal from './ClassModal';
import Pagination from './Pagination';
import GradeFilter from './GradeFilter';
import generateClassCode from '../../utils/classesUtils';

// Cache data ở ngoài component để giữ khi unmount
let cachedData = {
  classes: null,
  pagination: null,
  availableGrades: null,
  schoolYear: null
};

const ClassesView = ({ currentUser, isReadOnly = false, schoolYear }) => {
  // Khởi tạo từ cache nếu có
  const [classes, setClasses] = useState(
    cachedData.schoolYear === schoolYear && cachedData.classes ? cachedData.classes : []
  );
  const [pagination, setPagination] = useState(
    cachedData.schoolYear === schoolYear && cachedData.pagination ? cachedData.pagination : null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [availableGrades, setAvailableGrades] = useState(
    cachedData.schoolYear === schoolYear && cachedData.availableGrades ? cachedData.availableGrades : []
  );
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { loading, error, fetchClasses, fetchAvailableGrades, addClass, deleteClass, updateClass } = useClasses();

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingClass, setEditingClass] = useState(null);
  const [className, setClassName] = useState('');
  const [studentCount, setStudentCount] = useState('');

  const isAdmin = currentUser?.role === 'admin';
  const itemsPerPage = 10;

  useEffect(() => {
    const loadData = async () => {
      // Nếu có cache của năm học này thì không load
      if (cachedData.schoolYear === schoolYear && cachedData.classes) {
        return;
      }
      
      setIsLoadingData(true);
      try {
        const [gradesResult, classesResult] = await Promise.allSettled([
          fetchAvailableGrades(schoolYear),
          fetchClasses(schoolYear, 1, itemsPerPage, selectedGrade)
        ]);

        if (gradesResult.status === 'fulfilled' && gradesResult.value?.success) {
          setAvailableGrades(gradesResult.value.grades);
          cachedData.availableGrades = gradesResult.value.grades;
        }

        if (classesResult.status === 'fulfilled' && classesResult.value?.success) {
          const normalized = classesResult.value.classes.map((cls, idx) => ({
            ...cls,
            id: cls._id || cls.id,
            classCode: generateClassCode(idx)
          }));
          setClasses(normalized);
          setPagination(classesResult.value.pagination);
          
          // Lưu vào cache
          cachedData.classes = normalized;
          cachedData.pagination = classesResult.value.pagination;
          cachedData.schoolYear = schoolYear;
        } else {
          setClasses([]);
          setPagination(null);
        }
      } catch (err) {
        console.error("Error loading initial data:", err);
        setClasses([]);
        setPagination(null);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadData();
  }, [schoolYear]);

  useEffect(() => {
    // Khi đổi grade thì load lại và xóa cache
    if (selectedGrade !== '') {
      cachedData = { classes: null, pagination: null, availableGrades: null, schoolYear: null };
      loadClasses(1);
    }
  }, [selectedGrade]);

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
        cachedData.classes = normalized;
        cachedData.pagination = result.pagination;
        cachedData.schoolYear = schoolYear;
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

  const handleSubmit = async (e) => {
    e && e.preventDefault && e.preventDefault();

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
        // Xóa cache để load lại data mới
        cachedData = { classes: null, pagination: null, availableGrades: null, schoolYear: null };
        await Promise.all([
          fetchAvailableGrades(schoolYear).then(r => {
            if (r.success) {
              setAvailableGrades(r.grades);
              cachedData.availableGrades = r.grades;
            }
          }),
          loadClasses(currentPage)
        ]);
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
        // Xóa cache để load lại data mới
        cachedData = { classes: null, pagination: null, availableGrades: null, schoolYear: null };
        await Promise.all([
          fetchAvailableGrades(schoolYear).then(r => {
            if (r.success) {
              setAvailableGrades(r.grades);
              cachedData.availableGrades = r.grades;
            }
          }),
          loadClasses(currentPage)
        ]);
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
      const shouldGoToPrevPage = classes.length === 1 && currentPage > 1;
      const newPage = shouldGoToPrevPage ? currentPage - 1 : currentPage;

      // Xóa cache để load lại data mới
      cachedData = { classes: null, pagination: null, availableGrades: null, schoolYear: null };
      await Promise.all([
        fetchAvailableGrades(schoolYear).then(r => {
          if (r.success) {
            setAvailableGrades(r.grades);
            cachedData.availableGrades = r.grades;
          }
        }),
        loadClasses(newPage)
      ]);
      alert('Xóa lớp học thành công!');
    } else {
      alert(result.message || 'Xóa lớp học thất bại');
    }
  };

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

      {isLoadingData ? (
        <div className="bg-white rounded-xl shadow-lg p-16 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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
      )}

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