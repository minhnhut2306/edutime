import React, { useState, useEffect } from 'react';
import { Plus, Eye } from 'lucide-react';
import { useSubjects } from '../../hooks/useSubjects';
import { SubjectModal } from './SubjectModal';
import { SubjectsTable } from './SubjectsTable';

// Cache data ở ngoài component để giữ khi unmount
let cachedData = {
  subjects: null,
  schoolYear: null
};

const SubjectsView = ({ currentUser, isReadOnly = false, schoolYear }) => {
  // Khởi tạo từ cache nếu có
  const [subjects, setSubjects] = useState(
    cachedData.schoolYear === schoolYear && cachedData.subjects ? cachedData.subjects : []
  );
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectName, setSubjectName] = useState('');

  const { loading, fetchSubjects, addSubject, updateSubject, deleteSubject, error } = useSubjects();
  const isAdmin = currentUser.role === 'admin';

  const loadSubjects = async () => {
    setIsLoadingData(true);
    try {
      const result = await fetchSubjects(schoolYear);
      if (result.success) {
        setSubjects(result.subjects);
        // Lưu vào cache
        cachedData.subjects = result.subjects;
        cachedData.schoolYear = schoolYear;
      } else {
        setSubjects([]);
      }
    } catch (err) {
      console.error("Error loading subjects:", err);
      setSubjects([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    // Nếu có cache của năm học này thì không load
    if (cachedData.schoolYear === schoolYear && cachedData.subjects) {
      return;
    }
    
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
        // Xóa cache để load lại data mới
        cachedData = { subjects: null, schoolYear: null };
        await loadSubjects();
        handleCloseModal();
        alert('Cập nhật môn học thành công!');
      } else {
        alert(result.message || 'Cập nhật môn học thất bại');
      }
    } else {
      const result = await addSubject({ name: subjectName.trim() });
      if (result.success) {
        // Xóa cache để load lại data mới
        cachedData = { subjects: null, schoolYear: null };
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
      // Xóa cache để load lại data mới
      cachedData = { subjects: null, schoolYear: null };
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

      {isLoadingData ? (
        <div className="bg-white rounded-xl shadow-lg p-16 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <SubjectsTable
            subjects={subjects}
            onEdit={handleOpenEditModal}
            onDelete={handleDelete}
            isAdmin={isAdmin}
            isReadOnly={isReadOnly}
            loading={loading}
          />
        </div>
      )}

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