import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';

interface UserDropdownProps {
  user: any; // Replace with your user type
  onLogout: () => void;
  isOperator?: boolean;
  isDriver?: boolean;
  isCommuter?: boolean;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ 
  user, 
  onLogout,
  isOperator,
  isDriver,
  isCommuter
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  // Extract user initials for the avatar
  const getUserInitials = () => {
    if (!user || !user.name) return '?';
    
    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  // Determine user role text
  const getRoleText = () => {
    if (isOperator) return 'Operator';
    if (isDriver) return 'Driver';
    if (isCommuter) return 'Commuter';
    return 'User';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-2 text-gray-700 dark:text-gray-300 focus:outline-none"
        onClick={toggleDropdown}
      >
        <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center">
          {getUserInitials()}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium">{user?.name || 'User'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{getRoleText()}</p>
        </div>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1 px-2">
            {/* User info header */}
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || ''}</p>
            </div>
            
            {/* Menu items */}
            <div className="mt-2">
              <Link 
                to="/profile" 
                className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" 
                onClick={() => setIsOpen(false)}
              >
                <User size={16} className="mr-2" />
                Profile
              </Link>
              
              {/* Role-specific dashboard links */}
              {isOperator && (
                <Link 
                  to="/operator/dashboard" 
                  className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" 
                  onClick={() => setIsOpen(false)}
                >
                  <Settings size={16} className="mr-2" />
                  Operator Dashboard
                </Link>
              )}
              
              {isDriver && (
                <Link 
                  to="/driver/dashboard" 
                  className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" 
                  onClick={() => setIsOpen(false)}
                >
                  <Settings size={16} className="mr-2" />
                  Driver Dashboard
                </Link>
              )}
              
              {isCommuter && (
                <Link 
                  to="/dashboard" 
                  className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md" 
                  onClick={() => setIsOpen(false)}
                >
                  <Settings size={16} className="mr-2" />
                  My Dashboard
                </Link>
              )}
              
              <button
                className="flex w-full items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                onClick={handleLogout}
              >
                <LogOut size={16} className="mr-2" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
