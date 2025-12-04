import React from 'react';
import ClassRow from './ClassRow';

const ClassesTable = ({ classes = [], isAdmin, isReadOnly, loading, onEdit, onDelete }) => {
  const colSpan = isAdmin && !isReadOnly ? 5 : 4;

  return (
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
            <td colSpan={colSpan} className="px-6 py-8 text-center text-gray-500">
              Chưa có lớp học nào
            </td>
          </tr>
        ) : (
          classes.map((cls) => (
            <ClassRow
              key={cls.id}
              cls={cls}
              isAdmin={isAdmin}
              isReadOnly={isReadOnly}
              loading={loading}
              onEdit={() => onEdit(cls)}
              onDelete={() => onDelete(cls.id)}
            />
          ))
        )}
      </tbody>
    </table>
  );
};

export default ClassesTable;