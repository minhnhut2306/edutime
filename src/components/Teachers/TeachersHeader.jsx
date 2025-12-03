import React from 'react';
import { RefreshCw, Download, Edit, Plus, Eye, X } from 'react-feather';
import ExcelService from '../../service/ExcelService';

// Header chính
export const TeacherHeader = ({ isAdmin, isReadOnly, onRefresh, onImport, onAdd }) => (
  <div className="flex justify-between items-center">
    <h2 className="text-2xl font-bold flex items-center gap-2">
      Quản lý giáo viên
      {isReadOnly && (
        <span className="flex items-center gap-2 text-sm font-normal text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
          <Eye size={16} />
          Chế độ xem
        </span>
      )}
    </h2>
    {isAdmin && !isReadOnly && (
      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          title="Tải lại danh sách"
        >
          <RefreshCw size={20} />
          Tải lại
        </button>

        <button
          onClick={() => ExcelService.downloadTemplate('Teacher')}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Download size={20} />
          Tải file mẫu
        </button>

        <label className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer transition-colors">
          <Edit size={20} />
          <span>Import</span>
          <input type="file" accept=".xlsx,.xls" onChange={onImport} className="hidden" />
        </label>

        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Thêm
        </button>
      </div>
    )}
  </div>
);

// Banner readonly
export const ReadOnlyBanner = () => (
  <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg">
    <div className="flex items-center gap-2">
      <Eye size={20} className="text-orange-600" />
      <div>
        <p className="font-medium text-orange-900">Đang xem dữ liệu năm học cũ</p>
      </div>
    </div>
  </div>
);

// Kết quả import
export const ImportResultPanel = ({ result, onClose }) => {
  if (!result) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Kết quả Import</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex gap-4 mb-3">
        <span className="text-green-600 font-medium">
          Thành công: {result.successCount}
        </span>
        <span className="text-red-600 font-medium">
          Thất bại: {result.failedCount}
        </span>
      </div>

      {result.failed.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 font-medium mb-2">Chi tiết lỗi:</p>
          <ul className="text-sm text-red-600 space-y-1 max-h-40 overflow-y-auto">
            {result.failed.map((f, idx) => (
              <li key={idx}>• Dòng {f.row}: {f.reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};