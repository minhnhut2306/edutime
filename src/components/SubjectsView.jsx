import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Loader, X, Eye } from 'lucide-react';
import { useSubjects } from '../hooks/useSubjects';

const SubjectsView = ({ currentUser, isReadOnly = false, schoolYear }) => {
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const { fetchSubjects, addSubject, deleteSubject, loading, error } = useSubjects();
  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    loadSubjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolYear]);

  const loadSubjects = async () => {
     const result = await fetchSubjects(schoolYear);
    if (result.success) {
      setSubjects(result.subjects);
    }
  };

  const handleOpenModal = () => {
    if (isReadOnly) {
      alert('⚠️ Chế độ chỉ xem! Không thể thêm môn học vào năm học cũ.');
      return;
    }
    setSubjectName('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSubjectName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subjectName.trim()) {
      alert('Vui lòng nhập tên môn học');
      return;
    }

    const result = await addSubject({ name: subjectName.trim() });
    if (result.success) {
      await loadSubjects();
      handleCloseModal();
      alert('Thêm môn học thành công!');
    } else {
      alert(result.message || 'Thêm môn học thất bại');
    }
  };

  const handleDelete = async (subjectId) => {
    if (isReadOnly) {
      alert('⚠️ Chế độ chỉ xem! Không thể xóa môn học của năm học cũ.');
      return;
    }

    if (!confirm('Xóa môn học này?')) return;

    const result = await deleteSubject(subjectId);
    if (result.success) {
      await loadSubjects();
      alert('Xóa môn học thành công!');
    } else {
      alert(result.message || 'Xóa môn học thất bại');
    }
  };

  const generateSubjectCode = (index) => {
    return `MH${String(index + 1).padStart(3, '0')}`;
  };

  if (loading && subjects.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin" size={32} />
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
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <p className="text-sm text-orange-700">
                Dữ liệu chỉ được xem, không thể thêm hoặc xóa
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã môn</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên môn</th>
              {isAdmin && !isReadOnly && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {subjects.length === 0 ? (
              <tr>
                <td colSpan={isAdmin && !isReadOnly ? 3 : 2} className="px-6 py-8 text-center text-gray-500">
                  Chưa có môn học nào
                </td>
              </tr>
            ) : (
              subjects.map((subject, index) => (
                <tr key={subject._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {generateSubjectCode(index)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{subject.name}</td>
                  {isAdmin && !isReadOnly && (
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleDelete(subject._id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal thêm môn học */}
      {showModal && !isReadOnly && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Thêm môn học mới</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên môn học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder=""
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Đang thêm...' : 'Thêm môn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectsView;