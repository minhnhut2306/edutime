import * as XLSX from 'xlsx';

const ExcelService = {
  downloadTemplate(schoolYear) {
    const wsTeachers = XLSX.utils.json_to_sheet([
      { 'Họ và tên': 'Nguyễn Văn A', 'Số điện thoại': '0901234567', 'Môn dạy': 'Toán', 'Lớp chủ nhiệm': '6A1' }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsTeachers, 'Danh sách GV');
    XLSX.writeFile(wb, `EduTime_Template_${schoolYear}.xlsx`);
  },

  handleImport(file, onSuccess) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });

        const result = { teachers: [] };

        if (wb.SheetNames.includes('Danh sách GV')) {
          const ws = wb.Sheets['Danh sách GV'];
          const data = XLSX.utils.sheet_to_json(ws);
          result.teachers = data.map((row, idx) => {
            let phone = row['Số điện thoại'] || '';
            if (phone) {
              phone = String(phone);
              if (phone.length === 9 && !phone.startsWith('0')) {
                phone = '0' + phone;
              }
            }

            const subjectNames = (row['Môn dạy'] || '').split(',').map(s => s.trim()).filter(Boolean);
            return {
              id: `GV${String(idx + 1).padStart(3, '0')}`,
              name: row['Họ và tên'] || '',
              phone: phone,
              subjectNames: subjectNames,
              mainClassName: row['Lớp chủ nhiệm'] || ''
            };
          });
        }

        onSuccess(result);
      } catch (error) {
        console.error('Error importing:', error);
        alert('Có lỗi khi import dữ liệu!');
      }
    };
    reader.readAsBinaryString(file);
  }
};

export default ExcelService;