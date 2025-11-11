import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import DashboardView from '../components/DashboardView';
import TeachersView from '../components/TeachersView';
import ClassesView from '../components/ClassesView';
import StorageService from '../service/StorageService';
import SubjectsView from '../components/SubjectsView';
import TeachingInputView from '../components/TeachingInputView';
import UserManagementView from '../components/UserManagementView';
import LoginView from '../components/LoginView';
import ReportView from '../components/ReportView';
import WeeksView from '../components/WeeksView';
import TeacherDashboardView from '../components/TeacherDashboardView';


// ==================== MAIN APP ====================
const EduTime = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');

  const [users, setUsers] = useState([
    { username: 'admin', password: 'admin123', name: 'Quản trị viên', email: 'admin@school.edu.vn', role: 'admin', status: 'approved' },
    { username: 'gv001', password: 'gv123', name: 'Trần Lương Quốc Thạnh', email: 'nva@school.edu.vn', role: 'teacher', status: 'approved', allowedGrades: [] }
  ]);

  const [schoolYear, setSchoolYear] = useState('2024-2025');
  const [viewingYear, setViewingYear] = useState('2024-2025');
  const [archivedYears, setArchivedYears] = useState([]);

  const [teachers, setTeachers] = useState([
    { id: 'GV001', name: 'Nguyễn Văn A', email: 'nva@school.edu.vn', phone: '0901234567', subjectIds: ['MH001'], mainClassId: 'L001', userId: 'gv001' }
  ]);
  const [classes, setClasses] = useState([
    { id: 'L001', name: '10A1', grade: '10', studentCount: 35 },
    { id: 'L002', name: '10A2', grade: '10', studentCount: 34 },
    { id: 'L003', name: '11A1', grade: '11', studentCount: 36 }
  ]);
  const [subjects, setSubjects] = useState([
    { id: 'MH001', name: 'Toán' },
    { id: 'MH002', name: 'Văn' },
    { id: 'MH003', name: 'Anh' }
  ]);
  const [weeks, setWeeks] = useState([]);
  const [teachingRecords, setTeachingRecords] = useState([]);

  useEffect(() => {
    loadAllData();
  }, [viewingYear]);

  const loadAllData = async () => {
    const key = `edutime_year_${viewingYear}`;
    const data = await StorageService.loadData(key);

    if (data) {
      setTeachers(data.teachers || []);
      setClasses(data.classes || []);
      setSubjects(data.subjects || []);
      setWeeks(data.weeks || []);
      setTeachingRecords(data.teachingRecords || []);
    }

    const usersData = await StorageService.loadData('edutime_users');
    if (usersData) {
      setUsers(usersData);
    }

    // Load danh sách năm học (CÁCH MỚI)
    const years = await StorageService.getSchoolYearsList();
    if (years.length === 0) {
      // Nếu chưa có năm nào, thêm năm hiện tại
      await StorageService.addSchoolYear(viewingYear);
      setArchivedYears([viewingYear]);
    } else {
      setArchivedYears(years);
    }
  };

  const saveAllData = async () => {
    const key = `edutime_year_${viewingYear}`;
    const success = await StorageService.saveData(key, {
      teachers,
      classes,
      subjects,
      weeks,
      teachingRecords
    });

    await StorageService.saveData('edutime_users', users);

    if (success) {
      alert('Đã lưu dữ liệu thành công!');
    } else {
      alert('Có lỗi khi lưu dữ liệu!');
    }
  };

  const handleFinishYear = async () => {
    if (!confirm(`Xác nhận kết thúc năm học ${schoolYear}?\n\nDữ liệu sẽ được lưu trữ và bạn có thể bắt đầu năm học mới.`)) {
      return;
    }

    // Lưu dữ liệu năm hiện tại
    await saveAllData();

    // Tạo năm học mới
    const currentYear = parseInt(schoolYear.split('-')[0]);
    const newYear = `${currentYear + 1}-${currentYear + 2}`;

    // Thêm năm mới vào danh sách
    await StorageService.addSchoolYear(newYear);

    setSchoolYear(newYear);
    setViewingYear(newYear);

    // Reset dữ liệu cho năm mới
    setWeeks([]);
    setTeachingRecords([]);

    // Reload để cập nhật dropdown
    await loadAllData();

    alert(`Đã kết thúc năm học ${schoolYear}!\nBắt đầu năm học mới: ${newYear}`);
  };

  const handleLogin = (username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      if (user.status === 'pending') {
        alert('Tài khoản của bạn đang chờ duyệt. Vui lòng liên hệ Admin!');
        return;
      }
      if (user.status === 'rejected') {
        alert('Tài khoản của bạn đã bị từ chối. Vui lòng liên hệ Admin!');
        return;
      }
      setCurrentUser(user);
      setIsLoggedIn(true);
    } else {
      alert('Sai tên đăng nhập hoặc mật khẩu!');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  if (!isLoggedIn) {
    return <LoginView onLogin={handleLogin} />;
  }

  const isAdmin = currentUser.role === 'admin';
  const teacher = teachers.find(t => t.userId === currentUser.username);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onSave={saveAllData}
        schoolYear={viewingYear}
        archivedYears={archivedYears}
        onChangeYear={setViewingYear}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <Sidebar
              currentView={currentView}
              setCurrentView={setCurrentView}
              currentUser={currentUser}
            />
          </div>

          <div className="col-span-9">
            <div className="bg-white rounded-xl shadow-lg p-6">
              {currentView === 'dashboard' && isAdmin && (
                <DashboardView
                  teachers={teachers}
                  classes={classes}
                  subjects={subjects}
                  teachingRecords={teachingRecords}
                  users={users}
                  schoolYear={schoolYear}
                  setSchoolYear={setSchoolYear}
                  currentUser={currentUser}
                  onFinishYear={handleFinishYear}
                  archivedYears={archivedYears}
                  onChangeYear={setViewingYear}
                />
              )}

              {currentView === 'dashboard' && !isAdmin && (
                <TeacherDashboardView
                  teacher={teacher}
                  teachingRecords={teachingRecords}
                  classes={classes}
                  subjects={subjects}
                />
              )}

              {currentView === 'teachers' && isAdmin && (
                <TeachersView
                  teachers={teachers}
                  setTeachers={setTeachers}
                  classes={classes}
                  subjects={subjects}
                  currentUser={currentUser}
                />
              )}

              {currentView === 'classes' && isAdmin && (
                <ClassesView
                  classes={classes}
                  setClasses={setClasses}
                  currentUser={currentUser}
                />
              )}

              {currentView === 'subjects' && isAdmin && (
                <SubjectsView
                  subjects={subjects}
                  setSubjects={setSubjects}
                  currentUser={currentUser}
                />
              )}

              {currentView === 'weeks' && isAdmin && (
                <WeeksView
                  weeks={weeks}
                  setWeeks={setWeeks}
                  currentUser={currentUser}
                />
              )}

              {currentView === 'input' && (
                <TeachingInputView
                  teachers={teachers}
                  classes={classes}
                  subjects={subjects}
                  weeks={weeks}
                  teachingRecords={teachingRecords}
                  setTeachingRecords={setTeachingRecords}
                  schoolYear={viewingYear}
                  currentUser={currentUser}
                  users={users}
                />
              )}

              {currentView === 'report' && (
                <ReportView
                  teachers={teachers}
                  classes={classes}
                  subjects={subjects}
                  teachingRecords={teachingRecords}
                  weeks={weeks}
                  schoolYear={viewingYear}
                  currentUser={currentUser}
                />
              )}

              {currentView === 'users' && isAdmin && (
                <UserManagementView
                  users={users}
                  setUsers={setUsers}
                  teachers={teachers}
                  classes={classes}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EduTime;