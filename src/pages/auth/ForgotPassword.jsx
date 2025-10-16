import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Mail, ArrowLeft, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/auth';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await authAPI.forgotPassword({ email });
    
    // Check if the response has a message (even for non-existent users)
    if (response.data && response.data.message) {
      toast.success('If an account with that email exists, password reset instructions have been sent.');
      setSubmitted(true);
    } else {
      toast.success('Password reset instructions sent to your email');
      setSubmitted(true);
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    
    // Handle different error scenarios
    if (error.response?.status === 400) {
      // Validation error from backend
      const errorDetails = error.response.data.details;
      if (errorDetails && errorDetails.length > 0) {
        toast.error(errorDetails[0].msg || 'Validation failed');
      } else {
        toast.error(error.response.data.error || 'Invalid email format');
      }
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(error.response?.data?.error || 'Failed to send reset instructions');
    }
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Shield className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your university email address and we'll send you instructions to reset your password.
          </p>
        </div>

        <Card>
          <Card.Content>
            {submitted ? (
              <div className="text-center space-y-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
                <p className="text-sm text-gray-600">
                  We've sent password reset instructions to <strong>{email}</strong>
                </p>
                <p className="text-xs text-gray-500">
                  The reset link will expire in 1 hour.
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={() => setSubmitted(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Try another email
                  </Button>
                  <Link to="/login" className="block">
                    <Button variant="ghost" className="w-full">
                      Back to login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    University Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="username@paruluniversity.ac.in"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Only @paruluniversity.ac.in emails are accepted
                  </p>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full"
                >
                  Send reset instructions
                </Button>
              </form>
            )}
          </Card.Content>
        </Card>

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;