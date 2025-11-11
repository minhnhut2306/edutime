
import React from 'react';
import { Calendar, Save } from 'lucide-react';


const Header = ({ onSave }) => (
  <header className="bg-white shadow-lg border-b">
    <div className="max-w-7xl mx-auto px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Calendar className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">EduTime</h1>
            <p className="text-sm text-gray-500">Hệ thống Quản lý Giờ Dạy</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onSave}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Save size={20} />
            Lưu dữ liệu
          </button>
        </div>
      </div>
    </div>
  </header>
);
export default Header;