import React from 'react';

export const StatCards = ({ totalPeriods, recordsCount, teacherName }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <p className="text-blue-100 text-sm">Tổng số tiết</p>
        <p className="text-3xl font-bold mt-1">{totalPeriods}</p>
      </div>
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
        <p className="text-green-100 text-sm">Số bản ghi</p>
        <p className="text-3xl font-bold mt-1">{recordsCount}</p>
      </div>
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <p className="text-purple-100 text-sm">Giáo viên</p>
        <p className="text-xl font-bold mt-1">{teacherName || '-'}</p>
      </div>
    </div>
  );
};