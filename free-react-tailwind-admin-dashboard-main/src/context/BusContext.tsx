import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  getBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
  assignBusToRoute as apiAssignBusToRoute,
  getBusAssignments as apiGetBusAssignments,
  updateBusAssignment as apiUpdateBusAssignment,
  deleteBusAssignment as apiDeleteBusAssignment,
  BusFrontendData,
  BusAssignmentFrontendData
} from '../api/busService';

// Operation result type
interface BusResult {
  success: boolean;
  data?: BusFrontendData | BusFrontendData[] | string;
  error?: string;
}

// Assignment result type
interface AssignmentResult {
  success: boolean;
  data?: BusAssignmentFrontendData;
  error?: string;
}

// Define the context shape
interface BusContextType {
  buses: BusFrontendData[];
  currentBus: BusFrontendData | null;
  isLoading: boolean;
  error: string | null;
  
  // Bus operations
  fetchBuses: () => Promise<BusFrontendData[]>;
  fetchBus: (id: string) => Promise<BusFrontendData | null>;
  addBus: (busData: BusFrontendData) => Promise<BusResult>;
  editBus: (id: string, busData: Partial<BusFrontendData>) => Promise<BusResult>;
  removeBus: (id: string) => Promise<BusResult>;
  
  // Bus assignment operations
  assignBusToRoute: (assignmentData: BusAssignmentFrontendData) => Promise<AssignmentResult>;
  fetchBusAssignments: (busId: string) => Promise<BusAssignmentFrontendData[]>;
  updateBusAssignment: (assignmentId: string, assignmentData: Partial<BusAssignmentFrontendData>) => Promise<AssignmentResult>;
  deleteBusAssignment: (assignmentId: string) => Promise<BusResult>;
  
  clearError: () => void;
}

// Create the context with undefined default
const BusContext = createContext<BusContextType | undefined>(undefined);

// Props for the provider
interface BusProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps the application and makes bus management available
 */
export const BusProvider: React.FC<BusProviderProps> = ({ children }) => {
  const [buses, setBuses] = useState<BusFrontendData[]>([]);
  const [currentBus, setCurrentBus] = useState<BusFrontendData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load buses on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const busData = await getBuses();
        setBuses(busData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load buses';
        console.error('Failed to load initial bus data:', errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  /**
   * Fetch all buses for the operator
   */
  const fetchBuses = useCallback(async (): Promise<BusFrontendData[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getBuses();
      setBuses(data);
      setError(null);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch buses';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch a single bus by ID
   */
  const fetchBus = useCallback(async (id: string): Promise<BusFrontendData | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getBusById(id);
      setCurrentBus(data);
      setError(null);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch bus ${id}`;
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Add a new bus
   */
  const addBus = useCallback(async (busData: BusFrontendData): Promise<BusResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await createBus(busData);
      setBuses(prevBuses => [...prevBuses, data]);
      setError(null);
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add bus';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update an existing bus
   */
  const editBus = useCallback(async (id: string, busData: Partial<BusFrontendData>): Promise<BusResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await updateBus(id, busData);
      
      // Update both buses array and currentBus if it's the one being edited
      setBuses(prevBuses => 
        prevBuses.map(bus => bus.id === id ? data : bus)
      );
      
      if (currentBus?.id === id) {
        setCurrentBus(data);
      }
      
      setError(null);
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to update bus ${id}`;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [currentBus]);

  /**
   * Remove a bus
   */
  const removeBus = useCallback(async (id: string): Promise<BusResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await deleteBus(id);
      
      // Remove from buses array and clear currentBus if it's the one being deleted
      setBuses(prevBuses => prevBuses.filter(bus => bus.id !== id));
      
      if (currentBus?.id === id) {
        setCurrentBus(null);
      }
      
      setError(null);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to delete bus ${id}`;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [currentBus]);

  /**
   * Assign a bus to a route for a specific time period
   */
  const assignBusToRoute = useCallback(async (assignmentData: BusAssignmentFrontendData): Promise<AssignmentResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiAssignBusToRoute(assignmentData);
      console.log('Bus assigned to route successfully:', data);
      setError(null);
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to assign bus ${assignmentData.busId} to route ${assignmentData.routeId}`;
      
      console.error('Failed to assign bus to route:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch all assignments for a specific bus
   */
  const fetchBusAssignments = useCallback(async (busId: string): Promise<BusAssignmentFrontendData[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const assignments = await apiGetBusAssignments(busId);
      setError(null);
      return assignments;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to fetch assignments for bus ${busId}`;
      
      console.error(errorMessage);
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update an existing bus assignment
   */
  const updateBusAssignment = useCallback(
    async (assignmentId: string, assignmentData: Partial<BusAssignmentFrontendData>): Promise<AssignmentResult> => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await apiUpdateBusAssignment(assignmentId, assignmentData);
        console.log('Bus assignment updated successfully:', data);
        setError(null);
        return { success: true, data };
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : `Failed to update bus assignment ${assignmentId}`;
        
        console.error('Failed to update bus assignment:', errorMessage);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    }, 
  []);

  /**
   * Delete a bus assignment
   */
  const deleteBusAssignment = useCallback(async (assignmentId: string): Promise<BusResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await apiDeleteBusAssignment(assignmentId);
      console.log('Bus assignment deleted successfully');
      setError(null);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to delete bus assignment ${assignmentId}`;
      
      console.error('Failed to delete bus assignment:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear any bus management errors
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // The value to be provided to consumers
  const contextValue: BusContextType = {
    buses,
    currentBus,
    isLoading,
    error,
    fetchBuses,
    fetchBus,
    addBus,
    editBus,
    removeBus,
    assignBusToRoute,
    fetchBusAssignments,
    updateBusAssignment,
    deleteBusAssignment,
    clearError
  };

  return (
    <BusContext.Provider value={contextValue}>
      {children}
    </BusContext.Provider>
  );
};

export default BusContext;