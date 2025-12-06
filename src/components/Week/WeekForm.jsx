import React from 'react';
import { Plus, Loader, Zap } from 'lucide-react';

export const WeekForm = ({ week, setWeek, onSubmit, onCancel, onQuickAdd, loading, isEdit, totalWeeks }) => {
  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${isEdit ? 'border-2 border-blue-300' : ''}`}>
      <h3 className="text-lg font-semibold mb-4">
        {isEdit ? `Chỉnh sửa Tuần ${week.weekNumber}` : 'Thêm tuần học mới'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ngày bắt đầu</label>
          <input
            type="date"
            value={week.startDate}
            onChange={(e) => setWeek({ ...week, startDate: e.target.value })}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ngày kết thúc</label>
          <input
            type="date"
            value={week.endDate}
            onChange={(e) => setWeek({ ...week, endDate: e.target.value })}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>
        <div className="flex items-end gap-2">
          {!isEdit && onQuickAdd && (
            <button
              onClick={onQuickAdd}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              title="Thêm nhanh tuần tiếp theo (7 ngày từ thứ 2)"
            >
              {loading ? <Loader className="animate-spin" size={20} /> : <Zap size={20} />}
              Thêm nhanh
            </button>
          )}
          <button
            onClick={onSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader className="animate-spin" size={20} /> : isEdit ? 'Lưu' : <Plus size={20} />}
            {isEdit ? '' : 'Thêm'}
          </button>
          {isEdit && (
            <button
              onClick={onCancel}
              disabled={loading}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50"
            >
              Hủy
            </button>
          )}
        </div>
      </div>
      {!isEdit && week.startDate && week.endDate && new Date(week.startDate) < new Date(week.endDate) && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">
            Tuần này sẽ được đánh số: <strong>Tuần {totalWeeks + 1}</strong>
            {' '}({calculateDays(week.startDate, week.endDate)} ngày)
          </p>
        </div>
      )}
    </div>
  );
};
