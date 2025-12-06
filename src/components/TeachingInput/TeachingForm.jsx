import React from "react";
import { Check, X, Eye } from "react-feather";
import { recordTypeLabels } from "./../../utils/teachingUtils";

const TeachingForm = ({
  isAdmin,
  isEditing,
  isReadOnly,
  teachers,
  weeks,
  subjects,
  availableClasses,
  allowedGrades,
  formTeacherId,
  setFormTeacherId,
  selectedWeekId,
  setSelectedWeekId,
  selectedClassId,
  setSelectedClassId,
  selectedSubjectId,
  setSelectedSubjectId,
  periods,
  setPeriods,
  recordType,
  setRecordType,
  notes,
  setNotes,
  onAddOrSave,
  onCancel,
  hasGradeRestriction,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">{isEditing ? "Sửa bản ghi" : "Thêm bản ghi mới"}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isAdmin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giáo viên</label>
            <select
              value={formTeacherId}
              onChange={(e) => setFormTeacherId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn giáo viên --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tuần học</label>
          <select
            value={selectedWeekId}
            onChange={(e) => setSelectedWeekId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Chọn tuần --</option>
            {weeks.map((w) => (
              <option key={w.id} value={w.id}>
                Tuần {w.weekNumber} ({new Date(w.startDate).toLocaleDateString("vi-VN")} -{" "}
                {new Date(w.endDate).toLocaleDateString("vi-VN")})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Loại tiết dạy</label>
          <select
            value={recordType}
            onChange={(e) => setRecordType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(recordTypeLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lớp {hasGradeRestriction && <span className="text-blue-600">(Khối: {allowedGrades.join(", ")})</span>}
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Chọn lớp --</option>
            {availableClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (Khối {c.grade})
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">Môn học</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {subjects.length === 0 && <div className="text-sm text-gray-500">Không có môn</div>}
            {subjects.map((s) => {
              const isSelected = s.id === selectedSubjectId;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubjectId(s.id)}
                  className={`px-3 py-2 border rounded-lg text-left transition-colors ${isSelected ? "bg-blue-50 border-blue-400" : "bg-white border-gray-200"
                    }`}
                >
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-gray-400">{s.code || ""}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Số tiết</label>
          <input
            type="number"
            min="1"
            value={periods}
            onChange={(e) => setPeriods(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú (tùy chọn)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="VD: Dạy thay, thi giữa kỳ..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-end space-x-2">
          <button
            onClick={onAddOrSave}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            title={isEditing ? "Lưu thay đổi" : "Thêm bản ghi"}
            disabled={isReadOnly}
          >
            <Check size={16} />
            <span className="text-sm">{isEditing ? "Lưu" : "Thêm"}</span>
          </button>
          {isEditing && (
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              <X size={16} />
              <span className="text-sm">Hủy</span>
            </button>
          )}
          {isReadOnly && (
            <span className="flex items-center gap-2 text-sm font-normal text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
              <Eye size={16} />
              Chế độ xem
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeachingForm;
