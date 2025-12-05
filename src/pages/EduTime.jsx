/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import DashboardView from '../components/DashboardView';
import TeachersView from '../components/Teachers/TeachersView';
import ClassesView from '../components/Classes/ClassesView';
import StorageService from '../service/StorageService';
import SubjectsView from '../components/Subject/SubjectsView';
import TeachingInputView from '../components/TeachingInput/TeachingInputView';
import UserManagementView from '../components/UserManagementView';
import LoginView from '../components/LoginView';
import RegisterView from '../components/RegisterView';
import ForgotPasswordView from '../components/ForgotPasswordView';
import ChangePasswordView from '../components/ChangePasswordView';
import SelectTeacherView from '../components/SelectTeacherView';
import SchoolYearSetupView from '../components/SchoolYearSetupView';
import ReportView from '../components/Resport/ReportView';
import WeeksView from '../components/Week/WeeksView';
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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [needsTeacherSelection, setNeedsTeacherSelection] = useState(false);
  const [needsSchoolYearSetup, setNeedsSchoolYearSetup] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const { logout } = useAuth();
  const { finishSchoolYear } = useSchoolYear();
  const { fetchTeachers } = useTeacher();
  const { fetchClasses } = useClasses();
  const { fetchSubjects } = useSubjects();
  const { fetchWeeks } = useWeeks();
  const { fetchTeachingRecords } = useTeachingRecord();
  const { getActiveSchoolYear, fetchSchoolYears } = useSchoolYear();

  const [users, setUsers] = useState([]);
  const [schoolYear, setSchoolYear] = useState(null);
  const [viewingYear, setViewingYear] = useState(null);
  const [activeSchoolYear, setActiveSchoolYear] = useState(null);
  const [archivedYears, setArchivedYears] = useState([]);
  const [activeSchoolYearId, setActiveSchoolYearId] = useState(null);

  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [teachingRecords, setTeachingRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const isReadOnly = viewingYear !== activeSchoolYear;

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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && currentUser && currentUser.role !== 'admin') {
      checkTeacherSelection();
    }
  }, [isLoggedIn, currentUser]);

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
    } catch (err) { /* empty */ }
  };

  const checkSchoolYearSetup = async () => {
    try {
      const result = await getActiveSchoolYear();

      if (result.success && result.schoolYear) {
        setNeedsSchoolYearSetup(false);
        const sy = result.schoolYear;
        const label = sy.year || sy.label || String(sy);
        setActiveSchoolYear(label);
        setActiveSchoolYearId(sy._id || sy.id || null);
        setSchoolYear(sy);
        return;
      }

      setNeedsSchoolYearSetup(true);

    } catch (err) {
      console.error("[checkSchoolYearSetup] error:", err);
      setNeedsSchoolYearSetup(true);
    }
  };

  useEffect(() => {
    if (isLoggedIn && !needsTeacherSelection && !needsSchoolYearSetup) {
      loadAllData();
    }
  }, [isLoggedIn, viewingYear, needsTeacherSelection, needsSchoolYearSetup]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Lấy năm học hiện tại trước (cần để có viewingYear)
      const activeYearResult = await getActiveSchoolYear();
      let yearToUse = viewingYear;
      
      if (activeYearResult.success && activeYearResult.schoolYear) {
        const sy = activeYearResult.schoolYear;
        const label = sy.year || sy.label || String(sy);
        setSchoolYear(sy);
        setActiveSchoolYear(label);
        setActiveSchoolYearId(sy._id || sy.id || null);
        if (!viewingYear) {
          setViewingYear(label);
          yearToUse = label;
        }
      }

      // Chạy song song tất cả các API call không phụ thuộc nhau để tăng tốc độ
      const [
        yearsResult,
        teachersResult,
        classesResult,
        subjectsResult,
        weeksResult,
        recordsResult,
        usersData
      ] = await Promise.allSettled([
        fetchSchoolYears(),
        fetchTeachers(yearToUse),
        fetchClasses(yearToUse),
        fetchSubjects(yearToUse),
        fetchWeeks(yearToUse),
        fetchTeachingRecords(undefined, yearToUse),
        currentUser?.role === 'admin' ? StorageService.loadData('edutime_users') : Promise.resolve(null)
      ]);

      // Xử lý kết quả từng API call
      if (yearsResult.status === 'fulfilled' && yearsResult.value?.success) {
        setArchivedYears(yearsResult.value.schoolYears.map(y => y.year));
      }

      if (teachersResult.status === 'fulfilled' && teachersResult.value?.success) {
        setTeachers(teachersResult.value.teachers);
      }

      if (classesResult.status === 'fulfilled' && classesResult.value?.success) {
        setClasses(classesResult.value.classes);
      }

      if (subjectsResult.status === 'fulfilled' && subjectsResult.value?.success) {
        setSubjects(subjectsResult.value.subjects);
      }

      if (weeksResult.status === 'fulfilled' && weeksResult.value?.success) {
        setWeeks(weeksResult.value.weeks);
      }

      if (recordsResult.status === 'fulfilled' && recordsResult.value?.success) {
        setTeachingRecords(recordsResult.value.teachingRecords || []);
      }

      if (usersData.status === 'fulfilled' && usersData.value && currentUser?.role === 'admin') {
        setUsers(usersData.value);
      }

      // Log lỗi nếu có (không làm gián đoạn quá trình tải)
      [
        yearsResult,
        teachersResult,
        classesResult,
        subjectsResult,
        weeksResult,
        recordsResult,
        usersData
      ].forEach((result, index) => {
        if (result.status === 'rejected') {
          const apiNames = ['fetchSchoolYears', 'fetchTeachers', 'fetchClasses', 'fetchSubjects', 'fetchWeeks', 'fetchTeachingRecords', 'loadUsers'];
          console.error(`Error loading ${apiNames[index]}:`, result.reason);
        }
      });
    } catch (error) {
      console.error('loadAllData error:', error);
      alert('Có lỗi khi tải dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

  const saveAllData = async () => {
    if (isReadOnly) {
      alert('Không thể lưu dữ liệu năm học cũ!\n\nVui lòng chuyển về năm học hiện tại để lưu.');
      return;
    }

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
    const currentYearLabel = schoolYear?.year;
    if (!confirm(`Xác nhận kết thúc năm học ${currentYearLabel}?\n\nDữ liệu sẽ được lưu trữ và bạn có thể bắt đầu năm học mới.`)) {
      return;
    }

    setLoading(true);
    try {
      const result = await finishSchoolYear();

      if (!result.success) {
        throw new Error(result.message || 'Không thể kết thúc năm học');
      }

      const newYearLabel = result.data.newYear;
      const newYearId = result.data.newSchoolYearId;

      setSchoolYear({ year: newYearLabel, _id: newYearId, isActive: true });
      setViewingYear(newYearLabel);
      setActiveSchoolYear(newYearLabel);
      setActiveSchoolYearId(newYearId);

      setTeachers([]);
      setClasses([]);
      setSubjects([]);
      setWeeks([]);
      setTeachingRecords([]);

      await loadAllData();

      alert(`Đã kết thúc năm học ${currentYearLabel}!\n\nBắt đầu năm học mới: ${newYearLabel}`);
    } catch (error) {
      console.error('Lỗi kết thúc năm học:', error);
      alert(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (user, token) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setAuthToken(token);
    setShowRegister(false);
    setShowForgotPassword(false);
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
      setShowChangePassword(false);

      setTeachers([]);
      setClasses([]);
      setSubjects([]);
      setWeeks([]);
      setTeachingRecords([]);
      setUsers([]);

      alert(result.message || 'Đã đăng xuất thành công');
    } catch (err) {
      setCurrentUser(null);
      setIsLoggedIn(false);
      setAuthToken(null);
      setCurrentView('dashboard');
    }
  };

  const filteredTeachingRecords = teachingRecords.filter(record => {
    if (!record.schoolYear) return true;
    return record.schoolYear === viewingYear;
  });

  const handleSchoolYearCreated = (newSchoolYear) => {
    setSchoolYear(newSchoolYear);
    setViewingYear(newSchoolYear.year);
    setActiveSchoolYear(newSchoolYear.year);
    setActiveSchoolYearId(newSchoolYear._id || newSchoolYear.id || null);
    setNeedsSchoolYearSetup(false);
  };

  const handleChangeYear = (year) => {
    if (year !== viewingYear) {
      setViewingYear(year);
      loadAllData();
    }
  };

  // Hiển thị màn hình Quên mật khẩu
  if (showForgotPassword) {
    return (
      <ForgotPasswordView
        onBackToLogin={() => setShowForgotPassword(false)}
      />
    );
  }

  // Hiển thị màn hình Đăng ký
  if (showRegister) {
    return (
      <RegisterView
        onBackToLogin={() => setShowRegister(false)}
      />
    );
  }

  // Hiển thị màn hình Đăng nhập
  if (!isLoggedIn) {
    return (
      <LoginView
        onLogin={handleLogin}
        onShowRegister={() => setShowRegister(true)}
        onShowForgotPassword={() => setShowForgotPassword(true)}
      />
    );
  }

  // Hiển thị modal Đổi mật khẩu (khi đã đăng nhập)
  if (showChangePassword) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Header
            currentUser={currentUser}
            onLogout={handleLogout}
            onSave={saveAllData}
            schoolYear={viewingYear}
            archivedYears={archivedYears}
            onChangeYear={handleChangeYear}
            onShowChangePassword={() => setShowChangePassword(true)}
            isReadOnly={isReadOnly}
          />
          <ChangePasswordView
            onClose={() => setShowChangePassword(false)}
            onSuccess={() => {
              setShowChangePassword(false);
              alert('Đã đổi mật khẩu thành công!');
            }}
          />
        </div>
      </>
    );
  }

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
        onChangeYear={handleChangeYear}
        onShowChangePassword={() => setShowChangePassword(true)}
        isReadOnly={isReadOnly}
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
                  teachingRecords={filteredTeachingRecords}
                  users={users}
                  schoolYear={viewingYear}
                  activeSchoolYear={activeSchoolYear}
                  setSchoolYear={(year) => setSchoolYear({ year, isActive: true })}
                  currentUser={currentUser}
                  onFinishYear={handleFinishYear}
                  archivedYears={archivedYears}
                  onChangeYear={handleChangeYear}
                  isReadOnly={isReadOnly}
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

              {currentView === 'classes' && isAdmin && (
                <ClassesView
                  classes={classes}
                  setClasses={setClasses}
                  currentUser={currentUser}
                  isReadOnly={isReadOnly}
                  schoolYear={viewingYear}
                />
              )}

              {currentView === 'subjects' && isAdmin && (
                <SubjectsView
                  subjects={subjects}
                  setSubjects={setSubjects}
                  currentUser={currentUser}
                  isReadOnly={isReadOnly}
                  schoolYear={viewingYear}
                />
              )}

              {currentView === 'weeks' && isAdmin && (
                <WeeksView
                  weeks={weeks}
                  setWeeks={setWeeks}
                  currentUser={currentUser}
                  schoolYear={viewingYear}
                  isReadOnly={isReadOnly}
                />
              )}
              {currentView === 'teachers' && isAdmin && (
                <TeachersView
                  teachers={teachers}
                  setTeachers={setTeachers}
                  classes={classes}
                  subjects={subjects}
                  currentUser={currentUser}
                  isReadOnly={isReadOnly}
                  schoolYear={viewingYear}
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
                  isReadOnly={isReadOnly}
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
                  propSchoolYearId={activeSchoolYearId}
                  activeSchoolYear={activeSchoolYear}
                  currentUser={currentUser}
                  isReadOnly={isReadOnly}
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