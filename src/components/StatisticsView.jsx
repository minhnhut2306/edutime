import React from 'react';
import { Download } from 'lucide-react';
import ExcelService from '../service/ExcelService';


const StatisticsView = ({ teachers, classes, subjects, teachingRecords, schoolYear, selectedSemester }) => {
  const handleExport = () => {
    // Báo cáo theo giáo viên
    const teacherReport = teachers.map(teacher => {
      const records = teachingRecords.filter(r => r.teacherId === teacher.id);
      const totalPeriods = records.reduce((sum, r) => sum + (r.periods || 0), 0);
      
      return {
        'Mã GV': teacher.id,
        'Họ và tên': teacher.name,
        'Tổng số tiết': totalPeriods,
        'Số bản ghi': records.length
      };
    });

    // Báo cáo theo lớp
    const classReport = classes.map(cls => {
      const records = teachingRecords.filter(r => r.classId === cls.id);
      const totalPeriods = records.reduce((sum, r) => sum + (r.periods || 0), 0);
      
      return {
        'Mã lớp': cls.id,
        'Tên lớp': cls.name,
        'Khối': cls.grade,
        'Tổng số tiết': totalPeriods
      };
    });

    // Báo cáo theo môn
    const subjectReport = subjects.map(subject => {
      const records = teachingRecords.filter(r => r.subjectId === subject.id);
      const totalPeriods = records.reduce((sum, r) => sum + (r.periods || 0), 0);
      
      return {
        'Mã môn': subject.id,
        'Tên môn': subject.name,
        'Tổng số tiết': totalPeriods
      };
    });

    // Báo cáo theo tuần
    const weekReport = [];
    for (let week = 1; week <= 35; week++) {
      const records = teachingRecords.filter(r => r.week === week);
      const totalPeriods = records.reduce((sum, r) => sum + (r.periods || 0), 0);
      
      weekReport.push({
        'Tuần': week,
        'Số bản ghi': records.length,
        'Tổng số tiết': totalPeriods
      });
    }

    // Báo cáo theo khối
    const gradeReport = ['6', '7', '8', '9'].map(grade => {
      const gradeClasses = classes.filter(c => c.grade === grade);
      const classIds = gradeClasses.map(c => c.id);
      const records = teachingRecords.filter(r => classIds.includes(r.classId));
      const totalPeriods = records.reduce((sum, r) => sum + (r.periods || 0), 0);
      
      return {
        'Khối': grade,
        'Số lớp': gradeClasses.length,
        'Tổng số tiết': totalPeriods
      };
    });

    // Chi tiết tất cả bản ghi
    const detailReport = teachingRecords.map(record => {
      const teacher = teachers.find(t => t.id === record.teacherId);
      const cls = classes.find(c => c.id === record.classId);
      const subject = subjects.find(s => s.id === record.subjectId);
      
      return {
        'Tuần': record.week,
        'Mã GV': record.teacherId,
        'Giáo viên': teacher?.name || '',
        'Mã lớp': record.classId,
        'Lớp': cls?.name || '',
        'Khối': cls?.grade || '',
        'Mã môn': record.subjectId,
        'Môn học': subject?.name || '',
        'Số tiết': record.periods,
        'Người nhập': record.createdBy,
        'Ngày nhập': new Date(record.createdAt).toLocaleDateString('vi-VN')
      };
    });

    const data = {
      'Theo giáo viên': teacherReport,
      'Theo lớp': classReport,
      'Theo môn học': subjectReport,
      'Theo tuần': weekReport,
      'Theo khối': gradeReport,
      'Chi tiết': detailReport
    };

    ExcelService.exportReport(data, `BaoCao_${schoolYear}_${selectedSemester}_${new Date().getTime()}.xlsx`);
    alert('Đã xuất báo cáo Excel!');
  };

  // Tính toán thống kê
  const totalPeriods = teachingRecords.reduce((sum, r) => sum + (r.periods || 0), 0);
  
  const teacherStats = teachers.map(teacher => {
    const records = teachingRecords.filter(r => r.teacherId === teacher.id);
    const total = records.reduce((sum, r) => sum + (r.periods || 0), 0);
    return { teacher, total };
  }).sort((a, b) => b.total - a.total).slice(0, 10);

  const gradeStats = ['6', '7', '8', '9'].map(grade => {
    const gradeClasses = classes.filter(c => c.grade === grade);
    const classIds = gradeClasses.map(c => c.id);
    const records = teachingRecords.filter(r => classIds.includes(r.classId));
    const total = records.reduce((sum, r) => sum + (r.periods || 0), 0);
    return { grade, total };
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Thống kê & Báo cáo</h2>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Download size={20} />
          Xuất báo cáo Excel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <p className="text-blue-100 text-sm">Tổng số tiết</p>
          <p className="text-3xl font-bold mt-1">{totalPeriods}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <p className="text-green-100 text-sm">Số bản ghi</p>
          <p className="text-3xl font-bold mt-1">{teachingRecords.length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <p className="text-purple-100 text-sm">TB tiết/GV</p>
          <p className="text-3xl font-bold mt-1">
            {teachers.length > 0 ? Math.round(totalPeriods / teachers.length) : 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Top 10 Giáo viên (Số tiết)</h3>
          <div className="space-y-2">
            {teacherStats.map(({ teacher, total }, idx) => (
              <div key={teacher.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-500">#{idx + 1}</span>
                  <span className="font-medium">{teacher.name}</span>
                </div>
                <span className="text-blue-600 font-bold">{total} tiết</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Thống kê theo Khối</h3>
          <div className="space-y-2">
            {gradeStats.map(({ grade, total }) => (
              <div key={grade} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Khối {grade}</span>
                <span className="text-green-600 font-bold">{total} tiết</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default StatisticsView;