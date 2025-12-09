import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Loader } from 'lucide-react';
import { useWeeks } from '../../hooks/useWeek';
import { WeekForm } from './WeekForm';
import { WeeksTable } from './WeeksTable';
import Pagination from '../Classes/Pagination';

const MAX_WEEKS = 35;

// ✅ Cache tối ưu với Map
const cache = new Map();

const getCacheKey = (schoolYear, page) => `weeks_${schoolYear || 'current'}_page${page}`;

const WeeksView = ({ currentUser, schoolYear, isReadOnly = false }) => {
  const cacheKey = getCacheKey(schoolYear, 1);
  const cachedData = cache.get(cacheKey);

  const [weeks, setWeeks] = useState(cachedData?.weeks || []);
  const [pagination, setPagination] = useState(cachedData?.pagination || null);
  const [totalWeeks, setTotalWeeks] = useState(cachedData?.totalWeeks || 0);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingWeek, setEditingWeek] = useState(null);
  const [newWeek, setNewWeek] = useState({ startDate: '', endDate: '' });
  
  const { fetchWeeks, addWeek, updateWeek, deleteWeek, error } = useWeeks();
  const isAdmin = currentUser.role === 'admin';
  const itemsPerPage = 10;

  // ✅ Load weeks với cache
  const loadWeeks = useCallback(async (page = currentPage) => {
    const key = getCacheKey(schoolYear, page);
    
    // Nếu có cache thì dùng luôn
    if (cache.has(key)) {
      const cached = cache.get(key);
      setWeeks(cached.weeks);
      setPagination(cached.pagination);
      setTotalWeeks(cached.totalWeeks);
      setCurrentPage(page);
      return;
    }
    
    setIsLoadingData(true);
    try {
      const result = await fetchWeeks(schoolYear, page, itemsPerPage);
      if (result.success) {
        setWeeks(result.weeks);
        setPagination(result.pagination);
        setTotalWeeks(result.pagination.totalItems);
        setCurrentPage(page);
        
        // Lưu cache
        cache.set(key, {
          weeks: result.weeks,
          pagination: result.pagination,
          totalWeeks: result.pagination.totalItems
        });
      } else {
        setWeeks([]);
        setPagination(null);
        setTotalWeeks(0);
      }
    } catch (err) {
      console.error("Error loading weeks:", err);
      setWeeks([]);
      setPagination(null);
      setTotalWeeks(0);
    } finally {
      setIsLoadingData(false);
    }
  }, [schoolYear, currentPage]);

  useEffect(() => {
    loadWeeks(1);
  }, [schoolYear]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      loadWeeks(newPage);
    }
  };

  // ✅ Invalidate cache sau khi thêm/sửa/xóa
  const invalidateCache = () => {
    cache.clear();
  };

  const getNextMondayWeek = (lastEndDate) => {
    const nextDay = new Date(lastEndDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const dayOfWeek = nextDay.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7;

    const monday = new Date(nextDay);
    if (daysUntilMonday > 0) {
      monday.setDate(monday.getDate() + daysUntilMonday);
    }
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);

    return {
      startDate: monday.toISOString().split('T')[0],
      endDate: sunday.toISOString().split('T')[0]
    };
  };

  const handleQuickAdd = async () => {
    if (isReadOnly) {
      alert('Chế độ chỉ xem! Không thể thêm tuần học vào năm học cũ.');
      return;
    }

    if (totalWeeks >= MAX_WEEKS) {
      alert(`Đã đạt giới hạn ${MAX_WEEKS} tuần trong năm học!`);
      return;
    }
    
    const allWeeksResult = await fetchWeeks(schoolYear, 1, MAX_WEEKS);
    const allWeeks = allWeeksResult.success ? allWeeksResult.weeks : [];

    let nextWeekDates;

    if (allWeeks.length === 0) {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7;

      const monday = new Date(today);
      if (daysUntilMonday > 0) {
        monday.setDate(monday.getDate() + daysUntilMonday);
      }

      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);

      nextWeekDates = {
        startDate: monday.toISOString().split('T')[0],
        endDate: sunday.toISOString().split('T')[0]
      };
    } else {
      const sortedWeeks = [...allWeeks].sort((a, b) =>
        new Date(b.endDate) - new Date(a.endDate)
      );
      const lastWeek = sortedWeeks[0];
      nextWeekDates = getNextMondayWeek(lastWeek.endDate);
    }

    const result = await addWeek({
      startDate: nextWeekDates.startDate,
      endDate: nextWeekDates.endDate
    });

    if (result.success) {
      invalidateCache();
      await loadWeeks(currentPage);
      alert(`Đã thêm Tuần ${totalWeeks + 1} (${nextWeekDates.startDate} - ${nextWeekDates.endDate})!`);
    } else {
      alert(result.message || 'Thêm tuần thất bại');
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

    if (totalWeeks >= MAX_WEEKS) {
      alert(`Đã đạt giới hạn ${MAX_WEEKS} tuần trong năm học!`);
      return;
    }

    const result = await addWeek({
      startDate: newWeek.startDate,
      endDate: newWeek.endDate
    });

    if (result.success) {
      invalidateCache();
      await loadWeeks(currentPage);
      setNewWeek({ startDate: '', endDate: '' });
      alert(`Đã thêm tuần học thành công!`);
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
      invalidateCache();
      
      const shouldGoToPrevPage = weeks.length === 1 && currentPage > 1;
      const newPage = shouldGoToPrevPage ? currentPage - 1 : currentPage;
      await loadWeeks(newPage);
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
      invalidateCache();
      await loadWeeks(currentPage);
      setEditingWeek(null);
      alert('Đã cập nhật tuần học!');
    } else {
      alert(result.message || 'Cập nhật tuần thất bại');
    }
  };

  // ✅ Hiển thị cached data ngay lập tức
  if (isLoadingData && weeks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-blue-600" size={48} />
          <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
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
          <p className="text-sm text-gray-500 mt-1">
            Năm học: {schoolYear} - Tổng: {totalWeeks}/{MAX_WEEKS} tuần
          </p>
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
          onQuickAdd={handleQuickAdd}
          isEdit={false}
          totalWeeks={totalWeeks}
        />
      )}

      {editingWeek && !isReadOnly && (
        <WeekForm
          week={editingWeek}
          setWeek={setEditingWeek}
          onSubmit={handleSaveEdit}
          onCancel={() => setEditingWeek(null)}
          isEdit={true}
        />
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
        {/* ✅ Loading indicator nhỏ khi đang load nhưng đã có data */}
        {isLoadingData && weeks.length > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <Loader className="animate-spin text-blue-600" size={20} />
          </div>
        )}
        
        <WeeksTable
          weeks={weeks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isAdmin={isAdmin}
          isReadOnly={isReadOnly}
        />

        {pagination && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default WeeksView;