import React, { useState, useEffect } from 'react';
import { Plus, Loader, Eye } from 'lucide-react';
import { useSubjects } from '../../hooks/useSubjects';
import { SubjectModal } from './SubjectModal';
import { SubjectsTable } from './SubjectsTable';

const SubjectsView = ({ currentUser, isReadOnly = false, schoolYear }) => {
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); 
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { fetchSubjects, addSubject, updateSubject, deleteSubject, loading, error } = useSubjects();
  const isAdmin = currentUser.role === 'admin';

  const loadSubjects = async () => {
    setIsLoading(true);
    try {
      const result = await fetchSubjects(schoolYear);
      if (result.success) {
        setSubjects(result.subjects);
      }
    } catch (err) {
      console.error("Error loading subjects:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, [schoolYear]);

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

  const handleSubmit = async () => {
    if (!subjectName.trim()) {
      alert('Vui lòng nhập tên môn học');
      return;
    }

    if (modalMode === 'edit') {
      const result = await updateSubject(editingSubject._id, { name: subjectName.trim() });
      if (result.success) {
        await loadSubjects();
        handleCloseModal();
        alert('Cập nhật môn học thành công!');
      } else {
        alert(result.message || 'Cập nhật môn học thất bại');
      }
    } else {
      const result = await addSubject({ name: subjectName.trim() });
      if (result.success) {
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
      await loadSubjects();
      alert('Xóa môn học thành công!');
    } else {
      alert(result.message || 'Xóa môn học thất bại');
    }
  };

  // Chỉ hiển thị loading full screen khi đang load lần đầu và chưa có data
  const isInitialLoad = (isLoading || loading) && subjects.length === 0 && !error;

  if (isInitialLoad) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-blue-600" size={48} />
          <p className="text-gray-600">Đang tải dữ liệu môn học...</p>
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
            disabled={loading || isLoading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {(loading || isLoading) ? <Loader className="animate-spin" size={20} /> : <Plus size={20} />}
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
        {(isLoading || loading) && subjects.length > 0 && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <Loader className="animate-spin text-blue-600" size={32} />
          </div>
        )}
        <SubjectsTable
          subjects={subjects}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
          isAdmin={isAdmin}
          isReadOnly={isReadOnly}
          loading={loading || isLoading}
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