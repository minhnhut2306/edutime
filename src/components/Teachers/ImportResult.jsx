import React from 'react';
import { X } from 'react-feather';

const ImportResult = ({ result, onClose }) => {
  if (!result) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Kết quả Import</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors"><X size={20} /></button>
      </div>

      <div className="flex gap-4 mb-3">
        <span className="text-green-600 font-medium">✅ Thành công: {result.successCount}</span>
        <span className="text-red-600 font-medium">❌ Thất bại: {result.failedCount}</span>
      </div>

      {result.failed && result.failed.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 font-medium mb-2">Chi tiết lỗi:</p>
          <ul className="text-sm text-red-600 space-y-1 max-h-40 overflow-y-auto">
            {result.failed.map((f, idx) => <li key={idx}>• Dòng {f.row}: {f.reason}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImportResult;