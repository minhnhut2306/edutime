import React from 'react';

export const ExportParams = ({ exportType, exportParams, setExportParams, weeks }) => {
  switch (exportType) {
    case 'bc':
      return (
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!exportParams.bcNumbers || exportParams.bcNumbers.length === 0}
              onChange={(e) => setExportParams({ 
                ...exportParams, 
                bcNumbers: e.target.checked ? [] : [9] 
              })}
            />
            <span className="text-sm">Tự động xác định BC từ dữ liệu</span>
          </label>
          
          {(!exportParams.bcNumbers || exportParams.bcNumbers.length === 0) ? (
            <p className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
              Hệ thống sẽ xuất tất cả BC có dữ liệu (mỗi BC = 1 sheet)
            </p>
          ) : (
            <div>
              <p className="text-xs text-gray-600 mb-2">Chọn tháng cần xuất:</p>
              <div className="border rounded-lg p-2 max-h-40 overflow-y-auto grid grid-cols-3 gap-2">
                {[9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8].map(bc => (
                  <label key={bc} className="flex items-center gap-2 py-1 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportParams.bcNumbers?.includes(bc) || false}
                      onChange={(e) => {
                        const currentBCs = exportParams.bcNumbers || [];
                        if (e.target.checked) {
                          setExportParams({ 
                            ...exportParams, 
                            bcNumbers: [...currentBCs, bc].sort((a, b) => {
                              const orderA = a >= 9 ? a - 9 : a + 3;
                              const orderB = b >= 9 ? b - 9 : b + 3;
                              return orderA - orderB;
                            })
                          });
                        } else {
                          setExportParams({ 
                            ...exportParams, 
                            bcNumbers: currentBCs.filter(n => n !== bc) 
                          });
                        }
                      }}
                    />
                    <span className="text-sm">BC {bc}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {exportParams.bcNumbers?.length > 0 
                  ? `Đã chọn ${exportParams.bcNumbers.length} tháng. Tháng không có dữ liệu vẫn được xuất (sheet trống).`
                  : 'Chưa chọn tháng nào'
                }
              </p>
            </div>
          )}
        </div>
      );

    case 'week':
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!exportParams.weekIds || exportParams.weekIds.length === 0}
                onChange={() => setExportParams({ ...exportParams, weekIds: [] })}
              />
              <span className="text-sm">Một tuần</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={exportParams.weekIds && exportParams.weekIds.length > 0}
                onChange={() => setExportParams({ 
                  ...exportParams, 
                  weekIds: [weeks[0]?.id || weeks[0]?._id].filter(Boolean) 
                })}
              />
              <span className="text-sm">Nhiều tuần</span>
            </label>
          </div>

          {(!exportParams.weekIds || exportParams.weekIds.length === 0) ? (
            <div>
              <select
                value={exportParams.weekId || ''}
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
              <p className="text-xs text-gray-500 mt-2">
                Tuần không có dữ liệu vẫn được xuất (sheet trống)
              </p>
            </div>
          ) : (
            <div>
              <div className="border rounded-lg p-2 max-h-40 overflow-y-auto">
                {weeks.map(w => {
                  const wId = w.id || w._id;
                  return (
                    <label key={wId} className="flex items-center gap-2 py-1 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exportParams.weekIds?.includes(wId) || false}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setExportParams({ 
                              ...exportParams, 
                              weekIds: [...(exportParams.weekIds || []), wId] 
                            });
                          } else {
                            setExportParams({ 
                              ...exportParams, 
                              weekIds: (exportParams.weekIds || []).filter(id => id !== wId) 
                            });
                          }
                        }}
                      />
                      <span className="text-sm">Tuần {w.weekNumber}</span>
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {exportParams.weekIds?.length > 0
                  ? `Đã chọn ${exportParams.weekIds.length} tuần. Tuần không có dữ liệu vẫn được xuất (sheet trống).`
                  : 'Chưa chọn tuần nào'
                }
              </p>
            </div>
          )}
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
            Xuất tất cả tuần trong học kỳ (mỗi tháng = 1 sheet). Tuần chưa có dữ liệu vẫn xuất sheet trống.
          </p>
        </div>
      );

    case 'year':
      return (
        <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
          Xuất tất cả tháng trong năm học (mỗi tháng = 1 sheet). 
          <br />
          <span className="text-xs text-gray-500">
            Từ tháng 9 đến tháng 8 năm sau, bao gồm cả tháng không có dữ liệu.
          </span>
        </p>
      );

    default:
      return null;
  }
};