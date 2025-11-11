import React, { useState, useEffect } from 'react';
import { BarChart3, Users, BookOpen, FileSpreadsheet, Edit2, Calendar } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import DashboardView from '../components/DashboardView';
import TeachersView from '../components/TeachersView';
import ClassesView from '../components/ClassesView';
import PlaceholderView from '../components/PlaceholderView';
import StorageService from '../service/StorageService';


const EduTime = () => {
    const [currentView, setCurrentView] = useState('dashboard');
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachingData] = useState([]);
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [selectedSemester, setSelectedSemester] = useState('HK1');
    const [schoolYear, setSchoolYear] = useState('2025-2026');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await StorageService.loadData();
        setTeachers(data.teachers);
        setClasses(data.classes);
        setSubjects(data.subjects);
    };

    const saveData = async () => {
        await StorageService.saveData(teachers, classes, subjects);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Header onSave={saveData} />

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-3">
                        <Sidebar
                            currentView={currentView}
                            setCurrentView={setCurrentView}
                            teachers={teachers}
                            classes={classes}
                            subjects={subjects}
                        />
                    </div>

                    <div className="col-span-9">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            {currentView === 'dashboard' && (
                                <DashboardView
                                    teachers={teachers}
                                    classes={classes}
                                    subjects={subjects}
                                    selectedWeek={selectedWeek}
                                    setSelectedWeek={setSelectedWeek}
                                    selectedSemester={selectedSemester}
                                    setSelectedSemester={setSelectedSemester}
                                    schoolYear={schoolYear}
                                    setSchoolYear={setSchoolYear}
                                />
                            )}
                            {currentView === 'teachers' && (
                                <TeachersView
                                    teachers={teachers}
                                    setTeachers={setTeachers}
                                    classes={classes}
                                    teachingData={teachingData}
                                    schoolYear={schoolYear}
                                    selectedSemester={selectedSemester}
                                />
                            )}
                            {currentView === 'classes' && (
                                <ClassesView
                                    classes={classes}
                                    setClasses={setClasses}
                                />
                            )}
                            {currentView === 'subjects' && (
                                <PlaceholderView
                                    icon={FileSpreadsheet}
                                    message="Chức năng đang phát triển"
                                />
                            )}
                            {currentView === 'input' && (
                                <PlaceholderView
                                    icon={Edit2}
                                    message="Chức năng đang phát triển"
                                />
                            )}
                            {currentView === 'statistics' && (
                                <PlaceholderView
                                    icon={BarChart3}
                                    message="Chức năng đang phát triển"
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