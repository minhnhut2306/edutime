
import React from 'react';
import { Trash2, Plus } from 'react-feather';


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
export default SubjectsView;