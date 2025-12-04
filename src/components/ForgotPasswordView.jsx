import React, { useState } from 'react';
import { Mail, AlertCircle, Loader, ArrowLeft, Key, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../api/authAPI';

const ForgotPasswordView = ({ onBackToLogin }) => {
  const [step, setStep] = useState('email'); // 'email', 'otp', 'reset'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSendOTP = async () => {
    setError('');
    setSuccessMessage('');

    if (!email) {
      setError('Vui lòng nhập email!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không đúng định dạng!');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.forgotPassword(email);
      
      if (response.code === 200) {
        setSuccessMessage('Mã OTP đã được gửi đến email của bạn!');
        setStep('otp');
      } else {
        setError(response.msg || 'Gửi OTP thất bại');
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Có lỗi xảy ra khi gửi OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    
    if (!otp) {
      setError('Vui lòng nhập mã OTP!');
      return;
    }

    if (otp.length !== 6) {
      setError('Mã OTP phải có 6 chữ số!');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.verifyOTP(email, otp);
      
      if (response.code === 200) {
        setSuccessMessage('Xác thực OTP thành công!');
        setStep('reset');
      } else {
        setError(response.msg || 'Mã OTP không đúng');
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Mã OTP không đúng hoặc đã hết hạn');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    if (newPassword.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự!');
      return;
    }

    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!specialCharRegex.test(newPassword)) {
      setError('Mật khẩu phải có ít nhất 1 ký tự đặc biệt!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.resetPassword(email, otp, newPassword);
      
      if (response.code === 200) {
        alert('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
        onBackToLogin();
      } else {
        setError(response.msg || 'Đặt lại mật khẩu thất bại');
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Quên mật khẩu</h1>
          <p className="text-gray-500 mt-2">
            {step === 'email' && 'Nhập email để nhận mã OTP'}
            {step === 'otp' && 'Nhập mã OTP đã gửi đến email'}
            {step === 'reset' && 'Đặt lại mật khẩu mới'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <Mail className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}

        <div className="space-y-4">
          {step === 'email' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="example@email.com"
                  disabled={loading}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendOTP()}
                />
              </div>

              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Mail size={20} />
                    Gửi mã OTP
                  </>
                )}
              </button>
            </>
          )}

          {step === 'otp' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mã OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  disabled={loading}
                  onKeyPress={(e) => e.key === 'Enter' && handleVerifyOTP()}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Mã OTP có hiệu lực trong 10 phút
                </p>
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Đang xác thực...
                  </>
                ) : (
                  'Xác nhận OTP'
                )}
              </button>

              <button
                onClick={() => setStep('email')}
                disabled={loading}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-medium"
              >
                Gửi lại mã OTP
              </button>
            </>
          )}

          {step === 'reset' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập lại mật khẩu mới"
                    disabled={loading}
                    onKeyPress={(e) => e.key === 'Enter' && handleResetPassword()}
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
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Đang đặt lại...
                  </>
                ) : (
                  'Đặt lại mật khẩu'
                )}
              </button>
            </>
          )}

          <button
            onClick={onBackToLogin}
            disabled={loading}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-medium flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} />
            Quay lại đăng nhập
          </button>
        </div>

        {step === 'reset' && (
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Yêu cầu mật khẩu:</p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• Tối thiểu 8 ký tự</li>
              <li>• Có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordView;