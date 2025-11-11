import React, { useState } from 'react';
import { Edit2, Trash2, Download, Upload, Plus } from 'react-feather';
import ExcelService from '../service/ExcelService';


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


export default TeachersView;