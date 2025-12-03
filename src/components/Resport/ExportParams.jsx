import React from 'react';

export const ExportParams = ({ exportType, exportParams, setExportParams, weeks }) => {
  switch (exportType) {
    case 'bc':
      return (
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!exportParams.bcNumber}
              onChange={(e) => setExportParams({ ...exportParams, bcNumber: e.target.checked ? null : 9 })}
            />
            <span className="text-sm">Tự động xác định BC từ dữ liệu</span>
          </label>
          {exportParams.bcNumber && (
            <select
              value={exportParams.bcNumber}
              onChange={(e) => setExportParams({ ...exportParams, bcNumber: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {[9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8].map(bc => (
                <option key={bc} value={bc}>BC {bc} (Tháng {bc})</option>
              ))}
            </select>
          )}
          <p className="text-xs text-gray-500">
            Nếu chọn "Tự động", hệ thống sẽ xuất tất cả BC có dữ liệu (mỗi BC = 1 sheet)
          </p>
        </div>
      );

    case 'week':
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={exportParams.weekIds.length === 0}
                onChange={() => setExportParams({ ...exportParams, weekIds: [] })}
              />
              <span className="text-sm">Một tuần</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={exportParams.weekIds.length > 0}
                onChange={() => setExportParams({ ...exportParams, weekIds: [weeks[0]?.id || weeks[0]?._id].filter(Boolean) })}
              />
              <span className="text-sm">Nhiều tuần</span>
            </label>
          </div>

          {exportParams.weekIds.length === 0 ? (
            <select
              value={exportParams.weekId}
              onChange={(e) => setExportParams({ ...exportParams, weekId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">-- Chọn tuần --</option>
              {weeks.map(w => (
                <option key={w.id || w._id} value={w.id || w._id}>
                  Tuần {w.weekNumber} ({new Date(w.startDate).toLocaleDateString('vi-VN')})
                </option>
              ))}
            </select>
          ) : (
            <div className="border rounded-lg p-2 max-h-40 overflow-y-auto">
              {weeks.map(w => {
                const wId = w.id || w._id;
                return (
                  <label key={wId} className="flex items-center gap-2 py-1 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportParams.weekIds.includes(wId)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setExportParams({ ...exportParams, weekIds: [...exportParams.weekIds, wId] });
                        } else {
                          setExportParams({ ...exportParams, weekIds: exportParams.weekIds.filter(id => id !== wId) });
                        }
                      }}
                    />
                    <span className="text-sm">Tuần {w.weekNumber}</span>
                  </label>
                );
              })}
            </div>
          )}
          <p className="text-xs text-gray-500">
            Tuần thuộc tháng nào sẽ tự động xuất BC tháng đó
          </p>
        </div>
      );

    case 'semester':
      return (
        <div>
          <select
            value={exportParams.semester}
            onChange={(e) => setExportParams({ ...exportParams, semester: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value={1}>Học kỳ 1 (Tuần 1-18)</option>
            <option value={2}>Học kỳ 2 (Tuần 19-35)</option>
          </select>
          <p className="text-xs text-gray-500 mt-2">
            Xuất tất cả BC trong học kỳ (mỗi tháng = 1 sheet)
          </p>
        </div>
      );

    case 'year':
      return (
        <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
          Xuất tất cả BC trong năm học (mỗi tháng có dữ liệu = 1 sheet)
        </p>
      );

    default:
      return null;
  }
};