import { Link } from 'react-router-dom';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-white">
      {/* Left Side - Form */}
      <div className="flex flex-col justify-center md:w-1/2 p-8 md:p-12 lg:p-16">
        {/* Logo and Header */}
        <div className="mb-8">
          <Link to="/" className="flex items-center mb-6">
            <img src="/logo.svg" alt="Zurura Logo" className="h-8 w-auto" />
            <span className="ml-2 text-2xl font-bold text-gray-900">Zurura</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
          <p className="mt-2 text-gray-600">{subtitle}</p>
        </div>
        
        {/* Content (Form) */}
        {children}
      </div>
      
      {/* Right Side - Image/Background */}
      <div className="hidden md:block md:w-1/2 bg-blue-600">
        <div className="flex flex-col justify-center items-center h-full text-white p-12">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold mb-4">Travel Smarter with Zurura</h2>
            <p className="text-blue-100 mb-6">
              The modern way to book and track your bus journeys across the city.
              Real-time updates, easy booking, and hassle-free travel.
            </p>
            <img
              src="/auth-illustration.svg"
              alt="Bus illustration"
              className="w-full max-w-sm mx-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}