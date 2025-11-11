import React from 'react';
import { Download, Upload, FileSpreadsheet, Plus, Edit2, Trash2 } from 'lucide-react';
import ExcelService from '../service/ExcelService';

const TeachersView = ({ 
  teachers, 
  setTeachers, 
  classes,
  teachingData,
  schoolYear,
  selectedSemester
}) => {
  const handleImportExcel = (e) => {
    ExcelService.handleImport(e.target.files[0], (result) => {
      if (result.teachers.length > 0) {
        setTeachers(prev => [...prev, ...result.teachers]);
      }
    });
  };

  const handleExport = () => {
    ExcelService.exportToExcel(teachers, classes, teachingData, schoolYear, selectedSemester);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý Giáo viên</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={ExcelService.downloadTemplate}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            <Download size={20} />
            Tải file mẫu
          </button>
          
          <label className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer">
            <Upload size={20} />
            <span>Import Excel</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              className="hidden"
            />
          </label>
          
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
          >
            <FileSpreadsheet size={20} />
            Xuất Excel
          </button>
          
          <button
            onClick={() => {
              const name = prompt('Nhập họ tên giáo viên:');
              if (name) {
                const newTeacher = {
                  id: `GV${String(teachers.length + 1).padStart(3, '0')}`,
                  name,
                  email: '',
                  phone: ''
                };
                setTeachers([...teachers, newTeacher]);
              }
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Thêm giáo viên
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã GV</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ và tên</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số điện thoại</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {teachers.map((teacher) => (
              <tr key={teacher.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{teacher.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{teacher.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{teacher.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{teacher.phone}</td>
                <td className="px-6 py-4 text-sm">
                  <button className="text-blue-600 hover:text-blue-800 mr-3">
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Xóa giáo viên này?')) {
                        setTeachers(teachers.filter(t => t.id !== teacher.id));
                      }
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default TeachersView;