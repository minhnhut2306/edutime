import React, { useState, useEffect } from 'react';
import { Eye, Loader } from 'lucide-react';
import { useWeeks } from '../../hooks/useWeek';
import { WeekForm } from './WeekForm';
import { WeeksTable } from './WeeksTable';

const MAX_WEEKS = 35;

const WeeksView = ({ currentUser, schoolYear, isReadOnly = false }) => {
  const [weeks, setWeeks] = useState([]);
  const { fetchWeeks, addWeek, updateWeek, deleteWeek, loading, error } = useWeeks();
  const isAdmin = currentUser.role === 'admin';
  const [editingWeek, setEditingWeek] = useState(null);
  const [newWeek, setNewWeek] = useState({ startDate: '', endDate: '' });

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

  const validateWeekDates = (startDate, endDate, excludeId = null) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return { valid: false, message: 'Ngày kết thúc phải sau ngày bắt đầu!' };
    }

    const isOverlap = weeks.some(w => {
      if (w._id === excludeId) return false;
      const wStart = new Date(w.startDate);
      const wEnd = new Date(w.endDate);
      return (start <= wEnd && end >= wStart);
    });

    if (isOverlap) {
      return { valid: false, message: 'Thời gian này bị trùng với tuần khác!' };
    }

    return { valid: true };
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

    const validation = validateWeekDates(newWeek.startDate, newWeek.endDate);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    if (weeks.length >= MAX_WEEKS) {
      alert(`Đã đạt giới hạn ${MAX_WEEKS} tuần trong năm học!`);
      return;
    }

    const weekNumber = weeks.length + 1;
    const result = await addWeek({
      weekNumber,
      startDate: newWeek.startDate,
      endDate: newWeek.endDate
    });

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
    const validation = validateWeekDates(editingWeek.startDate, editingWeek.endDate, editingWeek._id);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    const result = await updateWeek(editingWeek._id, {
      startDate: editingWeek.startDate,
      endDate: editingWeek.endDate
    });

    if (result.success) {
      await loadWeeks();
      setEditingWeek(null);
      alert('Đã cập nhật tuần học!');
    } else {
      alert(result.message || 'Cập nhật tuần thất bại');
    }
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
            <p className="font-medium text-orange-900">Đang xem dữ liệu năm học cũ</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {isAdmin && !isReadOnly && (
        <WeekForm
          week={newWeek}
          setWeek={setNewWeek}
          onSubmit={handleAdd}
          loading={loading}
          isEdit={false}
          totalWeeks={weeks.length}
        />
      )}

      {editingWeek && !isReadOnly && (
        <WeekForm
          week={editingWeek}
          setWeek={setEditingWeek}
          onSubmit={handleSaveEdit}
          onCancel={() => setEditingWeek(null)}
          loading={loading}
          isEdit={true}
        />
      )}

      <WeeksTable
        weeks={weeks}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isAdmin={isAdmin}
        isReadOnly={isReadOnly}
        loading={loading}
      />
    </div>
  );
};

export default WeeksView;