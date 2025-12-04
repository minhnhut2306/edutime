import React, { useState } from 'react';
import { Key, Eye, EyeOff, AlertCircle, Loader, CheckCircle } from 'lucide-react';
import { authAPI } from '../api/authAPI';

const ChangePasswordView = ({ onClose, onSuccess, onLogout }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChangePassword = async () => {
    setError('');

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự!');
      return;
    }

    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!specialCharRegex.test(newPassword)) {
      setError('Mật khẩu mới phải có ít nhất 1 ký tự đặc biệt!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (oldPassword === newPassword) {
      setError('Mật khẩu mới phải khác mật khẩu cũ!');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.changePasswordWithOld(oldPassword, newPassword);
      
      if (response.code === 200) {
        setSuccess(true);
        
        // Đợi 2 giây để user đọc thông báo
        setTimeout(() => {
          // Xóa token ngay lập tức
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          if (onClose) onClose();
          if (onSuccess) onSuccess();
          
          // Đăng xuất và reload trang
          if (onLogout) {
            onLogout();
          } else {
            window.location.reload();
          }
        }, 2000);
      } else {
        setError(response.msg || 'Đổi mật khẩu thất bại');
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Mật khẩu cũ không đúng hoặc có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Đổi mật khẩu</h2>
          <p className="text-gray-500 mt-2">Nhập mật khẩu cũ và mật khẩu mới</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
              <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-medium text-green-800">Đổi mật khẩu thành công!</p>
                <p className="text-sm text-green-700 mt-1">
                  Vui lòng đăng nhập lại với mật khẩu mới.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 text-green-600">
              <Loader className="animate-spin" size={16} />
              <p className="text-xs">Đang đăng xuất...</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu cũ
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập mật khẩu hiện tại"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-3.5 text-gray-500"
                disabled={loading}
              >
                {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tối thiểu 8 ký tự, có ký tự đặc biệt"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-3.5 text-gray-500"
                disabled={loading}
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập lại mật khẩu mới"
                disabled={loading}
                onKeyPress={(e) => e.key === 'Enter' && handleChangePassword()}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3.5 text-gray-500"
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={loading || success}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              onClick={handleChangePassword}
              disabled={loading || success}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Đang xử lý...
                </>
              ) : success ? (
                <>
                  <CheckCircle size={20} />
                  Thành công!
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Đổi mật khẩu
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Yêu cầu mật khẩu mới:</p>
          <ul className="mt-2 space-y-1 text-xs">
            <li>• Tối thiểu 8 ký tự</li>
            <li>• Có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)</li>
            <li>• Phải khác mật khẩu cũ</li>
          </ul>
        
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordView;