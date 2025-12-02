import React, { useEffect, useState } from 'react';
import { Trash2, Plus, Loader, X, Eye } from 'lucide-react';
import { useClasses } from '../hooks/useClasses';

const ClassesView = ({ currentUser, isReadOnly = false, schoolYear }) => {
  const [classes, setClasses] = useState([]);
  const { loading, error, fetchClasses, addClass, deleteClass } = useClasses();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [className, setClassName] = useState('');
  const [studentCount, setStudentCount] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  const generateClassCode = (index) => {
    return `ML${String(index + 1).padStart(3, '0')}`;
  };

  useEffect(() => {
    loadClasses();
  }, [schoolYear]);

  const loadClasses = async () => {
    setIsLoading(true);
   const result = await fetchClasses(schoolYear);
    if (result.success) {
      const normalizedClasses = result.classes.map((cls, index) => ({
        ...cls,
        id: cls._id || cls.id,
        classCode: generateClassCode(index)
      }));
      setClasses(normalizedClasses);
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
    setClassName('');
    setStudentCount('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setClassName('');
    setStudentCount('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!className.trim()) {
      alert('Vui lòng nhập tên lớp');
      return;
    }

    const result = await addClass({
      name: className.trim(),
      studentCount: parseInt(studentCount) || 0
    });
    if (result.success) {
      const newClass = {
        ...result.class,
        id: result.class._id || result.class.id,
        classCode: generateClassCode(classes.length)
      };
      setClasses([...classes, newClass]);
      handleCloseModal();
      alert('Thêm lớp học thành công!');
    } else {
      alert(result.message || 'Thêm lớp học thất bại');
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
      const remainingClasses = classes
        .filter(c => c.id !== classId)
        .map((cls, index) => ({
          ...cls,
          classCode: generateClassCode(index)
        }));
      setClasses(remainingClasses);
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã lớp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên lớp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khối</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sĩ số</th>
              {isAdmin && !isReadOnly && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {classes.length === 0 ? (
              <tr key="empty-row">
                <td colSpan={isAdmin && !isReadOnly ? 5 : 4} className="px-6 py-8 text-center text-gray-500">
                  Chưa có lớp học nào
                </td>
              </tr>
            ) : (
              classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{cls.classCode}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{cls.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{cls.grade}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{cls.studentCount}</td>
                  {isAdmin && !isReadOnly && (
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleDelete(cls.id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

      {showModal && !isReadOnly && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Thêm lớp học mới</h3>
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
                  Tên lớp <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder=""
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sĩ số
                </label>
                <input
                  type="number"
                  value={studentCount}
                  onChange={(e) => setStudentCount(e.target.value)}
                  placeholder=""
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
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
                  {loading ? 'Đang thêm...' : 'Thêm lớp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesView;