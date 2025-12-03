import React from 'react';
import TeacherRow from './TeacherRow';

const TeachersTable = ({ teachers, classes, subjects, visibleInfo, toggleVisibility, onEdit, onDelete, isAdmin, isReadOnly }) => {
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
            {isAdmin && !isReadOnly && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>}
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
            teachers.map((t, idx) => (
              <TeacherRow
                key={t.id || idx}
                teacher={t}
                idx={idx}
                classes={classes}
                subjects={subjects}
                visibleInfo={visibleInfo}
                toggleVisibility={toggleVisibility}
                onEdit={onEdit}
                onDelete={onDelete}
                isAdmin={isAdmin}
                isReadOnly={isReadOnly}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TeachersTable;