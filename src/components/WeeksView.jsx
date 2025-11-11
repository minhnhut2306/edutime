// Weeks Management View (THÊM MỚI)
import React, { useState } from 'react';
import { Calendar, Edit2, Trash2, Plus } from 'lucide-react';

const MAX_WEEKS = 35;



// Weeks Management View (SỬA LẠI HOÀN TOÀN)
const WeeksView = ({ weeks, setWeeks, currentUser, schoolYear }) => {
  const isAdmin = currentUser.role === 'admin';
  const [editingWeek, setEditingWeek] = useState(null);
  const [newWeek, setNewWeek] = useState({
    startDate: '',
    endDate: ''
  });

  // Tính tuần số dựa trên ngày bắt đầu năm học
  const calculateWeekNumber = (startDate) => {
    if (!startDate) return null;

    // Tìm tuần đầu tiên trong năm học (tuần có ngày bắt đầu sớm nhất)
    const sortedWeeks = [...weeks].sort((a, b) =>
      new Date(a.startDate) - new Date(b.startDate)
    );

    if (sortedWeeks.length === 0) {
      return 1; // Tuần đầu tiên
    }

    const firstWeekStart = new Date(sortedWeeks[0].startDate);
    const newWeekStart = new Date(startDate);

    // Tính số tuần chênh lệch
    const diffTime = newWeekStart - firstWeekStart;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(diffDays / 7) + 1;

    return weekNumber > 0 ? weekNumber : 1;
  };

  const handleAdd = () => {
    if (!newWeek.startDate || !newWeek.endDate) {
      alert('Vui lòng chọn ngày bắt đầu và ngày kết thúc!');
      return;
    }

    const start = new Date(newWeek.startDate);
    const end = new Date(newWeek.endDate);

    if (start >= end) {
      alert('Ngày kết thúc phải sau ngày bắt đầu!');
      return;
    }

    // Kiểm tra trùng ngày với các tuần khác
    const isOverlap = weeks.some(w => {
      const wStart = new Date(w.startDate);
      const wEnd = new Date(w.endDate);
      return (start <= wEnd && end >= wStart);
    });

    if (isOverlap) {
      alert('Thời gian này bị trùng với tuần khác!');
      return;
    }

    // Tự động tính tuần số
    const weekNumber = weeks.length === 0 ? 1 : calculateWeekNumber(newWeek.startDate);

    const week = {
      id: `W${Date.now()}`,
      weekNumber: weekNumber,
      startDate: newWeek.startDate,
      endDate: newWeek.endDate
    };

    setWeeks([...weeks, week].sort((a, b) => a.weekNumber - b.weekNumber));
    setNewWeek({ startDate: '', endDate: '' });
    alert(`Đã thêm Tuần ${weekNumber}!`);
  };

  const handleDelete = (id) => {
    if (confirm('Xóa tuần học này?')) {
      const updatedWeeks = weeks.filter(w => w.id !== id);
      // Tự động cập nhật lại số tuần
      const reorderedWeeks = updatedWeeks
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .map((w, index) => ({ ...w, weekNumber: index + 1 }));

      setWeeks(reorderedWeeks);
    }
  };

  const handleEdit = (week) => {
    setEditingWeek({ ...week });
  };

  const handleSaveEdit = () => {
    const start = new Date(editingWeek.startDate);
    const end = new Date(editingWeek.endDate);

    if (start >= end) {
      alert('Ngày kết thúc phải sau ngày bắt đầu!');
      return;
    }

    // Kiểm tra trùng với các tuần khác (trừ tuần đang sửa)
    const isOverlap = weeks.some(w => {
      if (w.id === editingWeek.id) return false;
      const wStart = new Date(w.startDate);
      const wEnd = new Date(w.endDate);
      return (start <= wEnd && end >= wStart);
    });

    if (isOverlap) {
      alert('Thời gian này bị trùng với tuần khác!');
      return;
    }

    const updatedWeeks = weeks.map(w => w.id === editingWeek.id ? editingWeek : w);

    // Sắp xếp lại và cập nhật số tuần
    const reorderedWeeks = updatedWeeks
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .map((w, index) => ({ ...w, weekNumber: index + 1 }));

    setWeeks(reorderedWeeks);
    setEditingWeek(null);
    alert('Đã cập nhật tuần học!');
  };

  // Tính số ngày trong tuần
  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Quản lý Tuần học</h2>
          <p className="text-sm text-gray-500 mt-1">Năm học: {schoolYear} - Tổng: {weeks.length} tuần</p>
        </div>
      </div>

      {isAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-2">
              <Calendar size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-900">Hướng dẫn</p>
              <p className="text-sm text-blue-700 mt-1">
                Chọn ngày bắt đầu và ngày kết thúc cho mỗi tuần học.
                Hệ thống sẽ <strong>tự động đánh số tuần</strong> theo thứ tự thời gian.
              </p>
            </div>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Thêm tuần học mới</h3>
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900">
              📊 Tiến độ: {weeks.length}/{MAX_WEEKS} tuần
              <span className="ml-2 text-blue-600">
                ({MAX_WEEKS - weeks.length} tuần còn lại)
              </span>
            </p>
            {weeks.length >= MAX_WEEKS - 5 && weeks.length < MAX_WEEKS && (
              <p className="text-xs text-orange-600 mt-1">⚠️ Sắp đạt giới hạn năm học!</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày bắt đầu</label>
              <input
                type="date"
                value={newWeek.startDate}
                onChange={(e) => setNewWeek({ ...newWeek, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày kết thúc</label>
              <input
                type="date"
                value={newWeek.endDate}
                onChange={(e) => setNewWeek({ ...newWeek, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAdd}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Thêm tuần
              </button>
            </div>
          </div>
          {newWeek.startDate && newWeek.endDate && new Date(newWeek.startDate) < new Date(newWeek.endDate) && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                ✓ Tuần này sẽ được đánh số: <strong>Tuần {weeks.length === 0 ? 1 : calculateWeekNumber(newWeek.startDate)}</strong>
                {' '}({calculateDays(newWeek.startDate, newWeek.endDate)} ngày)
              </p>
            </div>
          )}
        </div>
      )}

      {editingWeek && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-300">
          <h3 className="text-lg font-semibold mb-4">Chỉnh sửa Tuần {editingWeek.weekNumber}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày bắt đầu</label>
              <input
                type="date"
                value={editingWeek.startDate}
                onChange={(e) => setEditingWeek({ ...editingWeek, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày kết thúc</label>
              <input
                type="date"
                value={editingWeek.endDate}
                onChange={(e) => setEditingWeek({ ...editingWeek, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleSaveEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Lưu
              </button>
              <button
                onClick={() => setEditingWeek(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold">Danh sách tuần học</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tuần</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày bắt đầu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày kết thúc</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số ngày</th>
                {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {weeks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <Calendar size={48} className="mx-auto text-gray-300 mb-2" />
                    <p>Chưa có tuần học nào. Hãy thêm tuần học đầu tiên!</p>
                  </td>
                </tr>
              ) : (
                weeks.map((week) => {
                  const start = new Date(week.startDate);
                  const end = new Date(week.endDate);
                  const days = calculateDays(week.startDate, week.endDate);

                  return (
                    <tr key={week.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-bold text-blue-600">Tuần {week.weekNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {start.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {end.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{days} ngày</td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-sm flex gap-2">
                          <button
                            onClick={() => handleEdit(week)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(week.id)}
                            className="text-red-600 hover:text-red-800"
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
      </div>
    </div>
  );
};

export default WeeksView;