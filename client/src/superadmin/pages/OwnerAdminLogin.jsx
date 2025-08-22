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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">🟦 Moohaar</h1>
          <p className="text-lg text-gray-600 mb-4">Owner Admin Login</p>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {step === 'credentials' ? 'Sign in to your account' : 'Enter verification code'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 'credentials' ? 'Access your owner admin dashboard' : 'Check your email for the 8-character code'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Credentials Step */}
          {step === 'credentials' && (
            <form className="space-y-6" onSubmit={handleCredentialsSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
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
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                    Verification Code
                  </label>
                  <div className="mt-1">
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      value={formData.otp}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-center text-lg font-mono tracking-widest uppercase"
                      placeholder="Enter 8-digit code"
                      maxLength={8}
                      required
                      autoFocus
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 text-center">
                    Code expires in 10 minutes
                  </p>
                </div>

                <div className="mt-4">
                  <button
                    type="submit"
                    disabled={loading || formData.otp.length !== 8}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Verifying...
                      </div>
                    ) : (
                      'Verify & Sign In'
                    )}
                  </button>
                </div>
              </form>

              <div className="text-center space-y-2">
                <button
                  onClick={resendOTP}
                  disabled={loading}
                  className="text-sm text-primary hover:text-blue-700 font-medium"
                >
                  Didn't receive the code? Resend
                </button>
                <br />
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
                  type="button"
                  onClick={() => navigate('/sufimoohaaradmin')}
                  className="font-medium text-primary hover:text-blue-700"
                >
                  Register here
                </button>
              </p>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
    </div>
  );
}