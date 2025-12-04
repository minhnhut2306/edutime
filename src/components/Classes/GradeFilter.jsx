import React from 'react';
import { Filter } from 'lucide-react';

const GradeFilter = ({ selectedGrade, onGradeChange, availableGrades = [], loading }) => {
  return (
    <div className="flex items-center gap-2">
      <Filter size={20} className="text-gray-500" />
      <select
        value={selectedGrade}
        onChange={(e) => onGradeChange(e.target.value)}
        disabled={loading}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white"
      >
        <option value="">Tất cả khối</option>
        {availableGrades.map((grade) => (
          <option key={grade} value={grade}>
            Khối {grade}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GradeFilter;