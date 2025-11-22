import React, { useState } from 'react';
import { Calendar, Eye, EyeOff, AlertCircle, Loader } from 'react-feather';
import { useAuth } from '../hooks/useAuth';

const LoginView = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, loading, error } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    const result = await login(email, password);
    
    if (result.success) {
      onLogin(result.user, result.token);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">EduTime</h1>
          <p className="text-gray-500 mt-2">Hệ thống Quản lý Giờ Dạy</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập email"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập mật khẩu"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-500"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={20} />
                Đang đăng nhập...
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;