import React, { useState, useEffect } from 'react';
import { Calendar, Edit, Trash2, Plus, Loader, Eye } from 'lucide-react';
import { useWeeks } from '../hooks/useWeek';

const MAX_WEEKS = 35;

const WeeksView = ({ currentUser, schoolYear, isReadOnly = false }) => {
  const [weeks, setWeeks] = useState([]);
  const { fetchWeeks, addWeek, updateWeek, deleteWeek, loading, error } = useWeeks();
  const isAdmin = currentUser.role === 'admin';
  const [editingWeek, setEditingWeek] = useState(null);
  const [newWeek, setNewWeek] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadWeeks();
  }, [schoolYear]);

  const loadWeeks = async () => {
    const result = await fetchWeeks(schoolYear);
    if (result.success) {
      const sortedWeeks = result.weeks
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .map((week, index) => ({ ...week, weekNumber: index + 1 }));
      setWeeks(sortedWeeks);
    }
  };

  const handleAdd = async () => {
    if (isReadOnly) {
      alert('Chế độ chỉ xem! Không thể thêm tuần học vào năm học cũ.');
      return;
    }

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

    const isOverlap = weeks.some(w => {
      const wStart = new Date(w.startDate);
      const wEnd = new Date(w.endDate);
      return (start <= wEnd && end >= wStart);
    });

    if (isOverlap) {
      alert('Thời gian này bị trùng với tuần khác!');
      return;
    }

    if (weeks.length >= MAX_WEEKS) {
      alert(`Đã đạt giới hạn ${MAX_WEEKS} tuần trong năm học!`);
      return;
    }

    const weekNumber = weeks.length + 1;

    const weekData = {
      weekNumber: weekNumber,
      startDate: newWeek.startDate,
      endDate: newWeek.endDate
    };

    const result = await addWeek(weekData);
    if (result.success) {
      await loadWeeks();
      setNewWeek({ startDate: '', endDate: '' });
      alert(`Đã thêm Tuần ${weekNumber}!`);
    } else {
      alert(result.message || 'Thêm tuần thất bại');
    }
  };

  const handleDelete = async (weekId) => {
    if (isReadOnly) {
      alert('Chế độ chỉ xem! Không thể xóa tuần học của năm học cũ.');
      return;
    }

    if (!confirm('Xóa tuần học này?')) return;

    const result = await deleteWeek(weekId);
    if (result.success) {
      await loadWeeks();
      alert('Đã xóa tuần học!');
    } else {
      alert(result.message || 'Xóa tuần thất bại');
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleEdit = (week) => {
    if (isReadOnly) {
      alert('Chế độ chỉ xem! Không thể chỉnh sửa tuần học của năm học cũ.');
      return;
    }
    setEditingWeek({
      ...week,
      startDate: formatDateForInput(week.startDate),
      endDate: formatDateForInput(week.endDate)
    });
  };

  const handleSaveEdit = async () => {
    const start = new Date(editingWeek.startDate);
    const end = new Date(editingWeek.endDate);

    if (start >= end) {
      alert('Ngày kết thúc phải sau ngày bắt đầu!');
      return;
    }

    const isOverlap = weeks.some(w => {
      if (w._id === editingWeek._id) return false;
      const wStart = new Date(w.startDate);
      const wEnd = new Date(w.endDate);
      return (start <= wEnd && end >= wStart);
    });

    if (isOverlap) {
      alert('Thời gian này bị trùng với tuần khác!');
      return;
    }

    const weekData = {
      startDate: editingWeek.startDate,
      endDate: editingWeek.endDate
    };

    const result = await updateWeek(editingWeek._id, weekData);
    if (result.success) {
      await loadWeeks();
      setEditingWeek(null);
      alert('Đã cập nhật tuần học!');
    } else {
      alert(result.message || 'Cập nhật tuần thất bại');
    }
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  if (loading && weeks.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Quản lý Tuần học
            {isReadOnly && (
              <span className="flex items-center gap-2 text-sm font-normal text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                <Eye size={16} />
                Chế độ xem
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Năm học: {schoolYear} - Tổng: {weeks.length}/{MAX_WEEKS} tuần</p>
        </div>
      </div>

      {isReadOnly && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Eye size={20} className="text-orange-600" />
            <div>
              <p className="font-medium text-orange-900">Đang xem dữ liệu năm học cũ</p>
              
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {isAdmin && !isReadOnly && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Thêm tuần học mới</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày bắt đầu</label>
              <input
                type="date"
                value={newWeek.startDate}
                onChange={(e) => setNewWeek({ ...newWeek, startDate: e.target.value })}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày kết thúc</label>
              <input
                type="date"
                value={newWeek.endDate}
                onChange={(e) => setNewWeek({ ...newWeek, endDate: e.target.value })}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAdd}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader className="animate-spin" size={20} /> : <Plus size={20} />}
                Thêm tuần
              </button>
            </div>
          </div>
          {newWeek.startDate && newWeek.endDate && new Date(newWeek.startDate) < new Date(newWeek.endDate) && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                ✓ Tuần này sẽ được đánh số: <strong>Tuần {weeks.length + 1}</strong>
                {' '}({calculateDays(newWeek.startDate, newWeek.endDate)} ngày)
              </p>
            </div>
          )}
        </div>
      )}

      {editingWeek && !isReadOnly && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-300">
          <h3 className="text-lg font-semibold mb-4">Chỉnh sửa Tuần {editingWeek.weekNumber}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày bắt đầu</label>
              <input
                type="date"
                value={editingWeek.startDate}
                onChange={(e) => setEditingWeek({ ...editingWeek, startDate: e.target.value })}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày kết thúc</label>
              <input
                type="date"
                value={editingWeek.endDate}
                onChange={(e) => setEditingWeek({ ...editingWeek, endDate: e.target.value })}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleSaveEdit}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? <Loader className="animate-spin" size={16} /> : 'Lưu'}
              </button>
              <button
                onClick={() => setEditingWeek(null)}
                disabled={loading}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
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
                            onClick={() => handleEdit(week)}
                            disabled={loading}
                            className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                            title="Chỉnh sửa"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(week._id)}
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
        </div>
      </div>
    </div>
  );
};

export default WeeksView;