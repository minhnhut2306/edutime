import React from 'react';
import { RefreshCw } from 'lucide-react';
import { ExportParams } from './ExportParams';

export const TeacherExportSettings = ({
  exportType,
  setExportType,
  exportParams,
  setExportParams,
  weeks,
  loadingRecords
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Chọn loại báo cáo</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Loại báo cáo</label>
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="bc">Theo BC (Biên chế/Tháng)</option>
            <option value="week">Theo Tuần</option>
            <option value="semester">Theo Học kỳ</option>
            <option value="year">Cả năm học</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tham số</label>
          <ExportParams
            exportType={exportType}
            exportParams={exportParams}
            setExportParams={setExportParams}
            weeks={weeks}
          />
        </div>
      </div>

      {loadingRecords && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <RefreshCw className="animate-spin" size={20} />
          <p className="text-sm text-blue-700">Đang tải dữ liệu...</p>
        </div>
      )}
    </div>
  );
};