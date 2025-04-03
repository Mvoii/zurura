import { Link } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';

export default function RegisterPage() {
  return (
    <AuthLayout 
      title="Create an Account" 
      subtitle="Choose your account type to get started"
    >
      <div className="space-y-4 mt-8">
        <Link 
          to="/auth/register/commuter"
          className="block w-full py-3 px-4 text-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          Register as Commuter
        </Link>
        
        <Link 
          to="/auth/register/operator"
          className="block w-full py-3 px-4 text-center border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition"
        >
          Register as Bus Operator
        </Link>
        
        <div className="text-center mt-6">
          <span className="text-sm text-gray-600">Already have an account?</span>
          <Link to="/auth/login" className="ml-1 text-sm font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}