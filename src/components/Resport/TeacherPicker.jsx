import React, { useMemo } from 'react';
import { normalizeId } from '../../utils/reportUtils';

const TeacherPicker = ({
  isAdmin,
  exportMode,
  availableTeachers,
  selectedTeacherId,
  setSelectedTeacherId,
  selectedTeacherIds,
  toggleTeacherSelection,
  selectAllTeachers,
  deselectAllTeachers
}) => {
  const normalizedTeachers = useMemo(() => (availableTeachers || []).map(t => ({ id: normalizeId(t), name: t.name })), [availableTeachers]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Giáo viên</label>
      {exportMode === 'single' ? (
        <select value={selectedTeacherId || ''} onChange={(e) => setSelectedTeacherId(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
          <option value="">-- Chọn giáo viên --</option>
          {normalizedTeachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      ) : (
        <div className="border rounded-lg max-h-48 overflow-y-auto">
          <div className="sticky top-0 bg-gray-50 p-2 border-b flex gap-2">
            <button onClick={selectAllTeachers} className="text-xs text-blue-600 hover:underline">Chọn tất cả</button>
            <button onClick={deselectAllTeachers} className="text-xs text-red-600 hover:underline">Bỏ chọn</button>
            <span className="text-xs text-gray-500 ml-auto">{selectedTeacherIds.length}/{normalizedTeachers.length}</span>
          </div>
          {normalizedTeachers.map(t => (
            <label key={t.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" checked={selectedTeacherIds.includes(t.id)} onChange={() => toggleTeacherSelection(t.id)} />
              <span className="text-sm">{t.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherPicker;