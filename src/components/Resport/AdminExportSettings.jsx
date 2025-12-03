import React from 'react';
import { RefreshCw } from 'lucide-react';
import { TeacherSelector } from './TeacherSelector';
import { ExportParams } from './ExportParams';

export const AdminExportSettings = ({
  exportMode,
  setExportMode,
  selectedTeacherId,
  setSelectedTeacherId,
  selectedTeacherIds,
  toggleTeacherSelection,
  selectAllTeachers,
  deselectAllTeachers,
  teachers,
  exportType,
  setExportType,
  exportParams,
  setExportParams,
  weeks,
  loadingRecords
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Cài đặt xuất báo cáo</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Chế độ xuất</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              checked={exportMode === 'single'} 
              onChange={() => setExportMode('single')} 
              className="w-4 h-4" 
            />
            <span className="text-sm">Một giáo viên</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              checked={exportMode === 'multiple'} 
              onChange={() => setExportMode('multiple')} 
              className="w-4 h-4" 
            />
            <span className="text-sm">Nhiều giáo viên (mỗi GV = sheet riêng)</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Giáo viên</label>
          <TeacherSelector
            exportMode={exportMode}
            selectedTeacherId={selectedTeacherId}
            setSelectedTeacherId={setSelectedTeacherId}
            selectedTeacherIds={selectedTeacherIds}
            toggleTeacherSelection={toggleTeacherSelection}
            selectAllTeachers={selectAllTeachers}
            deselectAllTeachers={deselectAllTeachers}
            teachers={teachers}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Loại báo cáo</label>
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="bc">Theo BC (Biên chế/Tháng)</option>
            <option value="week">Theo Tuần</option>
            <option value="semester">Theo Học kỳ</option>
            <option value="year">Cả năm học</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Tất cả đều xuất theo mẫu BC chuẩn
          </p>
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
