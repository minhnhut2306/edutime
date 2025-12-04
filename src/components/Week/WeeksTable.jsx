import React from 'react';
import { Calendar, Edit, Trash2 } from 'lucide-react';

export const WeeksTable = ({ weeks, onEdit, onDelete, isAdmin, isReadOnly, loading }) => {
  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <table className="w-full">
      <thead className="bg-gray-50 border-b">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tuần</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày bắt đầu</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày kết thúc</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số ngày</th>
          {isAdmin && !isReadOnly && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {weeks.length === 0 ? (
          <tr>
            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
              <Calendar size={48} className="mx-auto text-gray-300 mb-2" />
              <p>Chưa có tuần học nào</p>
            </td>
          </tr>
        ) : (
          weeks.map((week) => {
            const start = new Date(week.startDate);
            const end = new Date(week.endDate);
            const days = calculateDays(week.startDate, week.endDate);

            return (
              <tr key={week._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-bold text-blue-600">Tuần {week.weekNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {start.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {end.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{days} ngày</td>
                {isAdmin && !isReadOnly && (
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <button
                      onClick={() => onEdit(week)}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      title="Chỉnh sửa"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(week._id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
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
  );
};