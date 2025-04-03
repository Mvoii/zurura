import { useState } from 'react';
import { Mail } from 'lucide-react';
import { verifyEmail } from '../../lib/api/authService';

const EmailVerification = ({ email, onVerified, onResend }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      // In production, use the actual API call
      // const response = await verifyEmail(code);
      
      // For development/testing
      setTimeout(() => {
        if (code === '123456') { // For demonstration - use actual API verification
          onVerified();
        } else {
          setError('Invalid verification code');
          setIsSubmitting(false);
        }
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to verify code. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-medium text-center">Email Verification</h3>
        <p className="text-center text-sm text-gray-600 mt-1 max-w-xs">
          We've sent a verification code to <strong>{email}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="code" className="block text-sm font-medium text-gray-700">
            Verification Code
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => {
              // Only allow numbers
              const value = e.target.value.replace(/[^0-9]/g, '');
              setCode(value);
              if (error) setError('');
            }}
            placeholder="123456"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || code.length !== 6}
          className={`w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            (isSubmitting || code.length !== 6) ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Verifying..." : "Verify Email"}
        </button>
      </form>

      <div className="text-center text-sm">
        <p className="text-gray-600">
          Didn't receive the code?{" "}
          <button 
            onClick={onResend} 
            className="text-blue-600 hover:underline focus:outline-none"
          >
            Resend Code
          </button>
        </p>
      </div>
    </div>
  );
};

export default EmailVerification;
