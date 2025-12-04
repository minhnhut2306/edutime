import React from "react";

const FiltersBar = ({
  groupBy,
  setGroupBy,
  quickFilterMode,
  setQuickFilterMode,
  teachers = [],
  weeks = [],
  availableClasses = [],
  subjects = [],
  selectedTeacherId = "",
  setSelectedTeacherId,
  selectedWeekId = "",
  setSelectedWeekId,
  selectedClassId = "",
  setSelectedClassId,
  selectedSubjectId = "",
  setSelectedSubjectId,
  recordType = "teaching",
  setRecordType,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      <div className="flex items-center gap-3 w-full md:w-auto">
        <label className="text-sm font-medium text-gray-700">Lọc theo</label>
        <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="px-3 py-2 border rounded-lg">
          <option value="none">Không nhóm (Danh sách)</option>
          <option value="teacher">Theo giáo viên</option>
          <option value="week">Theo tuần</option>
          <option value="class">Theo lớp</option>
          <option value="recordType">Theo loại tiết</option>
          <option value="subject">Theo môn học</option>
        </select>

        <label className="text-sm font-medium text-gray-700">Bộ lọc nhanh:</label>
        <select
          value={quickFilterMode}
          onChange={(e) => {
            setQuickFilterMode(e.target.value);
            if (e.target.value !== "teacher" && setSelectedTeacherId) setSelectedTeacherId("");
            if (e.target.value !== "week" && setSelectedWeekId) setSelectedWeekId("");
            if (e.target.value !== "class" && setSelectedClassId) setSelectedClassId("");
            if (e.target.value !== "subject" && setSelectedSubjectId) setSelectedSubjectId("");
            if (e.target.value !== "recordType" && setRecordType) setRecordType("teaching");
          }}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="all">Hiển thị tất cả</option>
          <option value="teacher">Lọc theo GV</option>
          <option value="week">Lọc theo Tuần</option>
          <option value="class">Lọc theo Lớp</option>
          <option value="recordType">Lọc theo Loại tiết</option>
          <option value="subject">Lọc theo Môn</option>
        </select>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        {quickFilterMode === "teacher" && (
          <select 
            value={selectedTeacherId} 
            onChange={(e) => setSelectedTeacherId && setSelectedTeacherId(e.target.value)} 
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">-- Chọn giáo viên (Tất cả) --</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        )}

        {quickFilterMode === "week" && (
          <select 
            value={selectedWeekId} 
            onChange={(e) => setSelectedWeekId && setSelectedWeekId(e.target.value)} 
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">-- Chọn tuần (Tất cả) --</option>
            {weeks.map((w) => (
              <option key={w.id} value={w.id}>
                Tuần {w.weekNumber}
              </option>
            ))}
          </select>
        )}

        {quickFilterMode === "class" && (
          <select 
            value={selectedClassId} 
            onChange={(e) => setSelectedClassId && setSelectedClassId(e.target.value)} 
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">-- Chọn lớp (Tất cả) --</option>
            {availableClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (Khối {c.grade})
              </option>
            ))}
          </select>
        )}

        {quickFilterMode === "subject" && (
          <select 
            value={selectedSubjectId} 
            onChange={(e) => setSelectedSubjectId && setSelectedSubjectId(e.target.value)} 
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">-- Chọn môn (Tất cả) --</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}

        {quickFilterMode === "recordType" && (
          <select 
            value={recordType} 
            onChange={(e) => setRecordType && setRecordType(e.target.value)} 
            className="px-3 py-2 border rounded-lg"
          >
            <option value="teaching">Giảng dạy</option>
            <option value="tn-hn1">TN-HN 1</option>
            <option value="tn-hn2">TN-HN 2</option>
            <option value="tn-hn3">TN-HN 3</option>
            <option value="extra">Kiêm nhiệm</option>
            <option value="exam">Coi thi</option>
          </select>
        )}
      </div>
    </div>
  );
};

export default FiltersBar;