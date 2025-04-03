import { useState } from 'react';
import { useAuth } from '../../../lib/hooks/useAuth';
import { LogOut } from 'lucide-react';

export default function LogoutButton({ className = '', variant = 'default' }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      setIsLoggingOut(true);
      try {
        await logout();
        // No need to navigate - AuthContext.logout already does this
      } catch (error) {
        console.error('Logout error:', error);
        alert('There was an error logging out. Please try again.');
      } finally {
        setIsLoggingOut(false);
      }
    }
  };
  
  const getButtonStyles = () => {
    if (variant === 'icon') {
      return 'p-2 rounded-full hover:bg-gray-100';
    } else if (variant === 'menu') {
      return 'flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left';
    } else {
      return 'flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900';
    }
  };
  
  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`${getButtonStyles()} ${className} ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label="Log out"
    >
      {variant !== 'text' && (
        <LogOut className={variant === 'icon' ? 'h-5 w-5' : 'h-4 w-4 mr-2'} />
      )}
      {variant !== 'icon' && (isLoggingOut ? 'Logging out...' : 'Log out')}
    </button>
  );
}