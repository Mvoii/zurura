import React, { useRef, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { BusAssignmentFrontendData } from '../../api/busService';
import useRoute from '../../hooks/useRoute';
import { RouteFrontendData } from '../../api/routeService';
import Button from '../ui/button/Button';

interface BusAssignmentCalendarProps {
  assignments: BusAssignmentFrontendData[];
  onAssignmentClick?: (assignment: BusAssignmentFrontendData) => void;
}

const BusAssignmentCalendar: React.FC<BusAssignmentCalendarProps> = ({ 
  assignments, 
  onAssignmentClick 
}) => {
  const calendarRef = useRef<FullCalendar>(null);
  const { routes, fetchRoutes, isLoading: routesLoading, error: routesError } = useRoute();
  const [calendarReady, setCalendarReady] = useState(false);
  
  // Fetch routes if not already loaded
  useEffect(() => {
    if (routes.length === 0 && !routesLoading) {
      fetchRoutes();
    }
    
    // Set calendar as ready after a short delay to ensure proper rendering
    const timer = setTimeout(() => {
      setCalendarReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [routes.length, routesLoading, fetchRoutes]);
  
  // Get a route name by ID, handling missing routes gracefully
  const getRouteName = (routeId: string): string => {
    const route = routes.find((r: RouteFrontendData) => r.id === routeId);
    return route ? route.route_name : `Route ${routeId}`;
  };
  
  // Determine event color based on assignment status
  const getAssignmentColor = (assignment: BusAssignmentFrontendData): string => {
    const now = new Date();
    
    if (assignment.endDate < now) {
      return '#6b7280'; // Expired (gray)
    } else if (assignment.startDate > now) {
      return '#3b82f6'; // Upcoming (blue)
    }
    
    return '#10b981'; // Active (green)
  };
  
  // Convert assignments to calendar events
  const calendarEvents = assignments.map(assignment => {
    const routeName = getRouteName(assignment.routeId);
    const color = getAssignmentColor(assignment);
    
    return {
      id: assignment.id,
      title: routeName,
      start: assignment.startDate,
      end: assignment.endDate,
      allDay: true,
      backgroundColor: color,
      borderColor: color,
      extendedProps: {
        assignment
      }
    };
  });

  // Handle event click
  const handleEventClick = (clickInfo: any) => {
    if (onAssignmentClick && clickInfo.event.extendedProps.assignment) {
      onAssignmentClick(clickInfo.event.extendedProps.assignment);
    }
  };
  
  // Go to today's date
  const handleTodayClick = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.today();
    }
  };
  
  // Handle calendar reload when there's a route error
  const handleRetryRoutes = () => {
    fetchRoutes();
  };

  // If there are no assignments, display empty state
  if (assignments.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>No assignments to display in the calendar.</p>
      </div>
    );
  }
  
  // Show route loading error
  if (routesError && routes.length === 0) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>Error loading route information</p>
        <Button 
          variant="outline"
          onClick={handleRetryRoutes}
          className="mt-4"
        >
          Retry Loading Routes
        </Button>
      </div>
    );
  }

  return (
    <div className="bus-assignment-calendar">
      {!calendarReady || routesLoading ? (
        <div className="p-8 flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,listMonth'
          }}
          events={calendarEvents}
          eventClick={handleEventClick}
          height="auto"
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
          }}
          eventContent={(eventInfo) => {
            return (
              <div className="p-1 text-xs overflow-hidden cursor-pointer">
                <div className="font-semibold truncate">{eventInfo.event.title}</div>
                {/* Display date range for multi-day events */}
                {eventInfo.view.type === 'listMonth' && (
                  <div className="text-xs opacity-80">
                    {new Date(eventInfo.event.start!).toLocaleDateString()} - {new Date(eventInfo.event.end!).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          }}
          customButtons={{
            myToday: {
              text: 'Today',
              click: handleTodayClick
            }
          }}
        />
      )}
    </div>
  );
};

export default BusAssignmentCalendar;