import React from 'react';
import { X } from 'lucide-react';

export const SubjectModal = ({ isOpen, onClose, onSubmit, subjectName, setSubjectName, loading, mode }) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'edit' ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}
          </h3>
          <button
            onClick={onClose}
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
              placeholder="Ví dụ: Toán, Văn, Anh"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading 
                ? (mode === 'edit' ? 'Đang cập nhật...' : 'Đang thêm...') 
                : (mode === 'edit' ? 'Cập nhật' : 'Thêm môn')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};