import React, { useState, useEffect } from 'react';
import { Shield, Trash2, Loader, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// Cache data ở ngoài component để giữ khi unmount
let cachedUsers = null;

const UserManagementView = () => {
  // Khởi tạo từ cache nếu có
  const [users, setUsers] = useState(cachedUsers || []);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { fetchAllUsers, updateUserRole, deleteUser, loading, error } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    // Nếu có cache thì không hiển thị loading khi load lại
    if (!cachedUsers) {
      setIsLoadingData(true);
    }
    
    try {
      const result = await fetchAllUsers();
      if (result.success) {
        setUsers(result.users);
        cachedUsers = result.users; // Lưu vào cache
      } else {
        alert(result.message || 'Không thể tải danh sách người dùng');
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const confirmMsg = currentRole === 'admin'
      ? 'Hạ quyền admin thành user?'
      : 'Cấp quyền admin cho user này?';

    if (!confirm(confirmMsg)) return;

    const result = await updateUserRole(userId, newRole);
    if (result.success) {
      // Xóa cache để load lại data mới
      cachedUsers = null;
      await loadUsers();
      alert('Cập nhật quyền thành công!');
    } else {
      alert(result.message || 'Cập nhật quyền thất bại');
    }
  };

  const handleDelete = async (userId, userEmail) => {
    if (!confirm(`Xóa người dùng ${userEmail}?`)) return;

    const result = await deleteUser(userId);
    if (result.success) {
      // Xóa cache để load lại data mới
      cachedUsers = null;
      await loadUsers();
      alert('Xóa người dùng thành công!');
    } else {
      alert(result.message || 'Xóa người dùng thất bại');
    }
  };

  const handleRefresh = async () => {
    // Xóa cache và load lại
    cachedUsers = null;
    await loadUsers();
  };

  let myUser = null;
  try {
    const stored = localStorage.getItem('user');
    if (stored) {
      myUser = JSON.parse(stored);
    }
  } catch (err) {
    console.error('Lỗi parse user:', err);
  }

  const otherUsers = users.filter(user => user._id !== myUser?._id);

  // Hiển thị loader chỉ khi loading lần đầu và chưa có data
  if (isLoadingData && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-blue-600" size={48} />
          <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tài khoản của tôi */}
      {myUser && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-md p-6 border border-blue-200">
          <h2 className="text-lg font-bold text-blue-900 mb-4">Tài khoản của tôi</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 mb-1"><span className="font-semibold">Email:</span> {myUser.email}</p>
              <p className="text-sm text-blue-700"><span className="font-semibold">Vai trò:</span>
                <span className="ml-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  {myUser.role === 'admin' ? 'Admin' : 'User'}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-600">Trạng thái: <span className="font-semibold text-green-600">{myUser.status}</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Danh sách người dùng */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Quản lý Người dùng</h2>
          <button
            onClick={handleRefresh}
            disabled={loading || isLoadingData}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={20} className={(loading || isLoadingData) ? 'animate-spin' : ''} />
            Tải lại
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {otherUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    Không có người dùng nào để quản lý
                  </td>
                </tr>
              ) : (
                otherUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      {user.role === 'admin' ? (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          Admin
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleChangeRole(user._id, user.role)}
                          disabled={loading || isLoadingData}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={user.role === 'admin' ? 'Hạ quyền về User' : 'Cấp quyền Admin'}
                        >
                          <Shield size={16} />
                          <span className="text-xs">
                            {user.role === 'admin' ? 'Hạ quyền' : 'Cấp quyền'}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(user._id, user.email)}
                          disabled={loading || isLoadingData}
                          className="flex items-center gap-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                          title="Xóa người dùng"
                        >
                          <Trash2 size={16} />
                          <span className="text-xs">Xóa</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementView;