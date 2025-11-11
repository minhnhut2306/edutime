import React from 'react';
import { Users, BookOpen, FileSpreadsheet, Calendar } from 'lucide-react';

const DashboardView = ({ 
  teachers, 
  classes, 
  subjects, 
  selectedWeek,
  setSelectedWeek,
  selectedSemester,
  setSelectedSemester,
  schoolYear,
  setSchoolYear
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Giáo viên</p>
            <p className="text-3xl font-bold mt-1">{teachers.length}</p>
          </div>
          <Users size={40} className="opacity-80" />
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">Lớp học</p>
            <p className="text-3xl font-bold mt-1">{classes.length}</p>
          </div>
          <BookOpen size={40} className="opacity-80" />
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm">Môn học</p>
            <p className="text-3xl font-bold mt-1">{subjects.length}</p>
          </div>
          <FileSpreadsheet size={40} className="opacity-80" />
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm">Tuần hiện tại</p>
            <p className="text-3xl font-bold mt-1">{selectedWeek}/35</p>
          </div>
          <Calendar size={40} className="opacity-80" />
        </div>
      </div>
    </div>

    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-4">Thông tin năm học</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Năm học</label>
          <input
            type="text"
            value={schoolYear}
            onChange={(e) => setSchoolYear(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Học kỳ</label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="HK1">Học kỳ 1</option>
            <option value="HK2">Học kỳ 2</option>
            <option value="FULL">Cả năm</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tuần</label>
          <input
            type="number"
            min="1"
            max="35"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  </div>
);

export default DashboardView;