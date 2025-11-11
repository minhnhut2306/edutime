import * as XLSX from 'xlsx';

const ExcelService = {
  downloadTemplate() {
    const wsTeachers = XLSX.utils.json_to_sheet([
      { 'Mã GV': 'GV001', 'Họ và tên': 'Nguyễn Văn A', 'Email': 'nva@school.edu.vn', 'Số điện thoại': '0901234567' }
    ]);
    
    const wsClasses = XLSX.utils.json_to_sheet([
      { 'Mã lớp': 'L6A1', 'Tên lớp': '6A1', 'Khối': '6', 'Sĩ số': '35' }
    ]);
    
    const wsSubjects = XLSX.utils.json_to_sheet([
      { 'Mã môn': 'TOAN', 'Tên môn': 'Toán', 'Số tiết/tuần': '5' }
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsTeachers, 'Danh sách GV');
    XLSX.utils.book_append_sheet(wb, wsClasses, 'Danh sách lớp');
    XLSX.utils.book_append_sheet(wb, wsSubjects, 'Danh sách môn');
    
    XLSX.writeFile(wb, 'EduTime_Template.xlsx');
  },

  handleImport(file, onSuccess) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });

        const result = {
          teachers: [],
          classes: [],
          subjects: []
        };

        // Import Teachers
        if (wb.SheetNames.includes('Danh sách GV')) {
          const wsTeachers = wb.Sheets['Danh sách GV'];
          const dataTeachers = XLSX.utils.sheet_to_json(wsTeachers);
          result.teachers = dataTeachers.map((row, idx) => ({
            id: row['Mã GV'] || `GV${String(idx + 1).padStart(3, '0')}`,
            name: row['Họ và tên'] || '',
            email: row['Email'] || '',
            phone: row['Số điện thoại'] || ''
          }));
        }

        // Import Classes
        if (wb.SheetNames.includes('Danh sách lớp')) {
          const wsClasses = wb.Sheets['Danh sách lớp'];
          const dataClasses = XLSX.utils.sheet_to_json(wsClasses);
          result.classes = dataClasses.map((row, idx) => ({
            id: row['Mã lớp'] || `L${String(idx + 1).padStart(3, '0')}`,
            name: row['Tên lớp'] || '',
            grade: row['Khối'] || '',
            studentCount: row['Sĩ số'] || 0
          }));
        }

        // Import Subjects
        if (wb.SheetNames.includes('Danh sách môn')) {
          const wsSubjects = wb.Sheets['Danh sách môn'];
          const dataSubjects = XLSX.utils.sheet_to_json(wsSubjects);
          result.subjects = dataSubjects.map((row, idx) => ({
            id: row['Mã môn'] || `MH${String(idx + 1).padStart(3, '0')}`,
            name: row['Tên môn'] || '',
            periodsPerWeek: row['Số tiết/tuần'] || 0
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
  },

  exportToExcel(teachers, classes, teachingData, schoolYear, selectedSemester, subjects = []) {
    if (teachers.length === 0) {
      alert('Chưa có dữ liệu giáo viên để xuất!');
      return;
    }

    const exportType = confirm('Xuất file riêng cho từng giáo viên?\n\nOK = Xuất riêng (mỗi GV 1 file)\nHủy = Xuất tổng hợp (1 file chung)');

    if (exportType) {
      // Xuất riêng từng giáo viên
      teachers.forEach((teacher) => {
        const teacherData = teachingData.filter(td => td.teacherId === teacher.id);
        
        const wsInfo = XLSX.utils.json_to_sheet([
          { 'Thông tin': 'Mã giáo viên', 'Giá trị': teacher.id },
          { 'Thông tin': 'Họ và tên', 'Giá trị': teacher.name },
          { 'Thông tin': 'Email', 'Giá trị': teacher.email },
          { 'Thông tin': 'Số điện thoại', 'Giá trị': teacher.phone },
          { 'Thông tin': 'Năm học', 'Giá trị': schoolYear },
          { 'Thông tin': 'Học kỳ', 'Giá trị': selectedSemester },
        ]);

        const wsTeaching = XLSX.utils.json_to_sheet(
          teacherData.length > 0 ? teacherData.map(td => ({
            'Tuần': td.week,
            'Lớp': classes.find(c => c.id === td.classId)?.name || td.classId,
            'Môn': subjects.find(s => s.id === td.subjectId)?.name || td.subjectId,
            'Số tiết': td.periods
          })) : [{ 'Thông báo': 'Chưa có dữ liệu giờ dạy' }]
        );

        const classSummary = {};
        teacherData.forEach(td => {
          const className = classes.find(c => c.id === td.classId)?.name || td.classId;
          if (!classSummary[className]) {
            classSummary[className] = 0;
          }
          classSummary[className] += td.periods || 0;
        });

        const wsSummary = XLSX.utils.json_to_sheet(
          Object.keys(classSummary).length > 0 
            ? Object.entries(classSummary).map(([className, total]) => ({
                'Lớp': className,
                'Tổng số tiết': total
              }))
            : [{ 'Thông báo': 'Chưa có dữ liệu tổng hợp' }]
        );

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, wsInfo, 'Thông tin GV');
        XLSX.utils.book_append_sheet(wb, wsTeaching, 'Chi tiết giờ dạy');
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng hợp theo lớp');

        const fileName = `GioDay_${teacher.id}_${teacher.name.replace(/\s+/g, '_')}_${schoolYear}_${selectedSemester}.xlsx`;
        XLSX.writeFile(wb, fileName);
      });

      alert(`Đã xuất ${teachers.length} file Excel (mỗi giáo viên 1 file)!`);
    } else {
      // Xuất file tổng hợp
      const wsTeachers = XLSX.utils.json_to_sheet(
        teachers.map(t => ({
          'Mã GV': t.id,
          'Họ và tên': t.name,
          'Email': t.email,
          'Số điện thoại': t.phone
        }))
      );
      
      const wsClasses = XLSX.utils.json_to_sheet(
        classes.map(c => ({
          'Mã lớp': c.id,
          'Tên lớp': c.name,
          'Khối': c.grade,
          'Sĩ số': c.studentCount
        }))
      );

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsTeachers, 'Danh sách GV');
      XLSX.utils.book_append_sheet(wb, wsClasses, 'Danh sách lớp');
      
      XLSX.writeFile(wb, `EduTime_TongHop_${schoolYear}_${selectedSemester}.xlsx`);
      alert('Đã xuất file tổng hợp!');
    }
  }
};
export default ExcelService;