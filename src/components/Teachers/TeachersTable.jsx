import React from 'react';
import { Edit2, Trash2, Eye, EyeOff } from 'react-feather';

const TeacherTable = ({
  teachers,
  classes,
  subjects,
  visibleInfo,
  isAdmin,
  isReadOnly,
  onEdit,
  onDelete,
  onToggleVisibility,
  maskEmail,
  maskPhone
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã GV</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ và tên</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SĐT</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Môn dạy</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lớp CN</th>
            {isAdmin && !isReadOnly && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {teachers.length === 0 ? (
            <tr>
              <td colSpan={isAdmin && !isReadOnly ? 7 : 6} className="px-6 py-8 text-center text-gray-500">
                Chưa có giáo viên nào
              </td>
            </tr>
          ) : (
            teachers.map((teacher, idx) => {
              const displayCode = teacher.teacherCode || `GV${(idx + 1).toString().padStart(3, '0')}`;
              const mainClass = classes.find(c => (c._id || c.id) === teacher.mainClassId);
              const teacherSubjects = (teacher.subjectIds || [])
                .map(sid => subjects.find(s => (s._id || s.id) === sid)?.name)
                .filter(Boolean)
                .join(', ') || '-';

              const emailVisible = visibleInfo[teacher.id] === 'email' || visibleInfo[teacher.id] === 'both';
              const phoneVisible = visibleInfo[teacher.id] === 'phone' || visibleInfo[teacher.id] === 'both';

              return (
                <tr key={teacher.id || idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{displayCode}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{teacher.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <span>{emailVisible ? (teacher.email || '-') : maskEmail(teacher.email)}</span>
                      {teacher.email && (
                        <button
                          onClick={() => onToggleVisibility(teacher.id, 'email')}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title={emailVisible ? 'Ẩn email' : 'Hiện email'}
                        >
                          {emailVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <span>{phoneVisible ? (teacher.phone || '-') : maskPhone(teacher.phone)}</span>
                      {teacher.phone && (
                        <button
                          onClick={() => onToggleVisibility(teacher.id, 'phone')}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title={phoneVisible ? 'Ẩn SĐT' : 'Hiện SĐT'}
                        >
                          {phoneVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{teacherSubjects}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{teacher.mainClassName || mainClass?.name || '-'}</td>
                  {isAdmin && !isReadOnly && (
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button
                        onClick={() => onEdit(teacher)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(teacher.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TeacherTable;