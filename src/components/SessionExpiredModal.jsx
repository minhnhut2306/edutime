// src/components/SessionExpiredModal.jsx - CẬP NHẬT
import React, { useState, useEffect } from 'react';
import { AlertCircle, LogOut, Smartphone, Chrome, Globe } from 'lucide-react';

const SessionExpiredModal = ({ show, onClose, errorMessage }) => {
  const [countdown, setCountdown] = useState(5);
  const [browserInfo, setBrowserInfo] = useState(null);

  useEffect(() => {
    if (show && errorMessage) {
      const match = errorMessage.match(/đăng nhập từ (.+)\./);
      if (match) {
        setBrowserInfo(match[1]);
      }
    }
  }, [show, errorMessage]);

  useEffect(() => {
    if (!show) {
      setCountdown(5);
      setBrowserInfo(null);
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [show]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  if (!show) return null;
  const getBrowserIcon = () => {
    if (!browserInfo) return <Globe className="text-orange-600" size={40} />;
    
    const browserLower = browserInfo.toLowerCase();
    if (browserLower.includes('chrome')) return <Chrome className="text-orange-600" size={40} />;
    if (browserLower.includes('firefox')) return <Globe className="text-orange-600" size={40} />;
    if (browserLower.includes('cốc cốc')) return <Smartphone className="text-orange-600" size={40} />;
    
    return <Globe className="text-orange-600" size={40} />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            {getBrowserIcon()}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Phiên đăng nhập đã hết hạn
          </h2>
          
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg text-left mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm text-orange-800 font-medium">
                  {browserInfo ? (
                    <>
                      Tài khoản của bạn đã được đăng nhập từ <strong>{browserInfo}</strong>
                    </>
                  ) : (
                    'Tài khoản của bạn đã được đăng nhập ở thiết bị/trình duyệt khác'
                  )}
                </p>
                <p className="text-xs text-orange-700 mt-2">
                  Để bảo mật, mỗi tài khoản chỉ có thể đăng nhập trên 1 trình duyệt tại một thời điểm.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700 mb-2">
              Tự động đăng xuất sau
            </p>
            <div className="text-4xl font-bold text-blue-600">
              {countdown}s
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut size={20} />
          Đăng nhập lại ngay
        </button>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700 text-center">
            💡 <strong>Mẹo:</strong> Mỗi trình duyệt (Chrome, Firefox, Cốc Cốc...) được tính là một phiên đăng nhập riêng
          </p>
        </div>

        <p className="text-xs text-gray-500 text-center mt-3">
          Đăng xuất ở trình duyệt cũ trước khi đăng nhập trình duyệt mới để tránh bị gián đoạn
        </p>
      </div>
    </div>
  );
};

export default SessionExpiredModal;