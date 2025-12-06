import React, { useState, useEffect } from 'react';
import { Plus, Eye } from 'lucide-react';
import { useSubjects } from '../../hooks/useSubjects';
import { SubjectModal } from './SubjectModal';
import { SubjectsTable } from './SubjectsTable';

const SubjectsView = ({ currentUser, isReadOnly = false, schoolYear }) => {
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectName, setSubjectName] = useState('');

  const { fetchSubjects, addSubject, updateSubject, deleteSubject, error } = useSubjects();
  const isAdmin = currentUser.role === 'admin';

  const loadSubjects = async () => {
    try {
      const result = await fetchSubjects(schoolYear);
      if (result.success) {
        setSubjects(result.subjects);
      }
    } catch (err) {
      console.error("Error loading subjects:", err);
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
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <SubjectsTable
          subjects={subjects}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
          isAdmin={isAdmin}
          isReadOnly={isReadOnly}
        />
      </div>

      <SubjectModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        subjectName={subjectName}
        setSubjectName={setSubjectName}
        mode={modalMode}
      />
    </div>
  );
};

export default SubjectsView;
