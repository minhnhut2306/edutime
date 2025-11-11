import React from 'react';
import { BarChart3, Users, BookOpen, FileSpreadsheet, Edit2 } from 'lucide-react';
import NavButton from './NavButton';

const Sidebar = ({ currentView, setCurrentView, teachers, classes, subjects }) => (
  <div className="bg-white rounded-xl shadow-lg p-4 space-y-2">
    <NavButton 
      icon={BarChart3} 
      label="Tổng quan" 
      view="dashboard"
      currentView={currentView}
      onClick={() => setCurrentView('dashboard')}
    />
    <NavButton 
      icon={Users} 
      label="Giáo viên" 
      view="teachers"
      currentView={currentView}
      onClick={() => setCurrentView('teachers')}
      badge={teachers.length}
    />
    <NavButton 
      icon={BookOpen} 
      label="Lớp học" 
      view="classes"
      currentView={currentView}
      onClick={() => setCurrentView('classes')}
      badge={classes.length}
    />
    <NavButton 
      icon={FileSpreadsheet} 
      label="Môn học" 
      view="subjects"
      currentView={currentView}
      onClick={() => setCurrentView('subjects')}
      badge={subjects.length}
    />
    <NavButton 
      icon={Edit2} 
      label="Nhập tiết dạy" 
      view="input"
      currentView={currentView}
      onClick={() => setCurrentView('input')}
    />
    <NavButton 
      icon={BarChart3} 
      label="Thống kê" 
      view="statistics"
      currentView={currentView}
      onClick={() => setCurrentView('statistics')}
    />
  </div>
);
export default Sidebar;