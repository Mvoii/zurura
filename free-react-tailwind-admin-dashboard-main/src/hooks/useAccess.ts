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
export type ResourceType = 'route' | 'booking' | 'vehicle' | 'stop';
export type OperationType = 'view' | 'create' | 'update' | 'delete';

/**
 * Access control hook that centralizes all permission checks
 * @returns Object with access control methods and role status
 */
export const useAccess = () => {
  const { isAuthenticated, user } = useAuth();
  
  /**
   * Check if current user can perform operation on resource
   */
  const can = (operation: OperationType, resource: ResourceType): boolean => {
    if (!isAuthenticated) return false;

    // Role-based permissions matrix
    const permissions: Record<string, Record<ResourceType, OperationType[]>> = {
      operator: {
        route: ['view', 'create', 'update', 'delete'],
        booking: ['view'],
        vehicle: ['view', 'create', 'update', 'delete'],
        stop: ['view', 'create', 'update', 'delete']
      },
      driver: {
        route: ['view'],
        booking: ['view', 'update'],
        vehicle: ['view'],
        stop: ['view']
      },
      commuter: {
        route: ['view'],
        booking: ['view', 'create'],
        vehicle: ['view'],
        stop: ['view']
      },
      admin: {
        route: ['view', 'create', 'update', 'delete'],
        booking: ['view', 'create', 'update', 'delete'],
        vehicle: ['view', 'create', 'update', 'delete'],
        stop: ['view', 'create', 'update', 'delete']
      }
    };

    // Get user role or default to commuter
    const role = user?.role || 'commuter';
    
    // Check if role has permission for operation on resource
    return permissions[role]?.[resource]?.includes(operation) || false;
  };

  return {
    // Resource-specific permissions
    routes: {
      canView: isAuthenticated,
      canCreate: isOperator(),
      canEdit: isOperator(),
      canDelete: isOperator()
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