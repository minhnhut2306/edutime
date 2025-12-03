import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

const ClassesTable = ({ classes = [], isAdmin, isReadOnly, loading, onEdit, onDelete }) => {
  return (
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
            <tr>
              <td colSpan={isAdmin && !isReadOnly ? 5 : 4} className="px-6 py-8 text-center text-gray-500">
                Chưa có lớp học nào
              </td>
            </tr>
          ) : (
            classes.map((cls) => (
              <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{cls.classCode}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{cls.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{cls.grade || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{cls.studentCount ?? '-'}</td>
                {isAdmin && !isReadOnly && (
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(cls)}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(cls.id)}
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
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ClassesTable;