import React, { useState } from 'react';
import { Calendar, LogOut, Key, ChevronDown } from 'lucide-react';

const Header = ({ currentUser, onLogout, schoolYear, archivedYears, onChangeYear, onShowChangePassword }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
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
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{currentUser.name || currentUser.email}</p>
                  <p className="text-xs text-gray-500">
                    {currentUser.role === 'admin' ? 'Quản trị viên' : 'Giáo viên'}
                  </p>
                </div>
                <ChevronDown size={20} className="text-gray-500" />
              </button>

              {showDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowDropdown(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        onShowChangePassword();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <Key size={18} className="text-green-600" />
                      <span>Đổi mật khẩu</span>
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                    >
                      <LogOut size={18} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;