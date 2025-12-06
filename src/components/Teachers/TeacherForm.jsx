import React from 'react';
import { X } from 'react-feather';


const SubjectSelector = ({ subjects, selectedSubjectIds = [], onToggle }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Các môn dạy (chọn nhiều môn) <span className="text-red-500">*</span>
    </label>
    <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
      {subjects.map(s => {
        const subjectId = s._id || s.id;
        const isSelected = selectedSubjectIds.includes(subjectId);
        return (
          <button
            key={subjectId}
            type="button"
            onClick={() => onToggle(subjectId)}
            className={`px-3 py-1.5 rounded-lg border-2 transition-all font-medium ${
              isSelected
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            }`}
          >
            {s.name}
          </button>
        );
      })}
    </div>
    <p className="text-xs text-gray-500 mt-1">💡 Click vào môn để chọn/bỏ chọn</p>
  </div>
);


export const AddTeacherModal = ({ isOpen, onClose, teacher, onChange, onSubmit, classes, subjects }) => {
  if (!isOpen) return null;

  const handleSubjectToggle = (subjectId) => {
    const isSelected = teacher.subjectIds.includes(subjectId);
    onChange({
      ...teacher,
      subjectIds: isSelected
        ? teacher.subjectIds.filter(id => id !== subjectId)
        : [...teacher.subjectIds, subjectId]
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Thêm giáo viên mới</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={teacher.name}
                onChange={(e) => onChange({ ...teacher, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập họ và tên giáo viên"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
              <input
                type="text"
                value={teacher.phone}
                onChange={(e) => onChange({ ...teacher, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0123456789 (có thể bỏ trống)"
              />
            </div>

            <div className="col-span-2">
              <SubjectSelector
                subjects={subjects}
                selectedSubjectIds={teacher.subjectIds}
                onToggle={handleSubjectToggle}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Lớp chủ nhiệm</label>
              <select
                value={teacher.mainClassId}
                onChange={(e) => onChange({ ...teacher, mainClassId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Không chủ nhiệm lớp nào --</option>
                {classes.map(c => (
                  <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Thêm giáo viên
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export const EditTeacherForm = ({ teacher, onChange, onSave, onCancel, classes, subjects }) => {
  if (!teacher) return null;

  const handleSubjectToggle = (subjectId) => {
    const currentSubjects = teacher.subjectIds || [];
    const isSelected = currentSubjects.includes(subjectId);
    onChange({
      ...teacher,
      subjectIds: isSelected
        ? currentSubjects.filter(id => id !== subjectId)
        : [...currentSubjects, subjectId]
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Chỉnh sửa giáo viên</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={teacher.name}
            onChange={(e) => onChange({ ...teacher, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
          <input
            type="text"
            value={teacher.phone}
            onChange={(e) => onChange({ ...teacher, phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Có thể bỏ trống"
          />
        </div>
        <div className="col-span-2">
          <SubjectSelector
            subjects={subjects}
            selectedSubjectIds={teacher.subjectIds || []}
            onToggle={handleSubjectToggle}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Lớp chủ nhiệm</label>
          <select
            value={teacher.mainClassId}
            onChange={(e) => onChange({ ...teacher, mainClassId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Không chủ nhiệm lớp nào --</option>
            {classes.map(c => (
              <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={onSave}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Lưu
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Hủy
        </button>
      </div>
    </div>
  );
};
