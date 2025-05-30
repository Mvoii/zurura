import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { SidebarProvider } from './SidebarContext';
import { BusProvider } from './BusContext';
import { RouteProvider } from './RouteContext';
import { ProfileProvider } from './ProfileContext';
import { ScheduleProvider } from './ScheduleContext';
import { BookingProvider } from './BookingContext'; // Add this import

interface AppProviderProps {
  children: ReactNode;
}

/**
 * This component nests all application providers in the correct order
 * It centralizes provider management in one place for better maintainability
 */
const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <ProfileProvider>
        <ThemeProvider>
          <SidebarProvider>
            <RouteProvider>
              <BusProvider>
                <ScheduleProvider>
                  <BookingProvider> {/* Add BookingProvider here */}
                    {children}
                  </BookingProvider>
                </ScheduleProvider>
              </BusProvider>
            </RouteProvider>
          </SidebarProvider>
        </ThemeProvider>
      </ProfileProvider>
    </AuthProvider>
  );
};

export default AppProvider;