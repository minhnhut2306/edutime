import React from 'react';
import { Trash2, Upload, Plus } from 'react-feather';
import ExcelService from '../service/ExcelService';

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

export default ClassesView;