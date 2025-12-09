import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Eye, Loader } from 'lucide-react';
import { useSubjects } from '../../hooks/useSubjects';
import { SubjectModal } from './SubjectModal';
import { SubjectsTable } from './SubjectsTable';

const cache = new Map();

const getCacheKey = (schoolYear) => `subjects_${schoolYear || 'current'}`;

const SubjectsView = ({ currentUser, isReadOnly = false, schoolYear }) => {
  const cacheKey = getCacheKey(schoolYear);
  const cachedData = cache.get(cacheKey);

  const [subjects, setSubjects] = useState(cachedData?.subjects || []);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectName, setSubjectName] = useState('');

  const { loading, fetchSubjects, addSubject, updateSubject, deleteSubject, error } = useSubjects();
  const isAdmin = currentUser.role === 'admin';

  const loadSubjects = useCallback(async () => {
    const key = getCacheKey(schoolYear);
    
    if (cache.has(key)) {
      const cached = cache.get(key);
      setSubjects(cached.subjects);
      return;
    }
    
    setIsLoadingData(true);
    try {
      const result = await fetchSubjects(schoolYear);
      if (result.success) {
        setSubjects(result.subjects);
        // Lưu vào cache
        cache.set(key, { subjects: result.subjects });
      } else {
        setSubjects([]);
      }
    } catch (err) {
      console.error("Error loading subjects:", err);
      setSubjects([]);
    } finally {
      setIsLoadingData(false);
    }
  }, [schoolYear]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const handleOpenModal = () => {
    if (isReadOnly) {
      alert('Chế độ chỉ xem! Không thể thêm môn học vào năm học cũ.');
      return;
    }
    setModalMode('add');
    setEditingSubject(null);
    setSubjectName('');
    setShowModal(true);
  };

  const handleOpenEditModal = (subject) => {
    if (isReadOnly) {
      alert('Chế độ chỉ xem! Không thể chỉnh sửa môn học của năm học cũ.');
      return;
    }
    setModalMode('edit');
    setEditingSubject(subject);
    setSubjectName(subject.name);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalMode('add');
    setEditingSubject(null);
    setSubjectName('');
  };

  const invalidateCache = () => {
    cache.clear();
  };

  const handleSubmit = async () => {
    if (!subjectName.trim()) {
      alert('Vui lòng nhập tên môn học');
      return;
    }

    if (modalMode === 'edit') {
      const result = await updateSubject(editingSubject._id, { name: subjectName.trim() });
      if (result.success) {
        invalidateCache();
        await loadSubjects();
        handleCloseModal();
        alert('Cập nhật môn học thành công!');
      } else {
        alert(result.message || 'Cập nhật môn học thất bại');
      }
    } else {
      const result = await addSubject({ name: subjectName.trim() });
      if (result.success) {
        invalidateCache();
        await loadSubjects();
        handleCloseModal();
        alert('Thêm môn học thành công!');
      } else {
        alert(result.message || 'Thêm môn học thất bại');
      }
    }
  };

  const handleDelete = async (subjectId, subjectName) => {
    if (isReadOnly) {
      alert('Chế độ chỉ xem! Không thể xóa môn học của năm học cũ.');
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa môn học "${subjectName}"?`)) return;

    const result = await deleteSubject(subjectId);
    if (result.success) {
      invalidateCache();
      await loadSubjects();
      alert('Xóa môn học thành công!');
    } else {
      alert(result.message || 'Xóa môn học thất bại');
    }
  };

  // ✅ Hiển thị cached data ngay lập tức
  if (isLoadingData && subjects.length === 0) {
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
          Quản lý Môn học
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
            disabled={isLoadingData}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={20} />
            Thêm
          </button>
        )}
      </div>

      {isReadOnly && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Eye size={20} className="text-orange-600" />
            <p className="font-medium text-orange-900">Đang xem dữ liệu năm học cũ</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
        {/* ✅ Loading indicator nhỏ khi đang load nhưng đã có data */}
        {isLoadingData && subjects.length > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <Loader className="animate-spin text-blue-600" size={20} />
          </div>
        )}
        
        <SubjectsTable
          subjects={subjects}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
          isAdmin={isAdmin}
          isReadOnly={isReadOnly}
          loading={loading}
        />
      </div>

      <SubjectModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        subjectName={subjectName}
        setSubjectName={setSubjectName}
        loading={loading}
        mode={modalMode}
      />
    </div>
  );
};

export default SubjectsView;