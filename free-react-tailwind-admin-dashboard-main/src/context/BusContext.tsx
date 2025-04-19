import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  getBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
  BusFrontendData
} from '../api/busService';

// Operation result type
interface BusResult {
  success: boolean;
  data?: BusFrontendData | BusFrontendData[] | string;
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
    clearError
  };

  return (
    <BusContext.Provider value={contextValue}>
      {children}
    </BusContext.Provider>
  );
};

export default BusContext;