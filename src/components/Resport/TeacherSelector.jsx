import React from 'react';

export const TeacherSelector = ({ 
  exportMode, 
  selectedTeacherId, 
  setSelectedTeacherId, 
  selectedTeacherIds, 
  toggleTeacherSelection, 
  selectAllTeachers, 
  deselectAllTeachers, 
  teachers 
}) => {
  if (exportMode === 'single') {
    return (
      <select
        value={selectedTeacherId}
        onChange={(e) => setSelectedTeacherId(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      >
        <option value="">-- Chọn giáo viên --</option>
        {teachers.map(t => (
          <option key={t.id || t._id} value={t.id || t._id}>{t.name}</option>
        ))}
      </select>
    );
  }

  return (
    <div className="border rounded-lg max-h-48 overflow-y-auto">
      <div className="sticky top-0 bg-gray-50 p-2 border-b flex gap-2">
        <button onClick={selectAllTeachers} className="text-xs text-blue-600 hover:underline">Chọn tất cả</button>
        <button onClick={deselectAllTeachers} className="text-xs text-red-600 hover:underline">Bỏ chọn</button>
        <span className="text-xs text-gray-500 ml-auto">{selectedTeacherIds.length}/{teachers.length}</span>
      </div>
      {teachers.map(t => {
        const tId = t.id || t._id;
        return (
          <label key={tId} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer">
            <input 
              type="checkbox" 
              checked={selectedTeacherIds.includes(tId)} 
              onChange={() => toggleTeacherSelection(tId)} 
            />
            <span className="text-sm">{t.name}</span>
          </label>
        );
      })}
    </div>
  );
};