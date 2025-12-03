import React, { useMemo } from 'react';
import { normalizeId } from '../../utils/reportUtils';

const ExportParams = ({ exportType, exportParams, setExportParams, weeks = [] }) => {
  // memoized weeks mapping to avoid recreating in render
  const weekOptions = useMemo(() => (weeks || []).map(w => ({ id: normalizeId(w), label: `Tuần ${w.weekNumber} (${new Date(w.startDate).toLocaleDateString('vi-VN')})` })), [weeks]);

  if (exportType === 'bc') {
    return (
      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!exportParams.bcNumber}
            onChange={(e) => setExportParams({ ...exportParams, bcNumber: e.target.checked ? null : (exportParams.bcNumber || 9) })}
          />
          <span className="text-sm">Tự động xác định BC từ dữ liệu</span>
        </label>
        {exportParams.bcNumber && (
          <select
            value={exportParams.bcNumber}
            onChange={(e) => setExportParams({ ...exportParams, bcNumber: parseInt(e.target.value, 10) })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {[9,10,11,12,1,2,3,4,5,6,7,8].map(bc => <option key={bc} value={bc}>BC {bc} (Tháng {bc})</option>)}
          </select>
        )}
        <p className="text-xs text-gray-500">Nếu chọn "Tự động", hệ thống sẽ xuất tất cả BC có dữ liệu (mỗi BC = 1 sheet)</p>
      </div>
    );
  }

  if (exportType === 'week') {
    const multiMode = exportParams.weekIds && exportParams.weekIds.length > 0;
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" checked={!multiMode} onChange={() => setExportParams({ ...exportParams, weekIds: [], weekId: '' })} />
            <span className="text-sm">Một tuần</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={multiMode} onChange={() => setExportParams({ ...exportParams, weekIds: weekOptions.length ? [weekOptions[0].id] : [], weekId: '' })} />
            <span className="text-sm">Nhiều tuần</span>
          </label>
        </div>

        {!multiMode ? (
          <select value={exportParams.weekId || ''} onChange={(e) => setExportParams({ ...exportParams, weekId: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
            <option value="">-- Chọn tuần --</option>
            {weekOptions.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
          </select>
        ) : (
          <div className="border rounded-lg p-2 max-h-44 overflow-y-auto">
            {weekOptions.map(w => (
              <label key={w.id} className="flex items-center gap-2 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportParams.weekIds.includes(w.id)}
                  onChange={(e) => {
                    const next = e.target.checked ? [...exportParams.weekIds, w.id] : exportParams.weekIds.filter(id => id !== w.id);
                    setExportParams({ ...exportParams, weekIds: next });
                  }}
                />
                <span className="text-sm">{w.label}</span>
              </label>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-500">Tuần thuộc tháng nào sẽ tự động xuất BC tháng đó</p>
      </div>
    );
  }

  if (exportType === 'semester') {
    return (
      <div>
        <select value={exportParams.semester} onChange={(e) => setExportParams({ ...exportParams, semester: parseInt(e.target.value, 10) })} className="w-full px-3 py-2 border rounded-lg">
          <option value={1}>Học kỳ 1 (Tuần 1-18)</option>
          <option value={2}>Học kỳ 2 (Tuần 19-35)</option>
        </select>
        <p className="text-xs text-gray-500 mt-2">Xuất tất cả BC trong học kỳ (mỗi tháng = 1 sheet)</p>
      </div>
    );
  }

  if (exportType === 'year') {
    return <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">Xuất tất cả BC trong năm học (mỗi tháng có dữ liệu = 1 sheet)</p>;
  }

  return null;
};

export default ExportParams;