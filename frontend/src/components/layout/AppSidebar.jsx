import { NavLink } from 'react-router-dom';
import { X, Home, MapPin, Calendar, Clock, Users, Bus, Route, Settings, CreditCard } from 'lucide-react';
import LogoutButton from '../auth/LogoutButton';

// Navigation items based on user role
const getNavItems = (role) => {
  if (role === 'operator') {
    return [
      { name: 'Dashboard', icon: Home, href: '/operator/dashboard' },
      { name: 'Buses', icon: Bus, href: '/operator/buses' },
      { name: 'Routes', icon: Route, href: '/operator/routes' },
      { name: 'Schedules', icon: Calendar, href: '/operator/schedules' },
      { name: 'Bookings', icon: CreditCard, href: '/operator/bookings' },
      { name: 'Drivers', icon: Users, href: '/operator/drivers' },
      { name: 'Settings', icon: Settings, href: '/operator/settings' },
    ];
  }
  
  // Default commuter navigation
  return [
    { name: 'Routes', icon: MapPin, href: '/routes' },
    { name: 'My Bookings', icon: CreditCard, href: '/bookings' },
    { name: 'Trip History', icon: Clock, href: '/history' },
    { name: 'Profile', icon: Settings, href: '/profile' },
  ];
};

export default function AppSidebar({ isOpen, onClose, userRole }) {
  const navItems = getNavItems(userRole);
  
  return (
    <>
      {/* Mobile sidebar */}
      <div 
        className={`fixed inset-0 z-50 flex transform lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}
      >
        <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4">
          <div className="absolute top-0 right-0 pt-2 pr-2">
            <button
              type="button"
              className="rounded-md p-2 text-gray-400 hover:bg-gray-100"
              onClick={onClose}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <SidebarContent navItems={navItems} userRole={userRole} />
        </div>
      </div>
      
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <SidebarContent navItems={navItems} userRole={userRole} />
          </div>
        </div>
      </div>
    </>
  );
}

function SidebarContent({ navItems, userRole }) {
  return (
    <>
      <div className="flex flex-shrink-0 items-center px-4">
        <div className="h-8 w-auto text-blue-600 font-bold text-xl">Zurura</div>
      </div>
      <div className="mt-6 px-3">
        <div className="rounded-md bg-blue-50 p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold">
                {userRole === 'operator' ? 'OP' : 'CO'}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800 capitalize">{userRole}</p>
              <p className="text-xs text-blue-600">{userRole === 'operator' ? 'Manage your fleet' : 'Book your next trip'}</p>
            </div>
          </div>
        </div>
      </div>
      <nav className="mt-5 flex-1 space-y-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="flex-shrink-0 border-t border-gray-200 p-4">
        <LogoutButton variant="menu" className="w-full justify-start" />
      </div>
    </>
  );
}