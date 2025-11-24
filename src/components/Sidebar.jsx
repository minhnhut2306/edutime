import React from 'react';
import { Users, BookOpen, FileText, BarChart2 } from 'react-feather';
import { Clock, Edit2, Download, Lock } from 'lucide-react';

const Sidebar = ({ currentView, setCurrentView, currentUser }) => {
  const isAdmin = currentUser.role === 'admin';

  const NavButton = ({ icon, label, view, badge }) => {
    const Icon = icon;
    return (
      <button
        onClick={() => setCurrentView(view)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full ${currentView === view
            ? 'bg-blue-600 text-white shadow-lg'
            : 'text-gray-700 hover:bg-gray-100'
          }`}
      >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
        {badge !== undefined && (
          <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 space-y-2">
      <NavButton icon={BarChart2} label="Tổng quan" view="dashboard" />
      {isAdmin && (
        <>
          <NavButton icon={Users} label="Giáo viên" view="teachers" />
          <NavButton icon={BookOpen} label="Lớp học" view="classes" />
          <NavButton icon={FileText} label="Môn học" view="subjects" />
          <NavButton icon={Clock} label="Tuần học" view="weeks" />  {}
        </>
      )}
      <NavButton icon={Edit2} label="Nhập tiết dạy" view="input" />
      <NavButton icon={Download} label="Báo cáo" view="report" />
      {isAdmin && <NavButton icon={Lock} label="Người dùng" view="users" />}
    </div>
  );
};

export default Sidebar;