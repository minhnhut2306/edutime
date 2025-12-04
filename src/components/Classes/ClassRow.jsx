import React from 'react';
import { Trash2, Edit } from 'lucide-react';

const ClassRow = ({ cls, isAdmin, isReadOnly, loading, onEdit, onDelete }) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 text-sm font-medium text-gray-900">{cls.classCode}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{cls.name}</td>
      <td className="px-6 py-4 text-sm text-gray-500">{cls.grade}</td>
      <td className="px-6 py-4 text-sm text-gray-500">{cls.studentCount}</td>
      {isAdmin && !isReadOnly && (
        <td className="px-6 py-4 text-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              disabled={loading}
              className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Chỉnh sửa"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={onDelete}
              disabled={loading}
              className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Xóa"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </td>
      )}
    </tr>
  );
};

export default ClassRow;