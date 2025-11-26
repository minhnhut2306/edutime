/* eslint-disable no-unused-vars */

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
  const [authToken, setAuthToken] = useState(null);
  const { logout } = useAuth();

  const { fetchTeachers } = useTeacher();
  const { fetchClasses } = useClasses();
  const { fetchSubjects } = useSubjects();
  const { fetchWeeks } = useWeeks();
  const { fetchTeachingRecords } = useTeachingRecord();
  const { getActiveSchoolYear, fetchSchoolYears } = useSchoolYear();

  const [users, setUsers] = useState([]);
  const [schoolYear, setSchoolYear] = useState(null);
  const [viewingYear, setViewingYear] = useState(null);
  const [activeSchoolYear, setActiveSchoolYear] = useState(null); // ✅ Năm học đang active
  const [archivedYears, setArchivedYears] = useState([]);

  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [teachingRecords, setTeachingRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Xác định chế độ chỉ đọc
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
    } catch (err) {
      // Silent error handling
    }
  };

  const checkSchoolYearSetup = async () => {
    try {
      const result = await getActiveSchoolYear();

      if (result.success && result.schoolYear) {
        setNeedsSchoolYearSetup(false);
        return;
      }

      setNeedsSchoolYearSetup(true);

    } catch (err) {
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
      // ✅ Lấy năm học active
      const activeYearResult = await getActiveSchoolYear();
      if (activeYearResult.success && activeYearResult.schoolYear) {
        setSchoolYear(activeYearResult.schoolYear);
        setActiveSchoolYear(activeYearResult.schoolYear.year); // ✅ Lưu năm học active
        if (!viewingYear) {
          setViewingYear(activeYearResult.schoolYear.year);
        }
      }

      const yearsResult = await fetchSchoolYears();
      if (yearsResult.success) {
        setArchivedYears(yearsResult.schoolYears.map(y => y.year));
      }

      const teachersResult = await fetchTeachers();
      if (teachersResult.success) {
        setTeachers(teachersResult.teachers);
      }

      const classesResult = await fetchClasses();
      if (classesResult.success) {
        setClasses(classesResult.classes);
      }

      const subjectsResult = await fetchSubjects();
      if (subjectsResult.success) {
        setSubjects(subjectsResult.subjects);
      }

      const weeksResult = await fetchWeeks({ schoolYear: viewingYear });
      if (weeksResult.success) {
        setWeeks(weeksResult.weeks);
      }

      const recordsResult = await fetchTeachingRecords({ schoolYear: viewingYear });
      if (recordsResult.success) {
        setTeachingRecords(recordsResult.records);
      }

      if (currentUser?.role === 'admin') {
        const usersData = await StorageService.loadData('edutime_users');
        if (usersData) {
          setUsers(usersData);
        }
      }
    } catch (error) {
      alert('Có lỗi khi tải dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

  const saveAllData = async () => {
    // ✅ Không cho lưu nếu đang xem năm cũ
    if (isReadOnly) {
      alert('⚠️ Không thể lưu dữ liệu năm học cũ!\n\nVui lòng chuyển về năm học hiện tại để lưu.');
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
      alert('✅ Đã lưu dữ liệu thành công!');
    } else {
      alert('❌ Có lỗi khi lưu dữ liệu!');
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
    setActiveSchoolYear(newYear); // ✅ Cập nhật năm học active mới
    setWeeks([]);
    setTeachingRecords([]);
    await loadAllData();

    alert(`✅ Đã kết thúc năm học ${schoolYear.year}!\n\n📚 Bắt đầu năm học mới: ${newYear}`);
  };

  const handleLogin = (user, token) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setAuthToken(token);
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

  const handleSchoolYearCreated = (newSchoolYear) => {
    setSchoolYear(newSchoolYear);
    setViewingYear(newSchoolYear.year);
    setActiveSchoolYear(newSchoolYear.year); // ✅ Set năm học active
    setNeedsSchoolYearSetup(false);
  };

  // ✅ Xử lý khi đổi năm học
  const handleChangeYear = (year) => {
    if (year !== viewingYear) {
      setViewingYear(year);
      // Reload data cho năm học mới
      loadAllData();
    }
  };

  if (showRegister) {
    return (
      <RegisterView
        onBackToLogin={() => setShowRegister(false)}
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <LoginView
        onLogin={handleLogin}
        onShowRegister={() => setShowRegister(true)}
      />
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
        isReadOnly={isReadOnly} // ✅ Truyền vào Header
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
                  onChangeYear={handleChangeYear}
                  isReadOnly={isReadOnly} // ✅ Truyền prop
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
                  isReadOnly={isReadOnly} // ✅ Truyền prop
                />
              )}

              {currentView === 'classes' && isAdmin && (
                <ClassesView
                  classes={classes}
                  setClasses={setClasses}
                  currentUser={currentUser}
                  isReadOnly={isReadOnly} // ✅ Truyền prop
                />
              )}

              {currentView === 'subjects' && isAdmin && (
                <SubjectsView
                  subjects={subjects}
                  setSubjects={setSubjects}
                  currentUser={currentUser}
                  isReadOnly={isReadOnly} // ✅ Truyền prop
                />
              )}

              {currentView === 'weeks' && isAdmin && (
                <WeeksView
                  weeks={weeks}
                  setWeeks={setWeeks}
                  currentUser={currentUser}
                  schoolYear={viewingYear}
                  isReadOnly={isReadOnly} // ✅ Truyền prop
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
                  isReadOnly={isReadOnly} // ✅ Truyền prop
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
                  isReadOnly={isReadOnly} // ✅ Truyền prop (nếu cần)
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