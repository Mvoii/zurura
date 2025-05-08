import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
// import SidebarWidget from "./SidebarWidget";
import { GridIcon } from "../icons";

// Import Lucide React icons
import {
  User,
  Calendar,
  MapPin,
  Home,
  Search,
  Clock,
  History,
  Bus,
  Route,
  // ListChecks,
  ChevronDown,
  MoreHorizontal,
  // PieChart,
  Users,
  Settings,
  // LogIn,
  // UserPlus,
  Ticket,
  Navigation,
  Map,
  AlertCircle
} from "lucide-react";

import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// Define common navigation items accessible by all authenticated users
const commonNavItems: NavItem[] = [
  {
    icon: <User size={20} />,
    name: "Profile",
    path: "/profile",
  },
  {
    icon: <Settings size={20} />,
    name: "Settings",
    path: "/settings",
  },
];

// Define Commuter-specific navigation items
const commuterNavItems: NavItem[] = [
  {
    icon: <Home size={20} />,
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: <Search size={20} />,
    name: "Find Routes",
    path: "/routes",
  },
  {
    icon: <Calendar size={20} />,
    name: "Schedules",
    path: "/schedules",
  },
  {
    icon: <Ticket size={20} />,
    name: "My Bookings",
    path: "/bookings",
  },
  {
    icon: <History size={20} />,
    name: "Trip History",
    path: "/history",
  },
  {
    icon: <Navigation size={20} />,
    name: "Live Tracking",
    path: "/tracking/nearby",
  },
];

// Define Operator-specific navigation items
const operatorNavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/operator/dashboard",
  },
  {
    icon: <Route size={20} />,
    name: "Routes",
    path: "/operator/routes",
  },
  {
    icon: <Bus size={20} />,
    name: "Buses",
    path: "/operator/buses",
  },
  {
    icon: <Calendar size={20} />,
    name: "Schedule",
    subItems: [
      { name: "View Schedules", path: "/operator/schedules", pro: false },
    ],
  },
  {
    icon: <Users size={20} />,
    name: "Drivers",
    path: "/operator/drivers",
  },
  {
    icon: <MapPin size={20} />,
    name: "Stops",
    path: "/operator/stops",
  },
];

// Define Driver-specific navigation items
const driverNavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/driver/dashboard",
  },
  {
    icon: <Map size={20} />,
    name: "Live Tracking",
    path: "/driver/tracking",
  },
  {
    icon: <Clock size={20} />,
    name: "My Schedule",
    path: "/driver/schedule",
  },
  {
    icon: <AlertCircle size={20} />,
    name: "Incident Reports",
    path: "/driver/incidents",
  },
];

// Define unauthenticated user menu items
const unauthenticatedItems: NavItem[] = [
  {
    icon: <Search size={20} />,
    name: "Find Routes",
    path: "/routes",
  },
  {
    icon: <User size={20} />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/auth/signin", pro: false },
      { name: "Sign Up", path: "/auth/signup", pro: false },
    ],
  },
  {
    icon: <Calendar size={20} />,
    name: "Schedules",
    path: "/schedules",
  },
];

const AppSidebar: React.FC = () => {
  // Add auth state using the useAuth hook
  const { user, isAuthenticated, isOperator, isCommuter, isDriver } = useAuth();

  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Step 3: Combine Links Based on Role
  // Now we add logic to determine the final set of navigation items to display

  // Main navigation items (role-specific)
  const mainNavItems = useMemo(() => {
    if (!isAuthenticated) {
      return unauthenticatedItems;
    }
    
    if (isOperator) {
      return operatorNavItems;
    }
    
    if (isDriver) {
      return driverNavItems;
    }
    
    // Default to commuter items
    return commuterNavItems;
  }, [isAuthenticated, isOperator, isDriver]);

  // Secondary navigation items (common to all authenticated users)
  const secondaryNavItems = useMemo(() => {
    if (!isAuthenticated) {
      return []; // No secondary items for unauthenticated users
    }
    
    return commonNavItems;
  }, [isAuthenticated]);
  
  // Log auth state and nav items for debugging
  useEffect(() => {
    console.log("Auth state and navigation:", {
      isAuthenticated,
      user,
      isOperator,
      isCommuter,
      isDriver,
      mainNavItems: mainNavItems.length,
      secondaryNavItems: secondaryNavItems.length
    });
  }, [
    isAuthenticated,
    user,
    isOperator,
    isCommuter,
    isDriver,
    mainNavItems,
    secondaryNavItems
  ]);

  // Check if a path is active
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  // Check for active submenus to keep them open
  useEffect(() => {
    let submenuMatched = false;
    
    // Check main nav items
    mainNavItems.forEach((nav, index) => {
      // Direct path match
      if (nav.path && isActive(nav.path)) {
        submenuMatched = true;
      }
      
      // Submenu match
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({
              type: "main",
              index,
            });
            submenuMatched = true;
          }
        });
      }
    });
    
    // Check secondary nav items
    if (!submenuMatched) {
      secondaryNavItems.forEach((nav, index) => {
        // Direct path match
        if (nav.path && isActive(nav.path)) {
          submenuMatched = true;
        }
        
        // Submenu match
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    }

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, mainNavItems, secondaryNavItems]);

  // Calculate submenu heights for animation
  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  // Toggle submenu open/closed state
  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  // STEP 4: Conditionally render menu items based on roles
  // This function renders menu sections with better role-based organization 
  const renderMenuSection = (
    sectionTitle: string,
    items: NavItem[],
    menuType: "main" | "others"
  ) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div>
        <h2
          className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
            !isExpanded && !isHovered
              ? "lg:justify-center"
              : "justify-start"
          }`}
        >
          {isExpanded || isHovered || isMobileOpen ? (
            sectionTitle
          ) : (
            <MoreHorizontal className="size-6" />
          )}
        </h2>
        <ul className="flex flex-col gap-4">
          {items.map((nav, index) => (
            <li key={`${menuType}-${nav.name}-${index}`}>
              {nav.subItems ? (
                <button
                  onClick={() => handleSubmenuToggle(index, menuType)}
                  className={`menu-item group ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  } cursor-pointer ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "lg:justify-start"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size  ${
                      openSubmenu?.type === menuType && openSubmenu?.index === index
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <ChevronDown
                      className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                        openSubmenu?.type === menuType &&
                        openSubmenu?.index === index
                          ? "rotate-180 text-brand-500"
                          : ""
                      }`}
                    />
                  )}
                </button>
              ) : (
                nav.path && (
                  <Link
                    to={nav.path}
                    className={`menu-item group ${
                      isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                    }`}
                  >
                    <span
                      className={`menu-item-icon-size ${
                        isActive(nav.path)
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"
                      }`}
                    >
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className="menu-item-text">{nav.name}</span>
                    )}
                  </Link>
                )
              )}
              {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                <div
                  ref={(el) => {
                    subMenuRefs.current[`${menuType}-${index}`] = el;
                  }}
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    height:
                      openSubmenu?.type === menuType && openSubmenu?.index === index
                        ? `${subMenuHeight[`${menuType}-${index}`]}px`
                        : "0px",
                  }}
                >
                  <ul className="mt-2 space-y-1 ml-9">
                    {nav.subItems.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path}
                          className={`menu-dropdown-item ${
                            isActive(subItem.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                        >
                          {subItem.name}
                          <span className="flex items-center gap-1 ml-auto">
                            {subItem.new && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                              >
                                new
                              </span>
                            )}
                            {subItem.pro && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                              >
                                pro
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.png"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.png"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.png"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>

      {/* Add a note about the user role if authenticated */}
      {isAuthenticated && (isExpanded || isHovered || isMobileOpen) && (
        <div className="px-2 mb-4 text-sm text-center text-gray-500">
          Logged in as {isOperator ? "Operator" : isDriver ? "Driver" : "Commuter"}
        </div>
      )}

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-6">
            {/* Step 4: Conditionally render menu sections based on role */}
            
            {/* Main navigation section */}
            {renderMenuSection(
              isAuthenticated 
                ? isOperator 
                  ? "Operator Menu" 
                  : isDriver 
                    ? "Driver Menu" 
                    : "Commuter Menu"
                : "Navigation", 
              mainNavItems, 
              "main"
            )}
            
            {/* Settings/Common section - only for authenticated users */}
            {isAuthenticated && secondaryNavItems.length > 0 && 
              renderMenuSection("Settings", secondaryNavItems, "others")
            }
          </div>
        </nav>
        
        {/* Only show sidebar widget when expanded */}
        {/* {isExpanded || isHovered || isMobileOpen ? (
          <div className="mt-auto">
            <SidebarWidget />
          </div>
        ) : null} */}
      </div>
    </aside>
  );
};

export default AppSidebar;
