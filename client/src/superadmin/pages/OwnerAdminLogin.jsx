import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function OwnerAdminLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState('credentials'); // 'credentials' or 'otp'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adminId, setAdminId] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/super-admin/auth/login', {
        email: formData.email,
        password: formData.password
      });

      if (response.data.success && response.data.requiresOTP) {
        setAdminId(response.data.adminId);
        setStep('otp');
        setOtpSent(true);
      } else if (response.data.success) {
        // Login successful without OTP (shouldn't happen for super admin)
        navigate('/owner-admin/dashboard');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.otp) {
      setError('OTP is required');
      return;
    }

    if (formData.otp.length !== 8) {
      setError('OTP must be 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/super-admin/auth/login', {
        email: formData.email,
        password: formData.password,
        otp: formData.otp
      });

      if (response.data.success) {
        // Store admin info and redirect
        localStorage.setItem('adminRole', response.data.admin.role);
        localStorage.setItem('adminName', response.data.admin.name);
        navigate('/owner-admin/dashboard');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'OTP verification failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setError('');
    setLoading(true);

    try {
      await axios.post('/api/super-admin/auth/login', {
        email: formData.email,
        password: formData.password
      });
      setError('');
      alert('New OTP sent to your email');
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // Auto-format OTP input
  useEffect(() => {
    if (formData.otp.length === 8 && step === 'otp') {
      // Auto-submit when 8 characters are entered
      setTimeout(() => {
        handleOtpSubmit({ preventDefault: () => {} });
      }, 500);
    }
  }, [formData.otp]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <span className="text-2xl text-white font-bold">🟦</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Moohaar Owner Admin</h1>
          <p className="text-gray-600">
            {step === 'credentials' ? 'Sign in to your account' : 'Enter verification code'}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'credentials' ? 'bg-primary text-white' : 'bg-green-500 text-white'
            }`}>
              {step === 'credentials' ? '1' : '✓'}
            </div>
            <div className={`w-16 h-1 ${step === 'otp' ? 'bg-primary' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'otp' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              2
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Credentials Step */}
        {step === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Continue'
              )}
            </button>
          </form>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                <span className="text-green-600">📧</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                We've sent an 8-character verification code to<br />
                <strong>{formData.email}</strong>
              </p>
            </div>

            <form onSubmit={handleOtpSubmit}>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-center text-lg font-mono tracking-widest uppercase"
                  placeholder="Enter 8-digit code"
                  maxLength={8}
                  required
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Code expires in 10 minutes
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || formData.otp.length !== 8}
                className="w-full mt-4 bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify & Sign In'
                )}
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={resendOTP}
                disabled={loading}
                className="text-sm text-primary hover:text-blue-700 font-medium"
              >
                Didn't receive the code? Resend
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  setStep('credentials');
                  setFormData({ ...formData, otp: '' });
                  setError('');
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to login
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        {step === 'credentials' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need to register?{' '}
              <button
                onClick={() => navigate('/sufimoohaaradmin')}
                className="font-medium text-primary hover:text-blue-700"
              >
                Register here
              </button>
            </p>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-blue-600">🔐</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Security Active</h3>
              <p className="mt-1 text-sm text-blue-700">
                Two-factor authentication is required for all admin access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}