import React, { useEffect, useState } from 'react';
import { Loader, Plus, Eye } from 'lucide-react';
import { useClasses } from '../../hooks/useClasses';
import ClassesTable from './ClassesTable';
import ClassModal from './ClassModal';
import generateClassCode from '../../utils/classesUtils';

const ClassesView = ({ currentUser, isReadOnly = false, schoolYear }) => {
  const [classes, setClasses] = useState([]);
  const { loading, error, fetchClasses, addClass, deleteClass, updateClass } = useClasses();
  const [isLoading, setIsLoading] = useState(false);

  // modal / form state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingClass, setEditingClass] = useState(null);
  const [className, setClassName] = useState('');
  const [studentCount, setStudentCount] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    loadClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolYear]);

  const loadClasses = async () => {
    setIsLoading(true);
    const result = await fetchClasses(schoolYear);
    if (result.success) {
      const normalized = result.classes.map((cls, idx) => ({
        ...cls,
        id: cls._id || cls.id,
        classCode: generateClassCode(idx)
      }));
      setClasses(normalized);
    } else {
      alert(result.message || 'Không thể tải danh sách lớp học');
    }
    setIsLoading(false);
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
        // replace the class data and regenerate codes in original order
        const updated = classes.map((cls, index) =>
          cls.id === editingClass.id
            ? {
                ...cls,
                ...result.class,
                id: result.class._id || result.class.id,
                classCode: generateClassCode(index)
              }
            : { ...cls, classCode: generateClassCode(index) }
        );
        setClasses(updated);
        handleCloseModal();
        alert('Cập nhật lớp học thành công!');
      } else {
        alert(result.message || 'Cập nhật lớp học thất bại');
      }
    } else {
      // add new
      const result = await addClass({
        name: className.trim(),
        studentCount: parseInt(studentCount, 10) || 0
      });

      if (result.success) {
        const newClass = {
          ...result.class,
          id: result.class._id || result.class.id,
          classCode: generateClassCode(classes.length)
        };
        setClasses((prev) => [...prev, newClass]);
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
      const remaining = classes
        .filter((c) => c.id !== classId)
        .map((cls, idx) => ({ ...cls, classCode: generateClassCode(idx) }));
      setClasses(remaining);
      alert('Xóa lớp học thành công!');
    } else {
      alert(result.message || 'Xóa lớp học thất bại');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-blue-600" size={48} />
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

        {isAdmin && !isReadOnly && (
          <button
            onClick={handleOpenModal}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader className="animate-spin" size={20} /> : <Plus size={20} />}
            Thêm
          </button>
        )}
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

      <ClassesTable
        classes={classes}
        isAdmin={isAdmin}
        isReadOnly={isReadOnly}
        loading={loading}
        onEdit={handleOpenEditModal}
        onDelete={handleDelete}
      />

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