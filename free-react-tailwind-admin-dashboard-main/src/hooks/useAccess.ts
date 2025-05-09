import useAuth from './useAuth';
import { 
  isOperator, 
  isDriver, 
  isCommuter,
  hasRole
} from '../api/authService';

/**
 * Permission types for different resource operations
 */
export type ResourceType = 'route' | 'booking' | 'vehicle' | 'stop' | 'assignment' | 'schedule';
export type OperationType = 'view' | 'create' | 'update' | 'delete' | 'cancel';

// Define a type for public resource/operation pairs
type PublicAccess = {
  resource: ResourceType;
  operation: OperationType;
}

/**
 * Access control hook that centralizes all permission checks
 * @returns Object with access control methods and role status
 */
export const useAccess = () => {
  const { isAuthenticated, user } = useAuth();
  
  // Define which resource operations are publicly accessible (no auth required)
  const publicAccessList: PublicAccess[] = [
    { resource: 'route', operation: 'view' },
    { resource: 'schedule', operation: 'view' },
    { resource: 'stop', operation: 'view' }
  ];
  
  // Helper to check if a resource/operation pair is publicly accessible
  const isPublicAccess = (operation: OperationType, resource: ResourceType): boolean => {
    return publicAccessList.some(
      access => access.resource === resource && access.operation === operation
    );
  };
  
  /**
   * Check if current user can perform operation on resource
   */
  const can = (operation: OperationType, resource: ResourceType): boolean => {
    // Check if this is a public resource/operation first
    if (isPublicAccess(operation, resource)) {
      return true;
    }
    
    // If not public, require authentication
    if (!isAuthenticated) return false;

    // Role-based permissions matrix
    const permissions: Record<string, Record<ResourceType, OperationType[]>> = {
      operator: {
        route: ['view', 'create', 'update', 'delete'],
        booking: ['view'], // Operators can only view bookings
        vehicle: ['view', 'create', 'update', 'delete'],
        stop: ['view', 'create', 'update', 'delete'],
        assignment: ['view', 'create', 'update', 'delete'],
        schedule: ['view', 'create', 'update', 'delete']
      },
      driver: {
        route: ['view'],
        booking: ['view'], // Drivers can only view bookings
        vehicle: ['view'],
        stop: ['view'],
        assignment: ['view'],
        schedule: ['view']
      },
      commuter: {
        route: ['view'],
        booking: ['view', 'create', 'cancel'], // Commuters can create and cancel bookings
        vehicle: ['view'],
        stop: ['view'],
        assignment: ['view'],
        schedule: ['view']
      },
      admin: {
        route: ['view', 'create', 'update', 'delete'],
        booking: ['view', 'create', 'cancel'], // Admins can view, create and cancel bookings
        vehicle: ['view', 'create', 'update', 'delete'],
        stop: ['view', 'create', 'update', 'delete'],
        assignment: ['view', 'create', 'update', 'delete'],
        schedule: ['view', 'create', 'update', 'delete']
      }
    };

    // Get user role or default to commuter
    const role = user?.role || 'commuter';
    
    // Check if role has permission for operation on resource
    return permissions[role]?.[resource]?.includes(operation) || false;
  };

  // Helper for booking-specific permissions
  const canManageBookings = isAuthenticated && isCommuter();

  return {
    // Resource-specific permissions
    routes: {
      canView: true, // Public access
      canCreate: isAuthenticated && isOperator(),
      canEdit: isAuthenticated && isOperator(),
      canDelete: isAuthenticated && isOperator()
    },
    
    // Schedule-specific permissions
    schedules: {
      canView: true, // Public access
      canCreate: isAuthenticated && isOperator(),
      canEdit: isAuthenticated && isOperator(),
      canDelete: isAuthenticated && isOperator()
    },
    
    // Booking-specific permissions
    bookings: {
      canView: isAuthenticated,
      canCreate: canManageBookings,
      canCancel: canManageBookings
    },
    
    // Generic permission checker
    can,
    
    // Role status
    isOperator: isOperator(),
    isDriver: isDriver(),
    isCommuter: isCommuter(),
    hasRole,
    
    // Auth status
    isAuthenticated
  };
};

export default useAccess;