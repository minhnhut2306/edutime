import React from 'react';
import { X } from 'lucide-react';

const ClassModal = ({
  show,
  mode = 'add',
  loading,
  onClose,
  onSubmit,
  classNameValue,
  setClassName,
  studentCountValue,
  setStudentCount
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'edit' ? 'Chỉnh sửa lớp học' : 'Thêm lớp học mới'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên lớp <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={classNameValue}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Ví dụ: 10A1, 11B2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sĩ số</label>
            <input
              type="number"
              value={studentCountValue}
              onChange={(e) => setStudentCount(e.target.value)}
              placeholder="Nhập số lượng học sinh"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
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
              {loading ? (mode === 'edit' ? 'Đang cập nhật...' : 'Đang thêm...') : (mode === 'edit' ? 'Cập nhật' : 'Thêm lớp')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassModal;