// src/components/RegisterView.jsx
import React, { useState } from 'react';
import { Calendar, Eye, EyeOff, AlertCircle, Loader, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const RegisterView = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register, loading, error } = useAuth();
  const [localError, setLocalError] = useState('');

  const handleRegister = async () => {
    setLocalError('');

    // Validation
    if (!email || !password || !confirmPassword) {
      setLocalError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Email không đúng định dạng!');
      return;
    }

    // Password length
    if (password.length < 8) {
      setLocalError('Mật khẩu phải có ít nhất 8 ký tự!');
      return;
    }

    // Password special char
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!specialCharRegex.test(password)) {
      setLocalError('Mật khẩu phải có ít nhất 1 ký tự đặc biệt!');
      return;
    }

    // Password match
    if (password !== confirmPassword) {
      setLocalError('Mật khẩu xác nhận không khớp!');
      return;
    }

    const result = await register(email, password);
    
    if (result.success) {
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      onBackToLogin();
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Đăng ký tài khoản</h1>
          <p className="text-gray-500 mt-2">Tạo tài khoản mới để sử dụng EduTime</p>
        </div>

        {displayError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-red-700">{displayError}</p>
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
              placeholder="example@email.com"
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
                placeholder="Tối thiểu 8 ký tự, có ký tự đặc biệt"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập lại mật khẩu"
                onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
                disabled={loading}
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

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={20} />
                Đang đăng ký...
              </>
            ) : (
              'Đăng ký'
            )}
          </button>

          <button
            onClick={onBackToLogin}
            disabled={loading}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-medium flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} />
            Quay lại đăng nhập
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Yêu cầu mật khẩu:</p>
          <ul className="mt-2 space-y-1 text-xs">
            <li>• Tối thiểu 8 ký tự</li>
            <li>• Có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RegisterView;