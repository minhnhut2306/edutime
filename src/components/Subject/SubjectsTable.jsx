import React from 'react';
import { Trash2, Edit } from 'lucide-react';

export const SubjectsTable = ({ subjects, onEdit, onDelete, isAdmin, isReadOnly, loading }) => {
  const generateSubjectCode = (index) => {
    return `MH${String(index + 1).padStart(3, '0')}`;
  };

  return (
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
              <tr key={subject._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {generateSubjectCode(index)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{subject.name}</td>
                {isAdmin && !isReadOnly && (
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(subject)}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(subject._id, subject.name)}
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