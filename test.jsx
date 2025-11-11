/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Calendar, Save, Users, BookOpen, FileSpreadsheet, Edit2, BarChart3, Download, Upload, Plus, Trash2, LogOut, UserPlus, Lock, Eye, EyeOff, CheckCircle, XCircle, Mail } from 'lucide-react';
import * as XLSX from 'xlsx';

const MAX_WEEKS = 40;

// ==================== SERVICES ====================
const StorageService = {
  async loadData(key) {
    try {
      if (!window.storage) {
        console.warn('Storage API not available');
        return null;
      }
      const data = await window.storage.get(key, true);
      return data ? JSON.parse(data.value) : null;
    } catch (error) {
      return null;
    }
  },

  async saveData(key, value) {
    try {
      if (!window.storage) {
        console.warn('Storage API not available');
        return false;
      }
      await window.storage.set(key, JSON.stringify(value), true);
      return true;
    } catch (error) {
      console.error('Error saving:', error);
      return false;
    }
  },

  async getSchoolYearsList() {
    try {
      if (!window.storage) {
        return ['2024-2025']; // Trả về mặc định
      }
      const result = await window.storage.list('edutime_year_', true);
      if (!result || !result.keys) return ['2024-2025'];

      const years = result.keys
        .map(key => key.replace('edutime_year_', ''))
        .sort((a, b) => {
          const [yearA] = a.split('-').map(Number);
          const [yearB] = b.split('-').map(Number);
          return yearB - yearA;
        });

      return years.length > 0 ? years : ['2024-2025'];
    } catch (error) {
      return ['2024-2025'];
    }
  },

  async addSchoolYear(year) {
    if (!window.storage) {
      console.warn('Storage API not available');
      return;
    }
    const key = `edutime_year_${year}`;
    const existing = await this.loadData(key);
    if (!existing) {
      await this.saveData(key, {
        teachers: [],
        classes: [],
        subjects: [],
        weeks: [],
        teachingRecords: []
      });
    }
  }
};



const ExcelService = {
  exportTeacherReport(teacher, teachingData, schoolYear, classes, subjects) {
    const wb = XLSX.utils.book_new();

    // Lấy thông tin lớp chủ nhiệm
    const mainClass = classes.find(c => c.id === teacher.mainClassId);

    // Header info
    const today = new Date();
    const headerData = [
      ['SỞ GD&ĐT TỈNH VĨNH LONG'],
      ['TRUNG TÂM GDNN-GDTX HỘ CÂY NAM'],
      [],
      [`BẢNG KÊ GIỜ THÁNG ${String(today.getMonth() + 1).padStart(2, '0')} NĂM HỌC ${schoolYear} (BIÊN CHẾ)`],
      [`Môn: ${(teacher.subjectIds || []).map(sid => subjects.find(s => s.id === sid)?.name).filter(Boolean).join(', ') || '...........'}`],
      [],
      [`Họ và tên giáo viên: ${teacher.name}`],
      [],
      ['Phân công giảng dạy:'],
      [`-Lớp: TH-2: giảng dạy 3 tiết/tuần; Lớp: TH-HN-2: 12A1 giảng dạy 1tiết/tuần; Lớp: ...... giảng dạy ... tiết/tuần; Lớp: ...... giảng dạy ..... tiết/tuần;`],
      [`-Lớp: ...... giảng dạy ... tiết/tuần; Lớp: ..... giảng dạy ...tiết/tuần; Lớp: ......, giảng dạy ... /tiết/tuần; Lớp: ..... giảng dạy ...tiết/tuần`],
      [],
      ['Phân công kiêm nhiệm:'],
      [`-Chủ nhiệm lớp: ........... tiết/tuần.`],
      [`-Kiêm nhiệm: ........... tiết/tuần`],
      []
    ];

    // Thời gian sections
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Chia thành 4 tuần
    const week1End = new Date(monthStart);
    week1End.setDate(week1End.getDate() + 6);

    const week2Start = new Date(week1End);
    week2Start.setDate(week2Start.getDate() + 1);
    const week2End = new Date(week2Start);
    week2End.setDate(week2End.getDate() + 6);

    const week3Start = new Date(week2End);
    week3Start.setDate(week3Start.getDate() + 1);
    const week3End = new Date(week3Start);
    week3End.setDate(week3End.getDate() + 6);

    const week4Start = new Date(week3End);
    week4Start.setDate(week4Start.getDate() + 1);

    // Tính tổng tiết cho mỗi tuần
    const calculateWeekTotal = (startDate, endDate) => {
      return teachingData.filter(td => {
        const tdDate = new Date(td.date);
        return tdDate >= startDate && tdDate <= endDate;
      }).reduce((sum, td) => sum + (td.periods || 0), 0);
    };

    const week1Total = calculateWeekTotal(monthStart, week1End);
    const week2Total = calculateWeekTotal(week2Start, week2End);
    const week3Total = calculateWeekTotal(week3Start, week3End);
    const week4Total = calculateWeekTotal(week4Start, monthEnd);
    const monthTotal = week1Total + week2Total + week3Total + week4Total;

    // Tạo bảng chính
    const tableHeader = [
      [],
      ['', '', 'THỜI GIAN', '', '', '', '', '', '', '', ''],
      ['TT', 'Phân công',
        `Tuần 1\nTừ ${monthStart.getDate()}/${monthStart.getMonth() + 1}/${monthStart.getFullYear()}`,
        `Tuần 2\nTừ ${week2Start.getDate()}/${week2Start.getMonth() + 1}/${week2Start.getFullYear()}`,
        `Tuần 3\nTừ ${week3Start.getDate()}/${week3Start.getMonth() + 1}/${week3Start.getFullYear()}`,
        `Tuần 4\nTừ ${week4Start.getDate()}/${week4Start.getMonth() + 1}/${week4Start.getFullYear()}`,
        'Tổng số tiết\ntrong tháng\nkhoa phòng',
        'Giờ\ntiêu\nchuẩn',
        'Chỉ dạy',
        'Đơn giá',
        'Thành tiền',
        'Phụ chú'
      ]
    ];

    // Lấy danh sách lớp unique
    const uniqueClasses = [...new Set(teachingData.map(td => td.classId))];
    const classRows = [];
    let rowIndex = 1;

    uniqueClasses.forEach(classId => {
      const cls = classes.find(c => c.id === classId);
      const classData = teachingData.filter(td => td.classId === classId);

      const w1 = calculateWeekTotal(monthStart, week1End, classData);
      const w2 = calculateWeekTotal(week2Start, week2End, classData);
      const w3 = calculateWeekTotal(week3Start, week3End, classData);
      const w4 = calculateWeekTotal(week4Start, monthEnd, classData);
      const total = w1 + w2 + w3 + w4;

      classRows.push([
        rowIndex++,
        cls?.name || classId,
        w1 || '',
        w2 || '',
        w3 || '',
        w4 || '',
        total || '',
        '68',
        total - 68 > 0 ? total - 68 : '',
        '',
        '',
        ''
      ]);
    });

    // Thêm các dòng trống cho đủ 8 dòng
    while (classRows.length < 8) {
      classRows.push([
        rowIndex++,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        ''
      ]);
    }

    // Dòng tổng cộng
    const totalRow = [
      '',
      'Tổng cộng',
      week1Total || '',
      week2Total || '',
      week3Total || '',
      week4Total || '',
      monthTotal || '',
      '68',
      monthTotal - 68 > 0 ? monthTotal - 68 : '',
      '',
      '',
      ''
    ];

    // Footer
    const footerData = [
      [],
      [`Số tiền số nghị thanh toán: .................... đồng (Chi bằng chữ: ...............................................................)`],
      [],
      [`                                      Mỏ Cày, ngày 07 tháng 10 năm ${today.getFullYear()}                    Mỏ Cày, ngày 06 tháng 10 năm ${today.getFullYear()}`],
      ['PHÓ GIÁM ĐỐC', '', '', '', '', '', '', '', '', 'TỔ TRƯỞNG DUYỆT', '', 'GIÁO VIÊN KÊ GIỜ']
    ];

    // Kết hợp tất cả
    const allData = [
      ...headerData,
      ...tableHeader,
      ...classRows,
      totalRow,
      ...footerData
    ];

    const ws = XLSX.utils.aoa_to_sheet(allData);

    // Set column widths
    ws['!cols'] = [
      { wch: 5 },   // TT
      { wch: 15 },  // Phân công
      { wch: 12 },  // Tuần 1
      { wch: 12 },  // Tuần 2
      { wch: 12 },  // Tuần 3
      { wch: 12 },  // Tuần 4
      { wch: 12 },  // Tổng số tiết
      { wch: 8 },   // Giờ tiêu chuẩn
      { wch: 8 },   // Chỉ dạy
      { wch: 10 },  // Đơn giá
      { wch: 12 },  // Thành tiền
      { wch: 10 }   // Phụ chú
    ];

    // Merge cells
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }, // Header 1
      { s: { r: 1, c: 0 }, e: { r: 1, c: 11 } }, // Header 2
      { s: { r: 3, c: 0 }, e: { r: 3, c: 11 } }, // Title
      { s: { r: 4, c: 0 }, e: { r: 4, c: 11 } }, // Môn
      { s: { r: 16, c: 2 }, e: { r: 16, c: 6 } }, // THỜI GIAN header
    ];

    XLSX.utils.book_append_sheet(wb, ws, teacher.name.substring(0, 31));

    const fileName = `BangKeGio_${teacher.name}_Thang${String(today.getMonth() + 1).padStart(2, '0')}_${schoolYear.replace('-', '_')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  },
  exportWeeklyReport(teacher, teachingData, schoolYear, classes, subjects, weeks) {
    const wb = XLSX.utils.book_new();

    // Header
    const headerData = [
      ['BÁO CÁO THEO TUẦN'],
      [`Giáo viên: ${teacher.name}`],
      [`Năm học: ${schoolYear}`],
      []
    ];

    // Tính tiết theo từng tuần
    const weeklyData = weeks.map(week => {
      const weekRecords = teachingData.filter(r => r.weekId === week.id);
      const totalPeriods = weekRecords.reduce((sum, r) => sum + (r.periods || 0), 0);

      return [
        `Tuần ${week.weekNumber}`,
        new Date(week.startDate).toLocaleDateString('vi-VN'),
        new Date(week.endDate).toLocaleDateString('vi-VN'),
        weekRecords.length,
        totalPeriods
      ];
    });

    const tableData = [
      ['Tuần', 'Từ ngày', 'Đến ngày', 'Số bản ghi', 'Tổng tiết'],
      ...weeklyData,
      ['', '', 'TỔNG CỘNG', '', weeklyData.reduce((sum, w) => sum + w[4], 0)]
    ];

    const ws = XLSX.utils.aoa_to_sheet([...headerData, ...tableData]);
    XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo tuần');
    XLSX.writeFile(wb, `BaoCao_Tuan_${teacher.name}_${schoolYear.replace('-', '_')}.xlsx`);
  },

  exportSemesterReport(teacher, teachingData, schoolYear, classes, subjects, weeks) {
    const wb = XLSX.utils.book_new();

    // Chia học kỳ
    const hk1Weeks = weeks.filter(w => w.weekNumber <= 18);
    const hk2Weeks = weeks.filter(w => w.weekNumber > 18 && w.weekNumber <= 35);

    const hk1Records = teachingData.filter(r => hk1Weeks.some(w => w.id === r.weekId));
    const hk2Records = teachingData.filter(r => hk2Weeks.some(w => w.id === r.weekId));

    const hk1Total = hk1Records.reduce((sum, r) => sum + (r.periods || 0), 0);
    const hk2Total = hk2Records.reduce((sum, r) => sum + (r.periods || 0), 0);

    const data = [
      ['BÁO CÁO THEO HỌC KỲ'],
      [`Giáo viên: ${teacher.name}`],
      [`Năm học: ${schoolYear}`],
      [],
      ['Học kỳ', 'Tuần', 'Số bản ghi', 'Tổng tiết'],
      ['Học kỳ 1', 'Tuần 1-18', hk1Records.length, hk1Total],
      ['Học kỳ 2', 'Tuần 19-35', hk2Records.length, hk2Total],
      ['TỔNG CỘNG', '', hk1Records.length + hk2Records.length, hk1Total + hk2Total]
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo học kỳ');
    XLSX.writeFile(wb, `BaoCao_HocKy_${teacher.name}_${schoolYear.replace('-', '_')}.xlsx`);
  },

  exportYearReport(teacher, teachingData, schoolYear, classes, subjects, weeks) {
    const wb = XLSX.utils.book_new();

    // Tổng hợp cả năm
    const totalPeriods = teachingData.reduce((sum, r) => sum + (r.periods || 0), 0);
    const uniqueClasses = [...new Set(teachingData.map(r => r.classId))];

    const classData = uniqueClasses.map(classId => {
      const cls = classes.find(c => c.id === classId);
      const classRecords = teachingData.filter(r => r.classId === classId);
      const classPeriods = classRecords.reduce((sum, r) => sum + (r.periods || 0), 0);

      return [
        cls?.name || classId,
        cls?.grade || '-',
        classRecords.length,
        classPeriods
      ];
    });

    const data = [
      ['BÁO CÁO CẢ NĂM HỌC'],
      [`Giáo viên: ${teacher.name}`],
      [`Năm học: ${schoolYear}`],
      [],
      ['Lớp', 'Khối', 'Số bản ghi', 'Tổng tiết'],
      ...classData,
      ['TỔNG CỘNG', '', teachingData.length, totalPeriods]
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo năm học');
    XLSX.writeFile(wb, `BaoCao_NamHoc_${teacher.name}_${schoolYear.replace('-', '_')}.xlsx`);
  },

  downloadTemplate(schoolYear) {
    const wsTeachers = XLSX.utils.json_to_sheet([
      { 'Mã GV': 'GV001', 'Họ và tên': 'Nguyễn Văn A', 'Email': 'nva@school.edu.vn', 'Số điện thoại': '0901234567', 'Môn dạy': 'Toán', 'Lớp chủ nhiệm': '6A1' }
    ]);

    const wsClasses = XLSX.utils.json_to_sheet([
      { 'Mã lớp': 'L6A1', 'Tên lớp': '6A1', 'Khối': '6', 'Sĩ số': '35' }
    ]);

    const wsSubjects = XLSX.utils.json_to_sheet([
      { 'Mã môn': 'TOAN', 'Tên môn': 'Toán' }
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsTeachers, 'Danh sách GV');
    XLSX.utils.book_append_sheet(wb, wsClasses, 'Danh sách lớp');
    XLSX.utils.book_append_sheet(wb, wsSubjects, 'Danh sách môn');

    XLSX.writeFile(wb, `EduTime_Template_${schoolYear}.xlsx`);
  },

  handleImport(file, onSuccess) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });

        const result = { teachers: [], classes: [], subjects: [] };

        if (wb.SheetNames.includes('Danh sách GV')) {
          const ws = wb.Sheets['Danh sách GV'];
          const data = XLSX.utils.sheet_to_json(ws);
          result.teachers = data.map((row, idx) => {
            const subjectNames = (row['Môn dạy'] || '').split(',').map(s => s.trim()).filter(Boolean);
            return {
              id: row['Mã GV'] || `GV${String(idx + 1).padStart(3, '0')}`,
              name: row['Họ và tên'] || '',
              email: row['Email'] || '',
              phone: row['Số điện thoại'] || '',
              subjectNames: subjectNames, // Lưu tạm tên môn
              mainClassName: row['Lớp chủ nhiệm'] || ''
            };
          });
        }

        if (wb.SheetNames.includes('Danh sách lớp')) {
          const ws = wb.Sheets['Danh sách lớp'];
          const data = XLSX.utils.sheet_to_json(ws);
          result.classes = data.map((row, idx) => ({
            id: row['Mã lớp'] || `L${String(idx + 1).padStart(3, '0')}`,
            name: row['Tên lớp'] || '',
            grade: String(row['Khối'] || ''),
            studentCount: row['Sĩ số'] || 0
          }));
        }

        if (wb.SheetNames.includes('Danh sách môn')) {
          const ws = wb.Sheets['Danh sách môn'];
          const data = XLSX.utils.sheet_to_json(ws);
          result.subjects = data.map((row, idx) => ({
            id: row['Mã môn'] || `MH${String(idx + 1).padStart(3, '0')}`,
            name: row['Tên môn'] || ''
          }));
        }

        onSuccess(result);
        alert('Import dữ liệu thành công!');
      } catch (error) {
        console.error('Error importing:', error);
        alert('Có lỗi khi import dữ liệu!');
      }
    };
    reader.readAsBinaryString(file);
  }
};

function calculateWeekTotal(startDate, endDate, dataArray) {
  return dataArray.filter(td => {
    const tdDate = new Date(td.date);
    return tdDate >= startDate && tdDate <= endDate;
  }).reduce((sum, td) => sum + (td.periods || 0), 0);
}

// ==================== COMPONENTS ====================

// Login Component
const LoginView = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!username || !password) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">EduTime</h1>
          <p className="text-gray-500 mt-2">Hệ thống Quản lý Giờ Dạy</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập tên đăng nhập"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập mật khẩu"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            Đăng nhập
          </button>

          <div className="text-sm text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="font-medium mb-1">Tài khoản mặc định:</p>
            <p>Admin: admin / admin123</p>
            <p>GV: gv001 / gv123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const TeachingInputView = ({
  teachers,
  classes,
  subjects,
  weeks,
  teachingRecords,
  setTeachingRecords,
  schoolYear,
  currentUser,
  users // THÊM users vào props
}) => {
  const [selectedWeekId, setSelectedWeekId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [periods, setPeriods] = useState('');

  const isAdmin = currentUser.role === 'admin';
  const teacher = teachers.find(t => t.userId === currentUser.username);

  // ===== THÊM MỚI: LẤY THÔNG TIN PHÂN QUYỀN KHỐI =====
  const userInfo = users.find(u => u.username === currentUser.username);
  const allowedGrades = userInfo?.allowedGrades || [];
  const hasGradeRestriction = !isAdmin && allowedGrades.length > 0;

  // ===== THÊM MỚI: LỌC LỚP THEO QUYỀN =====
  const availableClasses = hasGradeRestriction
    ? classes.filter(c => allowedGrades.includes(c.grade))
    : classes;

  useEffect(() => {
    if (!isAdmin && teacher) {
      setSelectedTeacherId(teacher.id);
    }
  }, [isAdmin, teacher]);

  const myRecords = isAdmin ? teachingRecords :
    teachingRecords.filter(r => r.teacherId === teacher?.id);

  const handleAdd = () => {
    if (!isAdmin && !teacher) {
      alert('Không tìm thấy thông tin giáo viên!');
      return;
    }

    if (isAdmin && !selectedTeacherId) {
      alert('Vui lòng chọn giáo viên!');
      return;
    }

    if (!selectedWeekId || !selectedClassId || !selectedSubjectId || !periods) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    // ===== THÊM MỚI: KIỂM TRA QUYỀN THEO KHỐI =====
    if (hasGradeRestriction) {
      const selectedClass = classes.find(c => c.id === selectedClassId);
      if (selectedClass && !allowedGrades.includes(selectedClass.grade)) {
        alert(`❌ Bạn không có quyền nhập dữ liệu cho khối ${selectedClass.grade}!\nBạn chỉ được nhập khối: ${allowedGrades.join(', ')}`);
        return;
      }
    }

    const newRecord = {
      id: `TR${Date.now()}`,
      teacherId: isAdmin ? selectedTeacherId : teacher.id,
      weekId: selectedWeekId,
      classId: selectedClassId,
      subjectId: selectedSubjectId,
      periods: parseInt(periods),
      schoolYear,
      createdBy: currentUser.username,
      createdAt: new Date().toISOString()
    };

    setTeachingRecords([...teachingRecords, newRecord]);
    setSelectedWeekId('');
    setSelectedClassId('');
    setSelectedSubjectId('');
    if (isAdmin) setSelectedTeacherId('');
    setPeriods('');
    alert('✅ Đã thêm bản ghi!');
  };

  // ===== THÊM MỚI: KIỂM TRA QUYỀN XÓA =====
  const handleDelete = (id) => {
    const record = teachingRecords.find(r => r.id === id);
    if (!record) return;

    // Chỉ cho phép xóa bản ghi của chính mình (trừ admin)
    if (!isAdmin && record.createdBy !== currentUser.username) {
      alert('❌ Bạn chỉ có thể xóa bản ghi do chính mình tạo!');
      return;
    }

    if (confirm('Xóa bản ghi này?')) {
      setTeachingRecords(teachingRecords.filter(r => r.id !== id));
    }
  };

  if (!teacher && !isAdmin) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
        <p className="text-yellow-800">Tài khoản của bạn chưa được liên kết với giáo viên. Vui lòng liên hệ Admin!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Nhập tiết dạy</h2>

      {/* ===== THÊM MỚI: HIỂN THỊ THÔNG BÁO PHÂN QUYỀN ===== */}
      {hasGradeRestriction && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Lock size={20} className="text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Phân quyền của bạn</p>
              <p className="text-sm text-blue-700">
                Bạn chỉ được nhập dữ liệu cho các khối: <strong>{allowedGrades.join(', ')}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {!isAdmin && teacher && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-600">Giáo viên</p>
              <p className="font-medium">{teacher.name}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Lớp chủ nhiệm</p>
              <p className="font-medium">{classes.find(c => c.id === teacher.mainClassId)?.name || 'Chưa có'}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Thêm bản ghi mới</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giáo viên</label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn giáo viên --</option>
                {teachers.map(t => {
                  const teacherSubjects = (t.subjectIds || [])
                    .map(sid => subjects.find(s => s.id === sid)?.name)
                    .filter(Boolean)
                    .join(', ') || 'Chưa có môn';
                  return (
                    <option key={t.id} value={t.id}>{t.name} - {teacherSubjects}</option>
                  );
                })}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tuần học</label>
            <select
              value={selectedWeekId}
              onChange={(e) => setSelectedWeekId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn tuần --</option>
              {weeks.map(w => (
                <option key={w.id} value={w.id}>
                  Tuần {w.weekNumber} ({new Date(w.startDate).toLocaleDateString('vi-VN')} - {new Date(w.endDate).toLocaleDateString('vi-VN')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lớp {hasGradeRestriction && <span className="text-blue-600">(Khối: {allowedGrades.join(', ')})</span>}
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn lớp --</option>
              {availableClasses.map(c => (
                <option key={c.id} value={c.id}>{c.name} (Khối {c.grade})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Môn học</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn môn --</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số tiết</label>
            <input
              type="number"
              min="1"
              value={periods}
              onChange={(e) => setPeriods(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleAdd}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Thêm
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold">Danh sách bản ghi</h3>
          <p className="text-sm text-gray-500 mt-1">Tổng: {myRecords.length} bản ghi</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tuần</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giáo viên</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lớp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Môn</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiết</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người tạo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {myRecords
                .sort((a, b) => {
                  const weekA = weeks.find(w => w.id === a.weekId);
                  const weekB = weeks.find(w => w.id === b.weekId);
                  return (weekB?.weekNumber || 0) - (weekA?.weekNumber || 0);
                })
                .map((record) => {
                  const recordTeacher = teachers.find(t => t.id === record.teacherId);
                  const week = weeks.find(w => w.id === record.weekId);
                  const cls = classes.find(c => c.id === record.classId);
                  const subject = subjects.find(s => s.id === record.subjectId);

                  return (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">
                        Tuần {week?.weekNumber || '?'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{recordTeacher?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{cls?.name || record.classId}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{subject?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{record.periods}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{record.createdBy}</td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-800"
                          title={!isAdmin && record.createdBy !== currentUser.username ? "Bạn không có quyền xóa" : "Xóa"}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Header Component
// Header Component (SỬA LẠI - thêm dropdown chọn năm)
const Header = ({ currentUser, onLogout, onSave, schoolYear, archivedYears, onChangeYear }) => (
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
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
            <p className="text-xs text-gray-500">{currentUser.role === 'admin' ? 'Quản trị viên' : 'Giáo viên'}</p>
          </div>
          <button
            onClick={onSave}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Save size={20} />
            Lưu
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <LogOut size={20} />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  </header>
);

// Dashboard View (Admin)
// Dashboard View (Admin)
const DashboardView = ({ teachers, classes, subjects, teachingRecords, users, schoolYear, setSchoolYear, currentUser, onFinishYear, archivedYears, onChangeYear }) => {
  const pendingUsers = users.filter(u => u.status === 'pending');
  const totalRecords = teachingRecords.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Giáo viên</p>
              <p className="text-3xl font-bold mt-1">{teachers.length}</p>
            </div>
            <Users size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Lớp học</p>
              <p className="text-3xl font-bold mt-1">{classes.length}</p>
            </div>
            <BookOpen size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Môn học</p>
              <p className="text-3xl font-bold mt-1">{subjects.length}</p>
            </div>
            <FileSpreadsheet size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {pendingUsers.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-center">
            <Mail className="text-yellow-600 mr-3" size={24} />
            <div>
              <p className="font-medium text-yellow-800">Có {pendingUsers.length} tài khoản chờ duyệt</p>
              <p className="text-sm text-yellow-700">Vui lòng kiểm tra mục "Người dùng" để duyệt</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4">Thông tin năm học</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Năm học</label>
            <input
              type="text"
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
              disabled={currentUser.role !== 'admin'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tổng số bản ghi</label>
            <div className="text-2xl font-bold text-blue-600 py-2">{totalRecords}</div>
          </div>
        </div>

        {currentUser.role === 'admin' && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <button
              onClick={onFinishYear}
              className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-medium"
            >
              <CheckCircle size={20} />
              Kết thúc năm học {schoolYear}
            </button>

            {archivedYears && archivedYears.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Xem lại dữ liệu năm học trước</label>
                <select
                  onChange={(e) => onChangeYear(e.target.value)}
                  value=""
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn năm học --</option>
                  {archivedYears.filter(y => y !== schoolYear).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Lưu ý: Dữ liệu năm cũ chỉ được xem, không thể chỉnh sửa
                </p>
              </div>
            )}

            <p className="text-sm text-gray-500">
              Lưu ý: Sau khi kết thúc, dữ liệu năm học này sẽ được lưu trữ và bạn có thể bắt đầu năm học mới.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Teacher Dashboard
const TeacherDashboardView = ({ teacher, teachingRecords, classes, subjects }) => {
  const myRecords = teachingRecords.filter(r => r.teacherId === teacher.id);
  const totalPeriods = myRecords.reduce((sum, r) => sum + (r.periods || 0), 0);

  const today = new Date();
  const currentMonth = today.getMonth();
  const monthRecords = myRecords.filter(r => {
    const recordDate = new Date(r.date);
    return recordDate.getMonth() === currentMonth;
  });
  const monthPeriods = monthRecords.reduce((sum, r) => sum + (r.periods || 0), 0);

  const mainClass = classes.find(c => c.id === teacher.mainClassId);
  const teacherSubjects = (teacher.subjectIds || [])
    .map(sid => subjects.find(s => s.id === sid)?.name)
    .filter(Boolean)
    .join(', ') || 'Chưa có';

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Xin chào, {teacher.name}!</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-blue-100 text-sm">Lớp chủ nhiệm</p>
            <p className="text-xl font-bold mt-1">{mainClass?.name || 'Chưa có'}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Môn dạy</p>
            <p className="text-xl font-bold mt-1">{teacherSubjects}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <p className="text-gray-500 text-sm">Tổng tiết đã dạy</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{totalPeriods}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <p className="text-gray-500 text-sm">Tiết tháng này</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{monthPeriods}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <p className="text-gray-500 text-sm">Số bản ghi</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{myRecords.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4">Hướng dẫn sử dụng</h3>
        <div className="space-y-3 text-gray-700">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-2 mt-1">
              <Edit2 size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Nhập tiết dạy hàng ngày</p>
              <p className="text-sm text-gray-600">Vào mục "Nhập tiết dạy" để ghi lại số tiết dạy mỗi ngày</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-green-100 rounded-full p-2 mt-1">
              <Download size={16} className="text-green-600" />
            </div>
            <div>
              <p className="font-medium">Xuất báo cáo Excel</p>
              <p className="text-sm text-gray-600">Vào mục "Báo cáo" để xuất file Excel theo mẫu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Teachers Management View
const TeachersView = ({ teachers, setTeachers, classes, subjects, currentUser }) => {
  const isAdmin = currentUser.role === 'admin';
  const [editingTeacher, setEditingTeacher] = useState(null);

  const handleAdd = () => {
    const name = prompt('Nhập họ tên giáo viên:');
    if (name) {
      const newTeacher = {
        id: `GV${String(teachers.length + 1).padStart(3, '0')}`,
        name,
        email: '',
        phone: '',
        subjectId: '',
        subjectName: '',
        mainClassId: '',
        userId: ''
      };
      setTeachers([...teachers, newTeacher]);
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher({ ...teacher });
  };

  const handleSaveEdit = () => {
    if (editingTeacher) {
      setTeachers(teachers.map(t => t.id === editingTeacher.id ? editingTeacher : t));
      setEditingTeacher(null);
      alert('Đã cập nhật thông tin giáo viên!');
    }
  };

  const handleDelete = (id) => {
    if (confirm('Xóa giáo viên này?')) {
      setTeachers(teachers.filter(t => t.id !== id));
    }
  };

  const handleImport = (e) => {
    ExcelService.handleImport(e.target.files[0], (result) => {
      if (result.teachers.length > 0) {
        const newTeachers = result.teachers.map(t => {
          const mainClass = classes.find(c => c.name === t.mainClassName);
          const subjectIds = (t.subjectNames || [])
            .map(name => subjects.find(s => s.name === name)?.id)
            .filter(Boolean);
          return {
            id: t.id,
            name: t.name,
            email: t.email,
            phone: t.phone,
            mainClassId: mainClass?.id || '',
            subjectIds: subjectIds,
            userId: ''
          };
        });
        setTeachers(prev => [...prev, ...newTeachers]);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý Giáo viên</h2>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => ExcelService.downloadTemplate('2024-2025')}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              <Download size={20} />
              Tải file mẫu
            </button>

            <label className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer">
              <Upload size={20} />
              <span>Import</span>
              <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
            </label>

            <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <Plus size={20} />
              Thêm
            </button>
          </div>
        )}
      </div>

      {editingTeacher && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Chỉnh sửa giáo viên</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
              <input
                type="text"
                value={editingTeacher.name}
                onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={editingTeacher.email}
                onChange={(e) => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
              <input
                type="text"
                value={editingTeacher.phone}
                onChange={(e) => setEditingTeacher({ ...editingTeacher, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Các môn dạy (chọn nhiều môn)</label>
              <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
                {subjects.map(s => {
                  const isSelected = (editingTeacher.subjectIds || []).includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        const currentSubjects = editingTeacher.subjectIds || [];
                        if (isSelected) {
                          setEditingTeacher({ ...editingTeacher, subjectIds: currentSubjects.filter(id => id !== s.id) });
                        } else {
                          setEditingTeacher({ ...editingTeacher, subjectIds: [...currentSubjects, s.id] });
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg border-2 transition-all font-medium ${isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                        }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-1">💡 Click vào môn để chọn/bỏ chọn</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lớp chủ nhiệm</label>
              <select
                value={editingTeacher.mainClassId}
                onChange={(e) => setEditingTeacher({ ...editingTeacher, mainClassId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn lớp --</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSaveEdit}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Lưu
            </button>
            <button
              onClick={() => setEditingTeacher(null)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã GV</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ và tên</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SĐT</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Môn dạy</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lớp CN</th>
              {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {teachers.map((teacher) => {
              const mainClass = classes.find(c => c.id === teacher.mainClassId);
              const teacherSubjects = (teacher.subjectIds || [])
                .map(sid => subjects.find(s => s.id === sid)?.name)
                .filter(Boolean)
                .join(', ') || '-';
              return (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{teacher.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{teacher.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{teacher.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{teacher.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{teacherSubjects}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{mainClass?.name || '-'}</td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button onClick={() => handleEdit(teacher)} className="text-blue-600 hover:text-blue-800">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(teacher.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Classes Management View
const ClassesView = ({ classes, setClasses, currentUser }) => {
  const isAdmin = currentUser.role === 'admin';

  const handleAdd = () => {
    const name = prompt('Nhập tên lớp:');
    if (name) {
      const grade = prompt('Nhập khối (6, 7, 8, 9):');
      const studentCount = prompt('Nhập sĩ số:');
      const newClass = {
        id: `L${String(classes.length + 1).padStart(3, '0')}`,
        name,
        grade: grade || '',
        studentCount: parseInt(studentCount) || 0
      };
      setClasses([...classes, newClass]);
    }
  };

  const handleDelete = (id) => {
    if (confirm('Xóa lớp học này?')) {
      setClasses(classes.filter(c => c.id !== id));
    }
  };

  const handleImport = (e) => {
    ExcelService.handleImport(e.target.files[0], (result) => {
      if (result.classes.length > 0) {
        setClasses(prev => [...prev, ...result.classes]);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý Lớp học</h2>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer">
              <Upload size={20} />
              <span>Import</span>
              <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
            </label>

            <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <Plus size={20} />
              Thêm
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã lớp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên lớp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khối</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sĩ số</th>
              {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {classes.map((cls) => (
              <tr key={cls.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{cls.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{cls.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{cls.grade}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{cls.studentCount}</td>
                {isAdmin && (
                  <td className="px-6 py-4 text-sm">
                    <button onClick={() => handleDelete(cls.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Subjects Management View
const SubjectsView = ({ subjects, setSubjects, currentUser }) => {
  const isAdmin = currentUser.role === 'admin';

  const handleAdd = () => {
    const name = prompt('Nhập tên môn học:');
    if (name) {
      const newSubject = {
        id: `MH${String(subjects.length + 1).padStart(3, '0')}`,
        name
      };
      setSubjects([...subjects, newSubject]);
    }
  };

  const handleDelete = (id) => {
    if (confirm('Xóa môn học này?')) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý Môn học</h2>
        {isAdmin && (
          <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Plus size={20} />
            Thêm
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã môn</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên môn</th>
              {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {subjects.map((subject) => (
              <tr key={subject.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{subject.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{subject.name}</td>
                {isAdmin && (
                  <td className="px-6 py-4 text-sm">
                    <button onClick={() => handleDelete(subject.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Weeks Management View (THÊM MỚI)
// Weeks Management View (SỬA LẠI HOÀN TOÀN)
const WeeksView = ({ weeks, setWeeks, currentUser, schoolYear }) => {
  const isAdmin = currentUser.role === 'admin';
  const [editingWeek, setEditingWeek] = useState(null);
  const [newWeek, setNewWeek] = useState({
    startDate: '',
    endDate: ''
  });

  // Tính tuần số dựa trên ngày bắt đầu năm học
  const calculateWeekNumber = (startDate) => {
    if (!startDate) return null;

    // Tìm tuần đầu tiên trong năm học (tuần có ngày bắt đầu sớm nhất)
    const sortedWeeks = [...weeks].sort((a, b) =>
      new Date(a.startDate) - new Date(b.startDate)
    );

    if (sortedWeeks.length === 0) {
      return 1; // Tuần đầu tiên
    }

    const firstWeekStart = new Date(sortedWeeks[0].startDate);
    const newWeekStart = new Date(startDate);

    // Tính số tuần chênh lệch
    const diffTime = newWeekStart - firstWeekStart;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(diffDays / 7) + 1;

    return weekNumber > 0 ? weekNumber : 1;
  };

  const handleAdd = () => {
    if (!newWeek.startDate || !newWeek.endDate) {
      alert('Vui lòng chọn ngày bắt đầu và ngày kết thúc!');
      return;
    }

    const start = new Date(newWeek.startDate);
    const end = new Date(newWeek.endDate);

    if (start >= end) {
      alert('Ngày kết thúc phải sau ngày bắt đầu!');
      return;
    }

    // Kiểm tra trùng ngày với các tuần khác
    const isOverlap = weeks.some(w => {
      const wStart = new Date(w.startDate);
      const wEnd = new Date(w.endDate);
      return (start <= wEnd && end >= wStart);
    });

    if (isOverlap) {
      alert('Thời gian này bị trùng với tuần khác!');
      return;
    }

    // Tự động tính tuần số
    const weekNumber = weeks.length === 0 ? 1 : calculateWeekNumber(newWeek.startDate);

    const week = {
      id: `W${Date.now()}`,
      weekNumber: weekNumber,
      startDate: newWeek.startDate,
      endDate: newWeek.endDate
    };

    setWeeks([...weeks, week].sort((a, b) => a.weekNumber - b.weekNumber));
    setNewWeek({ startDate: '', endDate: '' });
    alert(`Đã thêm Tuần ${weekNumber}!`);
  };

  const handleDelete = (id) => {
    if (confirm('Xóa tuần học này?')) {
      const updatedWeeks = weeks.filter(w => w.id !== id);
      // Tự động cập nhật lại số tuần
      const reorderedWeeks = updatedWeeks
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .map((w, index) => ({ ...w, weekNumber: index + 1 }));

      setWeeks(reorderedWeeks);
    }
  };

  const handleEdit = (week) => {
    setEditingWeek({ ...week });
  };

  const handleSaveEdit = () => {
    const start = new Date(editingWeek.startDate);
    const end = new Date(editingWeek.endDate);

    if (start >= end) {
      alert('Ngày kết thúc phải sau ngày bắt đầu!');
      return;
    }

    // Kiểm tra trùng với các tuần khác (trừ tuần đang sửa)
    const isOverlap = weeks.some(w => {
      if (w.id === editingWeek.id) return false;
      const wStart = new Date(w.startDate);
      const wEnd = new Date(w.endDate);
      return (start <= wEnd && end >= wStart);
    });

    if (isOverlap) {
      alert('Thời gian này bị trùng với tuần khác!');
      return;
    }

    const updatedWeeks = weeks.map(w => w.id === editingWeek.id ? editingWeek : w);

    // Sắp xếp lại và cập nhật số tuần
    const reorderedWeeks = updatedWeeks
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .map((w, index) => ({ ...w, weekNumber: index + 1 }));

    setWeeks(reorderedWeeks);
    setEditingWeek(null);
    alert('Đã cập nhật tuần học!');
  };

  // Tính số ngày trong tuần
  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Quản lý Tuần học</h2>
          <p className="text-sm text-gray-500 mt-1">Năm học: {schoolYear} - Tổng: {weeks.length} tuần</p>
        </div>
      </div>

      {isAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-2">
              <Calendar size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-900">Hướng dẫn</p>
              <p className="text-sm text-blue-700 mt-1">
                Chọn ngày bắt đầu và ngày kết thúc cho mỗi tuần học.
                Hệ thống sẽ <strong>tự động đánh số tuần</strong> theo thứ tự thời gian.
              </p>
            </div>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Thêm tuần học mới</h3>
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900">
              📊 Tiến độ: {weeks.length}/{MAX_WEEKS} tuần
              <span className="ml-2 text-blue-600">
                ({MAX_WEEKS - weeks.length} tuần còn lại)
              </span>
            </p>
            {weeks.length >= MAX_WEEKS - 5 && weeks.length < MAX_WEEKS && (
              <p className="text-xs text-orange-600 mt-1">⚠️ Sắp đạt giới hạn năm học!</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày bắt đầu</label>
              <input
                type="date"
                value={newWeek.startDate}
                onChange={(e) => setNewWeek({ ...newWeek, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày kết thúc</label>
              <input
                type="date"
                value={newWeek.endDate}
                onChange={(e) => setNewWeek({ ...newWeek, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAdd}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Thêm tuần
              </button>
            </div>
          </div>
          {newWeek.startDate && newWeek.endDate && new Date(newWeek.startDate) < new Date(newWeek.endDate) && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                ✓ Tuần này sẽ được đánh số: <strong>Tuần {weeks.length === 0 ? 1 : calculateWeekNumber(newWeek.startDate)}</strong>
                {' '}({calculateDays(newWeek.startDate, newWeek.endDate)} ngày)
              </p>
            </div>
          )}
        </div>
      )}

      {editingWeek && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-300">
          <h3 className="text-lg font-semibold mb-4">Chỉnh sửa Tuần {editingWeek.weekNumber}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày bắt đầu</label>
              <input
                type="date"
                value={editingWeek.startDate}
                onChange={(e) => setEditingWeek({ ...editingWeek, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày kết thúc</label>
              <input
                type="date"
                value={editingWeek.endDate}
                onChange={(e) => setEditingWeek({ ...editingWeek, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleSaveEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Lưu
              </button>
              <button
                onClick={() => setEditingWeek(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold">Danh sách tuần học</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tuần</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày bắt đầu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày kết thúc</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số ngày</th>
                {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {weeks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <Calendar size={48} className="mx-auto text-gray-300 mb-2" />
                    <p>Chưa có tuần học nào. Hãy thêm tuần học đầu tiên!</p>
                  </td>
                </tr>
              ) : (
                weeks.map((week) => {
                  const start = new Date(week.startDate);
                  const end = new Date(week.endDate);
                  const days = calculateDays(week.startDate, week.endDate);

                  return (
                    <tr key={week.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-bold text-blue-600">Tuần {week.weekNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {start.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {end.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{days} ngày</td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-sm flex gap-2">
                          <button
                            onClick={() => handleEdit(week)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(week.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Report View
const ReportView = ({ teachers, classes, subjects, teachingRecords, weeks, schoolYear, currentUser }) => {
  const isAdmin = currentUser.role === 'admin';
  
  // ===== THÊM MỚI: Lấy giáo viên được liên kết =====
  const linkedTeacher = teachers.find(t => t.userId === currentUser.username);
  
  // ===== THÊM MỚI: Giới hạn danh sách GV theo quyền =====
  const availableTeachers = isAdmin ? teachers : 
    (linkedTeacher ? [linkedTeacher] : []);

  const [selectedTeacherId, setSelectedTeacherId] = useState(
    isAdmin ? '' : (linkedTeacher?.id || '')
  );
  const [reportType, setReportType] = useState('teacher');
  const [exportType, setExportType] = useState('month');

  // ===== THÊM MỚI: Cảnh báo nếu user chưa được liên kết =====
  if (!isAdmin && !linkedTeacher) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Báo cáo & Xuất Excel</h2>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
          <div className="flex items-center gap-3">
            <Mail size={24} className="text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-900">Tài khoản chưa được liên kết</p>
              <p className="text-sm text-yellow-700 mt-1">
                Tài khoản của bạn chưa được liên kết với giáo viên. 
                Vui lòng liên hệ Admin để được phân quyền!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleExport = () => {
    if (!isAdmin) {
      alert('⛔ Chỉ Admin mới có quyền xuất báo cáo Excel!');
      return;
    }

    if (!selectedTeacherId) {
      alert('Vui lòng chọn giáo viên!');
      return;
    }

    const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
    if (!selectedTeacher) {
      alert('Không tìm thấy thông tin giáo viên!');
      return;
    }

    const teacherRecords = teachingRecords.filter(r => r.teacherId === selectedTeacherId);
    if (teacherRecords.length === 0) {
      alert('Chưa có dữ liệu để xuất báo cáo!');
      return;
    }

    switch (exportType) {
      case 'month':
        ExcelService.exportTeacherReport(selectedTeacher, teacherRecords, schoolYear, classes, subjects, weeks);
        break;
      case 'week':
        ExcelService.exportWeeklyReport(selectedTeacher, teacherRecords, schoolYear, classes, subjects, weeks);
        break;
      case 'semester':
        ExcelService.exportSemesterReport(selectedTeacher, teacherRecords, schoolYear, classes, subjects, weeks);
        break;
      case 'year':
        ExcelService.exportYearReport(selectedTeacher, teacherRecords, schoolYear, classes, subjects, weeks);
        break;
    }

    alert('✅ Đã xuất báo cáo Excel!');
  };

  const myRecords = selectedTeacherId ?
    teachingRecords.filter(r => r.teacherId === selectedTeacherId) : [];
  const totalPeriods = myRecords.reduce((sum, r) => sum + (r.periods || 0), 0);

  const today = new Date();
  const currentMonth = today.getMonth();
  const monthRecords = myRecords.filter(r => {
    const week = weeks.find(w => w.id === r.weekId);
    if (!week) return false;
    const weekDate = new Date(week.startDate);
    return weekDate.getMonth() === currentMonth;
  });
  const monthPeriods = monthRecords.reduce((sum, r) => sum + (r.periods || 0), 0);

  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);

  const gradeStats = () => {
    if (!selectedTeacherId) return [];

    const grades = [...new Set(classes.map(c => c.grade))].sort();
    return grades.map(grade => {
      const gradeClasses = classes.filter(c => c.grade === grade);
      const gradeRecords = myRecords.filter(r =>
        gradeClasses.some(c => c.id === r.classId)
      );
      const gradePeriods = gradeRecords.reduce((sum, r) => sum + (r.periods || 0), 0);

      return {
        grade,
        classes: gradeClasses.length,
        records: gradeRecords.length,
        periods: gradePeriods
      };
    }).filter(g => g.periods > 0);
  };

  const semesterStats = () => {
    if (!selectedTeacherId || weeks.length === 0) return [];

    const semester1Weeks = weeks.filter(w => w.weekNumber <= 18);
    const semester2Weeks = weeks.filter(w => w.weekNumber > 18 && w.weekNumber <= 35);

    const sem1Records = myRecords.filter(r =>
      semester1Weeks.some(w => w.id === r.weekId)
    );
    const sem2Records = myRecords.filter(r =>
      semester2Weeks.some(w => w.id === r.weekId)
    );

    return [
      {
        semester: 'Học kỳ 1',
        weeks: 'Tuần 1-18',
        records: sem1Records.length,
        periods: sem1Records.reduce((sum, r) => sum + (r.periods || 0), 0)
      },
      {
        semester: 'Học kỳ 2',
        weeks: 'Tuần 19-35',
        records: sem2Records.length,
        periods: sem2Records.reduce((sum, r) => sum + (r.periods || 0), 0)
      }
    ];
  };

  const weeklyStats = () => {
    if (!selectedTeacherId) return [];

    return weeks
      .sort((a, b) => b.weekNumber - a.weekNumber)
      .map(week => {
        const weekRecords = myRecords.filter(r => r.weekId === week.id);
        const weekPeriods = weekRecords.reduce((sum, r) => sum + (r.periods || 0), 0);

        if (weekPeriods === 0) return null;

        return {
          weekNumber: week.weekNumber,
          startDate: week.startDate,
          endDate: week.endDate,
          records: weekRecords.length,
          periods: weekPeriods
        };
      })
      .filter(w => w !== null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Báo cáo & Xuất Excel</h2>
        <div className="flex gap-2">
          {isAdmin && selectedTeacherId && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Download size={20} />
              Xuất Excel
            </button>
          )}
        </div>
      </div>

      {/* ===== SỬA: Hiển thị thông tin khác nhau cho Admin và User ===== */}
      {isAdmin ? (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Chọn giáo viên & Loại báo cáo</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giáo viên</label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn giáo viên --</option>
                {availableTeachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} - {(t.subjectIds || []).map(sid => subjects.find(s => s.id === sid)?.name).filter(Boolean).join(', ') || 'Chưa có môn'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại báo cáo</label>
              <select
                value={exportType}
                onChange={(e) => setExportType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="month">Theo tháng</option>
                <option value="week">Theo tuần</option>
                <option value="semester">Theo học kỳ</option>
                <option value="year">Cả năm</option>
              </select>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-full p-2">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-900">Báo cáo của bạn</p>
              <p className="text-sm text-blue-700">
                Bạn đang xem báo cáo của: <strong>{linkedTeacher?.name}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedTeacherId && (
        <>
          {/* Tổng quan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <p className="text-blue-100 text-sm">Tổng số tiết</p>
              <p className="text-3xl font-bold mt-1">{totalPeriods}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <p className="text-green-100 text-sm">Tiết tháng này</p>
              <p className="text-3xl font-bold mt-1">{monthPeriods}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <p className="text-purple-100 text-sm">Số bản ghi</p>
              <p className="text-3xl font-bold mt-1">{myRecords.length}</p>
            </div>
          </div>

          {/* Thông tin giáo viên */}
          {selectedTeacher && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Thông tin giáo viên</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Họ và tên</p>
                  <p className="font-medium text-lg">{selectedTeacher.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Môn dạy</p>
                  <p className="font-medium text-lg">
                    {(selectedTeacher.subjectIds || [])
                      .map(sid => subjects.find(s => s.id === sid)?.name)
                      .filter(Boolean)
                      .join(', ') || 'Chưa có'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lớp chủ nhiệm</p>
                  <p className="font-medium text-lg">
                    {classes.find(c => c.id === selectedTeacher.mainClassId)?.name || 'Chưa có'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-lg">{selectedTeacher.email || 'Chưa có'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs báo cáo */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex gap-2 mb-4 border-b">
              <button
                onClick={() => setReportType('teacher')}
                className={`px-4 py-2 font-medium transition-all ${reportType === 'teacher'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                📊 Theo tháng
              </button>
              <button
                onClick={() => setReportType('week')}
                className={`px-4 py-2 font-medium transition-all ${reportType === 'week'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                📅 Theo tuần
              </button>
              <button
                onClick={() => setReportType('grade')}
                className={`px-4 py-2 font-medium transition-all ${reportType === 'grade'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                🎓 Theo khối
              </button>
              <button
                onClick={() => setReportType('semester')}
                className={`px-4 py-2 font-medium transition-all ${reportType === 'semester'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                📚 Theo học kỳ
              </button>
            </div>

            {/* Báo cáo theo tháng */}
            {reportType === 'teacher' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Tháng</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Số bản ghi</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Tổng tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(month => {
                      const monthData = myRecords.filter(r => {
                        const week = weeks.find(w => w.id === r.weekId);
                        if (!week) return false;
                        const weekDate = new Date(week.startDate);
                        return weekDate.getMonth() === month;
                      });
                      const monthTotal = monthData.reduce((sum, r) => sum + (r.periods || 0), 0);

                      if (monthData.length === 0) return null;

                      return (
                        <tr key={month} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm font-medium">Tháng {month + 1}</td>
                          <td className="px-4 py-2 text-sm">{monthData.length}</td>
                          <td className="px-4 py-2 text-sm font-medium text-blue-600">{monthTotal}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Báo cáo theo tuần */}
            {reportType === 'week' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Tuần</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Thời gian</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Số bản ghi</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Tổng tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {weeklyStats().map((week) => (
                      <tr key={week.weekNumber} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm font-medium text-blue-600">Tuần {week.weekNumber}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {new Date(week.startDate).toLocaleDateString('vi-VN')} - {new Date(week.endDate).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-4 py-2 text-sm">{week.records}</td>
                        <td className="px-4 py-2 text-sm font-medium text-green-600">{week.periods}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Báo cáo theo khối */}
            {reportType === 'grade' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Khối</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Số lớp</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Số bản ghi</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Tổng tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {gradeStats().map((grade) => (
                      <tr key={grade.grade} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm font-medium text-purple-600">Khối {grade.grade}</td>
                        <td className="px-4 py-2 text-sm">{grade.classes}</td>
                        <td className="px-4 py-2 text-sm">{grade.records}</td>
                        <td className="px-4 py-2 text-sm font-medium text-blue-600">{grade.periods}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Báo cáo theo học kỳ */}
            {reportType === 'semester' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Học kỳ</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Tuần học</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Số bản ghi</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Tổng tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {semesterStats().map((sem) => (
                      <tr key={sem.semester} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm font-medium text-orange-600">{sem.semester}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{sem.weeks}</td>
                        <td className="px-4 py-2 text-sm">{sem.records}</td>
                        <td className="px-4 py-2 text-sm font-medium text-green-600">{sem.periods}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {!selectedTeacherId && isAdmin && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">Vui lòng chọn giáo viên để xem báo cáo</p>
        </div>
      )}
    </div>
  );
};

// User Management View (Admin only)
const UserManagementView = ({ users, setUsers, teachers, classes }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'teacher',
    status: 'pending',
    allowedGrades: []
  });
  const [editingUser, setEditingUser] = useState(null);

  // Lấy danh sách khối duy nhất
  const uniqueGrades = [...new Set(classes.map(c => c.grade))].sort();

  const handleAdd = () => {
    if (!formData.username || !formData.password || !formData.name || !formData.email) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    if (users.find(u => u.username === formData.username)) {
      alert('Tên đăng nhập đã tồn tại!');
      return;
    }

    if (users.find(u => u.email === formData.email)) {
      alert('Email đã tồn tại!');
      return;
    }

    setUsers([...users, { ...formData }]);
    setFormData({ username: '', password: '', name: '', email: '', role: 'teacher', status: 'pending', allowedGrades: [] });
    setShowForm(false);
    alert('Đã thêm người dùng!');
  };

  const handleApprove = (username) => {
    setUsers(users.map(u =>
      u.username === username ? { ...u, status: 'approved' } : u
    ));
    alert('Đã duyệt tài khoản!');
  };

  const handleReject = (username) => {
    if (confirm('Từ chối tài khoản này?')) {
      setUsers(users.map(u =>
        u.username === username ? { ...u, status: 'rejected' } : u
      ));
    }
  };

  const handleDelete = (username) => {
    if (username === 'admin') {
      alert('Không thể xóa tài khoản admin!');
      return;
    }
    if (confirm('Xóa người dùng này?')) {
      setUsers(users.filter(u => u.username !== username));
    }
  };

  const handleEditGrades = (user) => {
    setEditingUser({ ...user, allowedGrades: user.allowedGrades || [] });
  };

  const handleSaveGrades = () => {
    setUsers(users.map(u =>
      u.username === editingUser.username ? editingUser : u
    ));
    setEditingUser(null);
    alert('Đã cập nhật phân quyền khối!');
  };

  const toggleGrade = (grade) => {
    const currentGrades = editingUser.allowedGrades || [];
    if (currentGrades.includes(grade)) {
      setEditingUser({
        ...editingUser,
        allowedGrades: currentGrades.filter(g => g !== grade)
      });
    } else {
      setEditingUser({
        ...editingUser,
        allowedGrades: [...currentGrades, grade]
      });
    }
  };

  const pendingUsers = users.filter(u => u.status === 'pending');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý Người dùng</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <UserPlus size={20} />
          Thêm người dùng
        </button>
      </div>

      {editingUser && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-300">
          <h3 className="text-lg font-semibold mb-4">Phân quyền khối cho: {editingUser.name}</h3>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-3">
              {editingUser.allowedGrades?.length === 0 ?
                '🔓 Có quyền nhập tất cả các khối' :
                `🔒 Chỉ được nhập khối: ${editingUser.allowedGrades?.join(', ')}`}
            </p>
            <div className="flex flex-wrap gap-2">
              {uniqueGrades.map(grade => (
                <button
                  key={grade}
                  onClick={() => toggleGrade(grade)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${(editingUser.allowedGrades || []).includes(grade)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                    }`}
                >
                  Khối {grade}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Để trống = cho phép nhập tất cả khối. Chọn khối cụ thể để giới hạn.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveGrades}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Lưu
            </button>
            <button
              onClick={() => setEditingUser(null)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Thêm người dùng mới</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="teacher">Giáo viên</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Thêm
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {pendingUsers.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-yellow-600">Tài khoản chờ duyệt ({pendingUsers.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên đăng nhập</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ và tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingUsers.map((user) => (
                  <tr key={user.username} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.username}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.role === 'admin' ? (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Admin</span>
                      ) : (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Giáo viên</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button
                        onClick={() => handleApprove(user.username)}
                        className="text-green-600 hover:text-green-800"
                        title="Duyệt"
                      >
                        <CheckCircle size={20} />
                      </button>
                      <button
                        onClick={() => handleReject(user.username)}
                        className="text-red-600 hover:text-red-800"
                        title="Từ chối"
                      >
                        <XCircle size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold">Tất cả tài khoản</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên đăng nhập</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ và tên</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => {
              const linkedTeacher = teachers.find(t => t.userId === user.username);
              return (
                <tr key={user.username} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.username}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.name}
                    {linkedTeacher && (
                      <span className="ml-2 text-xs text-green-600">(Đã liên kết GV)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.role === 'admin' ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Admin</span>
                    ) : (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Giáo viên</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.status === 'approved' ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Đã duyệt</span>
                    ) : user.status === 'rejected' ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Đã từ chối</span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Chờ duyệt</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      {user.role === 'teacher' && (
                        <button
                          onClick={() => handleEditGrades(user)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Phân quyền khối"
                        >
                          <Lock size={16} />
                        </button>
                      )}
                      {user.username !== 'admin' && (
                        <button
                          onClick={() => handleDelete(user.username)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
// Sidebar Component
// Sidebar Component (SỬA LẠI)
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
      <NavButton icon={BarChart3} label="Tổng quan" view="dashboard" />
      {isAdmin && (
        <>
          <NavButton icon={Users} label="Giáo viên" view="teachers" />
          <NavButton icon={BookOpen} label="Lớp học" view="classes" />
          <NavButton icon={FileSpreadsheet} label="Môn học" view="subjects" />
          <NavButton icon={Clock} label="Tuần học" view="weeks" />  {/* THÊM DÒNG NÀY */}
        </>
      )}
      <NavButton icon={Edit2} label="Nhập tiết dạy" view="input" />
      <NavButton icon={Download} label="Báo cáo" view="report" />
      {isAdmin && <NavButton icon={Lock} label="Người dùng" view="users" />}
    </div>
  );
};
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