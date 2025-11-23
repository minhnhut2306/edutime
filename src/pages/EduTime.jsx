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
import RegisterView from '../components/RegisterView';
import SelectTeacherView from '../components/SelectTeacherView';
import SchoolYearSetupView from '../components/SchoolYearSetupView';
import ReportView from '../components/ReportView';
import WeeksView from '../components/WeeksView';
import TeacherDashboardView from '../components/TeacherDashboardView';
import { useAuth } from '../hooks/useAuth';
import { useTeacher } from '../hooks/useTeacher';
import { useClasses } from '../hooks/useClasses';
import { useSubjects } from '../hooks/useSubjects';
import { useWeeks } from '../hooks/useWeek';
import { useTeachingRecord } from '../hooks/useTeachingRecord';
import { useSchoolYear } from '../hooks/useSchoolYear';

const EduTime = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [showRegister, setShowRegister] = useState(false);
  const [needsTeacherSelection, setNeedsTeacherSelection] = useState(false);
  const [needsSchoolYearSetup, setNeedsSchoolYearSetup] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [authToken, setAuthToken] = useState(null);
  const { logout } = useAuth();

  // Hooks
  const { fetchTeachers } = useTeacher();
  const { fetchClasses } = useClasses();
  const { fetchSubjects } = useSubjects();
  const { fetchWeeks } = useWeeks();
  const { fetchTeachingRecords } = useTeachingRecord();
  const { getActiveSchoolYear, fetchSchoolYears } = useSchoolYear();

  const [users, setUsers] = useState([]);
  const [schoolYear, setSchoolYear] = useState(null);
  const [viewingYear, setViewingYear] = useState(null);
  const [archivedYears, setArchivedYears] = useState([]);

  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [teachingRecords, setTeachingRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // Check login status on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setAuthToken(token);
        setIsLoggedIn(true);
      } catch (err) {
        console.error('Invalid stored user data:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Check if user needs to select teacher (non-admin only)
  useEffect(() => {
    if (isLoggedIn && currentUser && currentUser.role !== 'admin') {
      checkTeacherSelection();
    }
  }, [isLoggedIn, currentUser]);

  // Check if system needs school year setup (CHỈ KHI CHƯA CÓ NĂM HỌC NÀO)
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      checkSchoolYearSetup();
    }
  }, [isLoggedIn, currentUser]);

  const checkTeacherSelection = async () => {
    try {
      const result = await fetchTeachers();
      if (result.success) {
        const userId = currentUser._id || currentUser.id;
        const linkedTeacher = result.teachers.find(t => 
          t.userId && (t.userId._id === userId || t.userId === userId)
        );
        
        if (!linkedTeacher) {
          setNeedsTeacherSelection(true);
        }
      }
    } catch (err) {
      console.error('Error checking teacher selection:', err);
    }
  };

  const checkSchoolYearSetup = async () => {
    try {
      const result = await getActiveSchoolYear();
      
      // NẾU CÓ năm học active → Không cần setup
      if (result.success && result.schoolYear) {
        setNeedsSchoolYearSetup(false);
        return;
      }
      
      // NẾU CHƯA CÓ năm học nào → Kiểm tra role
      // Admin: Cho phép tạo năm học
      // User: Hiển thị thông báo chờ admin
      setNeedsSchoolYearSetup(true);
      
    } catch (err) {
      console.error('Error checking school year:', err);
      // Nếu lỗi (có thể do chưa có năm học) → Set true
      setNeedsSchoolYearSetup(true);
    }
  };

  // Load all data when logged in
  useEffect(() => {
    if (isLoggedIn && !needsTeacherSelection && !needsSchoolYearSetup) {
      loadAllData();
    }
  }, [isLoggedIn, viewingYear, needsTeacherSelection, needsSchoolYearSetup]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Load school year
      const activeYearResult = await getActiveSchoolYear();
      if (activeYearResult.success && activeYearResult.schoolYear) {
        setSchoolYear(activeYearResult.schoolYear);
        if (!viewingYear) {
          setViewingYear(activeYearResult.schoolYear.year);
        }
      }

      // Load archived years
      const yearsResult = await fetchSchoolYears();
      if (yearsResult.success) {
        setArchivedYears(yearsResult.schoolYears.map(y => y.year));
      }

      // Load teachers
      const teachersResult = await fetchTeachers();
      if (teachersResult.success) {
        setTeachers(teachersResult.teachers);
      }

      // Load classes
      const classesResult = await fetchClasses();
      if (classesResult.success) {
        setClasses(classesResult.classes);
      }

      // Load subjects
      const subjectsResult = await fetchSubjects();
      if (subjectsResult.success) {
        setSubjects(subjectsResult.subjects);
      }

      // Load weeks
      const weeksResult = await fetchWeeks({ schoolYear: viewingYear });
      if (weeksResult.success) {
        setWeeks(weeksResult.weeks);
      }

      // Load teaching records
      const recordsResult = await fetchTeachingRecords({ schoolYear: viewingYear });
      if (recordsResult.success) {
        setTeachingRecords(recordsResult.records);
      }

      // Load users (for admin)
      if (currentUser?.role === 'admin') {
        const usersData = await StorageService.loadData('edutime_users');
        if (usersData) {
          setUsers(usersData);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Có lỗi khi tải dữ liệu!');
    } finally {
      setLoading(false);
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
    if (!confirm(`Xác nhận kết thúc năm học ${schoolYear?.year}?\n\nDữ liệu sẽ được lưu trữ và bạn có thể bắt đầu năm học mới.`)) {
      return;
    }
    await saveAllData();
    const currentYear = parseInt(schoolYear.year.split('-')[0]);
    const newYear = `${currentYear + 1}-${currentYear + 2}`;
    await StorageService.addSchoolYear(newYear);

    setSchoolYear({ year: newYear, isActive: true });
    setViewingYear(newYear);
    setWeeks([]);
    setTeachingRecords([]);
    await loadAllData();

    alert(`Đã kết thúc năm học ${schoolYear.year}!\nBắt đầu năm học mới: ${newYear}`);
  };

  const handleLogin = (user, token) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setAuthToken(token);
    console.log('Đăng nhập thành công:', user);
    console.log('Token:', token);
  };

  const handleLogout = async () => {
    try {
      const result = await logout();
      setCurrentUser(null);
      setIsLoggedIn(false);
      setAuthToken(null);
      setCurrentView('dashboard');
      setNeedsTeacherSelection(false);
      setNeedsSchoolYearSetup(false);
      
      // Clear data
      setTeachers([]);
      setClasses([]);
      setSubjects([]);
      setWeeks([]);
      setTeachingRecords([]);
      setUsers([]);
      
      console.log('Đã đăng xuất:', result.message);
      alert(result.message || 'Đã đăng xuất thành công');
    } catch (err) {
      console.error('Error during logout:', err);
      setCurrentUser(null);
      setIsLoggedIn(false);
      setAuthToken(null);
      setCurrentView('dashboard');
    }
  };

  const handleSchoolYearCreated = (newSchoolYear) => {
    setSchoolYear(newSchoolYear);
    setViewingYear(newSchoolYear.year);
    setNeedsSchoolYearSetup(false);
  };

  // Show register view
  if (showRegister) {
    return (
      <RegisterView 
        onBackToLogin={() => setShowRegister(false)}
      />
    );
  }

  // Show login view
  if (!isLoggedIn) {
    return (
      <LoginView 
        onLogin={handleLogin}
        onShowRegister={() => setShowRegister(true)}
      />
    );
  }

  // Show teacher selection for non-admin users without linked teacher
  if (needsTeacherSelection) {
    return (
      <SelectTeacherView
        currentUser={currentUser}
        onTeacherSelected={() => {
          setNeedsTeacherSelection(false);
          window.location.reload();
        }}
      />
    );
  }

  // Show school year setup if no active year exists
  if (needsSchoolYearSetup) {
    return (
      <SchoolYearSetupView
        currentUser={currentUser}
        onSchoolYearCreated={handleSchoolYearCreated}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser.role === 'admin';
  
  // ✅ FIX: Tìm teacher object cho user hiện tại thay vì chỉ check boolean
  const linkedTeacher = !isAdmin ? teachers.find(t => {
    const teacherUserId = t.userId?._id || t.userId;
    const currentUserId = currentUser._id || currentUser.id;
    return teacherUserId === currentUserId;
  }) : null;

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
                  schoolYear={schoolYear?.year}
                  setSchoolYear={(year) => setSchoolYear({ year, isActive: true })}
                  currentUser={currentUser}
                  onFinishYear={handleFinishYear}
                  archivedYears={archivedYears}
                  onChangeYear={setViewingYear}
                />
              )}

              {currentView === 'dashboard' && !isAdmin && (
                <TeacherDashboardView
                  teacher={linkedTeacher}
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
                  schoolYear={schoolYear}
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