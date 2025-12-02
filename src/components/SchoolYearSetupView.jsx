import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, Loader, AlertCircle } from 'lucide-react';
import { useSchoolYear } from '../hooks/useSchoolYear';

const SchoolYearSetupView = ({ currentUser, onSchoolYearCreated }) => {
  const [yearInput, setYearInput] = useState('');
  const { createSchoolYear, loading, error } = useSchoolYear();
  const [localError, setLocalError] = useState('');

  const isAdmin = useMemo(() => currentUser?.role === 'admin', [currentUser?.role]);

  const getCurrentSchoolYear = useCallback(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const startYear = currentMonth >= 9 ? currentYear : currentYear - 1;
    return `${startYear}-${startYear + 1}`;
  }, []);

  const validateYearInput = useCallback((input) => {
    if (!input.trim()) {
      return 'Vui lòng nhập năm học!';
    }

    const yearPattern = /^\d{4}-\d{4}$/;
    if (!yearPattern.test(input)) {
      return 'Định dạng năm học không hợp lệ (VD: 2024-2025)';
    }

    const [startYear, endYear] = input.split('-').map(Number);
    if (endYear !== startYear + 1) {
      return 'Năm học phải liên tiếp nhau (VD: 2024-2025)';
    }

    return null;
  }, []);

  const handleSuggestYear = useCallback(() => {
    setYearInput(getCurrentSchoolYear());
    setLocalError('');
  }, [getCurrentSchoolYear]);

  const handleCreateYear = useCallback(async () => {
    const validationError = validateYearInput(yearInput);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    const result = await createSchoolYear({ year: yearInput });

    if (result.success) {
      alert('Đã tạo năm học thành công!');
      const schoolYearObj = result.schoolYear || { year: yearInput, status: 'active' };
      onSchoolYearCreated(schoolYearObj);
    } else {
      setLocalError(result.message || 'Tạo năm học thất bại');
    }
  }, [yearInput, validateYearInput, createSchoolYear, onSchoolYearCreated]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  }, []);

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdmin ? 'Thiết lập năm học' : 'Hệ thống chưa sẵn sàng'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isAdmin
              ? 'Tạo năm học đầu tiên để bắt đầu sử dụng hệ thống'
              : 'Vui lòng chờ Admin thiết lập năm học'}
          </p>
        </div>

        {!isAdmin && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <div className="flex flex-col items-center text-center gap-3">
              <AlertCircle className="text-yellow-600" size={48} />
              <div>
                <p className="text-lg text-yellow-900 font-bold mb-2">Hệ thống chưa được khởi tạo</p>
                <p className="text-sm text-yellow-800 mb-1">
                  Năm học chưa được tạo. Vui lòng liên hệ <strong>Admin</strong> để thiết lập năm học đầu tiên.
                </p>
                <p className="text-xs text-yellow-700 mt-3">
                  Chỉ cần <strong>1 Admin duy nhất</strong> tạo năm học lần đầu, sau đó tất cả tài khoản khác (kể cả Admin) sẽ tự động sử dụng năm học đó.
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="mt-4 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        )}

        {isAdmin && (
          <>
            {displayError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-red-700">{displayError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Năm học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={yearInput}
                  onChange={(e) => setYearInput(e.target.value)}
                  placeholder="2024-2025"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">Định dạng: YYYY-YYYY (VD: 2024-2025)</p>
              </div>

              <button
                onClick={handleSuggestYear}
                disabled={loading}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 font-medium text-sm"
              >
                Tự động điền năm học hiện tại
              </button>

              <button
                onClick={handleCreateYear}
                disabled={loading || !yearInput}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Đang tạo...
                  </>
                ) : (
                  'Tạo năm học'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SchoolYearSetupView;