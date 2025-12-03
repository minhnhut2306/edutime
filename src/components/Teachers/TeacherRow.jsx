import React from 'react';
import { Edit, Trash2, Eye, EyeOff } from 'react-feather';
import { maskEmail, maskPhone } from './../../utils/teacherUtils';    

const TeacherRow = ({
  teacher,
  idx,
  classes,
  subjects,
  visibleInfo,
  toggleVisibility,
  onEdit,
  onDelete,
  isAdmin,
  isReadOnly,
}) => {
  const displayCode = teacher.teacherCode || `GV${(idx + 1).toString().padStart(3, '0')}`;
  const mainClass = classes.find(c => (c._id || c.id) === teacher.mainClassId);
  const teacherSubjects = (teacher.subjectIds || [])
    .map(sid => subjects.find(s => (s._id || s.id) === sid)?.name)
    .filter(Boolean)
    .join(', ') || '-';

  const emailVisible = visibleInfo[teacher.id] === 'email' || visibleInfo[teacher.id] === 'both';
  const phoneVisible = visibleInfo[teacher.id] === 'phone' || visibleInfo[teacher.id] === 'both';

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 text-sm font-medium text-gray-900">{displayCode}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{teacher.name}</td>
      <td className="px-6 py-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>{emailVisible ? (teacher.email || '-') : maskEmail(teacher.email)}</span>
          {teacher.email && (
            <button
              onClick={() => toggleVisibility(teacher.id, 'email')}
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
              onClick={() => toggleVisibility(teacher.id, 'phone')}
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
          <button onClick={() => onEdit(teacher)} className="text-blue-600 hover:text-blue-800 transition-colors" title="Chỉnh sửa">
            <Edit size={16} />
          </button>
          <button onClick={() => onDelete(teacher.id)} className="text-red-600 hover:text-red-800 transition-colors" title="Xóa">
            <Trash2 size={16} />
          </button>
        </td>
      )}
    </tr>
  );
};

export default TeacherRow;