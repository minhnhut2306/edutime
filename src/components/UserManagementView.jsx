
import React, { useState } from 'react';
import { UserPlus, Lock, Trash2, CheckCircle, XCircle } from 'lucide-react';

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
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    (editingUser.allowedGrades || []).includes(grade)
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

export default UserManagementView;