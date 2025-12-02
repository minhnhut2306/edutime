
import React from 'react';
import { Calendar, LogOut, Save } from 'react-feather';

const Header = ({ currentUser, onLogout, schoolYear, archivedYears, onChangeYear }) => (
  <header className="bg-white shadow-lg border-b">
    <div className="max-w-7xl mx-auto px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Calendar className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">EduTime</h1>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">Năm học:</p>
              {currentUser.role === 'admin' && archivedYears && archivedYears.length > 1 ? (
                <select
                  value={schoolYear}
                  onChange={(e) => onChangeYear(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                >
                  {archivedYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              ) : (
                <p className="text-sm font-medium text-blue-600">{schoolYear}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
            <p className="text-xs text-gray-500">{currentUser.role === 'admin' ? 'Quản trị viên' : 'Giáo viên'}</p>
          </div>
        
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <LogOut size={20} />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  </header>
);

export default Header;