
import * as XLSX from 'xlsx';


const ExcelService = {
  exportTeacherReport(teacher, teachingData, schoolYear, classes, subjects) {
    const wb = XLSX.utils.book_new();

    // Lấy thông tin lớp chủ nhiệm
    // eslint-disable-next-line no-unused-vars
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

export default ExcelService;